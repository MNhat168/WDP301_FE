import toastr from 'toastr';

/**
 * Utility functions for managing favorite jobs
 */

/**
 * Get user token from localStorage
 * @returns {string|null} Token or null if not found
 */
export const getUserToken = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.token || user?.accessToken || null;
};

/**
 * Fetch user's favorite jobs
 * @returns {Promise<string[]>} Array of favorite job IDs
 */
export const fetchFavoriteJobs = async () => {
    const token = getUserToken();
    if (!token) return [];

    try {
        const response = await fetch('https://wdp301-lzse.onrender.com/api/jobs/favorites', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.status && data.result) {
                return data.result.map(job => job._id);
            }
        }
        return [];
    } catch (error) {
        console.error('Error fetching favorite jobs:', error);
        return [];
    }
};

/**
 * Toggle favorite status of a job
 * @param {string} jobId - The job ID to toggle
 * @param {boolean} isCurrentlyFavorite - Current favorite status
 * @param {Object} options - Additional options
 * @returns {Promise<{success: boolean, isFavorite: boolean, remainingFavorites?: number|string}>}
 */
export const toggleFavoriteJob = async (jobId, isCurrentlyFavorite, options = {}) => {
    const { 
        onLimitReached = null, 
        onAuthRequired = null,
        showToastMessages = true 
    } = options;
    
    const token = getUserToken();
    if (!token) {
        if (onAuthRequired) {
            onAuthRequired();
        } else if (showToastMessages) {
            toastr.warning('Please log in to save jobs');
        }
        return { success: false, isFavorite: isCurrentlyFavorite };
    }

    try {
        const endpoint = `https://wdp301-lzse.onrender.com/api/jobs/${jobId}/favorite`;
        const method = isCurrentlyFavorite ? 'DELETE' : 'POST';

        const response = await fetch(endpoint, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        // Check content type
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            if (response.status === 401) {
                if (onAuthRequired) {
                    onAuthRequired();
                } else if (showToastMessages) {
                    toastr.error('Session expired. Please log in again.');
                }
                return { success: false, isFavorite: isCurrentlyFavorite };
            }
            throw new Error(`Server returned ${response.status}. Please try again later.`);
        }

        if (!response.ok) {
            const errorData = await response.json();
            
            // Handle premium upgrade case
            if (response.status === 403 && errorData.result?.upgradeRequired) {
                if (onLimitReached) {
                    onLimitReached(errorData);
                } else if (showToastMessages) {
                    toastr.warning(errorData.message);
                }
                return { success: false, isFavorite: isCurrentlyFavorite };
            }
            
            throw new Error(errorData.message || `Failed to ${isCurrentlyFavorite ? 'remove' : 'add'} favorite job`);
        }

        const data = await response.json();
        
        if (data.status) {
            const newIsFavorite = !isCurrentlyFavorite;
            
            if (showToastMessages) {
                toastr.success(newIsFavorite ? 'Job saved to favorites!' : 'Job removed from favorites!');
                
                // Show remaining favorites for free users
                if (newIsFavorite && data.result?.remainingFavorites !== 'unlimited') {
                    const remaining = data.result.remainingFavorites;
                    if (remaining <= 2) {
                        toastr.info(`You have ${remaining} favorite slots remaining.`);
                    }
                }
            }
            
            return { 
                success: true, 
                isFavorite: newIsFavorite,
                remainingFavorites: data.result?.remainingFavorites
            };
        } else {
            throw new Error(data.message || `Failed to ${isCurrentlyFavorite ? 'remove' : 'add'} favorite job`);
        }

    } catch (error) {
        console.error(`Error ${isCurrentlyFavorite ? 'removing' : 'adding'} favorite job:`, error);
        
        if (showToastMessages) {
            if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
                toastr.error('Server error. Please try again later.');
            } else {
                toastr.error(error.message || `An error occurred while ${isCurrentlyFavorite ? 'removing' : 'adding'} the job ${isCurrentlyFavorite ? 'from' : 'to'} favorites.`);
            }
        }
        
        return { success: false, isFavorite: isCurrentlyFavorite };
    }
};

/**
 * Check if a job is in favorites
 * @param {string} jobId - The job ID to check
 * @returns {Promise<boolean>} True if job is favorited
 */
export const isJobFavorited = async (jobId) => {
    const favoriteJobIds = await fetchFavoriteJobs();
    return favoriteJobIds.includes(jobId);
};

/**
 * Get favorite jobs count
 * @returns {Promise<number>} Number of favorite jobs
 */
export const getFavoriteJobsCount = async () => {
    const favoriteJobs = await fetchFavoriteJobs();
    return favoriteJobs.length;
}; 
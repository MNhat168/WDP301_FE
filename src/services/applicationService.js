const API_BASE_URL = 'https://wdp301-lzse.onrender.com/api';

// Get auth headers
const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = user?.token || user?.accessToken;
    
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
    };
};

// Apply to a job
export const applyToJob = async (jobId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/applications`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ jobId })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to apply to job');
        }

        return {
            success: true,
            data: data.data,
            message: data.message
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to apply to job'
        };
    }
};

// Withdraw application
export const withdrawApplication = async (applicationId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to withdraw application');
        }

        return {
            success: true,
            message: data.message
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to withdraw application'
        };
    }
};

// Get application status for a specific job
export const getApplicationStatus = async (jobId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/applications/status/${jobId}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to get application status');
        }

        const data = await response.json();
        return {
            success: true,
            data: data
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to get application status'
        };
    }
};

// Get all user applications
export const getUserApplications = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/applications/my-applications`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch applications');
        }

        const data = await response.json();
        
        // Extract applications array from nested structure
        let applications = [];
        if (data.success && data.data && data.data.applications) {
            applications = data.data.applications;
        } else if (data.result) {
            applications = data.result;
        } else if (Array.isArray(data.data)) {
            applications = data.data;
        }
        
        return {
            success: true,
            data: applications,
            pagination: data.data?.pagination,
            summary: data.data?.summary
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to fetch applications'
        };
    }
}; 
import React, { useState } from 'react';
import { FiHeart } from 'react-icons/fi';
import toastr from 'toastr';

/**
 * Reusable Favorite Button Component
 * @param {Object} props
 * @param {string} props.jobId - The job ID
 * @param {boolean} props.isFavorite - Current favorite status
 * @param {Function} props.onToggle - Callback when favorite status changes (jobId, newStatus, remainingFavorites) => void
 * @param {Function} props.onAuthRequired - Callback when user needs to login
 * @param {Function} props.onLimitReached - Callback when limit is reached
 * @param {string} props.size - Button size: 'sm', 'md', 'lg'
 * @param {string} props.variant - Button variant: 'icon', 'button', 'minimal'
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showTooltip - Whether to show tooltip
 */
const FavoriteButton = ({
    jobId,
    isFavorite = false,
    onToggle = () => {},
    onAuthRequired = () => {},
    onLimitReached = () => {},
    size = 'md',
    variant = 'button',
    className = '',
    showTooltip = true,
    disabled = false
}) => {
    const [isLoading, setIsLoading] = useState(false);

    // Get user token from localStorage
    const getUserToken = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        return user?.token || user?.accessToken || null;
    };

    const handleClick = async () => {
        if (isLoading || disabled) return;

        const token = getUserToken();
        if (!token) {
            onAuthRequired();
            return;
        }

        setIsLoading(true);

        try {
            const endpoint = `https://wdp301-lzse.onrender.com/api/jobs/${jobId}/favorite`;
            const method = isFavorite ? 'DELETE' : 'POST';

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
                    onAuthRequired();
                    return;
                }
                throw new Error(`Server returned ${response.status}. Please try again later.`);
            }

            if (!response.ok) {
                const errorData = await response.json();
                
                // Handle premium upgrade case
                if (response.status === 403 && errorData.result?.upgradeRequired) {
                    onLimitReached(errorData);
                    return;
                }
                
                throw new Error(errorData.message || `Failed to ${isFavorite ? 'remove' : 'add'} favorite job`);
            }

            const data = await response.json();
            
            if (data.status) {
                const newIsFavorite = !isFavorite;
                
                toastr.success(newIsFavorite ? 'Job saved to favorites!' : 'Job removed from favorites!');
                
                // Show remaining favorites for free users
                if (newIsFavorite && data.result?.remainingFavorites !== 'unlimited') {
                    const remaining = data.result.remainingFavorites;
                    if (remaining <= 2) {
                        toastr.info(`You have ${remaining} favorite slots remaining.`);
                    }
                }
                
                onToggle(jobId, newIsFavorite, data.result?.remainingFavorites);
            } else {
                throw new Error(data.message || `Failed to ${isFavorite ? 'remove' : 'add'} favorite job`);
            }

        } catch (error) {
            console.error(`Error ${isFavorite ? 'removing' : 'adding'} favorite job:`, error);
            
            if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
                toastr.error('Server error. Please try again later.');
            } else {
                toastr.error(error.message || `An error occurred while ${isFavorite ? 'removing' : 'adding'} the job ${isFavorite ? 'from' : 'to'} favorites.`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Size configurations
    const sizeConfig = {
        sm: {
            iconSize: 'h-4 w-4',
            padding: 'p-2',
            text: 'text-xs',
            buttonPadding: 'px-3 py-2'
        },
        md: {
            iconSize: 'h-5 w-5',
            padding: 'p-2.5',
            text: 'text-sm',
            buttonPadding: 'px-4 py-2.5'
        },
        lg: {
            iconSize: 'h-6 w-6',
            padding: 'p-3',
            text: 'text-base',
            buttonPadding: 'px-6 py-4'
        }
    };

    const config = sizeConfig[size];

    // Base classes
    const baseClasses = `
        inline-flex items-center justify-center
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
    `;

    // Variant-specific styling
    const getVariantClasses = () => {
        const favoriteClasses = isFavorite
            ? 'text-red-500 bg-red-50 border-red-200 hover:bg-red-100'
            : 'text-gray-600 bg-white border-gray-200 hover:text-red-500 hover:border-red-300';

        switch (variant) {
            case 'icon':
                return `
                    ${config.padding} rounded-full border-2
                    ${favoriteClasses}
                `;
            case 'button':
                return `
                    ${config.buttonPadding} rounded-xl border-2 font-semibold
                    ${favoriteClasses}
                `;
            case 'minimal':
                return `
                    ${config.padding} rounded-lg
                    ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}
                `;
            default:
                return `${config.buttonPadding} rounded-xl border-2 ${favoriteClasses}`;
        }
    };

    const buttonContent = (
        <>
            {isLoading ? (
                <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${config.iconSize}`}></div>
            ) : (
                <FiHeart className={`${config.iconSize} ${isFavorite ? 'fill-current' : ''}`} />
            )}
            {variant === 'button' && (
                <span className={`ml-2 ${config.text}`}>
                    {isLoading 
                        ? (isFavorite ? 'Removing...' : 'Saving...') 
                        : (isFavorite ? 'Saved' : 'Save')
                    }
                </span>
            )}
        </>
    );

    const button = (
        <button
            onClick={handleClick}
            disabled={isLoading || disabled}
            className={`${baseClasses} ${getVariantClasses()}`}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
            {buttonContent}
        </button>
    );

    if (showTooltip && variant === 'icon') {
        return (
            <div className="relative group">
                {button}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
            </div>
        );
    }

    return button;
};

export default FavoriteButton; 
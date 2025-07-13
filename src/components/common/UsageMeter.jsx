import React from 'react';
import { FiBriefcase, FiFileText, FiHeart, FiTrendingUp } from 'react-icons/fi';

const UsageMeter = ({ 
    type = 'applications',
    used = 0,
    limit = 0,
    title = '',
    size = 'md',
    showNumbers = true,
    showIcon = true,
    className = ''
}) => {
    const getTypeConfig = (usageType) => {
        switch (usageType) {
            case 'applications':
                return {
                    icon: FiBriefcase,
                    defaultTitle: 'Job Applications',
                    iconColor: 'text-blue-500'
                };
            case 'jobPostings':
                return {
                    icon: FiFileText,
                    defaultTitle: 'Job Postings',
                    iconColor: 'text-green-500'
                };
            case 'favorites':
                return {
                    icon: FiHeart,
                    defaultTitle: 'Favorite Jobs',
                    iconColor: 'text-red-500'
                };
            case 'views':
                return {
                    icon: FiTrendingUp,
                    defaultTitle: 'Profile Views',
                    iconColor: 'text-purple-500'
                };
            default:
                return {
                    icon: FiBriefcase,
                    defaultTitle: 'Usage',
                    iconColor: 'text-gray-500'
                };
        }
    };

    const getSizeConfig = (sizeType) => {
        switch (sizeType) {
            case 'sm':
                return {
                    barHeight: 'h-2',
                    text: 'text-sm',
                    iconSize: 'h-4 w-4',
                    spacing: 'space-y-1'
                };
            case 'md':
                return {
                    barHeight: 'h-3',
                    text: 'text-sm',
                    iconSize: 'h-5 w-5',
                    spacing: 'space-y-2'
                };
            case 'lg':
                return {
                    barHeight: 'h-4',
                    text: 'text-base',
                    iconSize: 'h-6 w-6',
                    spacing: 'space-y-3'
                };
            default:
                return {
                    barHeight: 'h-3',
                    text: 'text-sm',
                    iconSize: 'h-5 w-5',
                    spacing: 'space-y-2'
                };
        }
    };

    const typeConfig = getTypeConfig(type);
    const sizeConfig = getSizeConfig(size);
    const Icon = typeConfig.icon;

    // Calculate percentage
    const percentage = limit === -1 ? 0 : limit === 0 ? 100 : Math.round((used / limit) * 100);
    const isUnlimited = limit === -1;

    // Get color based on percentage
    const getProgressColor = (percent) => {
        if (isUnlimited) return 'bg-gradient-to-r from-yellow-400 to-orange-500';
        if (percent >= 90) return 'bg-gradient-to-r from-red-400 to-red-600';
        if (percent >= 70) return 'bg-gradient-to-r from-orange-400 to-orange-600';
        if (percent >= 50) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
        return 'bg-gradient-to-r from-green-400 to-green-600';
    };

    const getTextColor = (percent) => {
        if (isUnlimited) return 'text-orange-600';
        if (percent >= 90) return 'text-red-600';
        if (percent >= 70) return 'text-orange-600';
        if (percent >= 50) return 'text-yellow-600';
        return 'text-green-600';
    };

    const displayTitle = title || typeConfig.defaultTitle;
    const progressColor = getProgressColor(percentage);
    const textColor = getTextColor(percentage);

    return (
        <div className={`${sizeConfig.spacing} ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    {showIcon && (
                        <Icon className={`${sizeConfig.iconSize} ${typeConfig.iconColor}`} />
                    )}
                    <span className={`font-medium text-gray-700 ${sizeConfig.text}`}>
                        {displayTitle}
                    </span>
                </div>
                
                {showNumbers && (
                    <div className={`${sizeConfig.text} font-medium ${textColor}`}>
                        {isUnlimited ? (
                            <span className="flex items-center space-x-1">
                                <span>{used}</span>
                                <span className="text-orange-500">∞</span>
                            </span>
                        ) : (
                            <span>
                                {used} / {limit}
                                {percentage > 0 && (
                                    <span className="ml-1 text-gray-500">
                                        ({percentage}%)
                                    </span>
                                )}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            <div className={`w-full bg-gray-200 rounded-full ${sizeConfig.barHeight} overflow-hidden`}>
                <div 
                    className={`${sizeConfig.barHeight} ${progressColor} rounded-full transition-all duration-500 ease-out`}
                    style={{ 
                        width: isUnlimited ? '100%' : `${Math.min(percentage, 100)}%` 
                    }}
                >
                    {isUnlimited && (
                        <div className="h-full w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 animate-pulse" />
                    )}
                </div>
            </div>

            {/* Status Text */}
            {!isUnlimited && percentage >= 90 && (
                <div className="text-xs text-red-600">
                    {percentage >= 100 ? 'Limit reached' : 'Almost at limit'}
                </div>
            )}
            
            {isUnlimited && (
                <div className="text-xs text-orange-600">
                    Unlimited usage
                </div>
            )}
        </div>
    );
};

export default UsageMeter; 
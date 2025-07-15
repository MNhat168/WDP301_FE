import React from 'react';
import { FiAward, FiStar, FiUsers, FiZap } from 'react-icons/fi';

const SubscriptionBadge = ({ 
    tier, 
    size = 'md',
    showIcon = true,
    showText = true,
    className = '',
    onClick = null
}) => {
    const getTierConfig = (tierType) => {
        switch (tierType) {
            case 'free':
                return {
                    name: 'Free',
                    icon: FiUsers,
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-700',
                    borderColor: 'border-gray-200',
                    iconColor: 'text-gray-500'
                };
            case 'basic':
                return {
                    name: 'Basic',
                    icon: FiStar,
                    bgColor: 'bg-blue-100',
                    textColor: 'text-blue-800',
                    borderColor: 'border-blue-200',
                    iconColor: 'text-blue-600'
                };
            case 'premium':
                return {
                    name: 'Premium',
                    icon: FiAward,
                    bgColor: 'bg-purple-100',
                    textColor: 'text-purple-800',
                    borderColor: 'border-purple-200',
                    iconColor: 'text-purple-600'
                };
            case 'enterprise':
                return {
                    name: 'Enterprise',
                    icon: FiZap,
                    bgColor: 'bg-gradient-to-r from-yellow-100 to-orange-100',
                    textColor: 'text-orange-800',
                    borderColor: 'border-orange-200',
                    iconColor: 'text-orange-600'
                };
            default:
                return {
                    name: 'Free',
                    icon: FiUsers,
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-700',
                    borderColor: 'border-gray-200',
                    iconColor: 'text-gray-500'
                };
        }
    };

    const getSizeConfig = (sizeType) => {
        switch (sizeType) {
            case 'sm':
                return {
                    padding: 'px-2 py-1',
                    text: 'text-xs',
                    iconSize: 'h-3 w-3',
                    spacing: 'space-x-1'
                };
            case 'md':
                return {
                    padding: 'px-3 py-1.5',
                    text: 'text-sm',
                    iconSize: 'h-4 w-4',
                    spacing: 'space-x-1.5'
                };
            case 'lg':
                return {
                    padding: 'px-4 py-2',
                    text: 'text-base',
                    iconSize: 'h-5 w-5',
                    spacing: 'space-x-2'
                };
            default:
                return {
                    padding: 'px-3 py-1.5',
                    text: 'text-sm',
                    iconSize: 'h-4 w-4',
                    spacing: 'space-x-1.5'
                };
        }
    };

    const tierConfig = getTierConfig(tier);
    const sizeConfig = getSizeConfig(size);
    const Icon = tierConfig.icon;

    const badgeClasses = `
        inline-flex items-center justify-center
        ${sizeConfig.padding} ${sizeConfig.spacing}
        ${tierConfig.bgColor} ${tierConfig.textColor} ${tierConfig.borderColor}
        border rounded-full font-semibold ${sizeConfig.text}
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''}
        ${className}
    `;

    const content = (
        <>
            {showIcon && (
                <Icon className={`${sizeConfig.iconSize} ${tierConfig.iconColor}`} />
            )}
            {showText && <span>{tierConfig.name}</span>}
        </>
    );

    if (onClick) {
        return (
            <button onClick={onClick} className={badgeClasses}>
                {content}
            </button>
        );
    }

    return (
        <div className={badgeClasses}>
            {content}
        </div>
    );
};

export default SubscriptionBadge; 
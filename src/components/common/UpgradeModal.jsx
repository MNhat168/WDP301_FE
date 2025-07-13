import React from 'react';
import { FiX, FiAward, FiCheck, FiStar, FiZap } from 'react-icons/fi';
import SubscriptionBadge from './SubscriptionBadge';

const UpgradeModal = ({
    isOpen,
    onClose,
    currentTier = 'free',
    actionType = 'apply',
    message = '',
    onUpgrade = () => {}
}) => {
    if (!isOpen) return null;

    const getActionMessage = (action, tier) => {
        const actionMessages = {
            apply: {
                title: 'Application Limit Reached',
                description: `You've reached your monthly application limit for the ${tier} plan.`,
                benefit: 'Apply to more jobs'
            },
            'post-job': {
                title: 'Job Posting Unavailable',
                description: `Job posting is not available on the ${tier} plan.`,
                benefit: 'Post unlimited jobs'
            },
            'add-favorite': {
                title: 'Favorites Limit Reached',
                description: `You've reached your favorites limit.`,
                benefit: 'Save unlimited favorites'
            }
        };
        return actionMessages[action] || actionMessages.apply;
    };

    const getRecommendedPlans = (currentTierType) => {
        switch (currentTierType) {
            case 'free':
                return [
                    {
                        tier: 'basic',
                        name: 'Basic',
                        price: '$9.99/month',
                        features: ['10 applications/month', '5 job posts', 'Basic support'],
                        recommended: false
                    },
                    {
                        tier: 'premium',
                        name: 'Premium',
                        price: '$19.99/month',
                        features: ['50 applications/month', '20 job posts', 'Advanced filters', 'Priority listing'],
                        recommended: true
                    }
                ];
            case 'basic':
                return [
                    {
                        tier: 'premium',
                        name: 'Premium',
                        price: '$19.99/month',
                        features: ['50 applications/month', '20 job posts', 'Advanced filters', 'Priority listing'],
                        recommended: true
                    },
                    {
                        tier: 'enterprise',
                        name: 'Enterprise',
                        price: '$49.99/month',
                        features: ['Unlimited applications', 'Unlimited job posts', 'Priority support', 'Custom analytics'],
                        recommended: false
                    }
                ];
            case 'premium':
                return [
                    {
                        tier: 'enterprise',
                        name: 'Enterprise',
                        price: '$49.99/month',
                        features: ['Unlimited applications', 'Unlimited job posts', 'Priority support', 'Custom analytics'],
                        recommended: true
                    }
                ];
            default:
                return [];
        }
    };

    const actionInfo = getActionMessage(actionType, currentTier);
    const recommendedPlans = getRecommendedPlans(currentTier);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                            <FiAward className="text-white text-xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{actionInfo.title}</h2>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className="text-sm text-gray-500">Current plan:</span>
                                <SubscriptionBadge tier={currentTier} size="sm" />
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FiX className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="text-center mb-6">
                        <p className="text-gray-600 mb-2">{actionInfo.description}</p>
                        <p className="text-lg font-semibold text-gray-900">
                            Upgrade your plan to {actionInfo.benefit}
                        </p>
                        {message && (
                            <p className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded-lg">
                                {message}
                            </p>
                        )}
                    </div>

                    {/* Plans */}
                    <div className="grid gap-4 md:grid-cols-2">
                        {recommendedPlans.map((plan) => (
                            <div
                                key={plan.tier}
                                className={`
                                    relative p-6 rounded-xl border-2 transition-all cursor-pointer
                                    ${plan.recommended 
                                        ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200' 
                                        : 'border-gray-200 hover:border-gray-300'
                                    }
                                `}
                                onClick={() => onUpgrade(plan.tier)}
                            >
                                {plan.recommended && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                            Recommended
                                        </span>
                                    </div>
                                )}

                                <div className="text-center mb-4">
                                    <SubscriptionBadge 
                                        tier={plan.tier} 
                                        size="lg" 
                                        className="mb-2"
                                    />
                                    <div className="text-2xl font-bold text-gray-900">
                                        {plan.price}
                                    </div>
                                </div>

                                <ul className="space-y-3">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-center space-x-2">
                                            <FiCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                                            <span className="text-sm text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => onUpgrade(plan.tier)}
                                    className={`
                                        w-full mt-6 px-4 py-2 rounded-lg font-semibold transition-all
                                        ${plan.recommended
                                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg'
                                            : 'bg-gray-800 text-white hover:bg-gray-900'
                                        }
                                    `}
                                >
                                    Upgrade to {plan.name}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Benefits section */}
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <FiStar className="mr-2 text-yellow-500" />
                            Why upgrade?
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                                <FiCheck className="text-green-500 h-4 w-4" />
                                <span>More job applications</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <FiCheck className="text-green-500 h-4 w-4" />
                                <span>Advanced search filters</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <FiCheck className="text-green-500 h-4 w-4" />
                                <span>Priority job listings</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <FiCheck className="text-green-500 h-4 w-4" />
                                <span>Direct messaging</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                    <div className="text-sm text-gray-500">
                        Cancel anytime • 30-day money-back guarantee
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal; 
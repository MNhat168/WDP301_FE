import React, { useState } from 'react';
import { useSubscriptionData } from '../../hooks/useSubscription.jsx';
import SubscriptionBadge from './SubscriptionBadge';
import UsageMeter from './UsageMeter';
import UpgradeModal from './UpgradeModal';
import { FiSettings, FiAward, FiRefreshCw, FiCalendar, FiTrendingUp } from 'react-icons/fi';

const SubscriptionDashboard = ({ 
    compact = false,
    showUpgrade = true,
    className = ''
}) => {
    const {
        subscriptionData,
        loading,
        error,
        refreshData,
        currentTier,
        applicationUsage,
        tierInfo
    } = useSubscriptionData();

    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    if (loading) {
        return (
            <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-8 bg-gray-200 rounded"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-white rounded-lg shadow-sm border border-red-200 p-6 ${className}`}>
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={refreshData}
                        className="inline-flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                    >
                        <FiRefreshCw className="mr-2 h-4 w-4" />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!subscriptionData) {
        return null;
    }

    const handleUpgrade = (targetTier) => {
        setShowUpgradeModal(false);
        // Here you would typically redirect to upgrade/payment page
        console.log(`Upgrading to ${targetTier}`);
        // window.location.href = `/upgrade/${targetTier}`;
    };

    if (compact) {
        return (
            <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">Plan:</span>
                        <SubscriptionBadge tier={currentTier} size="sm" />
                    </div>
                    {showUpgrade && currentTier !== 'enterprise' && (
                        <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                        >
                            Upgrade
                        </button>
                    )}
                </div>
                
                <UsageMeter
                    type="applications"
                    used={applicationUsage.used}
                    limit={applicationUsage.limit}
                    size="sm"
                />

                <UpgradeModal
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                    currentTier={currentTier}
                    actionType="apply"
                    onUpgrade={handleUpgrade}
                />
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <FiAward className="text-white text-xl" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Subscription Plan</h3>
                            <div className="flex items-center space-x-2 mt-1">
                                <SubscriptionBadge tier={currentTier} size="md" />
                                {subscriptionData.subscription.isActive && (
                                    <span className="text-sm text-green-600 font-medium">Active</span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        {showUpgrade && currentTier !== 'enterprise' && (
                            <button
                                onClick={() => setShowUpgradeModal(true)}
                                className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                            >
                                <FiAward className="mr-2 h-4 w-4" />
                                Upgrade
                            </button>
                        )}
                        <button
                            onClick={refreshData}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <FiRefreshCw className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Subscription Info */}
                {subscriptionData.subscription.isActive && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <FiCalendar className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium text-blue-900">
                                    {subscriptionData.subscription.daysRemaining > 0 
                                        ? `${subscriptionData.subscription.daysRemaining} days remaining`
                                        : 'Expired'
                                    }
                                </span>
                            </div>
                            <span className="text-xs text-blue-600">
                                Expires: {new Date(subscriptionData.subscription.expiryDate).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                )}

                {/* Usage Metrics */}
                <div className="space-y-6">
                    <UsageMeter
                        type="applications"
                        used={subscriptionData.applications.used}
                        limit={subscriptionData.applications.limit}
                        size="md"
                    />

                    {subscriptionData.jobPostings.limit > 0 && (
                        <UsageMeter
                            type="jobPostings"
                            used={subscriptionData.jobPostings.used}
                            limit={subscriptionData.jobPostings.limit}
                            size="md"
                        />
                    )}

                    <UsageMeter
                        type="favorites"
                        used={subscriptionData.favorites.count}
                        limit={subscriptionData.favorites.limit}
                        size="md"
                    />
                </div>

                {/* Analytics Summary */}
                {subscriptionData.analytics && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                            <FiTrendingUp className="mr-2 h-4 w-4" />
                            Your Activity
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="text-lg font-semibold text-gray-900">
                                    {subscriptionData.analytics.profileViews || 0}
                                </div>
                                <div className="text-xs text-gray-500">Profile Views</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="text-lg font-semibold text-gray-900">
                                    {subscriptionData.analytics.totalJobApplications || 0}
                                </div>
                                <div className="text-xs text-gray-500">Total Applications</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Features List */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Current Plan Features</h4>
                    <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center space-x-2 text-sm">
                            <div className={`w-2 h-2 rounded-full ${
                                subscriptionData.applications.limit === -1 ? 'bg-green-500' : 'bg-blue-500'
                            }`}></div>
                            <span className="text-gray-600">
                                {subscriptionData.applications.limit === -1 
                                    ? 'Unlimited job applications'
                                    : `${subscriptionData.applications.limit} applications per month`
                                }
                            </span>
                        </div>
                        
                        {subscriptionData.features.hasPriorityListing && (
                            <div className="flex items-center space-x-2 text-sm">
                                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                <span className="text-gray-600">Priority job listings</span>
                            </div>
                        )}
                        
                        {subscriptionData.features.hasAdvancedFilters && (
                            <div className="flex items-center space-x-2 text-sm">
                                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                <span className="text-gray-600">Advanced search filters</span>
                            </div>
                        )}

                        {subscriptionData.features.canDirectMessage && (
                            <div className="flex items-center space-x-2 text-sm">
                                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                <span className="text-gray-600">Direct messaging</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                currentTier={currentTier}
                actionType="apply"
                onUpgrade={handleUpgrade}
            />
        </div>
    );
};

export default SubscriptionDashboard; 
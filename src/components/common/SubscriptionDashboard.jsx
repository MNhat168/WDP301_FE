import React, { useState } from 'react';
import { useSubscriptionData } from '../../hooks/useSubscription.jsx';
import SubscriptionBadge from './SubscriptionBadge';
import UsageMeter from './UsageMeter';
import UpgradeModal from './UpgradeModal';
import UsageStats from './UsageStats';
import { FiSettings, FiAward, FiRefreshCw, FiCalendar, FiTrendingUp, FiBarChart } from 'react-icons/fi';

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
    const [activeTab, setActiveTab] = useState('overview');

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
                
                {/* Use compact UsageStats instead of custom UsageMeter */}
                <UsageStats 
                    className="mt-4"
                    showDetailed={false}
                    onUpgradeClick={() => setShowUpgradeModal(true)}
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
                            <h3 className="text-lg font-semibold text-gray-900">Subscription Dashboard</h3>
                            <div className="flex items-center space-x-2 mt-1">
                                <SubscriptionBadge tier={currentTier} size="md" />
                                {subscriptionData?.subscription?.isActive && (
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

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                    {[
                        { id: 'overview', label: 'Overview', icon: FiAward },
                        { id: 'usage', label: 'Usage Stats', icon: FiBarChart },
                        { id: 'features', label: 'Features', icon: FiSettings }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 py-4 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Subscription Info */}
                        {subscriptionData?.subscription?.isActive && (
                            <div className="p-4 bg-blue-50 rounded-lg">
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

                        {/* Quick Usage Overview */}
                        <UsageStats 
                            className=""
                            showDetailed={false}
                            onUpgradeClick={() => setShowUpgradeModal(true)}
                        />

                        {/* Analytics Summary */}
                        {subscriptionData?.analytics && (
                            <div className="pt-6 border-t border-gray-200">
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
                    </div>
                )}

                {/* Usage Stats Tab */}
                {activeTab === 'usage' && (
                    <div>
                        <UsageStats 
                            className=""
                            showDetailed={true}
                            period="current"
                            onUpgradeClick={() => setShowUpgradeModal(true)}
                        />
                    </div>
                )}

                {/* Features Tab */}
                {activeTab === 'features' && (
                    <div className="space-y-6">
                        <h4 className="text-lg font-medium text-gray-900">Current Plan Features</h4>
                        
                        <div className="grid grid-cols-1 gap-4">
                            <div className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className={`w-3 h-3 rounded-full ${
                                        subscriptionData?.applications?.limit === -1 ? 'bg-green-500' : 'bg-blue-500'
                                    }`}></div>
                                    <h5 className="font-medium text-gray-900">Job Applications</h5>
                                </div>
                                <p className="text-sm text-gray-600">
                                    {subscriptionData?.applications?.limit === -1 
                                        ? 'Unlimited job applications per month'
                                        : `${subscriptionData?.applications?.limit || 5} applications per month`
                                    }
                                </p>
                            </div>
                            
                            {subscriptionData?.features?.hasPriorityListing && (
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                        <h5 className="font-medium text-gray-900">Priority Listings</h5>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Your job applications appear at the top of employer lists
                                    </p>
                                </div>
                            )}
                            
                            {subscriptionData?.features?.hasAdvancedFilters && (
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                        <h5 className="font-medium text-gray-900">Advanced Search</h5>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Access to advanced search filters and job matching
                                    </p>
                                </div>
                            )}

                            {subscriptionData?.features?.canDirectMessage && (
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                        <h5 className="font-medium text-gray-900">Direct Messaging</h5>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Message employers directly to stand out from other candidates
                                    </p>
                                </div>
                            )}

                            {/* Show what they're missing if not premium */}
                            {currentTier === 'free' && (
                                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                                    <div className="text-center">
                                        <h5 className="font-medium text-gray-700 mb-2">Unlock More Features</h5>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Upgrade to access premium features like unlimited applications, priority support, and advanced analytics.
                                        </p>
                                        <button
                                            onClick={() => setShowUpgradeModal(true)}
                                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                                        >
                                            <FiAward className="mr-2 h-4 w-4" />
                                            View Upgrade Options
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
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
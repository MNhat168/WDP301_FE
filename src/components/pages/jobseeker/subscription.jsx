import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../layout/header';
// import { useSubscriptionData } from '../../../hooks/useSubscription.jsx';
import SubscriptionBadge from '../../common/SubscriptionBadge';
import UsageMeter from '../../common/UsageMeter';
import UpgradeModal from '../../common/UpgradeModal';
import { 
    FiStar, FiBarChart, FiCalendar, FiCreditCard, FiSettings,
    FiTrendingUp, FiCheck, FiX, FiAlertCircle, FiRefreshCw,
    FiDownload, FiEye, FiEdit3, FiTrash2, FiZap, FiAward
} from 'react-icons/fi';
import toastr from 'toastr';

const SubscriptionManagement = () => {
    const navigate = useNavigate();
    
    // Direct state management instead of hook
    const [subscriptionData, setSubscriptionData] = useState(null);
    const [subscriptionLoading, setSubscriptionLoading] = useState(true);
    const [subscriptionError, setSubscriptionError] = useState(null);

    // Legacy state for features not in new system
    const [billingHistory, setBillingHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const getUserToken = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        return user?.token || user?.accessToken;
    };

    // Direct API call for subscription data
    const fetchSubscriptionData = async () => {
        setSubscriptionLoading(true);
        setSubscriptionError(null);
        
        try {
            const token = getUserToken();

            console.log('Fetching subscription data...');
            
            // Use the same API endpoints as PackageList
            const [limitsResponse, usageResponse, subscriptionResponse] = await Promise.all([
                fetch('https://wdp301-lzse.onrender.com/api/user/limits', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }),
                fetch('https://wdp301-lzse.onrender.com/api/subscriptions/usage-stats', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }),
                fetch('https://wdp301-lzse.onrender.com/api/subscriptions/my-subscription', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
            ]);

            // Parse all responses
            const limitsData = await limitsResponse.json();
            const usageData = await usageResponse.json();
            const subscriptionDataRes = await subscriptionResponse.json();
            
            console.log('Limits data:', limitsData);
            console.log('Usage data:', usageData);
            console.log('Subscription data:', subscriptionDataRes);
            
            // Combine data from both endpoints
            let combinedData = null;
            
            if (limitsData.status && limitsData.result) {
                combinedData = limitsData.result;
                
                // Override with usage stats if available
                if (usageData.status && usageData.result) {
                    const usage = usageData.result;
                    
                    // Update applications data
                    if (usage.jobApplications) {
                        combinedData.applications = {
                            ...combinedData.applications,
                            used: usage.jobApplications.used || 0,
                            limit: usage.jobApplications.limit || combinedData.applications?.limit || 5,
                            remaining: Math.max(0, (usage.jobApplications.limit || 5) - (usage.jobApplications.used || 0))
                        };
                    }
                    
                    // Update favorites data
                    if (usage.savedJobs) {
                        combinedData.favorites = {
                            ...combinedData.favorites,
                            used: usage.savedJobs.used || 0,
                            limit: usage.savedJobs.limit || combinedData.favorites?.limit || 10,
                            remaining: Math.max(0, (usage.savedJobs.limit || 10) - (usage.savedJobs.used || 0))
                        };
                    }
                    
                    // Add profile views to analytics
                    if (!combinedData.analytics) {
                        combinedData.analytics = {};
                    }
                    combinedData.analytics.profileViews = usage.profileViews || 0;
                }
                
                // Update subscription info if available
                if (subscriptionDataRes.status && subscriptionDataRes.result?.hasSubscription) {
                    const subInfo = subscriptionDataRes.result;
                    combinedData.subscription = {
                        ...combinedData.subscription,
                        type: subInfo.planId?.packageType || subInfo.planId?.name?.toLowerCase() || 'free',
                        status: subInfo.status,
                        isActive: subInfo.status === 'active' || subInfo.status === 'trial',
                        startDate: subInfo.startDate,
                        expiryDate: subInfo.endDate,
                        daysRemaining: subInfo.daysRemaining || 0,
                        autoRenew: subInfo.autoRenew || false
                    };
                }
                
                setSubscriptionData(combinedData);
            } else {
                throw new Error(limitsData.message || 'Failed to fetch subscription data');
            }
        } catch (error) {
            console.error('Error fetching subscription data:', error);
            setSubscriptionError(error.message || 'Failed to fetch subscription data');
            toastr.error(error.message || 'Failed to fetch subscription data');
        } finally {
            setSubscriptionLoading(false);
        }
    };

    // Derived values from subscriptionData
    const currentTier = subscriptionData?.subscription?.type || 'free';
    const applicationUsage = {
        used: subscriptionData?.applications?.used || 0,
        limit: subscriptionData?.applications?.limit || 0,
        remaining: subscriptionData?.applications?.remaining || 0,
        percentage: subscriptionData?.applications?.limit === -1 ? 0 : 
                   Math.round(((subscriptionData?.applications?.used || 0) / (subscriptionData?.applications?.limit || 1)) * 100)
    };
    
    const getTierInfo = (tier) => {
        const tierMap = {
            'free': { name: 'Free', color: 'gray' },
            'basic': { name: 'Basic', color: 'blue' },
            'premium': { name: 'Premium', color: 'purple' },
            'enterprise': { name: 'Enterprise', color: 'gold' }
        };
        return tierMap[tier] || tierMap.free;
    };
    
    const tierInfo = getTierInfo(currentTier);

    // Manual sync function
    const handleSyncUsage = async (showToast = true) => {
        setIsSyncing(true);
        try {
            const token = getUserToken();
            const response = await fetch('https://wdp301-lzse.onrender.com/api/user/sync-usage', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (response.ok && data.status) {
                if (showToast) {
                    toastr.success('Usage data synced successfully');
                }
                // Refresh subscription data to show updated values
                await fetchSubscriptionData();
            } else {
                throw new Error(data.message || 'Failed to sync usage data');
            }
        } catch (error) {
            console.error('Error syncing usage data:', error);
            if (showToast) {
                toastr.error(error.message || 'Failed to sync usage data');
            }
        } finally {
            setIsSyncing(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        fetchSubscriptionData();
    }, []);

    // Fetch additional data not covered by subscription hook
    useEffect(() => {
        const fetchAdditionalData = async () => {
            const token = getUserToken();
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // Fetch billing history (not in new subscription system yet)
                const billingResponse = await fetch('https://wdp301-lzse.onrender.com/api/subscriptions/billing-history', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (billingResponse.ok) {
                    const billingData = await billingResponse.json();
                    setBillingHistory(billingData.result || []);
                }
            } catch (error) {
                console.error('Error fetching additional data:', error);
                // Don't show error toast for billing history as it's optional
            } finally {
                setIsLoading(false);
            }
        };

        if (!subscriptionLoading) {
            fetchAdditionalData();
        }
    }, [navigate, subscriptionLoading]);

    const handleCancelSubscription = async () => {
        setIsCancelling(true);
        try {
            const token = getUserToken();
            const response = await fetch('https://wdp301-lzse.onrender.com/api/subscriptions/cancel', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (response.ok && data.status) {
                toastr.success('Subscription cancelled successfully');
                setShowCancelModal(false);
                // Refresh subscription data
                await fetchSubscriptionData();
            } else {
                throw new Error(data.message || 'Failed to cancel subscription');
            }
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            toastr.error(error.message || 'Failed to cancel subscription');
        } finally {
            setIsCancelling(false);
        }
    };

    const handleUpgrade = (targetTier) => {
        setShowUpgradeModal(false);
        // Navigate to packages page or handle PayOS upgrade
        handlePayPalUpgrade(targetTier);
    };

    const handlePayPalUpgrade = async (targetTier) => {
        try {
            const token = getUserToken();
            const packageTypeMap = {
                'basic': 'basic',
                'premium': 'premium', 
                'enterprise': 'enterprise'
            };

            // First, get available plans to find the correct subscription ID
            const plansResponse = await fetch('https://wdp301-lzse.onrender.com/api/subscriptions/plans', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!plansResponse.ok) {
                throw new Error('Failed to fetch subscription plans');
            }

            const plansData = await plansResponse.json();
            const targetPlan = plansData.result?.find(plan => 
                plan.packageType === packageTypeMap[targetTier]
            );

            if (!targetPlan) {
                throw new Error(`${targetTier} plan not found`);
            }

            const response = await fetch('https://wdp301-lzse.onrender.com/api/subscriptions/subscribe', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subscriptionId: targetPlan._id,
                    paymentMethod: 'paypal',
                    billingPeriod: 'monthly'
                })
            });

            const data = await response.json();
            
            if (response.ok && data.status) {
                if (data.result.paymentUrl) {
                    // Redirect to PayPal payment page
                    window.open(data.result.paymentUrl, '_blank');
                    toastr.success('Redirecting to PayPal payment...');
                } else {
                    toastr.success('Subscription activated successfully!');
                    await fetchSubscriptionData();
                }
            } else {
                throw new Error(data.message || 'Failed to create payment request');
            }
        } catch (error) {
            console.error('Error creating payment:', error);
            toastr.error(error.message || 'Failed to initiate PayPal payment');
        }
    };

    // Log for debugging
    console.log('Current subscription data:', subscriptionData);
    console.log('Current application usage:', applicationUsage);

    const CancelModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiAlertCircle className="text-red-500 text-2xl"/>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Cancel Subscription?</h3>
                    <p className="text-gray-600">
                        You'll lose access to premium features at the end of your billing period. 
                        Your data will be preserved.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowCancelModal(false)}
                        className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                    >
                        Keep Subscription
                    </button>
                    <button
                        onClick={handleCancelSubscription}
                        disabled={isCancelling}
                        className="flex-1 bg-red-500 text-white py-3 px-4 rounded-xl hover:bg-red-600 transition-colors font-semibold flex items-center justify-center disabled:opacity-50"
                    >
                        {isCancelling ? (
                            <FiRefreshCw className="animate-spin mr-2"/>
                        ) : (
                            <FiTrash2 className="mr-2"/>
                        )}
                        Cancel Plan
                    </button>
                </div>
            </div>
        </div>
    );

    if (subscriptionLoading || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <Header />
                <div className="container mx-auto px-4 py-8 mt-20">
                    <div className="animate-pulse space-y-8">
                        <div className="h-12 bg-gray-200 rounded w-1/3"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1,2,3].map(i => (
                                <div key={i} className="bg-white rounded-2xl p-6 space-y-4">
                                    <div className="h-16 bg-gray-200 rounded"></div>
                                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (subscriptionError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <Header />
                <div className="container mx-auto px-4 py-8 mt-20">
                    <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiAlertCircle className="text-red-500 text-2xl"/>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Failed to Load Subscription Data</h3>
                        <p className="text-gray-600 mb-4">{subscriptionError}</p>
                        <button
                            onClick={fetchSubscriptionData}
                            className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors font-semibold"
                        >
                            <FiRefreshCw className="mr-2 inline"/>
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const isFreePlan = currentTier === 'free';
    const subscription = subscriptionData?.subscription;
    const isActive = subscription?.isActive;
    const isTrial = subscription?.type === 'trial';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header />
            
            <div className="container mx-auto px-4 py-8 mt-20">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">Subscription Management gyaaaaaaa</h1>
                        <p className="text-gray-600">Manage your plan, usage, and billing</p>
                    </div>
                    <button
                        onClick={() => navigate('/packages')}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold flex items-center"
                    >
                        <FiZap className="mr-2"/>
                        View All Plans
                    </button>
                </div>

                {/* Current Plan */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                                    isFreePlan ? 'bg-gray-100' : 'bg-gradient-to-r from-yellow-400 to-orange-500'
                                }`}>
                                    {isFreePlan ? (
                                        <FiSettings className="text-gray-600 text-xl"/>
                                    ) : (
                                        <FiAward className="text-white text-xl"/>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center mb-2">
                                        <h2 className="text-2xl font-bold text-gray-800 mr-3">
                                            {tierInfo.name} Plan
                                        </h2>
                                        <SubscriptionBadge tier={currentTier} size="md" />
                                        {isTrial && (
                                            <span className="ml-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                                                Trial
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600">
                                        {isActive && !isTrial && 'Active subscription'}
                                        {isTrial && 'Free trial active'}
                                        {subscription?.status === 'cancelled' && 'Cancelled (access until end of period)'}
                                        {isFreePlan && 'Free plan with basic features'}
                                    </p>
                                </div>
                            </div>
                            
                            {subscription && subscription.daysRemaining !== undefined && (
                                <div className="flex items-center space-x-6 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <FiCalendar className="mr-2"/>
                                        {isTrial ? 'Trial ends in:' : subscription.status === 'cancelled' ? 'Access until:' : 'Next billing in:'} {subscription.daysRemaining} days
                                    </div>
                                    {subscription.expiryDate && (
                                        <div className="flex items-center">
                                            <FiCreditCard className="mr-2"/>
                                            Expires: {new Date(subscription.expiryDate).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            {!isFreePlan && subscription?.status !== 'cancelled' && (
                                <button
                                    onClick={() => setShowCancelModal(true)}
                                    className="px-6 py-3 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-semibold"
                                >
                                    Cancel Plan
                                </button>
                            )}
                            {(isFreePlan || isTrial) && (
                                <button
                                    onClick={() => setShowUpgradeModal(true)}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
                                >
                                    <FiAward className="mr-2"/>
                                    Upgrade Now
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Usage Statistics - Always show regardless of current plan */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                            <FiBarChart className="mr-3 text-blue-500"/>
                            Usage This Month
                            {subscriptionData?.debug && (
                                <span className="ml-2 text-sm text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                                    Debug Mode
                                </span>
                            )}
                        </h3>
                        {/* Sync button if needed */}
                        {subscriptionData?.debug?.needsSync && Object.values(subscriptionData.debug.needsSync).some(Boolean) && (
                            <button
                                onClick={() => handleSyncUsage(true)}
                                disabled={isSyncing}
                                className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold disabled:opacity-50"
                            >
                                {isSyncing ? (
                                    <FiRefreshCw className="animate-spin mr-2" />
                                ) : (
                                    <FiRefreshCw className="mr-2" />
                                )}
                                {isSyncing ? 'Syncing...' : 'Sync Data'}
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Applications Usage */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-3 bg-blue-500 rounded-xl text-white">
                                    <FiEye className="h-5 w-5"/>
                                </div>
                                <h3 className="font-semibold text-gray-800">Applications</h3>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Used</span>
                                    <span className="font-semibold">
                                        {subscriptionData?.applications?.used || 0} / {
                                            subscriptionData?.applications?.limit === -1 ? 'Unlimited' : 
                                            subscriptionData?.applications?.limit || 5
                                        }
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-blue-500 h-2 rounded-full" 
                                        style={{ 
                                            width: subscriptionData?.applications?.limit === -1 ? '0%' : 
                                                `${Math.min(100, ((subscriptionData?.applications?.used || 0) / (subscriptionData?.applications?.limit || 5)) * 100)}%` 
                                        }}
                                    ></div>
                                </div>
                                <div className="text-sm text-gray-600">
                                    {subscriptionData?.applications?.remaining || 0} remaining this month
                                </div>
                            </div>
                        </div>
                        
                        {/* Favorites Usage */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-3 bg-red-500 rounded-xl text-white">
                                    <FiStar className="h-5 w-5"/>
                                </div>
                                <h3 className="font-semibold text-gray-800">Favorites</h3>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Used</span>
                                    <span className="font-semibold">
                                        {subscriptionData?.favorites?.used || subscriptionData?.user?.actualCounts?.favoriteJobs || 0} / {
                                            subscriptionData?.favorites?.limit === -1 ? 'Unlimited' : 
                                            subscriptionData?.favorites?.limit || 10
                                        }
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-red-500 h-2 rounded-full" 
                                        style={{ 
                                            width: subscriptionData?.favorites?.limit === -1 ? '0%' : 
                                                `${Math.min(100, ((subscriptionData?.favorites?.used || subscriptionData?.user?.actualCounts?.favoriteJobs || 0) / (subscriptionData?.favorites?.limit || 10)) * 100)}%` 
                                        }}
                                    ></div>
                                </div>
                                <div className="text-sm text-gray-600">
                                    {subscriptionData?.favorites?.remaining || 0} remaining
                                </div>
                            </div>
                        </div>

                        {/* Job Postings or Profile Views */}
                        {subscriptionData?.jobPostings && subscriptionData.jobPostings.limit > 0 ? (
                            <div className="bg-white rounded-2xl p-6 shadow-lg">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="p-3 bg-green-500 rounded-xl text-white">
                                        <FiEdit3 className="h-5 w-5"/>
                                    </div>
                                    <h3 className="font-semibold text-gray-800">Job Postings</h3>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Used</span>
                                        <span className="font-semibold">
                                            {subscriptionData.jobPostings?.used || 0} / {
                                                subscriptionData.jobPostings?.limit === -1 ? 'Unlimited' : 
                                                subscriptionData.jobPostings?.limit || 0
                                            }
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-green-500 h-2 rounded-full" 
                                            style={{ 
                                                width: subscriptionData.jobPostings?.limit === -1 ? '0%' : 
                                                    `${Math.min(100, ((subscriptionData.jobPostings?.used || 0) / (subscriptionData.jobPostings?.limit || 1)) * 100)}%` 
                                            }}
                                        ></div>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {subscriptionData.jobPostings?.remaining || 0} remaining this month
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl p-6 shadow-lg">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="p-3 bg-purple-500 rounded-xl text-white">
                                        <FiTrendingUp className="h-5 w-5"/>
                                    </div>
                                    <h3 className="font-semibold text-gray-800">Profile Activity</h3>
                                </div>
                                <div className="text-3xl font-bold text-gray-800 mb-2">
                                    {subscriptionData?.analytics?.profileViews || 0}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Profile views this month
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                    CV Downloads: {subscriptionData?.analytics?.cvDownloads || 0}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Billing History */}
                <div className="bg-white rounded-3xl shadow-xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                            <FiCreditCard className="mr-3 text-green-500"/>
                            Billing History
                        </h3>
                        <button className="text-blue-600 hover:text-blue-700 font-semibold flex items-center">
                            <FiDownload className="mr-2"/>
                            Download All
                        </button>
                    </div>

                    {billingHistory.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiCreditCard className="text-gray-400 text-2xl"/>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">No billing history</h4>
                            <p className="text-gray-600">
                                {isFreePlan ? 'Upgrade to a paid plan to see billing history' : 'Your billing history will appear here'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {billingHistory.map((bill, index) => (
                                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${
                                            bill.status === 'paid' ? 'bg-green-100' : 
                                            bill.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                                        }`}>
                                            {bill.status === 'paid' ? (
                                                <FiCheck className="text-green-600"/>
                                            ) : bill.status === 'pending' ? (
                                                <FiRefreshCw className="text-yellow-600"/>
                                            ) : (
                                                <FiX className="text-red-600"/>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{bill.description || `${bill.planName} Plan`}</p>
                                            <p className="text-sm text-gray-600">{new Date(bill.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-bold text-gray-800 mr-4">${bill.amount}</span>
                                        <button className="text-blue-600 hover:text-blue-700">
                                            <FiDownload />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showCancelModal && <CancelModal />}
            
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                currentTier={currentTier}
                actionType="subscription"
                message="Upgrade your plan to access more features and higher limits"
                onUpgrade={handleUpgrade}
            />
        </div>
    );
};

export default SubscriptionManagement; 
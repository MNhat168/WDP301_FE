import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../layout/header';
import { useSubscriptionData } from '../../../hooks/useSubscription.jsx';
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
    
    // Use new subscription hook
    const {
        subscriptionData,
        loading: subscriptionLoading,
        error: subscriptionError,
        refreshData,
        currentTier,
        applicationUsage,
        tierInfo
    } = useSubscriptionData();

    // Legacy state for features not in new system
    const [billingHistory, setBillingHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const getUserToken = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        return user?.token;
    };

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
                const billingResponse = await fetch('http://localhost:5000/api/subscriptions/billing-history', {
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
            const response = await fetch('http://localhost:5000/api/subscriptions/cancel', {
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
                refreshData();
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
        // Navigate to packages page or handle upgrade
        navigate('/packages');
        console.log(`Upgrading to ${targetTier}`);
    };

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
                            onClick={refreshData}
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
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">Subscription Management</h1>
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

                {/* Usage Statistics */}
                {subscriptionData && (
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <FiBarChart className="mr-3 text-blue-500"/>
                            Usage This Month
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-2xl p-6 shadow-lg">
                                <UsageMeter
                                    type="applications"
                                    used={subscriptionData.subscription?.applications?.actual || subscriptionData.applications?.used || 0}
                                    limit={subscriptionData.applications?.limit || subscriptionData.subscription?.applications?.limit || 5}
                                    size="md"
                                />
                            </div>
                            
                            <div className="bg-white rounded-2xl p-6 shadow-lg">
                                <UsageMeter
                                    type="favorites"
                                    used={subscriptionData.user?.actualCounts?.favoriteJobs || subscriptionData.favorites?.count || 0}
                                    limit={subscriptionData.favorites?.limit || 10}
                                    size="md"
                                />
                            </div>

                            {subscriptionData.jobPostings && (
                                <div className="bg-white rounded-2xl p-6 shadow-lg">
                                    <UsageMeter
                                        type="jobPostings"
                                        used={subscriptionData.subscription?.jobPostings?.actual || subscriptionData.jobPostings.used || 0}
                                        limit={subscriptionData.jobPostings.limit || subscriptionData.subscription?.jobPostings?.limit || 0}
                                        size="md"
                                    />
                                </div>
                            )}

                            {!subscriptionData.jobPostings && (
                                <div className="bg-white rounded-2xl p-6 shadow-lg">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="p-3 bg-green-500 rounded-xl text-white">
                                            <FiEye className="h-5 w-5"/>
                                        </div>
                                        <h3 className="font-semibold text-gray-800">Profile Views</h3>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-800 mb-2">
                                        {subscriptionData.analytics?.profileViews || subscriptionData.user?.profileViews || 0}
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Total views this month
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

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
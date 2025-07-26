import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../layout/header';
import useBanCheck from '../admin/checkban';
import { UserContext } from '../../../Context';
import {
    FiCheck, FiX, FiStar, FiZap, FiTrendingUp, FiUsers, FiEye,
    FiHeart, FiBriefcase, FiBarChart, FiGift, FiClock,
    FiShield, FiArrowRight, FiRefreshCw, FiCalendar, FiTarget,
    FiCreditCard, FiSettings, FiAward, FiAlertCircle, FiDownload,
    FiEdit3, FiTrash2
} from 'react-icons/fi';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

const PackageList = () => {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    
    const [plans, setPlans] = useState([]);
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [usageStats, setUsageStats] = useState(null);
    const [billingHistory, setBillingHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isTrialLoading, setIsTrialLoading] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState({
        amount: 0,
        bankCode: 'paypal',
        language: 'en'
    });
    const BanPopup = useBanCheck();

    // Get user token
    const getUserToken = () => {
        return user?.accessToken || user?.token;
    };

    // Fetch all data in one function
    const fetchAllData = async () => {
        try {
            const token = getUserToken();
            if (!token) return;

            setIsLoading(true);

            // Fetch subscription plans
            const plansResponse = await fetch('https://wdp301-lzse.onrender.com/api/subscriptions/plans', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (plansResponse.ok) {
                const plansData = await plansResponse.json();
                setPlans(plansData.result || []);
            }

            // Fetch current subscription
            const subResponse = await fetch('https://wdp301-lzse.onrender.com/api/subscriptions/my-subscription', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (subResponse.ok) {
                const subData = await subResponse.json();
                if (subData.result && subData.result.hasSubscription) {
                    setCurrentSubscription(subData.result);
                } else {
                    setCurrentSubscription(null);
                }
            } else {
                setCurrentSubscription(null);
            }

            // Fetch usage stats
            const statsResponse = await fetch('https://wdp301-lzse.onrender.com/api/user/limits', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            
            // Fetch actual applications for verification
            const applicationsResponse = await fetch('https://wdp301-lzse.onrender.com/api/applications/my-applications', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            let actualApplicationsCount = 0;
            let actualApplicationsList = [];
            if (applicationsResponse.ok) {
                const appsData = await applicationsResponse.json();
                
                if (appsData.success && appsData.data && appsData.data.applications) {
                    actualApplicationsList = appsData.data.applications;
                    actualApplicationsCount = actualApplicationsList.length;
                } else if (appsData.result && Array.isArray(appsData.result)) {
                    actualApplicationsList = appsData.result;
                    actualApplicationsCount = actualApplicationsList.length;
                }
            }
            
            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                
                const transformedStats = {
                    jobApplications: {
                        used: statsData.result?.applications?.used || 0,
                        limit: statsData.result?.applications?.limit || 5,
                        actualCount: actualApplicationsCount,
                        actualList: actualApplicationsList
                    },
                    savedJobs: {
                        used: statsData.result?.favorites?.used || 0,
                        limit: statsData.result?.favorites?.limit || 10,
                        actualCount: statsData.result?.user?.actualCounts?.favoriteJobs || 0
                    },
                    profileViews: statsData.result?.analytics?.profileViews || 0,
                    jobPostings: {
                        used: statsData.result?.jobPostings?.used || 0,
                        limit: statsData.result?.jobPostings?.limit || 0
                    }
                };
                
                setUsageStats(transformedStats);
            } else {
                const defaultStats = {
                    jobApplications: { used: 0, limit: 5, actualCount: 0 },
                    savedJobs: { used: 0, limit: 10, actualCount: 0 },
                    profileViews: 0,
                    jobPostings: { used: 0, limit: 0 }
                };
                setUsageStats(defaultStats);
            }

            // Fetch billing history
            const billingResponse = await fetch('https://wdp301-lzse.onrender.com/api/subscriptions/billing-history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (billingResponse.ok) {
                const billingData = await billingResponse.json();
                setBillingHistory(billingData.result || []);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            toastr.error('Failed to load subscription data');
            // Set default stats even if there's an error
            setUsageStats({
                jobApplications: { used: 0, limit: 5, actualCount: 0 },
                savedJobs: { used: 0, limit: 10, actualCount: 0 },
                profileViews: 0,
                jobPostings: { used: 0, limit: 0 }
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        fetchAllData();
    }, [user]);

    // Cancel subscription
    const handleCancelSubscription = async () => {
        setIsCancelling(true);
        try {
            const token = getUserToken();
            const response = await fetch('https://wdp301-lzse.onrender.com/api/subscriptions/cancel', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (response.ok && data.status) {
                toastr.success('Subscription cancelled successfully');
                setShowCancelModal(false);
                await fetchAllData(); // Refresh all data
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

    // Activate free trial - Updated to use subscribe endpoint
    const handleActivateTrial = async (planId) => {
        setIsTrialLoading(true);
        try {
            const token = getUserToken();
            const response = await fetch('https://wdp301-lzse.onrender.com/api/subscriptions/subscribe', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    subscriptionId: planId,
                    paymentMethod: 'trial' 
                })
            });

            const data = await response.json();
            
            if (response.ok && data.status) {
                toastr.success('Free trial activated successfully!');
                // Refresh subscription data
                await fetchAllData();
            } else {
                throw new Error(data.message || 'Failed to activate trial');
            }
        } catch (error) {
            console.error('Error activating trial:', error);
            toastr.error(error.message || 'Failed to activate free trial');
        } finally {
            setIsTrialLoading(false);
        }
    };

    // Handle upgrade click
    const handleUpgradeClick = (plan) => {
        const planName = plan.name || plan.packageName;
        const planPrice = plan.price || (plan.pricing?.monthly) || 0;
        const planTrialDays = plan.trialDays || (plan.promotions?.trialDays) || 0;
        
        if (planName === 'Free') {
            toastr.info('You are already on the free plan');
            return;
        }

        // Check if user can start trial
        if (!currentSubscription && planTrialDays > 0) {
            if (confirm(`Start ${planTrialDays}-day free trial for ${planName}?`)) {
                handleActivateTrial(plan._id);
                return;
            }
        }

        setSelectedPlan(plan);
        setPaymentDetails(prev => ({
            ...prev,
            amount: planPrice,
            planId: plan._id
        }));
        setShowPaymentModal(true);
    };

    // Payment modal component
    const PaymentModal = () => {
        const selectedPlanName = selectedPlan?.name || selectedPlan?.packageName || 'Premium Plan';
        const selectedPlanPrice = selectedPlan?.price || (selectedPlan?.pricing?.monthly) || 0;
        const selectedPlanInterval = selectedPlan?.interval || 'month';
        
        return (
            <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-auto flex flex-col">
                    <div className="p-6 text-center">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Upgrade to {selectedPlanName}</h2>
                        <div className="text-3xl font-bold text-blue-700 mb-2">
                            ${selectedPlanPrice?.toLocaleString()} <span className="text-base text-gray-500 font-normal">/{selectedPlanInterval}</span>
                        </div>
                    </div>
                    <form id="payment-form" onSubmit={handlePaymentSubmit} className="px-6 pb-6 flex flex-col gap-4">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center text-base"
                        >
                            <FiStar className="mr-2"/>
                            Pay with PayPal
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowPaymentModal(false)}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold text-base"
                        >
                            Cancel
                        </button>
                    </form>
                </div>
            </div>
        );
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = getUserToken();
            const response = await fetch('https://wdp301-lzse.onrender.com/api/subscriptions/subscribe', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subscriptionId: selectedPlan._id,
                    paymentMethod: paymentDetails.bankCode || 'paypal',
                    billingPeriod: 'monthly'
                })
            });

            const result = await response.json();

            if (response.ok && result.status) {
                // For PayPal integration, redirect to PayPal payment page
                if (result.result.paymentUrl) {
                    window.location.href = result.result.paymentUrl;
                } else {
                    const message = result.result.isUpgrade ? 
                        'Subscription upgraded successfully!' : 
                        'Subscription activated successfully!';
                    toastr.success(message);
                    setShowPaymentModal(false);
                    // Refresh subscription data
                    await fetchAllData();
                }
            } else {
                throw new Error(result.message || 'Subscription failed');
            }
        } catch (error) {
            console.error('Error processing subscription:', error);
            toastr.error('Subscription failed. Please try again.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Usage stats component
    const UsageStatsCard = () => {
        // Always show the card, even if usageStats is not loaded yet
        const stats = usageStats || {
            jobApplications: { used: 0, limit: 5, actualCount: 0 },
            savedJobs: { used: 0, limit: 10, actualCount: 0 },
            profileViews: 0,
            jobPostings: { used: 0, limit: 0 }
        };

        return (
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-12">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <FiBarChart className="mr-3 text-blue-500"/>
                    Your Usage This Month
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                        <div className="flex items-center justify-between mb-4">
                            <FiBriefcase className="text-blue-600 text-2xl"/>
                            <span className="text-sm font-semibold text-blue-600 bg-blue-200 px-3 py-1 rounded-full">
                                Job Applications
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-blue-700 mb-2">
                            {stats.jobApplications?.actualCount !== undefined ? 
                                stats.jobApplications.actualCount : 
                                (stats.jobApplications?.used || 0)}
                        </div>
                        <div className="text-sm text-blue-600">
                            of {stats.jobApplications?.limit === -1 ? '∞' : stats.jobApplications?.limit || 5} applications
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
                            <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ 
                                    width: stats.jobApplications?.limit === -1 ? '20%' : 
                                           `${Math.min(((stats.jobApplications?.actualCount !== undefined ? stats.jobApplications.actualCount : stats.jobApplications?.used || 0) / (stats.jobApplications?.limit || 5)) * 100, 100)}%` 
                                }}
                            ></div>
                        </div>
                        <div className="text-xs text-blue-500 mt-2">
                            Remaining: {stats.jobApplications?.limit === -1 ? '∞' : Math.max(0, (stats.jobApplications?.limit || 5) - (stats.jobApplications?.actualCount !== undefined ? stats.jobApplications.actualCount : stats.jobApplications?.used || 0))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                        <div className="flex items-center justify-between mb-4">
                            <FiHeart className="text-purple-600 text-2xl"/>
                            <span className="text-sm font-semibold text-purple-600 bg-purple-200 px-3 py-1 rounded-full">
                                Saved Jobs
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-purple-700 mb-2">
                            {stats.savedJobs?.actualCount !== undefined ? 
                                stats.savedJobs.actualCount : 
                                (stats.savedJobs?.used || 0)}
                        </div>
                        <div className="text-sm text-purple-600">
                            of {stats.savedJobs?.limit === -1 ? '∞' : stats.savedJobs?.limit || 10} saves
                        </div>
                        <div className="w-full bg-purple-200 rounded-full h-2 mt-3">
                            <div 
                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ 
                                    width: stats.savedJobs?.limit === -1 ? '30%' : 
                                           `${Math.min(((stats.savedJobs?.actualCount !== undefined ? stats.savedJobs.actualCount : stats.savedJobs?.used || 0) / (stats.savedJobs?.limit || 10)) * 100, 100)}%` 
                                }}
                            ></div>
                        </div>
                        <div className="text-xs text-purple-500 mt-2">
                            Remaining: {stats.savedJobs?.limit === -1 ? '∞' : Math.max(0, (stats.savedJobs?.limit || 10) - (stats.savedJobs?.actualCount !== undefined ? stats.savedJobs.actualCount : stats.savedJobs?.used || 0))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                        <div className="flex items-center justify-between mb-4">
                            <FiEye className="text-green-600 text-2xl"/>
                            <span className="text-sm font-semibold text-green-600 bg-green-200 px-3 py-1 rounded-full">
                                Profile Views
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-green-700 mb-2">
                            {stats.profileViews || 0}
                        </div>
                        <div className="text-sm text-green-600">
                            this month
                        </div>
                        {stats.jobPostings?.limit > 0 && (
                            <div className="mt-3 pt-3 border-t border-green-200">
                                <div className="text-sm text-green-600 font-semibold">
                                    Job Posts: {stats.jobPostings?.used || 0}/{stats.jobPostings?.limit || 0}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Plan card component
    const PlanCard = ({ plan, isPopular = false, isCurrentPlan = false }) => {
        const features = plan.features || [];
        
        // Handle backend data structure differences
        const planName = plan.name || plan.packageName || 'Unknown Plan';
        const planPrice = plan.price || (plan.pricing?.monthly) || 0;
        const planInterval = plan.interval || 'month';
        const planTrialDays = plan.trialDays || (plan.promotions?.trialDays) || 0;
        
        const canStartTrial = !currentSubscription && planTrialDays > 0 && planName !== 'Free';

        return (
            <div className={`relative bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-2 flex flex-col min-h-[550px] ${
                isCurrentPlan ? 'ring-4 ring-green-500 shadow-green-200/50 shadow-2xl' : 
                isPopular ? 'ring-4 ring-blue-500' : ''
            }`}>
                {isCurrentPlan && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg z-10">
                        <FiCheck className="mr-1 h-3 w-3"/>
                        Current Plan
                    </div>
                )}
                {isPopular && !isCurrentPlan && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg z-10">
                        <FiStar className="mr-1 h-3 w-3"/>
                        Popular
                    </div>
                )}

                {/* Card Content Wrapper */}
                <div className="flex-1 flex flex-col p-8 pt-12">
                    {/* Header, Price, and Features Section */}
                    <div className="flex-1">
                        {/* Plan Header */}
                        <div className="text-center mb-6">
                            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                                planName === 'Free' ? 'bg-gray-100' :
                                planName === 'Basic' ? 'bg-blue-100' :
                                planName === 'Premium' ? 'bg-purple-100' :
                                'bg-gradient-to-r from-yellow-100 to-orange-100'
                            }`}>
                                {planName === 'Free' ? <FiUsers className="text-gray-600 text-2xl"/> :
                                 planName === 'Basic' ? <FiZap className="text-blue-600 text-2xl"/> :
                                 planName === 'Premium' ? <FiStar className="text-purple-600 text-2xl"/> :
                                 <FiStar className="text-orange-600 text-2xl"/>}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">{planName}</h3>
                            <p className="text-gray-600 text-sm">{plan.description}</p>
                        </div>

                        {/* Pricing */}
                        <div className="text-center mb-6">
                            <div className="text-4xl font-bold text-gray-800 mb-2">
                                ${planPrice}
                                <span className="text-lg text-gray-500 font-normal">/{planInterval}</span>
                            </div>
                            {planTrialDays > 0 && !currentSubscription && (
                                <div className="flex items-center justify-center text-green-600 text-sm font-semibold">
                                    <FiGift className="mr-1"/>
                                    {planTrialDays} days free trial
                                </div>
                            )}
                        </div>

                        {/* Features */}
                        <div className="space-y-3">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-start">
                                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                        <FiCheck className="text-green-600 text-xs"/>
                                    </div>
                                    <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Action Button Footer */}
                    <div className="mt-auto pt-6">
                        <div className="space-y-3">
                            {isCurrentPlan ? (
                                <div className="w-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 py-4 px-6 rounded-2xl text-center font-semibold flex items-center justify-center border-2 border-green-200">
                                    <FiCheck className="mr-2"/>
                                    Current Plan
                                </div>
                            ) : canStartTrial ? (
                                <button
                                    onClick={() => handleActivateTrial(plan._id)}
                                    disabled={isTrialLoading}
                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-6 rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 font-semibold flex items-center justify-center disabled:opacity-50"
                                >
                                    {isTrialLoading ? (
                                        <FiRefreshCw className="mr-2 animate-spin"/>
                                    ) : (
                                        <FiGift className="mr-2"/>
                                    )}
                                    Start Free Trial
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleUpgradeClick(plan)}
                                    className={`w-full py-4 px-6 rounded-2xl font-semibold transition-all transform hover:scale-105 flex items-center justify-center ${
                                        isPopular 
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <FiArrowRight className="mr-2"/>
                                    {planName === 'Free' ? 'Current Plan' : 'Upgrade Now'}
                                </button>
                            )}

                            {currentSubscription && currentSubscription.planId?._id !== plan._id && planName !== 'Free' && (
                                <div className="text-center">
                                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                        Compare features
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="animate-pulse space-y-8">
                        <div className="h-12 bg-gray-200 rounded w-1/3 mx-auto"></div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="bg-white rounded-3xl p-8 space-y-4">
                                    <div className="h-16 bg-gray-200 rounded-2xl"></div>
                                    <div className="h-8 bg-gray-200 rounded"></div>
                                    <div className="h-12 bg-gray-200 rounded"></div>
                                    <div className="space-y-2">
                                        {[1,2,3,4].map(j => (
                                            <div key={j} className="h-6 bg-gray-200 rounded"></div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {BanPopup}
            <Header />
            
            <div className="container mx-auto px-4 py-8 mt-20">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-extrabold text-gray-800 mb-4">
                        Subscription <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Management</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Manage your subscription, track usage, and unlock your career potential with our premium features.
                    </p>
                    {(!currentSubscription || !currentSubscription.hasSubscription) && (
                        <p className="text-lg text-gray-500 mt-2">
                            Start with a free trial and upgrade anytime.
                        </p>
                    )}
                </div>

                {/* Usage Stats - Always show this */}
                <div className="relative z-10 mb-12">
                    <UsageStatsCard />
                </div>

                {/* Current Subscription Management */}
                {currentSubscription && currentSubscription.hasSubscription && (
                    <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center mr-4">
                                        <FiAward className="text-white text-xl"/>
                                    </div>
                                    <div>
                                        <div className="flex items-center mb-2">
                                            <h2 className="text-2xl font-bold text-gray-800 mr-3">
                                                {currentSubscription.planId?.name || currentSubscription.planId?.packageName || 'Premium'} Plan
                                            </h2>
                                            {currentSubscription.status === 'trial' && (
                                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                                                    Trial
                                                </span>
                                            )}
                                            {currentSubscription.status === 'active' && (
                                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-600">
                                            {currentSubscription.status === 'active' && !currentSubscription.status === 'trial' && 'Active subscription'}
                                            {currentSubscription.status === 'trial' && 'Free trial active'}
                                            {currentSubscription.status === 'cancelled' && 'Cancelled (access until end of period)'}
                                        </p>
                                    </div>
                                </div>
                                
                                {currentSubscription && currentSubscription.daysRemaining !== undefined && (
                                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <FiCalendar className="mr-2"/>
                                            {currentSubscription.status === 'trial' ? 'Trial ends in:' : 
                                             currentSubscription.status === 'cancelled' ? 'Access until:' : 
                                             'Next billing in:'} {currentSubscription.daysRemaining} days
                                        </div>
                                        {currentSubscription.endDate && (
                                            <div className="flex items-center">
                                                <FiCreditCard className="mr-2"/>
                                                Expires: {new Date(currentSubscription.endDate).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                {currentSubscription.status !== 'cancelled' && (
                                    <button
                                        onClick={() => setShowCancelModal(true)}
                                        className="px-6 py-3 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-semibold"
                                    >
                                        Cancel Plan
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Pricing Plans */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    {plans && plans.length > 0 ? plans.map((plan, index) => {
                        const planName = plan.name || plan.packageName;
                        
                        // Updated current plan detection for new API structure
                        let isCurrentPlan = false;
                        if (currentSubscription && currentSubscription.hasSubscription) {
                            // User has active subscription - check both possible locations for planId
                            const currentPlanId = currentSubscription.planId?._id || currentSubscription.subscription?.planId;
                            const planIdStr = plan._id?.toString();
                            const currentPlanIdStr = currentPlanId?.toString();
                            
                            isCurrentPlan = planIdStr === currentPlanIdStr;
                        } else {
                            // User has no subscription = free plan
                            isCurrentPlan = planName === 'Free' || plan.packageType === 'free';
                        }
                        
                        const isPopular = planName === 'Premium' || plan.packageType === 'premium';
                        
                        return (
                            <PlanCard 
                                key={plan._id || index} 
                                plan={plan} 
                                isPopular={isPopular}
                                isCurrentPlan={isCurrentPlan}
                            />
                        );
                    }) : (
                        <div className="col-span-full text-center py-12">
                            <p className="text-gray-500 text-lg">No subscription plans available at the moment.</p>
                        </div>
                    )}
                </div>

                {/* Billing History */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-16">
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
                                {(!currentSubscription || !currentSubscription.hasSubscription) ? 
                                    'Upgrade to a paid plan to see billing history' : 
                                    'Your billing history will appear here'}
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
                                            <p className="text-sm text-gray-600">{new Date(bill.paymentDate || bill.date).toLocaleDateString()}</p>
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

                {/* FAQ Section */}
                <div className="bg-white rounded-3xl shadow-xl p-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Frequently Asked Questions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Can I cancel anytime?</h4>
                                <p className="text-gray-600">Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">What happens to my data if I downgrade?</h4>
                                <p className="text-gray-600">Your data is never deleted. If you downgrade, you'll just have limited access to some premium features.</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Do you offer refunds?</h4>
                                <p className="text-gray-600">We offer a 14-day money-back guarantee for all paid plans. No questions asked.</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">How does the free trial work?</h4>
                                <p className="text-gray-600">Free trials give you full access to premium features. No credit card required to start.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showPaymentModal && <PaymentModal />}
            {showCancelModal && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-auto flex flex-col">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <FiAlertCircle className="text-white text-xl"/>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Cancel Subscription</h2>
                            <p className="text-sm text-gray-500 mt-1">Are you sure you want to cancel your subscription?</p>
                        </div>
                        <div className="px-6 pb-6 flex-1">
                            <div className="space-y-4">
                                <p className="text-gray-700 text-sm">
                                    Cancelling your subscription will immediately end your access to all premium features. 
                                    Your data will be preserved, but you won't be able to use features like 
                                    unlimited job applications, saved jobs, or profile views.
                                </p>
                                <p className="text-gray-700 text-sm">
                                    You will continue to have access to the free plan features until the end of your current billing period.
                                </p>
                            </div>
                        </div>
                        <div className="px-6 pb-6">
                            <div className="flex flex-col-reverse sm:flex-row gap-3">
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    className="flex-1 bg-white border border-gray-300 text-gray-800 py-3 px-5 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCancelSubscription}
                                    className="flex-1 bg-red-600 text-white py-3 px-5 rounded-lg hover:bg-red-700 transition-all font-semibold text-sm"
                                >
                                    Confirm Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PackageList;
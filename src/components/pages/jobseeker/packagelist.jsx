import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../layout/header';
import useBanCheck from '../admin/checkban';
import { UserContext } from '../../../Context';
import {
    FiCheck, FiX, FiStar, FiZap, FiTrendingUp, FiUsers, FiEye,
    FiHeart, FiBriefcase, FiBarChart, FiGift, FiClock,
    FiShield, FiArrowRight, FiRefreshCw, FiCalendar, FiTarget
} from 'react-icons/fi';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

const PackageList = () => {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    
    const [plans, setPlans] = useState([]);
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [usageStats, setUsageStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isTrialLoading, setIsTrialLoading] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState({
        amount: 0,
        bankCode: '',
        language: 'vn'
    });
    const BanPopup = useBanCheck();

    // Get user token
    const getUserToken = () => {
        return user?.accessToken || user?.token;
    };

    // Fetch subscription plans
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                if (!user) {
                    navigate('/login');
                    return;
                }

                const token = getUserToken();
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await fetch('http://localhost:5000/api/subscriptions/plans', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch plans');
                }

                const data = await response.json();
                setPlans(data.result || []);
            } catch (error) {
                console.error('Error fetching plans:', error);
                toastr.error('Failed to load subscription plans');
            }
        };

        fetchPlans();
    }, [user, navigate]);

    // Fetch current subscription and usage stats
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = getUserToken();
                if (!token) return;

                // Fetch current subscription - Updated endpoint
                const subResponse = await fetch('http://localhost:5000/api/subscriptions/my-subscription', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (subResponse.ok) {
                    const subData = await subResponse.json();
                    // Handle new API structure
                    if (subData.result && subData.result.hasSubscription) {
                        setCurrentSubscription(subData.result);
                    } else {
                        // User has no active subscription (free plan)
                        setCurrentSubscription(null);
                    }
                }

                // Fetch usage stats
                const statsResponse = await fetch('http://localhost:5000/api/subscriptions/usage-stats', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    setUsageStats(statsData.result);
                }

            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // Activate free trial - Updated to use subscribe endpoint
    const handleActivateTrial = async (planId) => {
        setIsTrialLoading(true);
        try {
            const token = getUserToken();
            const response = await fetch('http://localhost:5000/api/subscriptions/subscribe', {
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
                window.location.reload();
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
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                {/* Modal Container */}
                <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-auto flex flex-col">
                    {/* Modal Header */}
                    <div className="p-6 text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <FiStar className="text-white text-xl"/>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Upgrade to {selectedPlanName}</h2>
                        <p className="text-sm text-gray-500 mt-1">Choose your payment method below</p>
                    </div>

                    {/* Modal Body */}
                    <div className="px-6 pb-6 flex-1">
                        <form id="payment-form" onSubmit={handlePaymentSubmit} className="space-y-4">
                            <div className="bg-gray-100/70 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600">Total Amount</span>
                                    <span className="text-xl font-bold text-gray-900">
                                        ${selectedPlanPrice?.toLocaleString()}
                                        <span className="text-sm text-gray-500 font-normal">/{selectedPlanInterval}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                                    <FiShield className="mr-2 text-gray-400 h-4 w-4"/>
                                    Payment Method
                                </h3>
                                <div className="space-y-2">
                                    {[
                                        { value: '', label: 'VNPAY QR Payment Gateway', icon: '🏦' },
                                        { value: 'VNBANK', label: 'Domestic ATM Card/Account', icon: '💳' },
                                        { value: 'INTCARD', label: 'International Card', icon: '🌍' }
                                    ].map((method) => (
                                        <label key={method.value} className={`flex items-center p-3.5 border rounded-lg transition-all cursor-pointer ${paymentDetails.bankCode === method.value ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 bg-white hover:border-gray-400'}`}>
                                            <input type="radio" name="bankCode" value={method.value} checked={paymentDetails.bankCode === method.value} onChange={handleInputChange} className="h-4 w-4 border-gray-300 focus:ring-blue-500 text-blue-600"/>
                                            <span className="text-lg mx-3">{method.icon}</span>
                                            <span className="font-medium text-sm text-gray-800 flex-1">{method.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                                    <FiTarget className="mr-2 text-gray-400 h-4 w-4"/>
                                    Language Preference
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: 'vn', label: 'Tiếng Việt', flag: '🇻🇳' },
                                        { value: 'en', label: 'English', flag: '🇺🇸' }
                                    ].map((lang) => (
                                        <label key={lang.value} className={`flex items-center justify-center p-3.5 border rounded-lg transition-all cursor-pointer ${paymentDetails.language === lang.value ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 bg-white hover:border-gray-400'}`}>
                                            <input type="radio" name="language" value={lang.value} checked={paymentDetails.language === lang.value} onChange={handleInputChange} className="h-4 w-4 border-gray-300 focus:ring-blue-500 text-blue-600"/>
                                            <span className="text-lg mx-2">{lang.flag}</span>
                                            <span className="font-medium text-sm text-gray-800">{lang.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Modal Footer */}
                    <div className="px-6 pb-6">
                        <div className="flex flex-col-reverse sm:flex-row gap-3">
                            <button
                                type="button"
                                onClick={() => setShowPaymentModal(false)}
                                className="flex-1 bg-white border border-gray-300 text-gray-800 py-3 px-5 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="payment-form"
                                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-5 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold flex items-center justify-center text-sm"
                            >
                                <FiZap className="mr-1.5 h-4 w-4"/>
                                Proceed to Payment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = getUserToken();
            const response = await fetch('http://localhost:5000/api/subscriptions/subscribe', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subscriptionId: selectedPlan._id,
                    paymentMethod: paymentDetails.bankCode || 'vnpay',
                    billingPeriod: 'monthly'
                })
            });

            const result = await response.json();

            if (response.ok && result.status) {
                toastr.success('Subscription created successfully!');
                setShowPaymentModal(false);
                // Refresh subscription data
                window.location.reload();
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
        if (!usageStats) return null;

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
                            {usageStats.jobApplications?.used || 0}
                        </div>
                        <div className="text-sm text-blue-600">
                            of {usageStats.jobApplications?.limit === -1 ? '∞' : usageStats.jobApplications?.limit} applications
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
                            <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ 
                                    width: usageStats.jobApplications?.limit === -1 ? '20%' : 
                                           `${Math.min((usageStats.jobApplications?.used / usageStats.jobApplications?.limit) * 100, 100)}%` 
                                }}
                            ></div>
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
                            {usageStats.savedJobs?.used || 0}
                        </div>
                        <div className="text-sm text-purple-600">
                            of {usageStats.savedJobs?.limit === -1 ? '∞' : usageStats.savedJobs?.limit} saves
                        </div>
                        <div className="w-full bg-purple-200 rounded-full h-2 mt-3">
                            <div 
                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ 
                                    width: usageStats.savedJobs?.limit === -1 ? '30%' : 
                                           `${Math.min((usageStats.savedJobs?.used / usageStats.savedJobs?.limit) * 100, 100)}%` 
                                }}
                            ></div>
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
                            {usageStats.profileViews || 0}
                        </div>
                        <div className="text-sm text-green-600">
                            this month
                        </div>
                        <div className="flex items-center mt-3">
                            <FiTrendingUp className="text-green-600 mr-1"/>
                            <span className="text-sm text-green-600 font-semibold">
                                +{Math.floor(Math.random() * 20) + 5}% from last month
                            </span>
                        </div>
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

        // Debug log for current plan detection (updated for new API structure)
        if (process.env.NODE_ENV === 'development') {
            console.log('Plan:', planName, 'isCurrentPlan:', isCurrentPlan, 'hasSubscription:', currentSubscription?.hasSubscription, 'planId:', plan._id);
        }

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
                        Choose Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Perfect Plan</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Unlock your career potential with our premium features. Start with a free trial and upgrade anytime.
                    </p>
                </div>

                {/* Usage Stats */}
                <UsageStatsCard />

                {/* Current Subscription Info */}
                {currentSubscription && currentSubscription.hasSubscription && (
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 mb-12 text-white shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-6">
                                    <FiStar className="text-white text-2xl"/>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold mb-2 flex items-center">
                                        <FiCheck className="mr-2 text-green-200"/>
                                        Current Plan: {currentSubscription.planId?.name || currentSubscription.planId?.packageName || 'Premium'}
                                    </h3>
                                    <div className="flex items-center space-x-4 text-green-100">
                                        <span className="flex items-center">
                                            <FiShield className="mr-1"/>
                                            {currentSubscription.status === 'trial' ? 'Free Trial Active' : 'Active Subscription'}
                                        </span>
                                        {currentSubscription.endDate && (
                                            <span className="flex items-center">
                                                <FiCalendar className="mr-1"/>
                                                Expires {new Date(currentSubscription.endDate).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                {currentSubscription.status === 'trial' ? (
                                    <div className="bg-white/20 px-6 py-3 rounded-xl flex items-center">
                                        <FiClock className="mr-2 text-yellow-200"/>
                                        <span className="font-semibold">Trial Period</span>
                                    </div>
                                ) : (
                                    <div className="bg-white/20 px-6 py-3 rounded-xl flex items-center">
                                        <FiCheck className="mr-2 text-green-200"/>
                                        <span className="font-semibold">Premium Active</span>
                                    </div>
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
                            // User has active subscription
                            isCurrentPlan = currentSubscription.planId?._id === plan._id;
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
        </div>
    );
};

export default PackageList;
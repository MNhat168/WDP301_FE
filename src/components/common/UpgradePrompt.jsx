import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FiZap, FiStar, FiLock, FiX, FiCheck, 
    FiTrendingUp, FiShield, FiTarget 
} from 'react-icons/fi';

const UpgradePrompt = ({ 
    isOpen, 
    onClose, 
    title = "Upgrade to Premium", 
    message = "Unlock unlimited access and premium features",
    feature = "this feature",
    currentPlan = "Free",
    type = "limit" // "limit", "feature", "trial"
}) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleUpgrade = () => {
        onClose();
        navigate('/packages');
    };

    const getIcon = () => {
        switch (type) {
            case 'limit':
                return <FiLock className="text-white text-3xl"/>;
            case 'feature':
                return <FiStar className="text-white text-3xl"/>;
            case 'trial':
                return <FiStar className="text-white text-3xl"/>;
            default:
                return <FiZap className="text-white text-3xl"/>;
        }
    };

    const getGradient = () => {
        switch (type) {
            case 'limit':
                return 'from-red-500 to-pink-500';
            case 'feature':
                return 'from-purple-500 to-indigo-500';
            case 'trial':
                return 'from-yellow-500 to-orange-500';
            default:
                return 'from-blue-500 to-purple-500';
        }
    };

    const features = [
        'Unlimited job applications',
        'Unlimited saved jobs',
        'Priority customer support',
        'Advanced analytics',
        'Resume builder tools',
        'Premium job alerts'
    ];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                {/* Header */}
                <div className={`bg-gradient-to-br ${getGradient()} p-8 text-white text-center relative`}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                    >
                        <FiX className="text-xl"/>
                    </button>
                    
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        {getIcon()}
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-2">{title}</h3>
                    <p className="text-white/90">{message}</p>
                </div>

                {/* Body */}
                <div className="p-8">
                    {type === 'limit' && (
                        <div className="mb-6">
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                                <div className="flex items-center mb-2">
                                    <FiTarget className="text-red-500 mr-2"/>
                                    <span className="font-semibold text-red-700">Monthly Limit Reached</span>
                                </div>
                                <p className="text-red-600 text-sm">
                                    You've reached your monthly limit for {feature}. Upgrade to continue using this feature without restrictions.
                                </p>
                            </div>
                        </div>
                    )}

                    {type === 'feature' && (
                        <div className="mb-6">
                            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
                                <div className="flex items-center mb-2">
                                    <FiStar className="text-purple-500 mr-2"/>
                                    <span className="font-semibold text-purple-700">Premium Feature</span>
                                </div>
                                <p className="text-purple-600 text-sm">
                                    {feature} is available for Premium subscribers. Upgrade to unlock this and many more features.
                                </p>
                            </div>
                        </div>
                    )}

                    {type === 'trial' && (
                        <div className="mb-6">
                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
                                <div className="flex items-center mb-2">
                                    <FiStar className="text-orange-500 mr-2"/>
                                    <span className="font-semibold text-orange-700">Trial Available</span>
                                </div>
                                <p className="text-orange-600 text-sm">
                                    Start your free trial to access {feature} and all premium features for 7 days.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Premium Features List */}
                    <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <FiShield className="mr-2 text-green-500"/>
                            What you'll get with Premium:
                        </h4>
                        <div className="space-y-2">
                            {features.slice(0, 4).map((feature, index) => (
                                <div key={index} className="flex items-center text-sm text-gray-600">
                                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                        <FiCheck className="text-green-600 text-xs"/>
                                    </div>
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Current Plan Badge */}
                    <div className="mb-6">
                        <div className="bg-gray-100 rounded-xl p-3 text-center">
                            <span className="text-sm text-gray-600">Current Plan: </span>
                            <span className="font-semibold text-gray-800">{currentPlan}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={handleUpgrade}
                            className={`w-full bg-gradient-to-r ${getGradient()} text-white py-4 px-6 rounded-2xl hover:shadow-lg transition-all transform hover:scale-105 font-semibold flex items-center justify-center`}
                        >
                            <FiTrendingUp className="mr-2"/>
                            {type === 'trial' ? 'Start Free Trial' : 'Upgrade Now'}
                        </button>
                        
                        <button
                            onClick={onClose}
                            className="w-full text-gray-600 hover:text-gray-800 font-medium py-2"
                        >
                            Maybe Later
                        </button>
                    </div>

                    {/* Small Print */}
                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500">
                            {type === 'trial' ? 'No credit card required • Cancel anytime' : '30-day money-back guarantee'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Usage Tracking Hook
export const useUsageTracking = () => {
    const [usage, setUsage] = React.useState(null);
    const [subscription, setSubscription] = React.useState(null);

    const getUserToken = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        return user?.token;
    };

    const checkUsageLimit = (feature) => {
        if (!usage || !usage[feature]) return { canUse: true, isNearLimit: false };
        
        const featureUsage = usage[feature];
        if (featureUsage.limit === -1) return { canUse: true, isNearLimit: false };
        
        const canUse = featureUsage.used < featureUsage.limit;
        const isNearLimit = (featureUsage.used / featureUsage.limit) >= 0.8;
        
        return { canUse, isNearLimit, usage: featureUsage };
    };

    const incrementUsage = (feature) => {
        if (!usage || !usage[feature] || usage[feature].limit === -1) return;
        
        setUsage(prev => ({
            ...prev,
            [feature]: {
                ...prev[feature],
                used: prev[feature].used + 1
            }
        }));
    };

    React.useEffect(() => {
        const fetchUsageData = async () => {
            const token = getUserToken();
            if (!token) return;

            try {
                const [usageResponse, subResponse] = await Promise.all([
                    fetch('http://localhost:5000/api/subscriptions/usage-stats', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch('http://localhost:5000/api/subscriptions/current', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (usageResponse.ok) {
                    const usageData = await usageResponse.json();
                    setUsage(usageData.result);
                }

                if (subResponse.ok) {
                    const subData = await subResponse.json();
                    setSubscription(subData.result);
                }
            } catch (error) {
                console.error('Error fetching usage data:', error);
            }
        };

        fetchUsageData();
    }, []);

    return {
        usage,
        subscription,
        checkUsageLimit,
        incrementUsage,
        isFreePlan: !subscription || subscription.planId?.name === 'Free'
    };
};

export default UpgradePrompt; 
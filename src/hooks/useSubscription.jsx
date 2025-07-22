import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { getUserLimits, checkUserPermission, getSubscriptionTierInfo, formatRemainingDays } from '../services/subscriptionService';
import toastr from 'toastr';

// Subscription Context
const SubscriptionContext = createContext();

// Subscription Provider Component
export const SubscriptionProvider = ({ children }) => {
    const [subscriptionData, setSubscriptionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch subscription data
    const fetchSubscriptionData = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await getUserLimits();
            if (result.success) {
                setSubscriptionData(result.data);
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError(error.message || 'Failed to fetch subscription data');
        } finally {
            setLoading(false);
        }
    }, []);

    // Check if user can perform action
    const canPerformAction = useCallback(async (action) => {
        try {
            const result = await checkUserPermission(action);
            return result;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to check permission'
            };
        }
    }, []);

    // Refresh subscription data
    const refreshSubscription = useCallback(() => {
        fetchSubscriptionData();
    }, [fetchSubscriptionData]);

    useEffect(() => {
        // Only fetch if user is logged in
        const user = localStorage.getItem('user');
        if (user) {
            fetchSubscriptionData();
        } else {
            setLoading(false);
        }
    }, [fetchSubscriptionData]);

    const value = {
        subscriptionData,
        loading,
        error,
        canPerformAction,
        refreshSubscription,
        // Helper getters
        get currentTier() {
            return subscriptionData?.subscription?.type || 'free';
        },
        get isActive() {
            return subscriptionData?.subscription?.isActive || false;
        },
        get canApply() {
            return subscriptionData?.applications?.canApply || false;
        },
        get remainingApplications() {
            return subscriptionData?.applications?.remaining || 0;
        },
        get applicationLimit() {
            return subscriptionData?.applications?.limit || 0;
        },
        get usedApplications() {
            return subscriptionData?.applications?.used || 0;
        },
        get tierInfo() {
            return getSubscriptionTierInfo(this.currentTier);
        },
        get daysRemaining() {
            const days = subscriptionData?.subscription?.daysRemaining || 0;
            return formatRemainingDays(days);
        }
    };

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
};

// Hook to use subscription context
export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
};

// Standalone hook for when not using provider
export const useSubscriptionData = () => {
    const [subscriptionData, setSubscriptionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        console.log("fetching data")
        try {
            const result = await getUserLimits();
            console.log(result, "result")
            if (result.success) {
                setSubscriptionData(result.data);
            } else {
                setError(result.message);
                toastr.error(result.message);
            }
        } catch (error) {
            const errorMessage = error.message || 'Failed to fetch subscription data';
            setError(errorMessage);
            toastr.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const checkPermission = useCallback(async (action) => {
        try {
            const result = await checkUserPermission(action);
            return result;
        } catch (error) {
            toastr.error(error.message || 'Failed to check permission');
            return {
                success: false,
                message: error.message || 'Failed to check permission'
            };
        }
    }, []);

    const refreshData = useCallback(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        // Only fetch if user is logged in
        const user = localStorage.getItem('user');
        if (user) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [fetchData]);

    // Helper functions
    const getUsagePercentage = useCallback((used, limit) => {
        if (limit === -1) return 0; // Unlimited
        if (limit === 0) return 100; // No limit means 100% used
        return Math.round((used / limit) * 100);
    }, []);

    const getUsageColor = useCallback((percentage) => {
        if (percentage >= 90) return 'red';
        if (percentage >= 70) return 'orange';
        if (percentage >= 50) return 'yellow';
        return 'green';
    }, []);

    const canApplyToJob = useCallback(() => {
        return subscriptionData?.applications?.canApply || false;
    }, [subscriptionData]);

    const canPostJob = useCallback(() => {
        return subscriptionData?.jobPostings?.canPost || false;
    }, [subscriptionData]);

    const canAddFavorite = useCallback(() => {
        return subscriptionData?.favorites?.canAddMore || false;
    }, [subscriptionData]);

    return {
        subscriptionData,
        loading,
        error,
        checkPermission,
        refreshData,
        // Helper functions
        getUsagePercentage,
        getUsageColor,
        canApplyToJob,
        canPostJob,
        canAddFavorite,
        // Quick access properties
        currentTier: subscriptionData?.subscription?.type || 'free',
        isActive: subscriptionData?.subscription?.isActive || false,
        applicationUsage: {
            used: subscriptionData?.applications?.used || 0,
            limit: subscriptionData?.applications?.limit || 0,
            remaining: subscriptionData?.applications?.remaining || 0,
            percentage: getUsagePercentage(
                subscriptionData?.applications?.used || 0,
                subscriptionData?.applications?.limit || 0
            )
        },
        tierInfo: getSubscriptionTierInfo(subscriptionData?.subscription?.type || 'free')
    };
}; 
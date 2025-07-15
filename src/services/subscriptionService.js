const API_BASE_URL = 'http://localhost:5000/api';

// Get auth headers
const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = user?.token || user?.accessToken;
    
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
    };
};

// Get user subscription limits and usage information
export const getUserLimits = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/user/limits`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to get user limits');
        }

        const data = await response.json();
        return {
            success: true,
            data: data.result
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to get user limits'
        };
    }
};

// Check if user can perform specific action
export const checkUserPermission = async (action) => {
    try {
        const response = await fetch(`${API_BASE_URL}/user/check-permission/${action}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to check permission');
        }

        const data = await response.json();
        return {
            success: true,
            data: data.result,
            message: data.message
        };
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Failed to check permission'
        };
    }
};

// Subscription tier information for UI display
export const SUBSCRIPTION_TIERS = {
    free: {
        name: 'Free',
        color: 'gray',
        applications: 5,
        jobPostings: 0,
        features: []
    },
    basic: {
        name: 'Basic',
        color: 'blue',
        applications: 10,
        jobPostings: 5,
        features: ['Basic Support']
    },
    premium: {
        name: 'Premium',
        color: 'purple',
        applications: 50,
        jobPostings: 20,
        features: [
            'Priority Listing',
            'See Job Viewers', 
            'Advanced Filters',
            'Direct Messaging'
        ]
    },
    enterprise: {
        name: 'Enterprise',
        color: 'gold',
        applications: -1, // Unlimited
        jobPostings: -1,  // Unlimited
        features: [
            'Unlimited Applications',
            'Unlimited Job Posts',
            'Priority Support',
            'Custom Analytics',
            'All Premium Features'
        ]
    }
};

// Helper function to get subscription tier info
export const getSubscriptionTierInfo = (tierType) => {
    return SUBSCRIPTION_TIERS[tierType] || SUBSCRIPTION_TIERS.free;
};

// Format remaining days
export const formatRemainingDays = (days) => {
    if (days <= 0) return 'Expired';
    if (days === 1) return '1 day left';
    if (days <= 7) return `${days} days left`;
    if (days <= 30) return `${Math.ceil(days / 7)} weeks left`;
    return `${Math.ceil(days / 30)} months left`;
};

// Check if upgrade is needed for action
export const checkUpgradeNeeded = async (action) => {
    const result = await checkUserPermission(action);
    if (result.success && result.data.upgradeRequired) {
        return {
            needed: true,
            currentTier: result.data.subscriptionType,
            message: result.message
        };
    }
    return { needed: false };
}; 
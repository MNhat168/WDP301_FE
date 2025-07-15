import { useState, useCallback } from 'react';
import { applyToJob, withdrawApplication, getApplicationStatus, getUserApplications } from '../services/applicationService';
import { checkUserPermission } from '../services/subscriptionService';
import toastr from 'toastr';

export const useApplications = () => {
    const [loading, setLoading] = useState(false);
    const [applications, setApplications] = useState([]);
    const [applicationStatus, setApplicationStatus] = useState({});
    const [pagination, setPagination] = useState(null);
    const [summary, setSummary] = useState(null);

    // Apply to a job with subscription check
    const handleApplyToJob = useCallback(async (jobId, onSuccess, onUpgradeRequired) => {
        setLoading(true);
        try {
            // First check if user can apply
            const permissionCheck = await checkUserPermission('apply');
            
            if (!permissionCheck.success) {
                toastr.error(permissionCheck.message || 'Failed to check application permission');
                return { success: false, message: permissionCheck.message };
            }

            // Check if upgrade is required
            if (permissionCheck.data.upgradeRequired) {
                toastr.warning(permissionCheck.message);
                if (onUpgradeRequired) {
                    onUpgradeRequired({
                        action: 'apply',
                        currentTier: permissionCheck.data.subscriptionType,
                        message: permissionCheck.message
                    });
                }
                return { 
                    success: false, 
                    requiresUpgrade: true,
                    currentTier: permissionCheck.data.subscriptionType,
                    message: permissionCheck.message 
                };
            }

            // If can apply, proceed with application
            if (!permissionCheck.data.canPerform) {
                toastr.error(permissionCheck.message);
                return { success: false, message: permissionCheck.message };
            }

            // Proceed with job application
            const result = await applyToJob(jobId);
            
            if (result.success) {
                toastr.success(result.message || 'Application submitted successfully!');
                
                // Update application status
                setApplicationStatus(prev => ({
                    ...prev,
                    [jobId]: {
                        hasApplied: true,
                        applicationId: result.data._id,
                        testCompleted: false,
                        questionExist: false
                    }
                }));
                
                // Call success callback if provided
                if (onSuccess) onSuccess(result.data);
                
                return { success: true, data: result.data };
            } else {
                // Handle specific error cases
                if (result.message?.includes('complete your CV profile')) {
                    toastr.warning(result.message);
                    return { 
                        success: false, 
                        requiresCV: true, 
                        message: result.message 
                    };
                } else if (result.message?.includes('application limit')) {
                    // Subscription limit reached during application
                    if (onUpgradeRequired) {
                        onUpgradeRequired({
                            action: 'apply',
                            currentTier: 'free', // Default fallback
                            message: result.message
                        });
                    }
                    return { 
                        success: false, 
                        requiresUpgrade: true,
                        message: result.message 
                    };
                } else {
                    toastr.error(result.message);
                    return { success: false, message: result.message };
                }
            }
        } catch (error) {
            const errorMessage = error.message || 'Failed to apply to job';
            toastr.error(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Withdraw application (no subscription check needed)
    const handleWithdrawApplication = useCallback(async (applicationId, jobId, onSuccess) => {
        setLoading(true);
        try {
            const result = await withdrawApplication(applicationId);
            
            if (result.success) {
                toastr.success(result.message || 'Application withdrawn successfully!');
                
                // Update application status
                if (jobId) {
                    setApplicationStatus(prev => ({
                        ...prev,
                        [jobId]: {
                            hasApplied: false,
                            applicationId: null,
                            testCompleted: false,
                            questionExist: false
                        }
                    }));
                }
                
                // Remove from applications list
                setApplications(prev => prev.filter(app => app._id !== applicationId));
                
                // Call success callback if provided
                if (onSuccess) onSuccess();
                
                return { success: true };
            } else {
                toastr.error(result.message);
                return { success: false, message: result.message };
            }
        } catch (error) {
            const errorMessage = error.message || 'Failed to withdraw application';
            toastr.error(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Check application status
    const checkApplicationStatus = useCallback(async (jobId) => {
        try {
            const result = await getApplicationStatus(jobId);
            
            if (result.success) {
                setApplicationStatus(prev => ({
                    ...prev,
                    [jobId]: result.data
                }));
                return result.data;
            }
            return null;
        } catch (error) {
            console.error('Error checking application status:', error);
            return null;
        }
    }, []);

    // Fetch all user applications
    const fetchUserApplications = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getUserApplications();
            
            if (result.success) {
                // Ensure we always set an array
                const applicationsData = Array.isArray(result.data) ? result.data : [];
                setApplications(applicationsData);
                
                // Set pagination and summary if available
                if (result.pagination) setPagination(result.pagination);
                if (result.summary) setSummary(result.summary);
                
                return applicationsData;
            } else {
                toastr.error(result.message || 'Failed to fetch applications');
                setApplications([]); // Ensure empty array on error
                return [];
            }
        } catch (error) {
            const errorMessage = error.message || 'Failed to fetch applications';
            toastr.error(errorMessage);
            setApplications([]); // Ensure empty array on exception
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Get application status for a specific job
    const getJobApplicationStatus = useCallback((jobId) => {
        return applicationStatus[jobId] || {
            hasApplied: false,
            applicationId: null,
            testCompleted: false,
            questionExist: false
        };
    }, [applicationStatus]);

    // Check if user can apply (with subscription check)
    const canUserApply = useCallback(async () => {
        try {
            const result = await checkUserPermission('apply');
            return result.success ? result.data.canPerform : false;
        } catch (error) {
            console.error('Error checking application permission:', error);
            return false;
        }
    }, []);

    return {
        loading,
        applications,
        applicationStatus,
        pagination,
        summary,
        handleApplyToJob,
        handleWithdrawApplication,
        checkApplicationStatus,
        fetchUserApplications,
        getJobApplicationStatus,
        canUserApply
    };
}; 
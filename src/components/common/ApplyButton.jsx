import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplications } from '../../hooks/useApplications';
import { 
    FiSend, FiCheck, FiX, FiLoader, FiUser, FiAlertTriangle 
} from 'react-icons/fi';

const ApplyButton = ({ 
    jobId, 
    jobTitle, 
    companyName,
    className = "",
    variant = "primary", // primary, secondary, large
    onApplicationSuccess
}) => {
    const navigate = useNavigate();
    const { 
        loading, 
        handleApplyToJob, 
        handleWithdrawApplication,
        checkApplicationStatus,
        getJobApplicationStatus 
    } = useApplications();
    
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showCVModal, setShowCVModal] = useState(false);
    
    // Get current application status
    const applicationStatus = getJobApplicationStatus(jobId);
    const { hasApplied, applicationId } = applicationStatus;

    // Check application status on mount
    useEffect(() => {
        if (jobId) {
            checkApplicationStatus(jobId);
        }
    }, [jobId, checkApplicationStatus]);

    // Handle apply to job
    const handleApply = async () => {
        const result = await handleApplyToJob(jobId, onApplicationSuccess);
        
        if (result.requiresCV) {
            setShowCVModal(true);
        } else if (result.success) {
            setShowConfirmModal(false);
        }
    };

    // Handle withdraw application
    const handleWithdraw = async () => {
        if (applicationId) {
            const result = await handleWithdrawApplication(applicationId, jobId);
            if (result.success) {
                setShowConfirmModal(false);
            }
        }
    };

    // Button variants
    const getButtonStyles = () => {
        const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
        
        if (variant === "large") {
            return `${baseStyles} px-8 py-4 text-lg ${hasApplied 
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 focus:ring-green-500" 
                : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 hover:scale-105 focus:ring-blue-500"
            }`;
        }
        
        if (variant === "secondary") {
            return `${baseStyles} px-6 py-2 text-sm ${hasApplied 
                ? "bg-green-100 text-green-700 border border-green-300 hover:bg-green-200" 
                : "bg-white text-blue-600 border border-blue-300 hover:bg-blue-50"
            }`;
        }
        
        // Primary variant
        return `${baseStyles} px-6 py-3 ${hasApplied 
            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 focus:ring-green-500" 
            : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 hover:scale-105 focus:ring-blue-500"
        }`;
    };

    // Get button content
    const getButtonContent = () => {
        if (loading) {
            return (
                <>
                    <FiLoader className="animate-spin mr-2 h-4 w-4" />
                    Processing...
                </>
            );
        }
        
        if (hasApplied) {
            return (
                <>
                    <FiCheck className="mr-2 h-4 w-4" />
                    Applied
                </>
            );
        }
        
        return (
            <>
                <FiSend className="mr-2 h-4 w-4" />
                Apply Now
            </>
        );
    };

    return (
        <>
            <button
                onClick={() => setShowConfirmModal(true)}
                disabled={loading}
                className={`${getButtonStyles()} ${className}`}
            >
                {getButtonContent()}
            </button>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
                        <div className="text-center">
                            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                                hasApplied 
                                    ? "bg-red-100" 
                                    : "bg-blue-100"
                            }`}>
                                {hasApplied ? (
                                    <FiX className="w-8 h-8 text-red-600" />
                                ) : (
                                    <FiSend className="w-8 h-8 text-blue-600" />
                                )}
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {hasApplied ? 'Withdraw Application?' : 'Apply to this Job?'}
                            </h3>
                            
                            <div className="text-gray-600 mb-6">
                                <p className="font-medium text-gray-900">{jobTitle}</p>
                                <p className="text-sm">{companyName}</p>
                                <p className="text-sm mt-2">
                                    {hasApplied 
                                        ? 'Are you sure you want to withdraw your application? This action cannot be undone.'
                                        : 'Your CV profile will be submitted with this application.'
                                    }
                                </p>
                            </div>
                            
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={hasApplied ? handleWithdraw : handleApply}
                                    disabled={loading}
                                    className={`flex-1 px-4 py-2 rounded-xl text-white font-semibold transition-all ${
                                        hasApplied
                                            ? "bg-red-500 hover:bg-red-600"
                                            : "bg-blue-500 hover:bg-blue-600"
                                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? (
                                        <FiLoader className="animate-spin mx-auto h-4 w-4" />
                                    ) : (
                                        hasApplied ? 'Withdraw' : 'Apply'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CV Incomplete Modal */}
            {showCVModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                                <FiAlertTriangle className="w-8 h-8 text-yellow-600" />
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Complete Your CV Profile
                            </h3>
                            
                            <p className="text-gray-600 mb-6">
                                You need to complete your CV profile before applying to jobs. 
                                This helps employers learn more about your qualifications.
                            </p>
                            
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowCVModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCVModal(false);
                                        navigate('/profile/cv');
                                    }}
                                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center"
                                >
                                    <FiUser className="mr-2 h-4 w-4" />
                                    Complete CV
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ApplyButton; 
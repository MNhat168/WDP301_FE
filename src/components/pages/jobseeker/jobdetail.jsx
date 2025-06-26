import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from "../../layout/header";
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

import {
    FiMapPin, FiBriefcase, FiCalendar, FiClock, FiDollarSign,
    FiShare2, FiHeart, FiCheckCircle, FiXCircle, FiAlertCircle,
    FiAward, FiFileText, FiArrowLeft, FiUsers, FiEye, FiStar,
    FiTrendingUp, FiGlobe, FiMail, FiPhone, FiBookmark,
    FiTarget, FiShield, FiZap, FiMoreVertical, FiFlag,
    FiExternalLink, FiCheck
} from 'react-icons/fi';
import { LuBuilding } from "react-icons/lu";

// Enhanced Skeleton Loader Component
const JobDetailSkeleton = () => (
    <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Skeleton */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-20 mb-4"></div>
                        <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                        <div className="h-12 bg-blue-200 rounded w-32"></div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                    </div>
                </div>
                {/* Sidebar Skeleton */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                        <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="space-y-4">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const JobDetail = () => {
    const { id: jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const [isWithdrawn, setIsWithdrawn] = useState(false); // Track withdrawal status

    // User-specific application state
    const [applicationStatus, setApplicationStatus] = useState({
        hasApplied: false,
        applicationId: null,
        testCompleted: false,
        questionExist: false,
    });
    const [isActionLoading, setIsActionLoading] = useState(false);
    const timeoutRef = useRef();

    // This would typically come from an auth context
    const userIsLoggedIn = !!localStorage.getItem('user');

    useEffect(() => {
        // Reset withdrawal status when job changes
        setIsWithdrawn(false);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, [jobId]);

    useEffect(() => {
        const fetchJobDetails = async () => {
            if (!jobId) {
                setError("Job ID is missing.");
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.status && data.result) {
                    setJob(data.result);
                    setError(null);
                } else {
                    throw new Error(data.message || "Failed to parse job details");
                }
            } catch (err) {
                setError(err.message);
                console.error("Error fetching job details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchJobDetails();
    }, [jobId]);

    useEffect(() => {
        const fetchApplicationStatus = async () => {
            if (!jobId || !userIsLoggedIn) return;
            try {
                const response = await fetch(`http://localhost:5000/api/applications/status/${jobId}`, {
                    headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user'))?.accessToken}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.status && data.result) {
                        setApplicationStatus({ hasApplied: true, ...data.result });
                    }
                } else if (response.status === 404) {
                    setApplicationStatus({ hasApplied: false, applicationId: null, testCompleted: false, questionExist: false });
                }
            } catch (err) {
                console.error("Could not fetch application status:", err);
            }
        };

        fetchApplicationStatus();
    }, [jobId, userIsLoggedIn]);

    const handleApplyJob = async () => {
        if (!userIsLoggedIn) {
            toastr.warning('Please log in to apply for jobs.');
            navigate('/login');
            return;
        }

        setIsActionLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/applications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user'))?.accessToken}`
                },
                body: JSON.stringify({ jobId: job._id })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to apply.');

            toastr.success('Application submitted successfully!');

            // Update application status and job stats
            setApplicationStatus({ hasApplied: true, ...data.data });
            setIsWithdrawn(false);
            setJob(prev => ({ ...prev, applicantCount: prev.applicantCount - 1 }));
        } catch (err) {
            toastr.error(err.message || 'An error occurred while applying.');
            console.error('Error applying to job:', err);
        } finally {
            setIsWithdrawn(false);
            setIsActionLoading(false);
        }
    };

    const handleWithdrawApplication = async () => {
        if (!applicationStatus.applicationId) {
            toastr.error('No application to withdraw.');
            return;
        }

        setIsActionLoading(true);
        try {
            const response = await fetch(
                `http://localhost:5000/api/applications/${applicationStatus.applicationId}`,
                {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user'))?.accessToken}` }
                }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to withdraw application.');
            }

            toastr.info('Application withdrawn.');

            // Update states
            setIsWithdrawn(true);
            setApplicationStatus({ hasApplied: false, applicationId: null });
            setJob(prev => ({ ...prev, applicantCount: Math.max(0, prev.applicantCount + 1) }));

            // Automatically reset withdrawn status after 5 seconds
            timeoutRef.current = setTimeout(() => {
                setIsWithdrawn(false);
            }, 5000);

        } catch (err) {
            toastr.error(err.message || 'An error occurred while withdrawing.');
            console.error('Error withdrawing application:', err);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleFavoriteJob = () => {
        if (!userIsLoggedIn) {
            toastr.warning('Please log in to save jobs.');
            return;
        }
        setIsSaved(!isSaved);
        toastr.success(isSaved ? 'Job removed from favorites!' : 'Job saved to favorites!');
    };

    const handleShareJob = () => {
        if (navigator.share) {
            navigator.share({
                title: job.title,
                text: `Check out this job: ${job.title} at ${job.companyId?.companyName}`,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toastr.success('Job link copied to clipboard!');
        }
    };

    const handleSkillTestClick = () => {
        navigate("/doskilltest", { state: { jobId: job._id } });
    };

    if (loading) return <JobDetailSkeleton />;

    if (error) return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 max-w-md mx-auto">
                        <FiAlertCircle className="mx-auto text-red-500 text-6xl mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Job not found</h2>
                        <p className="text-gray-600 mb-8">{error}</p>
                        <button
                            onClick={() => navigate('/jobsearch')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Back to Search
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    if (!job) return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center text-xl text-gray-600">Job not found</div>
            </div>
        </div>
    );

    const renderActionButtons = () => {
        // Show withdrawn state if application was withdrawn
        if (isWithdrawn) {
            return (
                <button
                    disabled
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 bg-gray-100"
                >
                    <FiXCircle className="mr-2 h-4 w-4" />
                    Withdrawn
                </button>
            );
        }

        if (applicationStatus.hasApplied) {
            return (
                <div className="space-y-3">
                    {applicationStatus.questionExist && !applicationStatus.testCompleted ? (
                        <button
                            onClick={handleSkillTestClick}
                            disabled={isActionLoading}
                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                        >
                            <FiFileText className="mr-2 h-4 w-4" />
                            Take Skill Test
                        </button>
                    ) : (
                        <div className="w-full inline-flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md text-green-800 bg-green-100 border border-green-200">
                            <FiCheckCircle className="mr-2 h-4 w-4" />
                            Application Submitted
                        </div>
                    )}
                    <button
                        onClick={handleWithdrawApplication}
                        disabled={isActionLoading}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                        <FiXCircle className="mr-2 h-4 w-4" />
                        Withdraw Application
                    </button>
                </div>
            );
        }
        return (
            <button
                onClick={handleApplyJob}
                disabled={isActionLoading}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
                {isActionLoading ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Applying...
                    </>
                ) : (
                    <>
                        <FiZap className="mr-2 h-4 w-4" />
                        Apply Now
                    </>
                )}
            </button>
        );
    };

    const formatTimeAgo = (date) => {
        const now = new Date();
        const posted = new Date(date);
        const diffInHours = Math.floor((now - posted) / (1000 * 60 * 60));

        if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays}d ago`;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                    >
                        <FiArrowLeft className="mr-2 h-4 w-4" />
                        Back to results
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Job Header Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                        {job.title}
                                    </h1>
                                    <div className="flex items-center text-sm text-gray-500 mb-3">
                                        <Link
                                            to={`/company/${job.companyId?._id}`}
                                            className="text-blue-600 hover:text-blue-800 font-medium mr-3"
                                        >
                                            {job.companyId?.companyName || 'Company'}
                                        </Link>
                                        <span className="mr-3">•</span>
                                        <span className="flex items-center mr-3">
                                            <FiMapPin className="mr-1 h-4 w-4" />
                                            {job.location || 'Remote'}
                                        </span>
                                        <span className="mr-3">•</span>
                                        <span>{formatTimeAgo(job.createdAt)}</span>
                                    </div>

                                    {/* Job Type & Details */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {job.jobType || 'Full-time'}
                                        </span>
                                        {job.salary && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                ${job.salary.toLocaleString()}
                                            </span>
                                        )}
                                        {job.experienceYears && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                {job.experienceYears} years exp
                                            </span>
                                        )}
                                    </div>

                                    {/* Application Stats */}
                                    <div className="flex items-center text-sm text-gray-500 space-x-6">
                                        <span className="flex items-center">
                                            <FiUsers className="mr-1 h-4 w-4" />
                                            {job.applicantCount || Math.floor(Math.random() * 50) + 10} applicants
                                        </span>
                                        <span className="flex items-center">
                                            <FiEye className="mr-1 h-4 w-4" />
                                            {Math.floor(Math.random() * 500) + 100} views
                                        </span>
                                    </div>
                                </div>

                                {/* Company Logo */}
                                {job.companyId?.url && (
                                    <div className="ml-6 flex-shrink-0">
                                        <img
                                            src={job.companyId.url}
                                            alt="Company logo"
                                            className="w-60 h-40 rounded-lg object-cover border border-gray-200"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                                <div className="flex-1 max-w-xs">
                                    {renderActionButtons()}
                                </div>
                                <button
                                    onClick={handleFavoriteJob}
                                    className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${isSaved
                                        ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100 focus:ring-red-500'
                                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500'
                                        }`}
                                >
                                    <FiHeart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                                </button>
                                <button
                                    onClick={handleShareJob}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <FiShare2 className="h-4 w-4" />
                                </button>
                                <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    <FiMoreVertical className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Job Description */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">About the job</h2>
                            <div className="prose prose-sm max-w-none text-gray-700">
                                <div dangerouslySetInnerHTML={{
                                    __html: job.description?.replace(/\n/g, '<br />') || 'No description provided.'
                                }} />
                            </div>
                        </div>

                        {/* Requirements */}
                        {job.requirements && job.requirements.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h2>
                                <ul className="space-y-2">
                                    {job.requirements.map((req, i) => (
                                        <li key={i} className="flex items-start">
                                            <FiCheck className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                                            <span className="text-gray-700 text-sm">{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Benefits */}
                        {job.benefits && job.benefits.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Benefits</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {job.benefits.map((benefit, i) => (
                                        <div key={i} className="flex items-center">
                                            <FiCheck className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                            <span className="text-gray-700 text-sm">{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6 space-y-6">
                            {/* Job Details Card */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Job details</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <FiDollarSign className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Salary</p>
                                            <p className="text-sm text-gray-500">
                                                {job.salary ? `$${job.salary.toLocaleString()} USD` : 'Not disclosed'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <FiBriefcase className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Job type</p>
                                            <p className="text-sm text-gray-500">{job.jobType || 'Full-time'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <FiAward className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Experience level</p>
                                            <p className="text-sm text-gray-500">
                                                {job.experienceYears ? `${job.experienceYears} years` : 'Not specified'}
                                            </p>
                                        </div>
                                    </div>
                                    {job.endDate && (
                                        <div className="flex items-start">
                                            <FiClock className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Application deadline</p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(job.endDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Company Card */}
                            {job.companyId && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">About the company</h3>
                                    <div className="flex items-start space-x-3 mb-4">
                                        {job.companyId.url ? (
                                            <img
                                                src={job.companyId.url}
                                                alt="Company logo"
                                                className="w-12 h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                <LuBuilding className="h-6 w-6 text-gray-400" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h4 className="text-sm font-semibold text-gray-900">
                                                {job.companyId.companyName}
                                            </h4>
                                            <p className="text-sm text-gray-500">{job.companyId.address}</p>
                                            <div className="flex items-center mt-1">
                                                <div className="flex items-center">
                                                    {[...Array(5)].map((_, i) => (
                                                        <FiStar
                                                            key={i}
                                                            className={`h-3 w-3 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-gray-500 ml-1">
                                                    ({Math.floor(Math.random() * 500) + 100} reviews)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Link
                                        to={`/company/${job.companyId._id}`}
                                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        View company page
                                        <FiExternalLink className="ml-1 h-3 w-3" />
                                    </Link>
                                </div>
                            )}

                            {/* Report Job */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <button className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                                    <FiFlag className="mr-2 h-4 w-4" />
                                    Report this job
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetail;

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from "../../layout/header";
import FavoriteButton from '../../common/FavoriteButton';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

import {
    FiMapPin, FiBriefcase, FiCalendar, FiClock, FiDollarSign,
    FiShare2, FiHeart, FiCheckCircle, FiXCircle, FiAlertCircle,
    FiAward, FiFileText, FiArrowLeft, FiUsers, FiEye, FiStar,
    FiTrendingUp, FiGlobe, FiMail, FiPhone, FiBookmark,
    FiTarget, FiShield, FiZap, FiMoreVertical, FiFlag,
    FiExternalLink, FiCheck, FiInfo
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
                    if (data) {
                        setApplicationStatus(data);
                    }
                } else if (response.status === 404) {
                    setApplicationStatus({ hasApplied: false, applicationId: null, testCompleted: false, questionExist: false });
                }
            } catch (err) {
                console.error("Could not fetch application status:", err);
            }
        };

        const fetchFavoriteStatus = async () => {
            if (!jobId || !userIsLoggedIn) return;
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const token = user?.token || user?.accessToken;
                
                const response = await fetch(`http://localhost:5000/api/jobs/${jobId}/favorite-status`, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.status !== undefined) {
                        setIsSaved(data.status);
                    }
                }
            } catch (err) {
                console.error("Could not fetch favorite status:", err);
            }
        };

        fetchApplicationStatus();
        fetchFavoriteStatus();
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

    // Handlers for FavoriteButton
    const handleFavoriteToggle = (jobId, newStatus, remainingFavorites) => {
        setIsSaved(newStatus);
    };

    const handleAuthRequired = () => {
        toastr.warning('Please log in to save jobs.');
        navigate('/login');
    };

    const handleLimitReached = (errorData) => {
        toastr.warning('Favorite limit reached. Upgrade to premium for unlimited favorites!');
        // Could redirect to upgrade page
        // navigate('/upgrade');
    };

    if (loading) return <JobDetailSkeleton />;

    if (error) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-12 max-w-md mx-auto">
                        <FiAlertCircle className="mx-auto text-red-500 text-6xl mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Job not found</h2>
                        <p className="text-gray-600 mb-8">{error}</p>
                        <button
                            onClick={() => navigate('/jobsearch')}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg"
                        >
                            Back to Search
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    if (!job) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header />

            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center text-base font-medium text-blue-600 hover:text-blue-800 bg-blue-50 rounded-xl px-4 py-2 shadow-sm"
                    >
                        <FiArrowLeft className="mr-2 h-5 w-5" />
                        Back to results
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Job Header Card */}
                        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 mb-4">
                            <div className="flex flex-col md:flex-row items-start justify-between mb-6 gap-6">
                                <div className="flex-1">
                                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                                        {job.title}
                                    </h1>
                                    <div className="flex flex-wrap items-center text-base text-gray-500 mb-4 gap-2">
                                        <Link
                                            to={`/company/${job.companyId?._id}`}
                                            className="text-blue-600 hover:text-blue-800 font-semibold mr-3"
                                        >
                                            {job.companyId?.companyName || 'Company'}
                                        </Link>
                                        <span className="mr-3">•</span>
                                        <span className="flex items-center mr-3">
                                            <FiMapPin className="mr-1 h-5 w-5" />
                                            {job.location || 'Remote'}
                                        </span>
                                        <span className="mr-3">•</span>
                                        <span>{formatTimeAgo(job.createdAt)}</span>
                                    </div>

                                    {/* Job Type & Details */}
                                    <div className="flex flex-wrap gap-3 mb-4">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-100 to-blue-300 text-blue-800 shadow">
                                            {job.jobType || 'Full-time'}
                                        </span>
                                        {job.salary && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-green-100 to-green-300 text-green-800 shadow">
                                                ${job.salary.toLocaleString()}
                                            </span>
                                        )}
                                        {job.experienceYears && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-100 to-purple-300 text-purple-800 shadow">
                                                {job.experienceYears} years exp
                                            </span>
                                        )}
                                    </div>

                                    {/* Application Stats */}
                                    <div className="flex items-center text-sm text-gray-500 space-x-6">
                                        <span className="flex items-center">
                                            <FiUsers className="mr-1 h-5 w-5" />
                                            {job.applicantCount || Math.floor(Math.random() * 50) + 10} applicants
                                        </span>
                                        <span className="flex items-center">
                                            <FiEye className="mr-1 h-5 w-5" />
                                            {Math.floor(Math.random() * 500) + 100} views
                                        </span>
                                    </div>
                                </div>

                                {/* Company Logo */}
                                {job.companyId?.url && (
                                    <div className="ml-0 md:ml-6 flex-shrink-0">
                                        <img
                                            src={job.companyId.url}
                                            alt="Company logo"
                                            className="w-32 h-32 rounded-2xl object-cover border-2 border-blue-200 shadow-lg"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
                                <div className="flex-1 max-w-xs">
                                    {renderActionButtons()}
                                </div>
                                <FavoriteButton
                                    jobId={job._id}
                                    isFavorite={isSaved}
                                    onToggle={handleFavoriteToggle}
                                    onAuthRequired={handleAuthRequired}
                                    onLimitReached={handleLimitReached}
                                    variant="icon"
                                    size="lg"
                                    showTooltip={true}
                                />
                                <button
                                    onClick={handleShareJob}
                                    className="inline-flex items-center px-4 py-3 border border-gray-200 text-base font-semibold rounded-xl text-gray-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow"
                                >
                                    <FiShare2 className="h-5 w-5" />
                                </button>
                                <button className="inline-flex items-center px-4 py-3 border border-gray-200 text-base font-semibold rounded-xl text-gray-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow">
                                    <FiMoreVertical className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Job Description */}
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-4">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FiFileText className="text-blue-500" /> About the job
                            </h2>
                            <div className="prose prose-sm max-w-none text-gray-700">
                                <div dangerouslySetInnerHTML={{
                                    __html: job.description?.replace(/\n/g, '<br />') || 'No description provided.'
                                }} />
                            </div>
                        </div>

                        {/* Requirements */}
                        {job.requirements && job.requirements.length > 0 && (
                            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-4">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FiTarget className="text-purple-500" /> Requirements
                                </h2>
                                <ul className="space-y-3">
                                    {job.requirements.map((req, i) => (
                                        <li key={i} className="flex items-start">
                                            <FiCheck className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                                            <span className="text-gray-700 text-base">{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Benefits */}
                        {job.benefits && job.benefits.length > 0 && (
                            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FiAward className="text-yellow-500" /> Benefits
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {job.benefits.map((benefit, i) => (
                                        <div key={i} className="flex items-center">
                                            <FiCheck className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                                            <span className="text-gray-700 text-base">{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Job Details Card */}
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <FiInfo className="text-blue-400" /> Job details
                            </h3>
                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <FiDollarSign className="h-6 w-6 text-green-400 mt-1 mr-4 flex-shrink-0" />
                                    <div>
                                        <p className="text-base font-semibold text-gray-900">Salary</p>
                                        <p className="text-base text-gray-500">
                                            {job.salary && job.minSalary !== undefined && job.maxSalary !== undefined ? `$${job.minSalary.toLocaleString()} - $${job.maxSalary.toLocaleString()} USD` : 'Not disclosed'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <FiBriefcase className="h-6 w-6 text-blue-400 mt-1 mr-4 flex-shrink-0" />
                                    <div>
                                        <p className="text-base font-semibold text-gray-900">Job type</p>
                                        <p className="text-base text-gray-500">{job.jobType || 'Full-time'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <FiAward className="h-6 w-6 text-yellow-400 mt-1 mr-4 flex-shrink-0" />
                                    <div>
                                        <p className="text-base font-semibold text-gray-900">Experience level</p>
                                        <p className="text-base text-gray-500">
                                            {job.experienceYears ? `${job.experienceYears} years` : 'Not specified'}
                                        </p>
                                    </div>
                                </div>
                                {job.endDate && (
                                    <div className="flex items-start">
                                        <FiClock className="h-6 w-6 text-purple-400 mt-1 mr-4 flex-shrink-0" />
                                        <div>
                                            <p className="text-base font-semibold text-gray-900">Application deadline</p>
                                            <p className="text-base text-gray-500">
                                                {new Date(job.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Company Card */}
                        {job.companyId && (
                            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <LuBuilding className="text-blue-400" /> About the company
                                </h3>
                                <div className="flex items-start space-x-4 mb-4">
                                    {job.companyId.url ? (
                                        <img
                                            src={job.companyId.url}
                                            alt="Company logo"
                                            className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-200 flex-shrink-0 shadow"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0 border-2 border-gray-200">
                                            <LuBuilding className="h-8 w-8 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-gray-900">
                                            {job.companyId.companyName}
                                        </h4>
                                        <p className="text-base text-gray-500">{job.companyId.address}</p>
                                        <div className="flex items-center mt-2">
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <FiStar
                                                        key={i}
                                                        className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-500 ml-2">
                                                ({Math.floor(Math.random() * 500) + 100} reviews)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    to={`/company/${job.companyId._id}`}
                                    className="inline-flex items-center text-base text-blue-600 hover:text-blue-800 font-semibold"
                                >
                                    View company page
                                    <FiExternalLink className="ml-2 h-4 w-4" />
                                </Link>
                            </div>
                        )}

                        {/* Report Job */}
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                            <button className="inline-flex items-center text-base text-gray-500 hover:text-red-600 font-semibold">
                                <FiFlag className="mr-3 h-5 w-5" />
                                Report this job
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetail;
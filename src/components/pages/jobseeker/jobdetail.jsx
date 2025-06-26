import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from "../../layout/header";
import FavoriteButton from "../../common/FavoriteButton";
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

import {
    FiMapPin, FiBriefcase, FiCalendar, FiClock, FiDollarSign,
    FiShare2, FiHeart, FiCheckCircle, FiXCircle, FiAlertCircle, 
    FiAward, FiFileText, FiArrowLeft, FiUsers, FiEye, FiStar,
    FiTrendingUp, FiGlobe, FiMail, FiPhone, FiBookmark,
    FiTarget, FiShield, FiZap
} from 'react-icons/fi';

// Enhanced Skeleton Loader Component
const JobDetailSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="container mx-auto px-4 py-8 animate-pulse">
            {/* Hero Section Skeleton */}
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
                <div className="h-4 bg-gray-200 rounded w-24 mb-6"></div>
                <div className="h-10 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="flex flex-wrap gap-4 mb-6">
                    <div className="h-6 bg-gray-200 rounded w-32"></div>
                    <div className="h-6 bg-gray-200 rounded w-40"></div>
                    <div className="h-6 bg-gray-200 rounded w-36"></div>
                </div>
                <div className="flex gap-4">
                    <div className="h-12 bg-blue-200 rounded-xl flex-1"></div>
                    <div className="h-12 bg-gray-200 rounded-xl w-12"></div>
                    <div className="h-12 bg-gray-200 rounded-xl w-12"></div>
                </div>
            </div>
            
            <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl p-8 shadow-lg">
                        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="space-y-4">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded"></div>
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

    // User-specific application state
    const [applicationStatus, setApplicationStatus] = useState({
        hasApplied: false,
        applicationId: null,
        testCompleted: false,
        questionExist: false,
    });
    const [isActionLoading, setIsActionLoading] = useState(false);

    // This would typically come from an auth context
    const userIsLoggedIn = !!localStorage.getItem('user');

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
                const user = JSON.parse(localStorage.getItem('user'));
                const token = user?.token || user?.accessToken;
                
                if (!token) return;

                const response = await fetch(`http://localhost:5000/api/applications/status/${jobId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // Check content type
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    if (response.status === 401) {
                        localStorage.removeItem('user');
                        return;
                    }
                    console.warn('Non-JSON response from application status endpoint');
                    return;
                }

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

    // Check if job is favorited
    useEffect(() => {
        const checkFavoriteStatus = async () => {
            if (!jobId || !userIsLoggedIn) return;

            // 1) Quick check from localStorage user object if it contains favorites
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (Array.isArray(user?.favoriteJobs)) {
                    const quickMatch = user.favoriteJobs.includes(jobId);
                    if (quickMatch) {
                        setIsSaved(true);
                        // still fallback to API to stay consistent but no need if quickMatch true
                        return;
                    }
                }
            } catch (err) {
                // ignore JSON parse errors
            }

            // 2) Fallback: fetch favorites from server
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const token = user?.token || user?.accessToken;
                if (!token) return;

                const response = await fetch('http://localhost:5000/api/user/favorites', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.status && data.result) {
                        const favoriteJobIds = data.result.map(job => job._id);
                        setIsSaved(favoriteJobIds.includes(jobId));
                    }
                }
            } catch (err) {
                console.error("Could not fetch favorite status:", err);
            }
        };

        checkFavoriteStatus();
    }, [jobId, userIsLoggedIn]);

    const handleApplyJob = async () => {
        if (!userIsLoggedIn) {
            toastr.warning('Please log in to apply for jobs.');
            navigate('/login');
            return;
        }
        setIsActionLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user?.token || user?.accessToken;
            
            if (!token) {
                toastr.warning('Please log in to apply for jobs.');
                navigate('/login');
                return;
            }

            const response = await fetch(`http://localhost:5000/api/applications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ jobId: job._id })
            });

            // Check if response is HTML (error page)
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const htmlText = await response.text();
                console.error('Received HTML instead of JSON:', htmlText.substring(0, 200));
                
                if (response.status === 401) {
                    toastr.error('Session expired. Please log in again.');
                    localStorage.removeItem('user');
                    navigate('/login');
                    return;
                }
                
                throw new Error(`Server returned ${response.status}. Please try again later.`);
            }

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}: Failed to apply`);
            }
            
            if (data.status) {
                toastr.success('Application submitted successfully!');
                setApplicationStatus({ hasApplied: true, ...data.result });
            } else {
                throw new Error(data.message || 'Application failed');
            }

        } catch (err) {
            console.error('Error applying to job:', err);
            
            if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
                toastr.error('Server error. Please try again later.');
            } else if (err.message.includes('NetworkError') || err.message.includes('fetch')) {
                toastr.error('Network error. Please check your connection.');
            } else {
                toastr.error(err.message || 'An error occurred while applying.');
            }
        } finally {
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
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user?.token || user?.accessToken;
            
            if (!token) {
                toastr.warning('Please log in again.');
                navigate('/login');
                return;
            }

            const response = await fetch(`http://localhost:5000/api/applications/${applicationStatus.applicationId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Check content type
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                if (response.status === 401) {
                    toastr.error('Session expired. Please log in again.');
                    localStorage.removeItem('user');
                    navigate('/login');
                    return;
                }
                throw new Error(`Server returned ${response.status}. Please try again later.`);
            }

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to withdraw application.');
            }
            
            toastr.info('Application withdrawn.');
            setApplicationStatus({ hasApplied: false, applicationId: null, testCompleted: false, questionExist: false });
        } catch (err) {
            console.error('Error withdrawing application:', err);
            
            if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
                toastr.error('Server error. Please try again later.');
            } else {
                toastr.error(err.message || 'An error occurred while withdrawing.');
            }
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleFavoriteToggle = (jobId, isFavorite, remainingFavorites) => {
        setIsSaved(isFavorite);
    };

    const handleAuthRequired = () => {
        navigate('/login');
    };

    const handleLimitReached = (errorData) => {
        const shouldUpgrade = window.confirm(`${errorData.message}\n\nWould you like to upgrade now?`);
        if (shouldUpgrade) {
            navigate('/packages');
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

    if (loading) return <JobDetailSkeleton />;

    if (error) return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
            <Header />
            <div className="text-center py-20">
                <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md mx-auto">
                    <FiAlertCircle className="mx-auto text-red-500 text-6xl mb-6" />
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h2>
                    <p className="text-gray-600 mb-8 text-lg">{error}</p>
                    <button
                        onClick={() => navigate('/jobsearch')}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold"
                    >
                        Back to Search
                    </button>
                </div>
            </div>
        </div>
    );

    if (!job) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
            <Header />
            <div className="text-center text-2xl py-20 text-gray-600">Job not found</div>
        </div>
    );

    const renderActionButtons = () => {
        if (applicationStatus.hasApplied) {
            return (
                <div className="space-y-4">
                    {applicationStatus.questionExist && !applicationStatus.testCompleted ? (
                        <button
                            onClick={handleSkillTestClick}
                            disabled={isActionLoading}
                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 px-6 rounded-2xl text-lg hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 flex items-center justify-center disabled:opacity-50 shadow-lg"
                        >
                            <FiFileText className="mr-3" /> Take Skill Test
                        </button>
                    ) : (
                        <div className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 px-6 rounded-2xl text-lg flex items-center justify-center shadow-lg">
                            <FiCheckCircle className="mr-3" /> Application Submitted
                        </div>
                    )}
                    <button
                        onClick={handleWithdrawApplication}
                        disabled={isActionLoading}
                        className="w-full text-red-600 bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-300 font-semibold py-3 px-6 rounded-2xl transition-all flex items-center justify-center disabled:opacity-50"
                    >
                        <FiXCircle className="mr-2" /> Withdraw Application
                    </button>
                </div>
            );
        }
        return (
            <button
                onClick={handleApplyJob}
                disabled={isActionLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-2xl text-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center justify-center disabled:opacity-50 shadow-lg"
            >
                {isActionLoading ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                        Submitting...
                    </>
                ) : (
                    <>
                        <FiZap className="mr-3" /> Apply Now
                    </>
                )}
            </button>
        );
    };

    const StatCard = ({ icon, label, value, color = "blue" }) => (
        <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 border border-${color}-200 rounded-2xl p-4 text-center transition-all hover:shadow-lg`}>
            <div className={`text-${color}-600 text-2xl mb-2 flex justify-center`}>{icon}</div>
            <p className="text-gray-600 text-sm font-medium">{label}</p>
            <p className={`text-${color}-700 font-bold text-lg`}>{value}</p>
        </div>
    );

    const InfoItem = ({ icon, label, value, highlight = false }) => (
        <div className={`flex items-center p-4 rounded-2xl transition-all hover:shadow-md ${
            highlight ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
        }`}>
            <div className={`flex-shrink-0 mr-4 p-3 rounded-xl ${
                highlight ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'bg-white text-gray-600 shadow-sm'
            }`}>
                {icon}
            </div>
            <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm uppercase tracking-wide">{label}</p>
                <p className={`text-lg font-bold ${highlight ? 'text-blue-700' : 'text-gray-700'}`}>{value}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-28">
            <Header />
            
            <div className="container mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-500/10 to-pink-500/10 rounded-full -ml-24 -mb-24"></div>
                    
                    <div className="relative z-10">
                        <button 
                            onClick={() => navigate(-1)} 
                            className="flex items-center text-gray-600 hover:text-blue-600 mb-6 font-medium transition-colors group"
                        >
                            <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform"/> 
                            Back to results
                        </button>
                        
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                                <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-800 mb-4 leading-tight">
                                    {job.title}
                                </h1>
                                
                                <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
                                    <Link 
                                        to={`/company/${job.companyId?._id}`} 
                                        className="flex items-center hover:text-blue-600 transition-colors font-semibold"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                                            <FiBriefcase className="text-white text-sm"/>
                                        </div>
                                        {job.companyId?.companyName || 'Company'}
                                    </Link>
                                    <div className="flex items-center">
                                        <FiMapPin className="mr-2 text-red-500"/> 
                                        <span className="font-medium">{job.location || 'Remote'}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <FiCalendar className="mr-2 text-green-500"/> 
                                        <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <FiEye className="mr-2 text-blue-500"/> 
                                        <span>{Math.floor(Math.random() * 500) + 100} views</span>
                                    </div>
                                </div>
                            </div>
                            
                            {job.companyId?.url && (
                                <div className="ml-6">
                                    <img 
                                        src={`http://localhost:5000${job.companyId.url}`} 
                                        alt="company logo" 
                                        className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl shadow-lg object-cover border-4 border-white"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatCard 
                                icon={<FiDollarSign />} 
                                label="Salary" 
                                value={job.salary ? `$${job.salary.toLocaleString()}` : 'Negotiable'} 
                                color="green"
                            />
                            <StatCard 
                                icon={<FiAward />} 
                                label="Experience" 
                                value={job.experienceYears ? `${job.experienceYears} years` : 'Any level'} 
                                color="purple"
                            />
                            <StatCard 
                                icon={<FiUsers />} 
                                label="Applicants" 
                                value={`${job.applicantCount || Math.floor(Math.random() * 50) + 10}`} 
                                color="blue"
                            />
                            <StatCard 
                                icon={<FiClock />} 
                                label="Deadline" 
                                value={job.endDate ? new Date(job.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Open'} 
                                color="orange"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                {renderActionButtons()}
                            </div>
                            <FavoriteButton
                                jobId={job._id}
                                isFavorite={isSaved}
                                onToggle={handleFavoriteToggle}
                                onAuthRequired={handleAuthRequired}
                                onLimitReached={handleLimitReached}
                                variant="button"
                                size="lg"
                                showTooltip={false}
                            />
                            <button
                                onClick={handleShareJob}
                                className="px-6 py-4 bg-white border-2 border-gray-200 text-gray-600 rounded-2xl hover:border-blue-300 hover:text-blue-500 transition-all flex items-center justify-center font-semibold"
                            >
                                <FiShare2 className="mr-2" />
                                <span className="hidden sm:inline">Share</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Job Description */}
                        <div className="bg-white rounded-3xl shadow-xl p-8">
                            <div className="flex items-center mb-6">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                                    <FiFileText className="text-white"/>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">Job Description</h2>
                            </div>
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                                <div dangerouslySetInnerHTML={{ 
                                    __html: job.description?.replace(/\n/g, '<br />') || 'No description provided.' 
                                }} />
                            </div>
                        </div>

                        {/* Requirements */}
                        {job.requirements && job.requirements.length > 0 && (
                            <div className="bg-white rounded-3xl shadow-xl p-8">
                                <div className="flex items-center mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-4">
                                        <FiTarget className="text-white"/>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800">Requirements</h2>
                                </div>
                                <div className="space-y-3">
                                    {job.requirements.map((req, i) => (
                                        <div key={i} className="flex items-start">
                                            <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                                            <p className="text-gray-700 leading-relaxed">{req}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Benefits */}
                        {job.benefits && job.benefits.length > 0 && (
                            <div className="bg-white rounded-3xl shadow-xl p-8">
                                <div className="flex items-center mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4">
                                        <FiShield className="text-white"/>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800">Benefits & Perks</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {job.benefits.map((benefit, i) => (
                                        <div key={i} className="flex items-center bg-green-50 rounded-2xl p-4">
                                            <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                                                <FiCheckCircle className="text-white text-sm"/>
                                            </div>
                                            <p className="text-green-700 font-medium">{benefit}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="lg:col-span-1 space-y-6 mt-8 lg:mt-0">
                        <div className="sticky top-24 space-y-6">
                            {/* Job Overview */}
                            <div className="bg-white rounded-3xl shadow-xl p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                    <FiTrendingUp className="mr-3 text-blue-500"/>
                                    Job Overview
                                </h3>
                                <div className="space-y-4">
                                    <InfoItem 
                                        icon={<FiDollarSign/>} 
                                        label="Salary Range" 
                                        value={job.salary ? `$${job.salary.toLocaleString()} USD` : 'Negotiable'} 
                                        highlight={true}
                                    />
                                    <InfoItem 
                                        icon={<FiAward/>} 
                                        label="Experience Required" 
                                        value={job.experienceYears ? `${job.experienceYears} years` : 'Not specified'} 
                                    />
                                    <InfoItem 
                                        icon={<FiBriefcase/>} 
                                        label="Employment Type" 
                                        value={job.jobType || 'Full-time'} 
                                    />
                                    <InfoItem 
                                        icon={<FiClock/>} 
                                        label="Application Deadline" 
                                        value={job.endDate ? new Date(job.endDate).toLocaleDateString() : 'Open until filled'}
                                    />
                                </div>
                            </div>

                            {/* Company Information */}
                            {job.companyId && (
                                <div className="bg-white rounded-3xl shadow-xl p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                        <FiBriefcase className="mr-3 text-purple-500"/>
                                        About Company
                                    </h3>
                                    <div className="text-center mb-6">
                                        {job.companyId.url ? (
                                            <img 
                                                src={`http://localhost:5000${job.companyId.url}`} 
                                                alt="company logo" 
                                                className="w-20 h-20 rounded-2xl mx-auto mb-4 shadow-lg object-cover border-4 border-gray-100"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 rounded-2xl mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                                <FiBriefcase className="text-3xl text-white"/>
                                            </div>
                                        )}
                                        <h4 className="font-bold text-xl text-gray-800 mb-2">{job.companyId.companyName}</h4>
                                        <p className="text-gray-600 mb-4">{job.companyId.address}</p>
                                        <div className="flex items-center justify-center text-sm text-gray-500 mb-6">
                                            <FiStar className="mr-1 text-yellow-500"/>
                                            <span className="font-semibold">4.5</span>
                                            <span className="mx-2">•</span>
                                            <span>{Math.floor(Math.random() * 500) + 100} reviews</span>
                                        </div>
                                    </div>
                                    <Link 
                                        to={`/company/${job.companyId._id}`} 
                                        className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-3 px-6 rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold transform hover:scale-105"
                                    >
                                        View Company Profile
                                    </Link>
                                </div>
                            )}

                            {/* Quick Actions */}
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-6 border border-blue-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <button className="w-full flex items-center justify-center bg-white text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors font-medium border border-gray-200">
                                        <FiBookmark className="mr-2"/>
                                        Save for later
                                    </button>
                                    <button className="w-full flex items-center justify-center bg-white text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors font-medium border border-gray-200">
                                        <FiMail className="mr-2"/>
                                        Email to friend
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetail;

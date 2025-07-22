import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../layout/header';
import useBanCheck from '../admin/checkban';
import { FiZap, FiStar, FiArrowRight, FiLock, FiBookmark } from 'react-icons/fi';
import toastr from 'toastr';

const JobSearch = () => {
    const BanPopup = useBanCheck();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const isInitialMount = useRef(true);
    const [userUsage, setUserUsage] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [savedJobs, setSavedJobs] = useState({});
    const [isUserDataLoading, setIsUserDataLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        totalJobs: 0,
        hasNextPage: false,
        hasPrevPage: false
    });

    // Enhanced filters to match your API
    const [filters, setFilters] = useState({
        keyword: '',
        location: '',
        jobType: '',
        minSalary: '',
        maxSalary: '',
        experience: '',
        education: '',
        skills: ''
    });

    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Job types for dropdown
    const jobTypes = [
        'Full-time',
        'Part-time',
        'Contract',
        'Internship',
        'Freelance'
    ];

    // Experience levels
    const experienceLevels = [
        'Entry Level',
        'Mid Level',
        'Senior Level',
        'Executive'
    ];

    // Education levels
    const educationLevels = [
        'High School',
        'Associate Degree',
        'Bachelor\'s Degree',
        'Master\'s Degree',
        'PhD'
    ];

    // Get user token
    const getUserToken = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        return user?.token;
    };

    // Fetch user usage and subscription data
    useEffect(() => {
        const fetchUserData = async () => {
            const token = getUserToken();
            if (!token) return;

            try {
                // Fetch usage stats
                const usageResponse = await fetch('http://localhost:5000/api/subscriptions/usage-stats', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (usageResponse.ok) {
                    const usageData = await usageResponse.json();
                    setUserUsage(usageData.result);
                }

                // Fetch current subscription
                const subResponse = await fetch('http://localhost:5000/api/subscriptions/current', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (subResponse.ok) {
                    const subData = await subResponse.json();
                    setSubscription(subData.result);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setIsUserDataLoading(false); // Add this line
            }
        };

        fetchUserData();
    }, []);

    // Limit enforcement modal
    const LimitModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiLock className="text-white text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    Monthly Limit Reached
                </h3>
                <p className="text-gray-600 mb-6">
                    You've reached your monthly limit for saved jobs. Upgrade to Premium to save unlimited jobs and unlock more features!
                </p>
                <div className="space-y-3">
                    <button
                        onClick={() => {
                            setShowLimitModal(false);
                            navigate('/packages');
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold flex items-center justify-center"
                    >
                        <FiStar className="mr-2" />
                        Upgrade Now
                    </button>
                    <button
                        onClick={() => setShowLimitModal(false)}
                        className="w-full text-gray-600 hover:text-gray-800 font-medium"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    );

    // Usage banner component
    const UsageBanner = () => {
        if (!userUsage || subscription?.planId?.name === 'Enterprise') return null;

        const savedJobsUsage = userUsage.savedJobs;
        const applicationsUsage = userUsage.jobApplications;

        const isNearLimit = (usage) => {
            if (usage.limit === -1) return false;
            return (usage.used / usage.limit) >= 0.8;
        };

        const showBanner = isNearLimit(savedJobsUsage) || isNearLimit(applicationsUsage);

        if (!showBanner) return null;

        return (
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold mb-2">You're approaching your monthly limits!</h3>
                        <div className="text-sm opacity-90">
                            {isNearLimit(savedJobsUsage) && (
                                <p>Saved Jobs: {savedJobsUsage.used}/{savedJobsUsage.limit}</p>
                            )}
                            {isNearLimit(applicationsUsage) && (
                                <p>Applications: {applicationsUsage.used}/{applicationsUsage.limit}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/packages')}
                        className="bg-white text-orange-600 px-6 py-3 rounded-xl hover:bg-orange-50 transition-colors font-semibold flex items-center"
                    >
                        <FiZap className="mr-2" />
                        Upgrade
                    </button>
                </div>
            </div>
        );
    };

    const fetchJobs = async (page = 1) => {
        setIsLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const queryParams = new URLSearchParams();

            // Add all non-empty filters to query params
            Object.entries(filters).forEach(([key, value]) => {
                if (value && value.trim() !== '') {
                    queryParams.append(key, value.trim());
                }
            });

            // Add pagination
            queryParams.append('page', page.toString());
            queryParams.append('limit', '12'); // Show 12 jobs per page


            const response = await fetch(`http://localhost:5000/api/jobs?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('API Response:', data);

                if (data.status) {
                    setJobs(data.result || []);

                    // Map the pagination data correctly from your backend
                    const paginationData = data.pagination || {};
                    setPagination({
                        currentPage: paginationData.currentPage || 1,
                        totalPages: paginationData.totalPages || 0,
                        totalJobs: paginationData.totalJobs || 0,
                        hasNextPage: paginationData.hasNextPage || false,
                        hasPrevPage: paginationData.hasPrevPage || false
                    });
                } else {
                    console.error('API returned error:', data.message);
                    setJobs([]);
                    setPagination({
                        currentPage: 1,
                        totalPages: 0,
                        totalJobs: 0,
                        hasNextPage: false,
                        hasPrevPage: false
                    });
                }
            } else {
                console.error('Failed to fetch jobs:', response.status);
                setJobs([]);
                setPagination({
                    currentPage: 1,
                    totalPages: 0,
                    totalJobs: 0,
                    hasNextPage: false,
                    hasPrevPage: false
                });
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
            setJobs([]);
            setPagination({
                currentPage: 1,
                totalPages: 0,
                totalJobs: 0,
                hasNextPage: false,
                hasPrevPage: false
            });
        } finally {
            setIsLoading(false);
            setIsSearching(false);
        }
    };

    const handleSaveJob = async (jobId) => {
        const token = getUserToken();
        if (!token) {
            toastr.warning('Please log in to save jobs');
            navigate('/login');
            return;
        }

        // Check if user data is still loading
        if (isUserDataLoading) {
            toastr.info('Please wait while we load your account data');
            return;
        }

        // Create a fallback check using localStorage
        const fallbackCheck = () => {
            const localUsage = JSON.parse(localStorage.getItem('jobUsage')) || { saved: 0, limit: 10 };
            return localUsage.saved >= localUsage.limit;
        };

        // Determine if limit is reached
        const isLimitReached = userUsage
            ? userUsage.savedJobs.limit !== -1 && userUsage.savedJobs.used >= userUsage.savedJobs.limit
            : fallbackCheck();

        if (isLimitReached) {
            setShowLimitModal(true);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/jobs/save', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ jobId })
            });

            if (response.ok) {
                toastr.success('Job saved successfully!');
                setSavedJobs(prev => ({ ...prev, [jobId]: true }));
                setUserUsage(prev => ({
                    ...prev,
                    savedJobs: {
                        ...prev.savedJobs,
                        used: prev.savedJobs.used + 1
                    }
                }));
                const localUsage = JSON.parse(localStorage.getItem('jobUsage')) || { saved: 0, limit: userUsage?.savedJobs.limit || 10 };
                localStorage.setItem('jobUsage', JSON.stringify({
                    ...localUsage,
                    saved: localUsage.saved + 1
                }));
            } else {
                const error = await response.json();
                toastr.error(error.message || 'Failed to save job');
            }
        } catch (error) {
            console.error('Error saving job:', error);
            toastr.error('Failed to save job');
        }
    };

    // Initial load
    useEffect(() => {
        fetchJobs(1);
    }, []);

    // Handle filter changes with debouncing
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const handler = setTimeout(() => {
            fetchJobs(1);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [filters]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Show searching state immediately
        setIsSearching(true);

        setFilters(prev => ({
            ...prev,
            [name]: value
        }));

        // Reset to page 1 when filters change
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, currentPage: newPage }));
        fetchJobs(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearFilters = () => {
        setFilters({
            keyword: '',
            location: '',
            jobType: '',
            minSalary: '',
            maxSalary: '',
            experience: '',
            education: '',
            skills: ''
        });
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        // Immediately fetch all jobs when clearing filters
        fetchJobs(1);
    };

    const formatSalary = (salary) => {
        if (!salary) return 'Negotiable';
        return `$${parseInt(salary).toLocaleString()}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getCompanyName = (companyId) => {
        // For now, just return a placeholder. 
        // In a real app, you might want to fetch company details or have them populated
        if (!companyId) return 'Company';
        return `Company (${companyId.slice(-8)})`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
            {BanPopup}
            <Header />

            {/* Hero Section */}
            <div className="w-full bg-white border-b border-gray-200 py-12 mb-0">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
                        Find your next opportunity
                    </h1>
                    <p className="text-lg text-gray-600 mb-6">
                        Search and discover jobs that match your skills and ambitions.
                    </p>
                    {/* Search Bar */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <input
                                    type="text"
                                    name="keyword"
                                    value={filters.keyword}
                                    onChange={handleInputChange}
                                    placeholder="Search job titles, companies, or keywords"
                                    className="w-full p-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="relative">
                                <input
                                    type="text"
                                    name="location"
                                    value={filters.location}
                                    onChange={handleInputChange}
                                    placeholder="Location"
                                    className="w-full p-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
                {/* Filters Sidebar */}
                <div className={`w-full lg:w-1/4 ${showAdvancedFilters ? 'block' : 'hidden lg:block'}`}> 
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md mb-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                            <button
                                onClick={clearFilters}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Clear all
                            </button>
                        </div>
                        <div className="space-y-6">
                            {/* Job Type */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Job Type</h3>
                                <div className="space-y-2">
                                    {jobTypes.map(type => (
                                        <div key={type} className="flex items-center">
                                            <input
                                                type="radio"
                                                id={`type-${type}`}
                                                name="jobType"
                                                value={type}
                                                checked={filters.jobType === type}
                                                onChange={handleInputChange}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                            <label htmlFor={`type-${type}`} className="ml-2 text-sm text-gray-700">
                                                {type}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Experience Level */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Experience Level</h3>
                                <div className="space-y-2">
                                    {experienceLevels.map(level => (
                                        <div key={level} className="flex items-center">
                                            <input
                                                type="radio"
                                                id={`exp-${level}`}
                                                name="experience"
                                                value={level}
                                                checked={filters.experience === level}
                                                onChange={handleInputChange}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                            <label htmlFor={`exp-${level}`} className="ml-2 text-sm text-gray-700">
                                                {level}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Education */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Education</h3>
                                <div className="space-y-2">
                                    {educationLevels.map(level => (
                                        <div key={level} className="flex items-center">
                                            <input
                                                type="radio"
                                                id={`edu-${level}`}
                                                name="education"
                                                value={level}
                                                checked={filters.education === level}
                                                onChange={handleInputChange}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                            <label htmlFor={`edu-${level}`} className="ml-2 text-sm text-gray-700">
                                                {level}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Skills */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Skills</h3>
                                <input
                                    type="text"
                                    name="skills"
                                    value={filters.skills}
                                    onChange={handleInputChange}
                                    placeholder="e.g., React, Python..."
                                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            {/* Salary Range */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Salary Range</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Min ($)</label>
                                        <input
                                            type="number"
                                            name="minSalary"
                                            value={filters.minSalary}
                                            onChange={handleInputChange}
                                            placeholder="Min"
                                            className="w-full p-2 text-sm border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Max ($)</label>
                                        <input
                                            type="number"
                                            name="maxSalary"
                                            value={filters.maxSalary}
                                            onChange={handleInputChange}
                                            placeholder="Max"
                                            className="w-full p-2 text-sm border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Job Results */}
                <div className="w-full lg:w-3/4">
                    {/* Results Header */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                {pagination.totalJobs > 0 ? (
                                    <>{pagination.totalJobs.toLocaleString()} jobs found</>
                                ) : (
                                    'Search Results'
                                )}
                                {isSearching && (
                                    <div className="ml-3 animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                                )}
                            </h2>
                            {pagination.totalJobs > 0 && (
                                <p className="text-gray-600 mt-1 text-sm">
                                    Showing {Math.min(pagination.totalJobs, 12)} of {pagination.totalJobs} jobs
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading && !isSearching && (
                        <div className="flex justify-center items-center py-16">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading jobs...</p>
                            </div>
                        </div>
                    )}

                    {/* Job List */}
                    {!isLoading && jobs.length > 0 && (
                        <div className={`space-y-4 mb-8 transition-opacity duration-300 ${isSearching ? 'opacity-50' : 'opacity-100'}`}>
                            {jobs.map((job, index) => (
                                <div
                                    key={job._id || index}
                                    className="bg-white rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 shadow-sm"
                                >
                                    <div className="p-4 sm:p-6 flex">
                                        {/* Company Logo */}
                                        <div className="mr-4 flex-shrink-0">
                                            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-blue-800 font-bold text-xl">
                                                {job.title ? job.title.charAt(0).toUpperCase() : 'J'}
                                            </div>
                                        </div>

                                        {/* Job Details */}
                                        <div className="flex-grow">
                                            <div className="flex flex-col sm:flex-row sm:justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer" onClick={() => navigate(`/jobs-detail/${job._id}`)}>
                                                        {job.title}
                                                    </h3>
                                                    <p className="text-gray-700 mt-1">{getCompanyName(job.companyId.companyName)}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleSaveJob(job._id)}
                                                    className={`mt-3 sm:mt-0 flex items-center justify-end ${savedJobs[job._id]
                                                        ? "text-blue-500"
                                                        : "text-gray-500 hover:text-blue-600"
                                                        }`}
                                                >
                                                    <FiBookmark className={`w-5 h-5 ${savedJobs[job._id] ? 'fill-current' : ''}`} />
                                                </button>
                                            </div>

                                            <div className="mt-3">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-gray-600 text-sm flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        {job.location}
                                                    </span>

                                                    {job.salary && (
                                                        <span className="text-gray-600 text-sm flex items-center">
                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                            </svg>
                                                            {formatSalary(job.salary)}
                                                        </span>
                                                    )}

                                                    {job.experienceYears && (
                                                        <span className="text-gray-600 text-sm flex items-center">
                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8zM8 14v.01M12 14v.01M16 14v.01" />
                                                            </svg>
                                                            {job.experienceYears} yrs
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="mt-3 text-sm text-gray-600 line-clamp-2">
                                                    {job.description || 'No description available.'}
                                                </div>

                                                <div className="mt-3 flex items-center text-xs text-gray-500">
                                                    <span>Posted {formatDate(job.createdAt)}</span>
                                                    {job.applicantCount > 0 && (
                                                        <span className="ml-3">{job.applicantCount} applicants</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-4 flex flex-wrap gap-3">
                                                <button
                                                    onClick={() => navigate(`/jobs-detail/${job._id}`)}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors text-sm font-medium shadow"
                                                >
                                                    Apply now
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/jobs-detail/${job._id}`)}
                                                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors text-sm font-medium shadow"
                                                >
                                                    View details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {!isLoading && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                            <button
                                disabled={!pagination.hasPrevPage}
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-full ${!pagination.hasPrevPage
                                    ? "text-gray-400 cursor-not-allowed bg-gray-100"
                                    : "text-gray-700 hover:text-white hover:bg-blue-600 bg-white border border-gray-300"
                                    }`}
                            >
                                <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Previous
                            </button>

                            <div className="hidden md:flex gap-2">
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (pagination.totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else {
                                        const startPage = Math.max(1, Math.min(pagination.currentPage - 2, pagination.totalPages - 4));
                                        pageNum = startPage + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${pagination.currentPage === pageNum
                                                ? "bg-blue-600 text-white shadow"
                                                : "text-gray-700 hover:text-white hover:bg-blue-500 bg-white border border-gray-300"
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                disabled={!pagination.hasNextPage}
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-full ${!pagination.hasNextPage
                                    ? "text-gray-400 cursor-not-allowed bg-gray-100"
                                    : "text-gray-700 hover:text-white hover:bg-blue-600 bg-white border border-gray-300"
                                    }`}
                            >
                                Next
                                <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* No Results State */}
                    {!isLoading && jobs.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">
                                {Object.values(filters).some(value => value && value.trim() !== '')
                                    ? 'No jobs match your search'
                                    : 'No jobs available'
                                }
                            </h3>
                            <p className="text-gray-600 max-w-md mx-auto mb-6">
                                {Object.values(filters).some(value => value && value.trim() !== '')
                                    ? 'Try adjusting your filters or search terms'
                                    : 'Check back later for new opportunities'
                                }
                            </p>
                            {Object.values(filters).some(value => value && value.trim() !== '') && (
                                <button
                                    onClick={clearFilters}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Limit Modal */}
            {showLimitModal && <LimitModal />}
        </div>
    );
};

export default JobSearch;
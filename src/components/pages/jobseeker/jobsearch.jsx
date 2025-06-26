import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../layout/header';
import useBanCheck from '../admin/checkban';
import FavoriteButton from '../../common/FavoriteButton';
import { FiZap, FiStar, FiArrowRight, FiLock } from 'react-icons/fi';
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
    const [favoriteJobs, setFavoriteJobs] = useState(new Set());
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

                // Fetch favorite jobs
                const favResponse = await fetch('http://localhost:5000/api/jobs/favorites', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (favResponse.ok) {
                    const favData = await favResponse.json();
                    if (favData.status && favData.result) {
                        const favoriteJobIds = new Set(favData.result.map(job => job._id));
                        setFavoriteJobs(favoriteJobIds);
                    }
                } else {
                    console.warn('Failed to fetch favorites:', favResponse.status);
                    // Don't fail the whole operation if favorites can't be loaded
                    setFavoriteJobs(new Set());
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    // Limit enforcement modal
    const LimitModal = () => (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiLock className="text-white text-3xl"/>
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
                        <FiStar className="mr-2"/>
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
                        <FiZap className="mr-2"/>
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

    // Handle favorite toggle
    const handleFavoriteToggle = (jobId, isFavorite, remainingFavorites) => {
        const newFavorites = new Set(favoriteJobs);
        if (isFavorite) {
            newFavorites.add(jobId);
        } else {
            newFavorites.delete(jobId);
        }
        setFavoriteJobs(newFavorites);

        // Update usage stats if adding to favorites
        if (isFavorite && userUsage) {
            setUserUsage(prev => ({
                ...prev,
                savedJobs: {
                    ...prev.savedJobs,
                    used: prev.savedJobs.used + 1
                }
            }));
        }
    };

    const handleAuthRequired = () => {
        navigate('/login');
    };

    const handleLimitReached = (errorData) => {
        setShowLimitModal(true);
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
        if (!companyId) return 'Company';

        // If backend returns full object
        if (typeof companyId === 'object') {
            if (companyId.companyName) return companyId.companyName;
            if (companyId._id && typeof companyId._id === 'string') return `Company (${companyId._id.slice(-8)})`;
            return 'Company';
        }

        // If backend returns just an ID string
        if (typeof companyId === 'string') {
            return `Company (${companyId.slice(-8)})`;
        }

        return 'Company';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {BanPopup}
            <Header />
            
            {/* Hero Section */}
            <div className="w-full bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 py-16 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                        Find Your Dream Job
                    </h1>
                    <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Discover thousands of opportunities from top companies around the world
                    </p>
                    
                    {/* Quick Search Bar */}
                    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-4 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <input
                                    type="text"
                                    name="keyword"
                                    value={filters.keyword}
                                    onChange={handleInputChange}
                                    placeholder="Job title, skills, or company..."
                                    className="w-full p-3 sm:p-4 text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    name="location"
                                    value={filters.location}
                                    onChange={handleInputChange}
                                    placeholder="Location..."
                                    className="w-full p-3 sm:p-4 text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <button
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                className="bg-blue-600 text-white p-3 sm:p-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm sm:text-base"
                            >
                                {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
                            </button>
                        </div>
                        
                        {/* Advanced Filters */}
                        {showAdvancedFilters && (
                            <div className="mt-6 p-4 sm:p-6 bg-gray-50 rounded-xl">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Job Type */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Job Type
                                        </label>
                                        <select
                                            name="jobType"
                                            value={filters.jobType}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="">All Types</option>
                                            {jobTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Experience */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Experience Level
                                        </label>
                                        <select
                                            name="experience"
                                            value={filters.experience}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="">All Levels</option>
                                            {experienceLevels.map(level => (
                                                <option key={level} value={level}>{level}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Education */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Education
                                        </label>
                                        <select
                                            name="education"
                                            value={filters.education}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="">All Education</option>
                                            {educationLevels.map(level => (
                                                <option key={level} value={level}>{level}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Skills */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Skills
                                        </label>
                                        <input
                                            type="text"
                                            name="skills"
                                            value={filters.skills}
                                            onChange={handleInputChange}
                                            placeholder="e.g., React, Python..."
                                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    {/* Min Salary */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Min Salary
                                        </label>
                                        <input
                                            type="number"
                                            name="minSalary"
                                            value={filters.minSalary}
                                            onChange={handleInputChange}
                                            placeholder="Min salary..."
                                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    
                                    {/* Max Salary */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Max Salary
                                        </label>
                                        <input
                                            type="number"
                                            name="maxSalary"
                                            value={filters.maxSalary}
                                            onChange={handleInputChange}
                                            placeholder="Max salary..."
                                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    
                                    {/* Clear Filters Button */}
                                    <div className="sm:col-span-2 flex items-end">
                                        <button
                                            onClick={clearFilters}
                                            className="w-full bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition-colors"
                                        >
                                            Clear All Filters
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Usage Banner */}
                <UsageBanner />

                {/* Results Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
                            {pagination.totalJobs > 0 ? (
                                <>Found {pagination.totalJobs.toLocaleString()} jobs</>
                            ) : (
                                'Search Results'
                            )}
                            {isSearching && (
                                <div className="ml-3 animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                            )}
                        </h2>
                        {pagination.totalJobs > 0 && (
                            <p className="text-gray-600 mt-1 text-sm sm:text-base">
                                Page {pagination.currentPage} of {pagination.totalPages}
                                {pagination.totalPages > 0 && (
                                    <span className="ml-2">
                                        • Showing {((pagination.currentPage - 1) * 12) + 1}-{Math.min(pagination.currentPage * 12, pagination.totalJobs)} of {pagination.totalJobs} jobs
                                    </span>
                                )}
                            </p>
                        )}
                    </div>
                </div>

                {/* Loading State - Only show when initial loading */}
                {isLoading && !isSearching && (
                    <div className="flex justify-center items-center py-16">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                            <p className="text-gray-600 text-lg">Loading jobs...</p>
                        </div>
                    </div>
                )}

                {/* Job Results Grid */}
                {!isLoading && jobs.length > 0 && (
                    <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 mb-8 sm:mb-12 transition-opacity duration-300 ${
                        isSearching ? 'opacity-50' : 'opacity-100'
                    }`}>
                        {jobs.map((job, index) => (
                            <div
                                key={job._id || index}
                                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden flex flex-col"
                            >
                                {/* Content wrapper that grows */}
                                <div className="flex-grow">
                                    {/* Job Card Header */}
                                    <div className="p-4 sm:p-6 border-b border-gray-100">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                                                    {job.title}
                                                </h3>
                                                <p className="text-blue-600 font-semibold truncate">
                                                    {getCompanyName(job.companyId)}
                                                </p>
                                            </div>
                                            <div className="ml-3 flex-shrink-0">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-lg">
                                                    {job.title ? job.title.charAt(0).toUpperCase() : 'J'}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <div className="flex items-center text-gray-600 text-sm">
                                                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span className="truncate">{job.location}</span>
                                            </div>
                                            
                                            <div className="flex items-center text-gray-600 text-sm">
                                                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                </svg>
                                                <span className="font-semibold text-green-600">
                                                    {formatSalary(job.salary)}
                                                </span>
                                            </div>
                                            
                                            {job.experienceYears && (
                                                <div className="flex items-center text-gray-600 text-sm">
                                                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8zM8 14v.01M12 14v.01M16 14v.01" />
                                                    </svg>
                                                    <span className="truncate">{job.experienceYears} years experience</span>
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center text-gray-600 text-sm">
                                                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    job.status === 'active' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {job.status?.charAt(0).toUpperCase() + job.status?.slice(1) || 'Active'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Job Card Body */}
                                    <div className="p-4 sm:p-6">
                                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                                            {job.description || 'No description available.'}
                                        </p>
                                        
                                        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-4">
                                            <span>Posted: {formatDate(job.createdAt)}</span>
                                            <span>{job.applicantCount || 0} applicants</span>
                                        </div>

                                        {job.endDate && (
                                            <div className="flex items-center text-xs sm:text-sm text-orange-600 mb-4">
                                                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>Deadline: {formatDate(job.endDate)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer with Action Buttons */}
                                <div className="p-4 sm:p-6 pt-0">
                                    <div className="flex gap-2 sm:gap-3">
                                        <button
                                            onClick={() => navigate(`/jobs-detail/${job._id}`)}
                                            className="flex-1 bg-blue-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm sm:text-base"
                                        >
                                            View Details
                                        </button>
                                        <FavoriteButton
                                            jobId={job._id}
                                            isFavorite={favoriteJobs.has(job._id)}
                                            onToggle={handleFavoriteToggle}
                                            onAuthRequired={handleAuthRequired}
                                            onLimitReached={handleLimitReached}
                                            variant="icon"
                                            size="md"
                                            showTooltip={true}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!isLoading && pagination.totalPages > 1 && (
                    <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2">
                        <button
                            disabled={!pagination.hasPrevPage}
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-xl border-2 font-semibold transition-colors text-sm sm:text-base ${
                                !pagination.hasPrevPage
                                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-500"
                            }`}
                        >
                            <span className="hidden sm:inline">← Previous</span>
                            <span className="sm:hidden">←</span>
                        </button>

                        {/* Page Numbers */}
                        {(() => {
                            const pages = [];
                            const totalPages = pagination.totalPages;
                            const currentPage = pagination.currentPage;
                            
                            // Always show first page
                            if (totalPages > 0) {
                                pages.push(1);
                            }
                            
                            // Calculate range around current page
                            let startPage = Math.max(2, currentPage - 1);
                            let endPage = Math.min(totalPages - 1, currentPage + 1);
                            
                            // Add ellipsis if needed
                            if (startPage > 2) {
                                pages.push('...');
                            }
                            
                            // Add middle pages
                            for (let i = startPage; i <= endPage; i++) {
                                if (i !== 1 && i !== totalPages) {
                                    pages.push(i);
                                }
                            }
                            
                            // Add ellipsis if needed
                            if (endPage < totalPages - 1) {
                                pages.push('...');
                            }
                            
                            // Always show last page if more than 1 page
                            if (totalPages > 1) {
                                pages.push(totalPages);
                            }
                            
                            return pages.map((page, index) => {
                                if (page === '...') {
                                    return (
                                        <span
                                            key={`ellipsis-${index}`}
                                            className="px-2 sm:px-4 py-2 sm:py-3 text-gray-500 text-sm sm:text-base"
                                        >
                                            ...
                                        </span>
                                    );
                                }
                                
                                return (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 font-semibold transition-colors text-sm sm:text-base ${
                                            pagination.currentPage === page
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-500"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                );
                            });
                        })()}

                        <button
                            disabled={!pagination.hasNextPage}
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-xl border-2 font-semibold transition-colors text-sm sm:text-base ${
                                !pagination.hasNextPage
                                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-500"
                            }`}
                        >
                            <span className="hidden sm:inline">Next →</span>
                            <span className="sm:hidden">→</span>
                        </button>
                    </div>
                )}

                {/* No Results State */}
                {!isLoading && jobs.length === 0 && (
                    <div className="text-center py-12 sm:py-16">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                            {Object.values(filters).some(value => value && value.trim() !== '') 
                                ? 'No jobs found matching your search' 
                                : 'No jobs available'
                            }
                        </h3>
                        <p className="text-gray-600 text-base sm:text-lg mb-6 sm:mb-8 max-w-md mx-auto px-4">
                            {Object.values(filters).some(value => value && value.trim() !== '') 
                                ? 'Try adjusting your search criteria or filters to find more opportunities.'
                                : 'There are currently no active job postings. Please check back later.'
                            }
                        </p>
                        {Object.values(filters).some(value => value && value.trim() !== '') && (
                            <button
                                onClick={clearFilters}
                                className="bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm sm:text-base"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Limit Modal */}
            {showLimitModal && <LimitModal />}
        </div>
    );
};

export default JobSearch;

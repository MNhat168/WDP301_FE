import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../layout/header';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import {
    FiBriefcase, FiMapPin, FiCalendar, FiClock, FiDollarSign,
    FiSearch, FiFilter, FiEye, FiFileText, FiCheckCircle, 
    FiXCircle, FiAlertCircle, FiRefreshCw, FiChevronRight,
    FiStar, FiUsers, FiTrendingUp, FiTarget, FiAward
} from 'react-icons/fi';

// Enhanced Skeleton Loader
const ApplicationSkeleton = () => (
    <div className="bg-white rounded-3xl shadow-xl p-6 animate-pulse">
        <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="flex items-center space-x-4">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-blue-200 rounded w-24"></div>
        </div>
    </div>
);

const Application = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is logged in
    const userIsLoggedIn = !!localStorage.getItem('user');

    useEffect(() => {
        if (!userIsLoggedIn) {
            navigate('/login');
            return;
        }
        fetchApplications();
    }, [userIsLoggedIn, navigate]);

    useEffect(() => {
        filterApplications();
    }, [applications, keyword, statusFilter]);

    const fetchApplications = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user?.token || user?.accessToken;
            
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch('http://localhost:5000/api/applications/applied', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
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
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.status && data.result) {
                setApplications(data.result);
            } else {
                throw new Error(data.message || "Failed to fetch applications");
            }
        } catch (err) {
            console.error("Error fetching applications:", err);
            setError(err.message || "Could not fetch applications. Please try again.");
            
            if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
                setError('Server error. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    const filterApplications = () => {
        let filtered = applications;

        // Filter by keyword
        if (keyword.trim()) {
            filtered = filtered.filter(app => 
                app.jobId?.title?.toLowerCase().includes(keyword.toLowerCase()) ||
                app.jobId?.companyId?.companyName?.toLowerCase().includes(keyword.toLowerCase())
            );
        }

        // Filter by status
        if (statusFilter !== "all") {
            filtered = filtered.filter(app => {
                if (statusFilter === "pending") return app.status === "pending" || !app.status;
                if (statusFilter === "reviewed") return app.status === "reviewed";
                if (statusFilter === "rejected") return app.status === "rejected";
                if (statusFilter === "accepted") return app.status === "accepted";
                return true;
            });
        }

        setFilteredApplications(filtered);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        setKeyword(formData.get('keyword') || '');
    };

    const getStatusBadge = (status, testCompleted = false, questionExist = false) => {
        if (questionExist && !testCompleted) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                    <FiAlertCircle className="mr-1 h-3 w-3"/>
                    Test Required
                </span>
            );
        }

        switch (status?.toLowerCase()) {
            case 'accepted':
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        <FiCheckCircle className="mr-1 h-3 w-3"/>
                        Accepted
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                        <FiXCircle className="mr-1 h-3 w-3"/>
                        Rejected
                    </span>
                );
            case 'reviewed':
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        <FiEye className="mr-1 h-3 w-3"/>
                        Under Review
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                        <FiClock className="mr-1 h-3 w-3"/>
                        Pending
                    </span>
                );
        }
    };

    const ApplicationCard = ({ application }) => {
        const job = application.jobId;
        const company = job?.companyId;
        
        return (
            <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:-translate-y-1">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                                {job?.title || 'Job Title'}
                            </h3>
                            <Link 
                                to={`/company/${company?._id}`}
                                className="text-gray-600 hover:text-blue-600 font-medium flex items-center transition-colors"
                            >
                                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-2">
                                    <FiBriefcase className="text-white text-xs"/>
                                </div>
                                {company?.companyName || 'Company'}
                            </Link>
                        </div>
                        
                        {company?.url && (
                            <img 
                                src={`http://localhost:5000${company.url}`} 
                                alt="company logo" 
                                className="w-12 h-12 rounded-xl shadow-md object-cover border-2 border-gray-100"
                            />
                        )}
                    </div>

                    {/* Job Details */}
                    <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-500">
                            <FiMapPin className="mr-2 text-red-500 h-4 w-4"/> 
                            <span>{job?.location || 'Remote'}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                            <FiCalendar className="mr-2 text-green-500 h-4 w-4"/> 
                            <span>Applied {new Date(application.createdAt || application.applicationDate).toLocaleDateString()}</span>
                        </div>
                        {job?.salary && (
                            <div className="flex items-center text-sm text-gray-500">
                                <FiDollarSign className="mr-2 text-yellow-500 h-4 w-4"/> 
                                <span>${job.salary.toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    {/* Status and Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-3">
                            {getStatusBadge(application.status, application.testCompleted, application.questionExist)}
                        </div>
                        
                        <Link
                            to={`/jobs/${job?._id}`}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold text-sm"
                        >
                            <FiEye className="mr-2 h-4 w-4"/>
                            View Job
                            <FiChevronRight className="ml-1 h-4 w-4"/>
                        </Link>
                    </div>
                </div>
            </div>
        );
    };

    if (!userIsLoggedIn) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <Header />
            
            <div className="container mx-auto px-4 py-8 mt-20">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-extrabold text-gray-800 mb-4">
                        My <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Job Applications</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Track your job applications and stay updated on your career journey
                    </p>
                </div>

                {/* Search and Filter Section */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1 relative">
                            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
                            <input
                                type="text"
                                name="keyword"
                                placeholder="Search by job title or company name..."
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                defaultValue={keyword}
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center"
                        >
                            <FiSearch className="mr-2 h-5 w-5"/>
                            Search
                        </button>
                    </form>

                    {/* Status Filter */}
                    <div className="flex flex-wrap gap-2">
                        <span className="flex items-center text-gray-600 font-medium mr-4">
                            <FiFilter className="mr-2"/>
                            Filter by status:
                        </span>
                        {[
                            { key: 'all', label: 'All Applications', icon: FiUsers },
                            { key: 'pending', label: 'Pending', icon: FiClock },
                            { key: 'reviewed', label: 'Under Review', icon: FiEye },
                            { key: 'accepted', label: 'Accepted', icon: FiCheckCircle },
                            { key: 'rejected', label: 'Rejected', icon: FiXCircle }
                        ].map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => setStatusFilter(key)}
                                className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all ${
                                    statusFilter === key
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <Icon className="mr-2 h-4 w-4"/>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Summary */}
                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-600 font-semibold text-sm">Total Applications</p>
                                    <p className="text-3xl font-bold text-blue-700">{applications.length}</p>
                                </div>
                                <FiBriefcase className="text-blue-600 text-3xl"/>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border border-yellow-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-yellow-600 font-semibold text-sm">Pending</p>
                                    <p className="text-3xl font-bold text-yellow-700">
                                        {applications.filter(app => !app.status || app.status === 'pending').length}
                                    </p>
                                </div>
                                <FiClock className="text-yellow-600 text-3xl"/>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-600 font-semibold text-sm">Accepted</p>
                                    <p className="text-3xl font-bold text-green-700">
                                        {applications.filter(app => app.status === 'accepted').length}
                                    </p>
                                </div>
                                <FiCheckCircle className="text-green-600 text-3xl"/>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-600 font-semibold text-sm">Under Review</p>
                                    <p className="text-3xl font-bold text-purple-700">
                                        {applications.filter(app => app.status === 'reviewed').length}
                                    </p>
                                </div>
                                <FiEye className="text-purple-600 text-3xl"/>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <ApplicationSkeleton key={i} />
                        ))}
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-16">
                        <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md mx-auto">
                            <FiAlertCircle className="mx-auto text-red-500 text-6xl mb-6" />
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h3>
                            <p className="text-gray-600 mb-8">{error}</p>
                            <button
                                onClick={fetchApplications}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold flex items-center mx-auto"
                            >
                                <FiRefreshCw className="mr-2"/>
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

                {/* Applications Grid */}
                {!loading && !error && (
                    <>
                        {filteredApplications.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredApplications.map((application) => (
                                    <ApplicationCard key={application._id} application={application} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md mx-auto">
                                    <FiFileText className="mx-auto text-gray-400 text-6xl mb-6" />
                                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                        {applications.length === 0 ? 'No Applications Yet' : 'No Matching Applications'}
                                    </h3>
                                    <p className="text-gray-600 mb-8">
                                        {applications.length === 0 
                                            ? "You haven't applied to any jobs yet. Start exploring opportunities!"
                                            : "Try adjusting your search criteria or filters."
                                        }
                                    </p>
                                    <Link
                                        to="/jobsearch"
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold inline-flex items-center"
                                    >
                                        <FiSearch className="mr-2"/>
                                        Find Jobs
                                    </Link>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Application;

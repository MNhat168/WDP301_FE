import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../layout/header';
import { useApplications } from '../../../hooks/useApplications';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import {
    FiBriefcase, FiMapPin, FiCalendar, FiClock, FiDollarSign,
    FiSearch, FiFilter, FiEye, FiFileText, FiCheckCircle, 
    FiXCircle, FiAlertCircle, FiRefreshCw, FiChevronRight,
    FiStar, FiUsers, FiTrendingUp, FiTarget, FiAward, FiTrash2
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
    const {
        loading,
        applications,
        fetchUserApplications,
        handleWithdrawApplication,
        summary,
        pagination
    } = useApplications();
    
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [error, setError] = useState(null);

    // Check if user is logged in
    const userIsLoggedIn = !!localStorage.getItem('user');

    useEffect(() => {
        if (!userIsLoggedIn) {
            navigate('/login');
            return;
        }
        loadApplications();
    }, [userIsLoggedIn, navigate]);

    useEffect(() => {
        filterApplications();
    }, [applications, keyword, statusFilter]);

    const loadApplications = async () => {
        try {
            setError(null);
            await fetchUserApplications();
        } catch (err) {
            setError(err.message || 'Failed to load applications');
        }
    };

    const filterApplications = () => {
        // Ensure applications is an array
        if (!Array.isArray(applications)) {
            setFilteredApplications([]);
            return;
        }
        
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
                if (statusFilter === "interview") return app.status === "interview_scheduled";
                if (statusFilter === "accepted") return app.status === "accepted";
                if (statusFilter === "rejected") return app.status === "rejected";
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
        const [showWithdrawModal, setShowWithdrawModal] = useState(false);
        const [isWithdrawing, setIsWithdrawing] = useState(false);
        
        // Process steps
        const steps = [
            {
                key: 'pending',
                label: 'Pending',
                icon: <FiClock className="w-5 h-5" />,
                color: 'bg-yellow-400',
                activeColor: 'bg-yellow-500',
            },
            {
                key: 'interview_scheduled',
                label: 'Interview',
                icon: <FiUsers className="w-5 h-5" />,
                color: 'bg-blue-400',
                activeColor: 'bg-blue-600',
            },
            {
                key: 'accepted',
                label: 'Accepted',
                icon: <FiCheckCircle className="w-5 h-5" />,
                color: 'bg-green-400',
                activeColor: 'bg-green-600',
            },
            {
                key: 'rejected',
                label: 'Rejected',
                icon: <FiXCircle className="w-5 h-5" />,
                color: 'bg-red-400',
                activeColor: 'bg-red-600',
            },
        ];

        // Determine current step index
        const status = (application.status || 'pending').toLowerCase();
        let currentStepIdx = 0;
        if (status === 'pending') currentStepIdx = 0;
        else if (status === 'interview_scheduled') currentStepIdx = 1;
        else if (status === 'accepted') currentStepIdx = 2;
        else if (status === 'rejected') currentStepIdx = 3;

        // For process bar, only show one of approve/reject at the end
        const visibleSteps = steps.slice(0, 2).concat(
            status === 'accepted' ? steps[2] : status === 'rejected' ? steps[3] : []
        );

        const handleWithdraw = async () => {
            setIsWithdrawing(true);
            
            try {
                const result = await handleWithdrawApplication(application._id, job?._id);
                
                if (result?.success !== false) {
                    setShowWithdrawModal(false);
                    // Refresh the applications list
                    loadApplications();
                } else {
                    toastr.error(result?.message || 'Failed to withdraw application');
                }
            } catch (error) {
                toastr.error('Failed to withdraw application');
            } finally {
                setIsWithdrawing(false);
            }
        };
        
        return (
            <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:-translate-y-1">
                <div className="p-6">
                    {/* Process Bar */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between">
                            {visibleSteps.map((step, idx) => {
                                const isActive = idx === currentStepIdx;
                                const isCompleted = idx < currentStepIdx;
                                const isLast = idx === visibleSteps.length - 1;
                                return (
                                    <React.Fragment key={step.key}>
                                        <div className="flex flex-col items-center flex-1">
                                            <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                                                isActive
                                                    ? step.activeColor + ' border-' + step.activeColor.replace('bg-', '')
                                                    : isCompleted
                                                    ? step.color + ' border-' + step.color.replace('bg-', '')
                                                    : 'bg-gray-200 border-gray-300'
                                            } text-white font-bold transition-all`}
                                            >
                                                {step.icon}
                                            </div>
                                            <span className={`mt-2 text-xs font-medium ${isActive ? 'text-blue-700' : isCompleted ? 'text-gray-500' : 'text-gray-400'}`}>{step.label}</span>
                                        </div>
                                        {!isLast && (
                                            <div className={`flex-1 h-1 mx-1 ${
                                                isCompleted ? 'bg-blue-400' : 'bg-gray-200'
                                            } rounded-full transition-all`}></div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
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
                        
                        <div className="flex items-center space-x-2">
                            {company?.url && (
                                <img 
                                    src={`http://localhost:5000${company.url}`} 
                                    alt="company logo" 
                                    className="w-12 h-12 rounded-xl shadow-md object-cover border-2 border-gray-100"
                                />
                            )}
                            
                            {/* Withdraw Button - Show for all applications */}
                            <button
                                onClick={() => {
                                    setShowWithdrawModal(true);
                                }}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title="Withdraw Application"
                                disabled={isWithdrawing}
                            >
                                {isWithdrawing ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
                                ) : (
                                    <FiTrash2 className="w-4 h-4" />
                                )}
                            </button>
                        </div>
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
                            to={`/jobs-detail/${job?._id}`}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold text-sm"
                        >
                            <FiEye className="mr-2 h-4 w-4"/>
                            View Job
                            <FiChevronRight className="ml-1 h-4 w-4"/>
                        </Link>
                    </div>
                </div>

                {/* Withdraw Confirmation Modal */}
                {showWithdrawModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                    <FiTrash2 className="w-8 h-8 text-red-600" />
                                </div>
                                
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Withdraw Application?
                                </h3>
                                
                                <div className="text-gray-600 mb-6">
                                    <p className="font-medium text-gray-900">{job?.title}</p>
                                    <p className="text-sm">{company?.companyName}</p>
                                    <p className="text-sm mt-2">
                                        Are you sure you want to withdraw your application? This action cannot be undone.
                                    </p>
                                </div>
                                
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setShowWithdrawModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                                        disabled={isWithdrawing}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleWithdraw}
                                        disabled={isWithdrawing}
                                        className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                                    >
                                        {isWithdrawing ? (
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                                Withdrawing...
                                            </div>
                                        ) : (
                                            'Withdraw'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (!userIsLoggedIn) {
        return null; // Will redirect in useEffect
    }

    // Early return if applications state is not properly initialized
    if (!Array.isArray(applications) && !loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Initializing applications...</p>
                </div>
            </div>
        );
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
                            { key: 'interview', label: 'Interview', icon: FiUsers },
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
                {!loading && !error && Array.isArray(applications) && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-600 font-semibold text-sm">Interview</p>
                                    <p className="text-3xl font-bold text-blue-700">
                                        {applications.filter(app => app.status === 'interview_scheduled').length}
                                    </p>
                                </div>
                                <FiUsers className="text-blue-600 text-3xl"/>
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
                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-red-600 font-semibold text-sm">Rejected</p>
                                    <p className="text-3xl font-bold text-red-700">
                                        {applications.filter(app => app.status === 'rejected').length}
                                    </p>
                                </div>
                                <FiXCircle className="text-red-600 text-3xl"/>
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
                                onClick={loadApplications}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold flex items-center mx-auto"
                            >
                                <FiRefreshCw className="mr-2"/>
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

                {/* Pagination Info */}
                {!loading && !error && pagination && pagination.totalPages > 1 && (
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center bg-white rounded-2xl p-4 shadow-lg">
                            <span className="text-gray-600 text-sm">
                                Page {pagination.currentPage} of {pagination.totalPages} 
                                ({pagination.totalApplications} total applications)
                            </span>
                        </div>
                    </div>
                )}

                {/* Applications Grid */}
                {!loading && !error && (
                    <>
                        {Array.isArray(filteredApplications) && filteredApplications.length > 0 ? (
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
                                        {Array.isArray(applications) && applications.length === 0 ? 'No Applications Yet' : 'No Matching Applications'}
                                    </h3>
                                    <p className="text-gray-600 mb-8">
                                        {Array.isArray(applications) && applications.length === 0 
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

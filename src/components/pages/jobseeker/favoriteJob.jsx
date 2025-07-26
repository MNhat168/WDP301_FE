import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from "../../layout/header";
import { UserContext } from '../../../Context';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import {
    FiBriefcase, FiMapPin, FiCalendar, FiClock, FiDollarSign,
    FiSearch, FiEye, FiTrash2, FiHeart, FiAlertCircle, 
    FiRefreshCw, FiChevronRight, FiStar, FiAward,
    FiUsers, FiBookmark, FiFilter
} from 'react-icons/fi';

// Enhanced Skeleton Loader
const FavoriteSkeleton = () => (
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
            <div className="flex space-x-2">
                <div className="h-8 bg-blue-200 rounded w-24"></div>
                <div className="h-8 bg-red-200 rounded w-24"></div>
            </div>
        </div>
    </div>
);

const FavoriteJob = () => {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const [favoriteJobs, setFavoriteJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingJobId, setDeletingJobId] = useState(null);


    useEffect(() => {
        const fetchFavoriteJobs = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const token = user?.token || user?.accessToken;
    
                const response = await fetch('https://wdp301-lzse.onrender.com/api/user/favorites', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
    
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.status && data.result) {
                        setFavoriteJobs(data.result);
                    } else if (data.status === false) {
                        setFavoriteJobs([]);
                    } else {
                        setFavoriteJobs([]);
                    }
                } else {
                    if (response.status === 404) {
                        // No favorites found
                        setFavoriteJobs([]);
                        return;
                    }
                    
                    const errorText = await response.text();
                    setError(`Failed to load favorites: ${response.status}`);
                }
            } catch (err) {
                setError("Could not fetch favorite jobs. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchFavoriteJobs();
    }, []);

    useEffect(() => {
        filterJobs();
    }, [favoriteJobs, keyword]);

    const filterJobs = () => {
        let filtered = favoriteJobs;

        // Filter by keyword
        if (keyword.trim()) {
            filtered = filtered.filter(job => 
                job.title?.toLowerCase().includes(keyword.toLowerCase()) ||
                job.companyId?.companyName?.toLowerCase().includes(keyword.toLowerCase()) ||
                job.location?.toLowerCase().includes(keyword.toLowerCase())
            );
        }

        setFilteredJobs(filtered);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        setKeyword(formData.get('keyword') || '');
    };

    const deleteFavorite = async (jobId) => {
        if (!jobId) {
            toastr.error('Invalid job ID');
            return;
        }

        setDeletingJobId(jobId);
        
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = user?.token || user?.accessToken;

            const response = await fetch(`https://wdp301-lzse.onrender.com/api/jobs/${jobId}/favorite`, {
                method: 'DELETE',
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
                throw new Error(errorData.message || 'Failed to remove favorite job');
            }

            // Update local state
            const updatedFavorites = favoriteJobs.filter(job => job._id !== jobId);
            setFavoriteJobs(updatedFavorites);
            
            toastr.success("Job removed from favorites!");

        } catch (err) {
            console.error('Error removing favorite job:', err);
            
            if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
                toastr.error('Server error. Please try again later.');
            } else {
                toastr.error(err.message || 'Failed to remove job from favorites');
            }
        } finally {
            setDeletingJobId(null);
        }
    };

    const FavoriteJobCard = ({ job }) => {
        const company = job?.companyId;
        const isDeleting = deletingJobId === job._id;
        
        return (
            <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:-translate-y-1 flex flex-col h-full">
                <div className="p-6 flex-1 flex flex-col">
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
                            <FiHeart className="text-red-500 fill-current h-5 w-5"/>
                            {company?.url && (
                                <img 
                                    src={`https://wdp301-lzse.onrender.com${company.url}`} 
                                    alt="company logo" 
                                    className="w-12 h-12 rounded-xl shadow-md object-cover border-2 border-gray-100"
                                />
                            )}
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
                            <span>Posted {job?.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently'}</span>
                        </div>
                        {job?.salary && (
                            <div className="flex items-center text-sm text-gray-500">
                                <FiDollarSign className="mr-2 text-yellow-500 h-4 w-4"/> 
                                <span>${job.salary.toLocaleString()}</span>
                            </div>
                        )}
                        {job?.experienceYears && (
                            <div className="flex items-center text-sm text-gray-500">
                                <FiAward className="mr-2 text-purple-500 h-4 w-4"/> 
                                <span>{job.experienceYears} years experience</span>
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {job?.jobType && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                {job.jobType}
                            </span>
                        )}
                        {job?.status && (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                {job.status}
                            </span>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                        <span className="text-sm text-gray-500 flex items-center">
                            <FiBookmark className="mr-1 h-4 w-4"/>
                            Saved Job
                        </span>
                        
                        <div className="flex space-x-2">
                            <Link
                                to={`/jobs-detail/${job?._id}`}
                                className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold text-xs"
                            >
                                <FiEye className="mr-2 h-4 w-4"/>
                                View Job
                            </Link>
                            <button
                                onClick={() => deleteFavorite(job._id)}
                                disabled={isDeleting}
                                className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all transform hover:scale-105 font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                ) : (
                                    <FiTrash2 className="mr-2 h-4 w-4"/>
                                )}
                                {isDeleting ? 'Removing...' : 'Remove'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <Header />
            
            <div className="container mx-auto px-4 py-8 mt-20">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-extrabold text-gray-800 mb-4">
                        My <span className="bg-gradient-to-r from-red-500 to-pink-600 bg-clip-text text-transparent">Favorite Jobs</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Your saved job opportunities in one convenient place
                    </p>
                </div>

                {/* Search Section */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
                            <input
                                type="text"
                                name="keyword"
                                placeholder="Search favorite jobs by title, company, or location..."
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                                defaultValue={keyword}
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-2xl hover:from-red-600 hover:to-pink-700 transition-all transform hover:scale-105 flex items-center"
                        >
                            <FiSearch className="mr-2 h-5 w-5"/>
                            Search
                        </button>
                    </form>
                </div>

                {/* Stats Summary */}
                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl p-6 border border-red-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-red-600 font-semibold text-sm">Total Favorites</p>
                                    <p className="text-3xl font-bold text-red-700">{favoriteJobs.length}</p>
                                </div>
                                <FiHeart className="text-red-600 text-3xl"/>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-600 font-semibold text-sm">Companies</p>
                                    <p className="text-3xl font-bold text-blue-700">
                                        {new Set(favoriteJobs.map(job => job.companyId?._id)).size}
                                    </p>
                                </div>
                                <FiBriefcase className="text-blue-600 text-3xl"/>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-600 font-semibold text-sm">Filtered Results</p>
                                    <p className="text-3xl font-bold text-purple-700">{filteredJobs.length}</p>
                                </div>
                                <FiFilter className="text-purple-600 text-3xl"/>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <FavoriteSkeleton key={i} />
                        ))}
                    </div>
                )}
                {/* Favorite Jobs Grid */}
                {!loading && !error && (
                    <>
                        {filteredJobs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredJobs.map((job) => (
                                    <FavoriteJobCard key={job._id} job={job} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md mx-auto">
                                    <FiHeart className="mx-auto text-gray-400 text-6xl mb-6" />
                                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                        {favoriteJobs.length === 0 ? 'No Favorite Jobs Yet' : 'No Matching Jobs'}
                                    </h3>
                                    <p className="text-gray-600 mb-8">
                                        {favoriteJobs.length === 0 
                                            ? "Start exploring jobs and save the ones you like!"
                                            : "Try adjusting your search criteria."
                                        }
                                    </p>
                                    <Link
                                        to="/jobsearch"
                                        className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-3 rounded-2xl hover:from-red-600 hover:to-pink-700 transition-all transform hover:scale-105 font-semibold inline-flex items-center"
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

export default FavoriteJob;
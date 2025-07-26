import React, { useEffect, useState } from "react";
import HeaderEmployer from "../../layout/headeremp";
import useBanCheck from '../admin/checkban';

const ListJobCreate = () => {
  const [jobList, setJobList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('accept');
  const [error, setError] = useState(null);
  const BanPopup = useBanCheck();

  const getAuthToken = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.accessToken || "";
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const token = getAuthToken();
        const response = await fetch("http://localhost:5000/api/employer/jobs", {
          headers: {
            "Authorization": `Bearer ${token}`
          },
          credentials: "include"
        });
        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }

        const data = await response.json();
        console.log("Fetched job list:", data);

        // Handle both direct array and nested result structure
        const jobs = data.result || data;
        setJobList(Array.isArray(jobs) ? jobs : []);
        setError(null);
      } catch (error) {
        console.error("Error fetching job list:", error);
        setError(error.message);
        setJobList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleDeleteJob = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
      try {
        const token = getAuthToken();
        const response = await fetch("http://localhost:5000/api/employer/jobs", {
          headers: {
            "Authorization": `Bearer ${token}`
          },
          credentials: "include"
        });
        if (response.ok) {
          setJobList((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
          // You can add a toast notification here
          console.log("Job deleted successfully");
        } else {
          console.error("Failed to delete job");
        }
      } catch (error) {
        console.error("Error deleting job:", error);
      }
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return "No date available";

      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date error";
    }
  };

  const formatSalary = (salary) => {
    if (!salary) return "Salary not specified";
    if (typeof salary === 'object') {
      const { min, max, currency = 'VND' } = salary;
      if (min && max) {
        return `${min?.toLocaleString()} - ${max?.toLocaleString()} ${currency}`;
      }
      if (min) return `From ${min?.toLocaleString()} ${currency}`;
      if (max) return `Up to ${max?.toLocaleString()} ${currency}`;
    }
    return salary.toString();
  };

  if (isLoading) {
    return (
      <>
        {BanPopup}
        <HeaderEmployer />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center px-8 py-4 bg-white rounded-2xl shadow-xl">
              <svg className="animate-spin h-12 w-12 text-blue-600 mr-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <div>
                <h3 className="text-xl font-semibold text-gray-700">Loading your jobs...</h3>
                <p className="text-gray-500">Please wait while we fetch your job listings</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {BanPopup}
        <HeaderEmployer />
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
          <div className="text-center bg-white p-12 rounded-3xl shadow-2xl max-w-md mx-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  // Filter jobs based on their status
  const acceptedJobs = jobList.filter(job => job.status === 'active' || job.status === 'Accept');
  const rejectedJobs = jobList.filter(job => job.status === 'rejected' || job.status === 'Reject');
  const pendingJobs = jobList.filter(job => job.status === 'pending' || job.status === 'Pending');
  const expiredJobs = jobList.filter(job =>
    job.status === 'expired' ||
    job.status === 'inactive' ||
    new Date(job.endDate) < new Date()
  );

  const getActiveJobs = () => {
    switch (activeTab) {
      case 'accept': return acceptedJobs;
      case 'reject': return rejectedJobs;
      case 'pending': return pendingJobs;
      case 'expired': return expiredJobs;
      default: return acceptedJobs;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'accept':
        return 'bg-gradient-to-r from-green-500 to-emerald-600';
      case 'rejected':
      case 'reject':
        return 'bg-gradient-to-r from-red-500 to-pink-600';
      case 'pending':
        return 'bg-gradient-to-r from-yellow-500 to-orange-600';
      case 'expired':
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
      default:
        return 'bg-gradient-to-r from-blue-500 to-indigo-600';
    }
  };

  return (
    <>
      {BanPopup}
      <HeaderEmployer />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">My Job Listings</h1>
          <p className="text-xl text-blue-100">Manage and track all your posted jobs</p>
        </div>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-12">
        <div className="container mx-auto px-4">

          {jobList.length === 0 ? (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"></path>
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">No Jobs Yet!</h3>
                <p className="text-xl text-gray-600 mb-8">Start building your team by posting your first job</p>
                <a
                  href="/create-job"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-xl font-bold text-lg"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Create Your First Job
                </a>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 font-medium">Active Jobs</p>
                      <p className="text-3xl font-bold">{acceptedJobs.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 font-medium">Pending</p>
                      <p className="text-3xl font-bold">{pendingJobs.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 font-medium">Rejected</p>
                      <p className="text-3xl font-bold">{rejectedJobs.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-100 font-medium">Expired</p>
                      <p className="text-3xl font-bold">{expiredJobs.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-gray-800">Job Categories</h2>
                  <a
                    href="/create-job"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    <span>Add New Job</span>
                  </a>
                </div>

                <div className="flex flex-wrap gap-4 mb-8">
                  {[
                    { key: 'accept', label: 'Active Jobs', count: acceptedJobs.length, color: 'from-green-500 to-emerald-600' },
                    { key: 'pending', label: 'Pending Review', count: pendingJobs.length, color: 'from-yellow-500 to-orange-600' },
                    { key: 'reject', label: 'Rejected', count: rejectedJobs.length, color: 'from-red-500 to-pink-600' },
                    { key: 'expired', label: 'Expired', count: expiredJobs.length, color: 'from-gray-500 to-gray-600' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${activeTab === tab.key
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`px-2 py-1 rounded-full text-sm font-bold ${activeTab === tab.key ? 'bg-white/20' : 'bg-white'
                        }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Jobs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getActiveJobs().length === 0 ? (
                    <div className="col-span-full text-center py-16">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"></path>
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-600 mb-2">
                        No {activeTab} jobs found
                      </h3>
                      <p className="text-gray-500">There are currently no jobs in this category</p>
                    </div>
                  ) : (
                    getActiveJobs().map((job) => (
                      <div
                        key={job._id}
                        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:scale-105"
                      >
                        {/* Job Status Badge */}
                        <div className={`h-2 ${getStatusColor(job.status)}`}></div>

                        <div className="p-6">
                          {/* Job Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                                {job.title}
                              </h3>
                              <div className="flex items-center text-gray-600 mb-2">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                </svg>
                                <span className="text-sm">{job.companyName || "No company"}</span>
                              </div>
                            </div>

                            {activeTab !== 'expired' && (
                              <button
                                onClick={() => handleDeleteJob(job._id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                              </button>
                            )}
                          </div>

                          {/* Job Details */}
                          <div className="space-y-3 mb-6">
                            <div className="flex items-center text-gray-600">
                              <svg className="w-4 h-4 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              </svg>
                              <span className="text-sm">{job.location || "Location not specified"}</span>
                            </div>

                            <div className="flex items-center text-gray-600">
                              <svg className="w-4 h-4 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                              </svg>
                              <span className="text-sm">{formatSalary(job.salary)}</span>
                            </div>

                            <div className="flex items-center text-gray-600">
                              <svg className="w-4 h-4 mr-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6v6m8-6v6m-7-3h6"></path>
                              </svg>
                              <span className="text-sm">Posted: {formatDate(job.createdAt)}</span>
                            </div>

                            {job.deadline && (
                              <div className="flex items-center text-gray-600">
                                <svg className="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <span className="text-sm">Deadline: {formatDate(job.deadline)}</span>
                              </div>
                            )}
                          </div>

                          {/* Job Actions */}
                          <div className="flex space-x-3">
                            <a
                              href={`/jobdetails/${job._id}`}
                              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-center font-medium"
                            >
                              View Details
                            </a>
                            <a
                              href={`/edit-job/${job._id}`}
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium"
                            >
                              Edit
                            </a>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ListJobCreate;
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toastr from "toastr";
import HeaderEmployer from "../../layout/headeremp";

const JobDetailsEmployer = () => {
  const { id } = useParams();
  const [jobDetails, setJobDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const getAuthToken = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.accessToken || "";
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!id) return;

    fetch(`http://localhost:5000/api/employer/jobs/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.status && data.result) {
          setJobDetails(data.result);
          setEditFormData({
            title: data.result.title || '',
            description: data.result.description || '',
            location: data.result.location || '',
            minSalary: data.result.minSalary || '',
            maxSalary: data.result.maxSalary || '',
            endDate: data.result.endDate ? new Date(data.result.endDate).toISOString().split('T')[0] : '',
            applicantCount: data.result.applicantCount || 0
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching job details:", error);
      });
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSalaryChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: parseInt(value)
    }));
  };

  const handleSaveChanges = async () => {
    const token = getAuthToken();
    setIsLoading(true);

    try {
      const updateData = {
        ...editFormData,
        status: 'pending' // Set status to pending when updating
      };

      const response = await fetch(`http://localhost:5000/api/employer/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status) {
        setJobDetails(data.result);
        setIsEditing(false);
        toastr.success('Job updated successfully! Status set to pending for review.');
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating job:', error);
      toastr.error('Failed to update job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData({
      title: jobDetails.title || '',
      description: jobDetails.description || '',
      location: jobDetails.location || '',
      minSalary: jobDetails.minSalary || '',
      maxSalary: jobDetails.maxSalary || '',
      endDate: jobDetails.endDate ? new Date(jobDetails.endDate).toISOString().split('T')[0] : '',
      applicantCount: jobDetails.applicantCount || 0
    });
  };

  if (!jobDetails) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <HeaderEmployer />

        {/* Loading State */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <HeaderEmployer />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Job Header Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  name="title"
                  value={editFormData.title}
                  onChange={handleInputChange}
                  className="text-3xl font-bold text-gray-900 mb-3 w-full border-2 border-blue-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="Job Title"
                />
              ) : (
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {jobDetails.title}
                </h1>
              )}

              <div className="flex items-center space-x-6 text-gray-600 mb-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h2M9 7h6m-6 4h6m-2 4h2" />
                  </svg>
                  <span className="font-medium">{jobDetails.companyId?.companyName || 'Company'}</span>
                </div>

                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={editFormData.location}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                      placeholder="Location"
                    />
                  ) : (
                    <span>{jobDetails.location}</span>
                  )}
                </div>

                <div className="flex items-center">
                  {isEditing ? (
                    <div className="w-full">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>${editFormData.minSalary?.toLocaleString()}</span>
                        <span>${editFormData.maxSalary?.toLocaleString()}</span>
                      </div>
                      <div className="flex space-x-2">
                        <input
                          type="range"
                          name="minSalary"
                          min="0"
                          max="500000"
                          value={editFormData.minSalary}
                          onChange={handleSalaryChange}
                          className="w-full accent-blue-600"
                        />
                        <input
                          type="range"
                          name="maxSalary"
                          min="0"
                          max="500000"
                          value={editFormData.maxSalary}
                          onChange={handleSalaryChange}
                          className="w-full accent-blue-600"
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="font-semibold text-green-600">
                      ${jobDetails.minSalary?.toLocaleString()} - ${jobDetails.maxSalary?.toLocaleString()} USD
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${jobDetails.status === "active"
                  ? "bg-green-100 text-green-800"
                  : jobDetails.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : jobDetails.status === "inactive"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${jobDetails.status === "active" ? "bg-green-500" :
                    jobDetails.status === "pending" ? "bg-yellow-500" :
                      jobDetails.status === "inactive" ? "bg-red-500" : "bg-gray-500"
                    }`}></div>
                  {(jobDetails.status && typeof jobDetails.status === 'string')
                    ? jobDetails.status.charAt(0).toUpperCase() + jobDetails.status.slice(1)
                    : 'Unknown'
                  }
                </span>

                <span className="text-sm text-gray-500">
                  Updated on {new Date(jobDetails?.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>

                <span className="text-sm text-gray-500">
                  Expires on {isEditing ? (
                    <input
                      type="date"
                      name="endDate"
                      value={editFormData.endDate}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500 ml-1"
                    />
                  ) : (
                    new Date(jobDetails?.endDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-6">

            {/* Job Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
              <div className="prose prose-gray max-w-none">
                {isEditing ? (
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleInputChange}
                    rows={8}
                    className="w-full border-2 border-blue-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 resize-vertical"
                    placeholder="Job description..."
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {jobDetails?.description}
                  </p>
                )}
              </div>
            </div>

            {/* Job Information - TopCV Style */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Job Information</h2>

              {/* TopCV Style Information Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Position Level */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Level</h3>
                  </div>
                  <p className="text-gray-700 font-medium">Senior Level</p>
                </div>

                {/* Experience */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Experience</h3>
                  </div>
                  <p className="text-gray-700 font-medium">3+ years</p>
                </div>

                {/* Salary */}
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-100">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Salary</h3>
                  </div>
                  <p className="text-green-600 font-bold">
                    ${isEditing ? editFormData.minSalary?.toLocaleString() : jobDetails.minSalary?.toLocaleString()} -
                    ${isEditing ? editFormData.maxSalary?.toLocaleString() : jobDetails.maxSalary?.toLocaleString()} 
                  </p>
                </div>

                {/* Location */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-100">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Location</h3>
                  </div>
                  <p className="text-gray-700 font-medium">{jobDetails?.location}</p>
                </div>

                {/* Job Type */}
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-4 border border-teal-100">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0v2a2 2 0 002 2V8a2 2 0 00-2-2zM8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m-8 0H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Job Type</h3>
                  </div>
                  <p className="text-gray-700 font-medium">Full-time</p>
                </div>

                {/* Application Deadline */}
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-4 border border-rose-100">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Deadline</h3>
                  </div>
                  <p className="text-gray-700 font-medium">
                    {new Date(jobDetails?.endDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions & Stats */}
          <div className="space-y-6">

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>

              <div className="space-y-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveChanges}
                      disabled={isLoading}
                      className="w-full bg-green-600 text-white text-center py-3 px-4 rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center group disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>

                    <button
                      onClick={handleCancelEdit}
                      className="w-full bg-gray-500 text-white text-center py-3 px-4 rounded-md hover:bg-gray-600 transition-colors font-medium flex items-center justify-center group"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full bg-blue-600 text-white text-center py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center group"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Job
                    </button>

                    <a
                      href={`/questions/loadskilltest/${jobDetails?._id}`}
                      className="w-full bg-purple-600 text-white text-center py-3 px-4 rounded-md hover:bg-purple-700 transition-colors font-medium flex items-center justify-center group"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      Create Skill Test
                    </a>

                    <a
                      href={`/listApplyCv?jobId=${jobDetails._id}`}
                      className="w-full bg-green-600 text-white text-center py-3 px-4 rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center group"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      View Applications ({jobDetails?.applicantCount || 0})
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Job Statistics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Statistics</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Applications</span>
                  {isEditing ? (
                    <input
                      type="number"
                      name="applicantCount"
                      value={editFormData.applicantCount}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded px-2 py-1 w-20"
                      min="0"
                    />
                  ) : (
                    <span className="font-semibold text-green-600">
                      {jobDetails?.applicantCount || 0}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-semibold capitalize ${jobDetails.status === 'active' ? 'text-green-600' : 'text-gray-600'
                    }`}>
                    {jobDetails?.status}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="text-sm text-gray-500">
                    {new Date(jobDetails?.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h2M9 7h6m-6 4h6m-2 4h2" />
                  </svg>
                </div>

                <h4 className="font-semibold text-gray-900 mb-1">
                  {jobDetails.companyId?.companyName}
                </h4>

                <p className="text-sm text-gray-600 flex items-center justify-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {jobDetails.companyId?.address}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsEmployer;
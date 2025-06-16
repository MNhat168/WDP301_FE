import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toastr from "toastr"; 
import HeaderEmployer from "../../layout/headeremp";

const JobDetailsEmployer = () => {
  const { id } = useParams();
  const [jobDetails, setJobDetails] = useState(null);

  useEffect(() => {
    // Check if id is undefined
    if (!id) {
      console.log("No ID provided");
      return;
    }

    console.log("Fetching job details for ID:", id);
    
    fetch(`http://localhost:5000/api/jobs/${id}`, {
      credentials: "include",
    })
      .then((response) => {
        console.log("Response status:", response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("API Response:", data);
        // Extract the actual job data from the result property
        if (data.status && data.result) {
          setJobDetails(data.result);
        } else {
          console.error("Invalid API response structure:", data);
        }
      })
      .catch((error) => {
        console.error("Error fetching job details:", error);
      });
  }, [id]);

  if (!jobDetails) {
    return (
      <div className="bg-white min-h-screen">
        <HeaderEmployer />
        
        {/* Loading Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-white mb-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Loading Job Details...
            </div>
            
            {/* Skeleton Title */}
            <div className="h-12 bg-white/20 rounded-lg mx-auto mb-4 max-w-md animate-pulse"></div>
            
            {/* Skeleton Info Items */}
            <div className="flex items-center justify-center space-x-6 text-blue-100">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-white/30 rounded mr-2 animate-pulse"></div>
                <div className="w-20 h-4 bg-white/30 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-white/30 rounded mr-2 animate-pulse"></div>
                <div className="w-32 h-4 bg-white/30 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-white/30 rounded mr-2 animate-pulse"></div>
                <div className="w-24 h-4 bg-white/30 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Main Content */}
        <div className="container mx-auto py-12 px-4 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Column Skeleton */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Job Overview Card Skeleton */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-40 h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-20 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                
                {/* Description Skeleton */}
                <div className="mb-8">
                  <div className="w-32 h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="space-y-2">
                      <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Information Card Skeleton */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="w-48 h-6 bg-gray-200 rounded mb-6 animate-pulse"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="group">
                        <div className="w-20 h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                        <div className="p-4 bg-gray-50 rounded-xl border">
                          <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-6">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="group">
                        <div className="w-20 h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                        <div className="p-4 bg-gray-50 rounded-xl border">
                          <div className="w-40 h-6 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="space-y-6">
              
              {/* Action Buttons Card Skeleton */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="w-32 h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
                
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div 
                      key={item}
                      className="w-full h-12 bg-gray-200 rounded-xl animate-pulse"
                    ></div>
                  ))}
                </div>
              </div>

              {/* Statistics Card Skeleton */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="w-24 h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
                
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Company Info Card Skeleton */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="w-32 h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
                
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-2xl mx-auto mb-4 animate-pulse"></div>
                  <div className="w-32 h-6 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
                  <div className="w-24 h-4 bg-gray-200 rounded mx-auto animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Loading Indicator */}
        <div className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-2xl shadow-2xl">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <span className="font-medium">Loading amazing content...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-black">
      <HeaderEmployer />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-white mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8zM8 14v.01M12 14v.01M16 14v.01" />
            </svg>
            Job Details
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            {jobDetails.title}
          </h1>
          <div className="flex items-center justify-center space-x-6 text-blue-100">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h2M9 7h6m-6 4h6m-2 4h2" />
              </svg>
              {jobDetails.companyId?.companyName || 'Company'}
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {jobDetails.location}
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              ${jobDetails.salary?.toLocaleString() || 'Negotiable'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-12 px-4 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Status and Basic Info Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Job Overview</h2>
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                  jobDetails.status === "active"
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : jobDetails.status === "pending"
                    ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                    : jobDetails.status === "inactive"
                    ? "bg-red-100 text-red-800 border border-red-200"
                    : "bg-gray-100 text-gray-800 border border-gray-200"
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    jobDetails.status === "active" ? "bg-green-500" :
                    jobDetails.status === "pending" ? "bg-yellow-500" :
                    jobDetails.status === "inactive" ? "bg-red-500" : "bg-gray-500"
                  }`}></div>
                  {(jobDetails.status && typeof jobDetails.status === 'string') 
                    ? jobDetails.status.charAt(0).toUpperCase() + jobDetails.status.slice(1)
                    : 'Unknown'
                  }
                </span>
              </div>

              {/* Job Description */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Description
                </h3>
                <div className="prose prose-lg text-gray-700 bg-gray-50 rounded-xl p-6">
                  <p>{jobDetails?.description}</p>
                </div>
              </div>
            </div>

            {/* Detailed Information Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Job Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="group">
                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Company</label>
                    <div className="mt-2 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <p className="text-lg font-semibold text-gray-800">{jobDetails.companyId?.companyName}</p>
                      {jobDetails.companyId?.address && (
                        <p className="text-sm text-gray-600 mt-1">{jobDetails.companyId.address}</p>
                      )}
                    </div>
                  </div>

                  <div className="group">
                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Salary</label>
                    <div className="mt-2 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                      <p className="text-lg font-bold text-green-700">
                        ${jobDetails.salary?.toLocaleString()} USD
                      </p>
                    </div>
                  </div>

                  <div className="group">
                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Applications</label>
                    <div className="mt-2 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                      <p className="text-lg font-bold text-purple-700">
                        {jobDetails?.applicantCount} Applications
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="group">
                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Location</label>
                    <div className="mt-2 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100">
                      <p className="text-lg font-semibold text-gray-800 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {jobDetails?.location}
                      </p>
                    </div>
                  </div>

                  <div className="group">
                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Posted Date</label>
                    <div className="mt-2 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
                      <p className="text-lg font-semibold text-gray-800">
                        {new Date(jobDetails?.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="group">
                    <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Start Date</label>
                    <div className="mt-2 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-100">
                      <p className="text-lg font-semibold text-gray-800">
                        {new Date(jobDetails?.startDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            
            {/* Action Buttons Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                {/* Edit Job Button */}
                <a
                  href={`/edit-job/${jobDetails?._id}`}
                  className="block w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white text-center py-3 px-4 rounded-xl shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all transform hover:scale-105 font-medium group"
                >
                  <svg className="w-5 h-5 inline mr-2 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Job Information
                </a>
                
                {/* Create Skill Test Button */}
                <a
                  href={`/questions/loadskilltest/${jobDetails?._id}`}
                  className="block w-full bg-gradient-to-r from-gray-800 to-black text-white text-center py-3 px-4 rounded-xl shadow-lg hover:from-black hover:to-gray-900 transition-all transform hover:scale-105 font-medium group"
                >
                  <svg className="w-5 h-5 inline mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Create Skill Test
                </a>

                {/* View Applications Button */}
                <a
                  href={`/listApplyCv?jobId=${jobDetails._id}`}
                  className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-3 px-4 rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 font-medium group"
                >
                  <svg className="w-5 h-5 inline mr-2 group-hover:bounce transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  View Applications ({jobDetails?.applicantCount})
                </a>
              </div>
            </div>

            {/* Job Statistics Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Statistics
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Job ID</span>
                  <span className="text-sm font-mono bg-white px-2 py-1 rounded border">
                    {jobDetails._id ? jobDetails._id.slice(-8) + '...' : 'N/A'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Applications</span>
                  <span className="font-bold text-green-700">{jobDetails?.applicantCount}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Status</span>
                  <span className={`font-semibold capitalize ${
                    jobDetails.status === 'active' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {jobDetails?.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Last Updated</span>
                  <span className="text-sm text-gray-600">
                    {new Date(jobDetails?.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Company Info Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h2M9 7h6m-6 4h6m-2 4h2" />
                </svg>
                Company Details
              </h3>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h2M9 7h6m-6 4h6m-2 4h2" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">
                  {jobDetails.companyId?.companyName}
                </h4>
                <p className="text-gray-600 flex items-center justify-center">
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

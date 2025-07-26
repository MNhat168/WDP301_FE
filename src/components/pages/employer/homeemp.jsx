import React, { useEffect, useState } from "react";
import axios from "axios";
import HeaderEmployer from "../../layout/headeremp";
import Hero from "../../layout/Hero";
import Features from "../../layout/Features";
import TestimonialEmp from "../../layout/TestimonialEmp";
import Footer from "../../Footer/Footer";
import useBanCheck from "../admin/checkban"; // Import ban check hook
import { Bar, Pie } from "react-chartjs-2";
import Chart from "chart.js/auto"; // Use the default import from chart.js
import ChatBox from "../../layout/chatbox";

const HomeEmp = () => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [applicationsByMonth, setApplicationsByMonth] = useState([]);
  const [jobCounts, setJobCounts] = useState({
    accept: 0,
    reject: 0,
    pending: 0,
    cvApplied: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BanPopup = useBanCheck();
  const API_BASE_URL = 'https://wdp301-lzse.onrender.com/api/user'

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
          setUser(storedUser);
          // Optionally fetch fresh user data from API
          try {
            const response = await fetch(`${API_BASE_URL}/current`, {
              credentials: 'include',
              headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${storedUser.accessToken}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              const userData = data.result;
              
              // Update user with fresh data
              const updatedUser = {
                ...storedUser,
                ...userData
              };
              setUser(updatedUser);
            }
          } catch (apiError) {
            console.log('Could not fetch fresh user data, using stored data');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fetch dashboard data
  // useEffect(() => {
  //   if (user) {
  //     const fetchDashboardData = async () => {
  //       try {
  //         // You may need to adjust the endpoint based on your backend API
  //         const response = await axios.get(
  //           `https://wdp301-lzse.onrender.com/api/dashboard/${user._id || user.userId}`,
  //           { 
  //             withCredentials: true,
  //             headers: {
  //               'Authorization': `Bearer ${user.accessToken}`
  //             }
  //           }
  //         );
  //         setCompany(response.data.company);
  //         setApplicationsByMonth(response.data.applicationsByMonth || []);
  //         setJobCounts({
  //           accept: response.data.accept || 0,
  //           reject: response.data.reject || 0,
  //           pending: response.data.pending || 0,
  //           cvApplied: response.data.cvApplied || 0,
  //         });
  //       } catch (err) {
  //         console.error("Error fetching dashboard data:", err);
  //         // Set default values if API fails
  //         setApplicationsByMonth([0,0,0,0,0,0,0,0,0,0,0,0]);
  //         setJobCounts({
  //           accept: 0,
  //           reject: 0,
  //           pending: 0,
  //           cvApplied: 0,
  //         });
  //       }
  //     };

  //     fetchDashboardData();
  //   }
  // }, [user]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center px-8 py-4 bg-white rounded-2xl shadow-lg">
          <svg className="animate-spin h-8 w-8 text-purple-600 mr-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xl font-semibold text-gray-700">Loading Dashboard...</span>
        </div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
      <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    </div>
  );
  
  if (!user) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No User Data</h3>
        <p className="text-gray-600">Please login to access your dashboard</p>
      </div>
    </div>
  );

  // Chart Data for Applicant Chart
  const applicantChartData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Number of Applicants",
        data: applicationsByMonth,
        backgroundColor: "rgba(255, 193, 7, 0.6)",
        borderColor: "rgba(255, 193, 7, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Job Status Pie Chart Data
  const jobStatusChartData = {
    labels: ["Job Accept", "Job Reject"],
    datasets: [
      {
        label: "Job Status",
        data: [jobCounts.accept, jobCounts.reject],
        backgroundColor: ["rgba(40, 167, 69, 0.8)", "rgba(220, 53, 69, 0.8)"],
        borderColor: ["rgba(40, 167, 69, 1)", "rgba(220, 53, 69, 1)"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <>
      {BanPopup}
      <ChatBox />
      <HeaderEmployer />

      {/* Main Dashboard with Beautiful Background */}
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="container mx-auto pt-20 pb-12 px-4">
          {/* Welcome Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-white px-6 py-3 rounded-full shadow-lg mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-600">Welcome back, {user.firstName || 'Employer'}</span>
            </div>
            
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 bg-clip-text text-transparent">
              Your Dashboard
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Track your job postings, manage applications, and grow your business with powerful insights
            </p>
          </div>

          {/* Stats Cards with Enhanced Design */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
            <div className="group relative bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <span className="text-green-100 text-sm font-medium">+12%</span>
                </div>
                <h3 className="text-2xl font-bold mb-1">{jobCounts.accept}</h3>
                <p className="text-green-100 font-medium">Job Accepted</p>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </div>
                  <span className="text-red-100 text-sm font-medium">-3%</span>
                </div>
                <h3 className="text-2xl font-bold mb-1">{jobCounts.reject}</h3>
                <p className="text-red-100 font-medium">Job Rejected</p>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <span className="text-yellow-100 text-sm font-medium">5 new</span>
                </div>
                <h3 className="text-2xl font-bold mb-1">{jobCounts.pending}</h3>
                <p className="text-yellow-100 font-medium">Job Pending</p>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <span className="text-blue-100 text-sm font-medium">+8%</span>
                </div>
                <h3 className="text-2xl font-bold mb-1">{jobCounts.cvApplied}</h3>
                <p className="text-blue-100 font-medium">CV Applied</p>
              </div>
            </div>
          </div>

          {/* Charts Section with Beautiful Cards */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
            {/* Bar Chart Card */}
            <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Monthly Applications</h3>
                  <p className="text-gray-600 text-sm">Track application trends over time</p>
                </div>
              </div>
              <div className="h-[350px]">
                <Bar
                  data={applicantChartData}
                  options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: { 
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0,0,0,0.05)'
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        }
                      }
                    },
                  }}
                />
              </div>
            </div>

            {/* Pie Chart Card */}
            <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Job Status Overview</h3>
                  <p className="text-gray-600 text-sm">Distribution of job applications</p>
                </div>
              </div>
              <div className="h-[350px] flex items-center justify-center">
                <div className="w-full max-w-[280px]">
                  <Pie
                    data={jobStatusChartData}
                    options={{
                      maintainAspectRatio: false,
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            padding: 20,
                            usePointStyle: true,
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Hero />
      <Features />
      <TestimonialEmp />
      <Footer />
    </>
  );
};

export default HomeEmp;

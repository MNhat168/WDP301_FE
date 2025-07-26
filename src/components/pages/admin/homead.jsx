import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS } from 'chart.js/auto';
import { Bar, Pie, Doughnut, Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../layout/adminsidebar';

const HomeAdmin = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalCompanies: 0,
    activeAccounts: 0,
    bannedAccounts: 0,
    topJobs: [],
    monthlyStats: []
  });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('https://wdp301-lzse.onrender.com/api/user/current', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        navigate('/login');
      }
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsResponse, monthlyResponse, topJobsResponse] = await Promise.all([
          axios.get('https://wdp301-lzse.onrender.com/api/admin/dashboard/stats', {
            headers: {
              Authorization: `Bearer ${token}`
            },
            withCredentials: true
          }),
          axios.get('https://wdp301-lzse.onrender.com/api/admin/dashboard/monthly-jobs', {
            headers: {
              Authorization: `Bearer ${token}`
            },
            withCredentials: true
          }),
          axios.get('https://wdp301-lzse.onrender.com/api/admin/dashboard/top-jobs', {
            headers: {
              Authorization: `Bearer ${token}`
            },
            withCredentials: true
          })
        ]);

        setStats({
          ...statsResponse.data,
          monthlyStats: monthlyResponse.data,
          topJobs: topJobsResponse.data
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    fetchData();
  }, [navigate, token]);

  // Enhanced Bar Chart Data with gradients
  const barChartData = {
    labels: stats.monthlyStats.map(stat => {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return months[stat.month - 1];
    }),
    datasets: [{
      label: 'Jobs Posted',
      data: stats.monthlyStats.map(stat => stat.countJob),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  // Enhanced Doughnut Chart Data
  const doughnutChartData = {
    labels: ['Active Accounts', 'Banned Accounts'],
    datasets: [{
      data: [stats.activeAccounts, stats.bannedAccounts],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        'rgba(34, 197, 94, 1)',
        'rgba(239, 68, 68, 1)'
      ],
      borderWidth: 2,
      cutout: '60%',
    }]
  };

  // Enhanced Chart options
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: 'Inter, sans-serif'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
        ticks: {
          color: 'rgba(107, 114, 128, 1)',
          font: {
            family: 'Inter, sans-serif'
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(107, 114, 128, 1)',
          font: {
            family: 'Inter, sans-serif'
          }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: 'Inter, sans-serif'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 8,
      }
    },
    maintainAspectRatio: false,
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-32 w-32 border-4 border-blue-200"></div>
              <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-600 absolute top-0 left-0"></div>
            </div>
            <p className="mt-6 text-gray-600 text-lg font-medium">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        {/* Enhanced Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200 p-6 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's what's happening.</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200">
                <i className="fas fa-bell text-xl"></i>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">3</span>
              </button>
              <button className="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200">
                <i className="fas fa-user-circle text-xl"></i>
              </button>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Users Card */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Users</p>
                    <p className="text-3xl font-bold mt-2">{stats.totalUsers.toLocaleString()}</p>
                    <p className="text-blue-100 text-xs mt-1">+12% from last month</p>
                  </div>
                  <div className="p-4 bg-white/20 rounded-full">
                    <i className="fas fa-users text-2xl"></i>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-300 to-blue-400"></div>
            </div>

            {/* Jobs Card */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Total Jobs</p>
                    <p className="text-3xl font-bold mt-2">{stats.totalJobs.toLocaleString()}</p>
                    <p className="text-green-100 text-xs mt-1">+8% from last month</p>
                  </div>
                  <div className="p-4 bg-white/20 rounded-full">
                    <i className="fas fa-briefcase text-2xl"></i>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-300 to-green-400"></div>
            </div>

            {/* Companies Card */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Companies</p>
                    <p className="text-3xl font-bold mt-2">{stats.totalCompanies.toLocaleString()}</p>
                    <p className="text-purple-100 text-xs mt-1">+5% from last month</p>
                  </div>
                  <div className="p-4 bg-white/20 rounded-full">
                    <i className="fas fa-building text-2xl"></i>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-300 to-purple-400"></div>
            </div>

            {/* Active Rate Card */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Active Rate</p>
                    <p className="text-3xl font-bold mt-2">
                      {stats.totalUsers > 0 ? Math.round((stats.activeAccounts / stats.totalUsers) * 100) : 0}%
                    </p>
                    <p className="text-orange-100 text-xs mt-1">Account activity</p>
                  </div>
                  <div className="p-4 bg-white/20 rounded-full">
                    <i className="fas fa-chart-line text-2xl"></i>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-300 to-orange-400"></div>
            </div>
          </div>

          {/* Enhanced Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Jobs Chart - Takes 2 columns */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Monthly Job Posts</h3>
                    <p className="text-gray-600 text-sm mt-1">Jobs posted throughout the year</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <i className="fas fa-chart-bar text-blue-600"></i>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {stats.monthlyStats.length > 0 ? (
                  <div className="h-80">
                    <Bar data={barChartData} options={barChartOptions} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-80 text-gray-500">
                    <div className="text-center">
                      <i className="fas fa-chart-bar text-4xl text-gray-300 mb-4"></i>
                      <p>No data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Account Status Chart - Takes 1 column */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Account Status</h3>
                    <p className="text-gray-600 text-sm mt-1">User account distribution</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <i className="fas fa-users text-green-600"></i>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {stats.activeAccounts > 0 || stats.bannedAccounts > 0 ? (
                  <div className="h-80">
                    <Doughnut data={doughnutChartData} options={doughnutOptions} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-80 text-gray-500">
                    <div className="text-center">
                      <i className="fas fa-chart-pie text-4xl text-gray-300 mb-4"></i>
                      <p>No data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Top Jobs Table */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">🔥 Top 5 Hot Jobs</h3>
                  <p className="text-gray-600 text-sm mt-1">Most applied jobs this month</p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                    Export
                  </button>
                  <button className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    View All
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Job Title</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Salary</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Applications</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.topJobs.length > 0 ? (
                    stats.topJobs.map((job, index) => (
                      <tr key={index} className="hover:bg-gray-50/50 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                              index === 0 ? 'bg-yellow-500' : 
                              index === 1 ? 'bg-gray-400' : 
                              index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                            }`}>
                              {index + 1}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{job.Title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-gray-600">
                            <i className="fas fa-map-marker-alt mr-2 text-gray-400"></i>
                            {job.Location || 'Remote'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-green-600 font-medium">{job.Salary}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            <i className="fas fa-file-alt mr-2"></i>
                            {job.ApplyCount}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <i className="fas fa-briefcase text-4xl text-gray-300 mb-4"></i>
                          <p className="text-lg font-medium">No jobs data available</p>
                          <p className="text-sm">Jobs will appear here once posted</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeAdmin;
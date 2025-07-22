import React, { useState, useEffect } from 'react';
import { 
  FiActivity, FiTrendingUp, FiAlertCircle, FiRefreshCw, 
  FiCalendar, FiBarChart, FiEye, FiHeart, FiBriefcase,
  FiDownload, FiFilter, FiMail, FiStar
} from 'react-icons/fi';

const UsageStats = ({ 
  className = "",
  showDetailed = false,
  period = "current",
  onUpgradeClick = null 
}) => {
  const [usageData, setUsageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Get user token
  const getUserToken = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.accessToken || user?.token;
  };

  // Fetch usage statistics
  const fetchUsageStats = async () => {
    const token = getUserToken();
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/usage/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsageData(data.result);
      } else {
        throw new Error('Failed to fetch usage statistics');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageStats();
  }, [period]);

  // Get color based on usage percentage
  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600 bg-red-50';
    if (percentage >= 70) return 'text-orange-600 bg-orange-50';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  // Format usage display
  const formatUsage = (used, limit, isUnlimited) => {
    if (isUnlimited) return `${used} (unlimited)`;
    return `${used}/${limit}`;
  };

  // Get action icon
  const getActionIcon = (action) => {
    const icons = {
      job_application: FiBriefcase,
      add_favorite: FiHeart,
      job_posting: FiBriefcase,
      profile_view: FiEye,
      cv_download: FiDownload,
      search_filter: FiFilter,
      direct_message: FiMail,
      featured_job_post: FiStar
    };
    return icons[action] || FiActivity;
  };

  // Usage meter component
  const UsageMeter = ({ action, data }) => {
    const Icon = getActionIcon(action);
    const percentage = data.isUnlimited ? 0 : data.percentage || 0;
    const colorClass = getUsageColor(percentage);

    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Icon className="h-5 w-5 text-gray-600 mr-2" />
            <h4 className="font-medium text-gray-900 capitalize">
              {action.replace('_', ' ')}
            </h4>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            {data.isUnlimited ? 'Unlimited' : `${percentage.toFixed(0)}%`}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Used</span>
            <span className="font-medium">
              {formatUsage(data.used, data.limit, data.isUnlimited)}
            </span>
          </div>

          {!data.isUnlimited && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  percentage >= 90 ? 'bg-red-500' :
                  percentage >= 70 ? 'bg-orange-500' :
                  percentage >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          )}

          {!data.isUnlimited && data.remaining !== undefined && (
            <div className="text-xs text-gray-500">
              {data.remaining} remaining
            </div>
          )}
        </div>
      </div>
    );
  };

  // Summary card component
  const SummaryCard = ({ title, value, icon: Icon, trend, color = "blue" }) => (
    <div className={`bg-${color}-50 rounded-lg p-4 border border-${color}-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-${color}-600 text-sm font-medium`}>{title}</p>
          <p className={`text-2xl font-bold text-${color}-900`}>{value}</p>
          {trend && (
            <p className={`text-xs text-${color}-600 flex items-center mt-1`}>
              <FiTrendingUp className="h-3 w-3 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <Icon className={`h-8 w-8 text-${color}-500`} />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <FiAlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">Failed to load usage statistics</span>
          <button 
            onClick={fetchUsageStats}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <FiRefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  if (!usageData) return null;

  const { actionLimits, summary, subscriptionTier, usageStats } = usageData;

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Usage Statistics</h3>
          <p className="text-sm text-gray-600">
            Current plan: <span className="font-medium capitalize">{subscriptionTier}</span>
          </p>
        </div>
        <button 
          onClick={fetchUsageStats}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
        >
          <FiRefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs for detailed view */}
      {showDetailed && (
        <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
          {['overview', 'details', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Overview Tab */}
      {(!showDetailed || activeTab === 'overview') && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard
              title="Total Actions"
              value={summary?.totalActions || 0}
              icon={FiActivity}
              color="blue"
            />
            <SummaryCard
              title="Successful"
              value={summary?.successfulActions || 0}
              icon={FiTrendingUp}
              color="green"
            />
            <SummaryCard
              title="Blocked"
              value={summary?.blockedActions || 0}
              icon={FiAlertCircle}
              color="red"
            />
          </div>

          {/* Usage Meters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(actionLimits).map(([action, data]) => (
              <UsageMeter key={action} action={action} data={data} />
            ))}
          </div>

          {/* Upgrade prompt for users near limits */}
          {subscriptionTier === 'free' && onUpgradeClick && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold mb-2">Upgrade to Premium</h4>
                  <p className="text-blue-100 text-sm">
                    Get unlimited access and remove all restrictions
                  </p>
                </div>
                <button
                  onClick={onUpgradeClick}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details Tab */}
      {showDetailed && activeTab === 'details' && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Detailed Usage Breakdown</h4>
          {Object.entries(usageStats).map(([action, stats]) => (
            <div key={action} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium capitalize">{action.replace('_', ' ')}</span>
                <span className="text-sm text-gray-600">
                  Last used: {new Date(stats.lastUsed).toLocaleDateString()}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total: </span>
                  <span className="font-medium">{stats.total}</span>
                </div>
                <div>
                  <span className="text-gray-600">Successful: </span>
                  <span className="font-medium text-green-600">{stats.successful}</span>
                </div>
                <div>
                  <span className="text-gray-600">Blocked: </span>
                  <span className="font-medium text-red-600">{stats.blocked}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History Tab */}
      {showDetailed && activeTab === 'history' && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Recent Activity</h4>
          <div className="space-y-2">
            {usageData.recentLogs?.slice(0, 10).map((log, index) => (
              <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                <div className="flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-3 ${
                    log.status === 'success' ? 'bg-green-500' : 
                    log.status === 'blocked' ? 'bg-red-500' : 'bg-gray-500'
                  }`} />
                  <span className="capitalize">{log.action.replace('_', ' ')}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageStats; 
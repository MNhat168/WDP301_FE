import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CVPreview from '../jobseeker/CVPreview';
import HeaderEmployer from "../../layout/headeremp";
import toastr from "toastr";
import { FiUser, FiCalendar, FiMapPin, FiBriefcase, FiMail, FiPhone, FiChevronRight, FiCheckSquare, FiZap, FiTrendingUp, FiStar, FiAward, FiTarget, FiBarChart2, FiRefreshCw } from "react-icons/fi";

const ApproveCV = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobDetails, setJobDetails] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [activeApplicant, setActiveApplicant] = useState(null);
  const [showBulkScheduleModal, setShowBulkScheduleModal] = useState(false);
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [scheduleData, setScheduleData] = useState({
    availableSlots: [],
    note: ""
  });

  // AI Matching States
  const [aiAnalytics, setAiAnalytics] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showTopCandidates, setShowTopCandidates] = useState(false);
  const [topCandidates, setTopCandidates] = useState([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [sortBy, setSortBy] = useState('matchScore'); // matchScore, applicationDate, status

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);

  const getAuthToken = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.accessToken || "";
  };

  // AI Matching API Functions
  const batchAnalyzeApplications = async (forceReanalyze = false) => {
    const token = getAuthToken();
    setIsAnalyzing(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/ai-matching/jobs/${jobId}/batch-analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({ forceReanalyze })
        }
      );

      if (!response.ok) throw new Error("Failed to analyze applications");

      const data = await response.json();
      toastr.success(`AI Analysis completed! ${data.result.analyzedApplications}/${data.result.totalApplications} applications analyzed`);

      // Refresh applications with new AI data
      await fetchApplications();
      await fetchAiAnalytics();

    } catch (error) {
      toastr.error(error.message || "Failed to analyze applications");
      console.error("Batch analyze error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchTopCandidates = async () => {
    const token = getAuthToken();
    try {
      const response = await fetch(
        `http://localhost:5000/api/ai-matching/jobs/${jobId}/top-candidates?limit=5&includeDetails=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to fetch top candidates");

      const data = await response.json();
      setTopCandidates(data.result.topCandidates || []);

    } catch (error) {
      toastr.error(error.message || "Failed to load top candidates");
      console.error("Fetch top candidates error:", error);
    }
  };

  const fetchAiAnalytics = async () => {
    const token = getAuthToken();
    try {
      const response = await fetch(
        `http://localhost:5000/api/ai-matching/jobs/${jobId}/analytics`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAiAnalytics(data.result);
      }
    } catch (error) {
      console.error("Fetch AI analytics error:", error);
    }
  };

  const analyzeApplication = async (applicationId) => {
    const token = getAuthToken();
    try {
      const response = await fetch(
        `http://localhost:5000/api/ai-matching/applications/${applicationId}/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to analyze application");

      const data = await response.json();
      toastr.success("AI analysis completed!");

      // Update the specific application in state
      setApplications(prev => prev.map(app =>
        app._id === applicationId
          ? { ...app, aiAnalysis: data.result.aiAnalysis }
          : app
      ));

    } catch (error) {
      toastr.error(error.message || "Failed to analyze application");
      console.error("Analyze application error:", error);
    }
  };

  const fetchApplications = async () => {
    const token = getAuthToken();
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/applications/job/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to fetch applications");

      const data = await response.json();
      setApplications(data.applications || []);
      setJobDetails(data.jobDetails || null);
    } catch (error) {
      toastr.error(error.message || "Failed to load applications");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    const token = getAuthToken();
    try {
      const response = await fetch(
        `http://localhost:5000/api/applications/${applicationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) throw new Error("Failed to update status");

      const data = await response.json();
      toastr.success(`Application ${status} successfully`);
      fetchApplications();
    } catch (error) {
      toastr.error(error.message || "Status update failed");
      console.error("Update error:", error);
    }
  };

  const toggleSelectAll = () => {
    const pendingIds = getPendingApplicationIds();
    const allPendingSelected = pendingIds.length > 0 &&
      pendingIds.every(id => selectedApplicants.includes(id));

    if (allPendingSelected) {
      setSelectedApplicants(prev =>
        prev.filter(id => !pendingIds.includes(id))
      );
    } else {
      setSelectedApplicants(prev =>
        [...new Set([...prev, ...pendingIds])]
      );
    }
  };

  const getPendingApplicationIds = () => {
    return applications
      .filter(app => app.status === "pending")
      .map(app => app._id);
  };

  const getAnalysisTypeIndicator = (aiAnalysis) => {
    const isAutomated = aiAnalysis.automatedAnalysis || aiAnalysis.analysisType === 'automated';

    return {
      text: isAutomated ? 'Auto Analysis' : 'Manual Analysis',
      color: isAutomated ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800',
      icon: isAutomated ? FiZap : FiUser
    };
  };

  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    setScheduleData(prev => ({ ...prev, [name]: value }));
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const isDateSelected = (date) => {
    return selectedDates.some(selected =>
      formatDate(selected.date) === formatDate(date)
    );
  };

  const isDatePast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateClick = (date) => {
    if (isDatePast(date)) return;

    const dateStr = formatDate(date);
    const existingIndex = selectedDates.findIndex(selected =>
      formatDate(selected.date) === dateStr
    );

    if (existingIndex >= 0) {
      setSelectedDates(prev => prev.filter((_, index) => index !== existingIndex));
    } else {
      setSelectedDates(prev => [...prev, {
        date: date,
        timeSlots: ['09:00', '14:00']
      }]);
    }
  };

  // Handle time slot changes
  const handleTimeSlotChange = (dateIndex, slotIndex, newTime) => {
    setSelectedDates(prev => {
      const updated = [...prev];
      updated[dateIndex].timeSlots[slotIndex] = newTime;
      return updated;
    });
  };

  // Add time slot
  const addTimeSlot = (dateIndex) => {
    setSelectedDates(prev => {
      const updated = [...prev];
      updated[dateIndex].timeSlots.push('09:00');
      return updated;
    });
  };

  // Remove time slot
  const removeTimeSlot = (dateIndex, slotIndex) => {
    setSelectedDates(prev => {
      const updated = [...prev];
      updated[dateIndex].timeSlots.splice(slotIndex, 1);
      return updated;
    });
  };

  const acceptApplicant = async (applicationId) => {
    await updateApplicationStatus(applicationId, "accepted");
    setJobDetails(prev => ({
      ...prev,
      applicantCount: Math.max(0, prev.applicantCount - 1)
    }));
    setApplications(prev =>
      prev.map(app =>
        app._id === applicationId
          ? { ...app, status: 'accepted' }
          : app
      )
    );
    setSelectedApplicants(prev =>
      prev.filter(id => id !== applicationId)
    );
  };

  useEffect(() => {
    if (applications.length > 0 && !activeApplicant) {
      setActiveApplicant(applications[0]);
    }
  }, [applications]);

  // Function to handle applicant selection
  const handleSelectApplicant = (application) => {
    setActiveApplicant(application);
  };

  // Calendar navigation
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const toggleApplicantSelection = (applicationId) => {
    setSelectedApplicants(prev =>
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  // Open bulk schedule modal
  const openBulkScheduleModal = () => {
    setShowBulkScheduleModal(true);
    setSelectedDates([]);
    setScheduleData({ availableSlots: [], note: "" });
  };

  const closeBulkScheduleModal = () => {
    setShowBulkScheduleModal(false);
    setSelectedDates([]);
    setScheduleData({ availableSlots: [], note: "" });
  };

  const sendBulkInterviewInvitations = async () => {
    if (selectedDates.length === 0) {
      toastr.error("Please select at least one available date");
      return;
    }

    const token = getAuthToken();
    try {
      const response = await fetch(
        `http://localhost:5000/api/applications/schedule-bulk`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({
            applicationIds: selectedApplicants,
            availableSlots: selectedDates,
            note: scheduleData.note
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to send invitations");

      const data = await response.json();
      toastr.success(`Scheduled ${data.scheduledCount} interviews`);

      // Update UI to show interview scheduled status
      setApplications(prev => prev.map(app =>
        selectedApplicants.includes(app._id)
          ? { ...app, status: 'interview_scheduled' }
          : app
      ));
      setSelectedApplicants([]);
      closeBulkScheduleModal();
    } catch (error) {
      toastr.error(error.message || "Failed to schedule interviews");
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-blue-100 text-blue-800";
    if (score >= 40) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getRecommendationBadge = (recommendation) => {
    switch (recommendation?.toLowerCase()) {
      case 'highly_recommended':
        return {
          text: 'Highly Recommended',
          color: 'bg-green-100 text-green-800',
          icon: FiStar
        };
      case 'recommended':
        return {
          text: 'Recommended',
          color: 'bg-blue-100 text-blue-800',
          icon: FiTrendingUp
        };
      case 'consider':
        return {
          text: 'Consider',
          color: 'bg-yellow-100 text-yellow-800',
          icon: FiTarget
        };
      case 'not_recommended':
        return {
          text: 'Not Recommended',
          color: 'bg-red-100 text-red-800',
          icon: FiBarChart2
        };
      default:
        return {
          text: 'No Recommendation',
          color: 'bg-gray-100 text-gray-800',
          icon: FiBarChart2
        };
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchAiAnalytics(); // Load analytics on component mount
  }, [jobId]);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <HeaderEmployer />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get pending application IDs for use in JSX
  const pendingApplicationIds = getPendingApplicationIds();

  return (
    <div className="bg-gray-50 min-h-screen">
      <HeaderEmployer />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Applications for: {jobDetails?.title || "Job"}
              </h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                {applications.length} application{applications.length !== 1 ? "s" : ""} received
              </p>
            </div>
            <button
              onClick={() => navigate(`/jobdetails/${jobId}`)}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm md:text-base"
            >
              View Job Details
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* AI Analytics Dashboard */}
        {aiAnalytics && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6 border border-blue-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <FiZap className="mr-2 text-blue-600" />
                AI Matching Analytics
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                  Auto + Manual
                </span>
              </h2>
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {showAnalytics ? 'Hide Details' : 'Show Details'}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{aiAnalytics.analyzedApplications}</div>
                <div className="text-sm text-gray-600">Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{aiAnalytics.averageMatchScore}</div>
                <div className="text-sm text-gray-600">Avg Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {aiAnalytics.recommendationBreakdown?.highly_recommended || 0}
                </div>
                <div className="text-sm text-gray-600">Top Picks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {((aiAnalytics.analyzedApplications / aiAnalytics.totalApplications) * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Coverage</div>
              </div>
            </div>

            {/* System Info */}
            <div className="bg-blue-100 rounded-lg p-3 mb-4 text-sm text-blue-800">
              <div className="flex items-center">
                <FiZap className="mr-2" size={14} />
                <strong>Dual AI System:</strong>
                <span className="ml-1">Auto-analysis when applications are submitted + Manual controls for HR</span>
              </div>
            </div>

            {showAnalytics && (
              <div className="border-t border-blue-200 pt-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Score Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Excellent (80-100)</span>
                        <span className="text-green-600 font-semibold">{aiAnalytics.scoreDistribution?.excellent || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Good (60-79)</span>
                        <span className="text-blue-600 font-semibold">{aiAnalytics.scoreDistribution?.good || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Average (40-59)</span>
                        <span className="text-yellow-600 font-semibold">{aiAnalytics.scoreDistribution?.average || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Poor (0-39)</span>
                        <span className="text-red-600 font-semibold">{aiAnalytics.scoreDistribution?.poor || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Recommendations</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Highly Recommended</span>
                        <span className="text-green-600 font-semibold">{aiAnalytics.recommendationBreakdown?.highly_recommended || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Recommended</span>
                        <span className="text-blue-600 font-semibold">{aiAnalytics.recommendationBreakdown?.recommended || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Consider</span>
                        <span className="text-yellow-600 font-semibold">{aiAnalytics.recommendationBreakdown?.consider || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Not Recommended</span>
                        <span className="text-red-600 font-semibold">{aiAnalytics.recommendationBreakdown?.not_recommended || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={openBulkScheduleModal}
            disabled={selectedApplicants.length === 0}
            className={`px-4 py-2 rounded-lg font-medium flex items-center ${selectedApplicants.length === 0
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
          >
            <FiCalendar className="mr-2" size={16} />
            Schedule Interview ({selectedApplicants.length})
          </button>

          <button
            onClick={() => batchAnalyzeApplications(false)}
            disabled={isAnalyzing || applications.length === 0}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 font-medium flex items-center"
          >
            {isAnalyzing ? (
              <FiRefreshCw className="mr-2 animate-spin" size={16} />
            ) : (
              <FiZap className="mr-2" size={16} />
            )}
            {isAnalyzing ? 'Analyzing...' : 'AI Analyze Missing'}
          </button>

          <button
            onClick={() => batchAnalyzeApplications(true)}
            disabled={isAnalyzing || applications.length === 0}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 font-medium flex items-center"
          >
            {isAnalyzing ? (
              <FiRefreshCw className="mr-2 animate-spin" size={16} />
            ) : (
              <FiRefreshCw className="mr-2" size={16} />
            )}
            {isAnalyzing ? 'Re-analyzing...' : 'Force Re-analyze All'}
          </button>

          <button
            onClick={() => {
              fetchTopCandidates();
              setShowTopCandidates(true);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center"
          >
            <FiAward className="mr-2" size={16} />
            Top 5 Candidates
          </button>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="matchScore">Sort by AI Score</option>
              <option value="applicationDate">Sort by Date</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">Applicants</h2>
              <div className="flex items-center">
                <button
                  onClick={toggleSelectAll}
                  className={`flex items-center text-sm ${pendingApplicationIds.length > 0 &&
                      pendingApplicationIds.every(id => selectedApplicants.includes(id))
                      ? 'text-blue-600'
                      : 'text-gray-600'
                    } ${pendingApplicationIds.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={pendingApplicationIds.length === 0}
                >
                  <FiCheckSquare className="mr-1" size={16} />
                  <span>
                    {pendingApplicationIds.length === 0
                      ? 'No Pending Applications'
                      : pendingApplicationIds.every(id => selectedApplicants.includes(id))
                        ? 'Deselect All Pending'
                        : 'Select All Pending'}
                  </span>
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">Click to view details • Sorted by {sortBy.replace(/([A-Z])/g, ' $1').toLowerCase()}</p>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
              {applications.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {applications.map((application) => (
                    <div
                      key={application._id}
                      className={`p-4 cursor-pointer transition-colors ${activeApplicant?._id === application._id
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : 'hover:bg-gray-50'
                        }`}
                      onClick={() => handleSelectApplicant(application)}
                    >
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          disabled={application.status !== "pending"}
                          checked={selectedApplicants.includes(application._id)}
                          onChange={() => toggleApplicantSelection(application._id)}
                          className="mt-1 mr-3 h-4 w-4 text-blue-600 rounded"
                        />
                        <div className="mr-3">
                          {application.userId?.avatar ? (
                            <img
                              src={application.userId.avatar}
                              alt="Profile"
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center text-gray-500">
                              <FiUser size={18} />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <h3 className="font-medium text-gray-900 truncate">
                              {application.userId?.firstName + " " + application.userId?.lastName || "Applicant"}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${application.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : application.status === "accepted"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                                }`}
                            >
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 truncate flex items-center mt-1">
                            <FiBriefcase className="mr-1.5 flex-shrink-0" size={12} />
                            <span className="truncate">{application.cvProfileId?.headline || "No headline provided"}</span>
                          </p>

                          <div className="flex items-center text-xs text-gray-500 mt-2">
                            <FiCalendar className="mr-1.5 flex-shrink-0" size={12} />
                            <span>Applied: {new Date(application.applicationDate).toLocaleDateString()}</span>
                            {/* Show analysis date if available */}
                            {application.aiAnalysis?.analyzedAt && (
                              <span className="ml-2 text-xs text-gray-400">
                                • AI: {new Date(application.aiAnalysis.analyzedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          {/* AI Analysis Preview */}
                          {application.aiAnalysis && (
                            <div className="mt-2 text-xs text-gray-600">
                              <div className="truncate">
                                {application.aiAnalysis.explanation?.substring(0, 80)}...
                              </div>
                            </div>
                          )}
                        </div>

                        <FiChevronRight
                          className={`ml-2 mt-1.5 flex-shrink-0 ${activeApplicant?._id === application._id ? 'text-blue-500' : 'text-gray-400'
                            }`}
                        />
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            acceptApplicant(application._id);
                          }}
                          disabled={application.status == "pending"}
                          className={`text-xs px-2.5 py-1.5 rounded ${application.status === "interview_scheduled"
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-100 text-gray-500 cursor-not-allowed"
                            }`}
                        >
                          Accept
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateApplicationStatus(application._id, "rejected");
                          }}
                          className={`text-xs px-2.5 py-1.5 rounded bg-red-100 text-red-800 hover:bg-red-200`}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 px-4">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No applications yet
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Applicants will appear here when they apply to this job.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* CV Preview Panel */}
          <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">
                {activeApplicant ? "CV Preview" : "Select an applicant"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {activeApplicant
                  ? `Viewing ${activeApplicant.userId?.firstName + " " + activeApplicant.userId?.lastName || "applicant"}'s CV`
                  : "Click on an applicant to view their CV"}
              </p>
            </div>

            <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 220px)' }}>
              {activeApplicant ? (
                <div className="bg-white p-2 md:p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      {activeApplicant.userId?.avatar ? (
                        <img
                          src={activeApplicant.userId.avatar}
                          alt="Profile"
                          className="w-12 h-12 rounded-full object-cover mr-3"
                        />
                      ) : (
                        <div className="bg-gray-200 rounded-full w-12 h-12 flex items-center justify-center text-gray-500 mr-3">
                          <FiUser size={20} />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {activeApplicant.userId?.firstName + " " + activeApplicant.userId?.lastName || "Applicant"}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <FiMail className="mr-1.5" size={14} />
                          {activeApplicant.userId?.email || "No email"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      {/* AI Match Score */}
                      {activeApplicant.aiAnalysis?.matchScore && (
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${getMatchScoreColor(activeApplicant.aiAnalysis.matchScore)}`}>
                          {activeApplicant.aiAnalysis.matchScore}% AI Match
                        </div>
                      )}

                      {/* Recommendation Badge */}
                      {activeApplicant.aiAnalysis?.overallRecommendation && (
                        <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getRecommendationBadge(activeApplicant.aiAnalysis.overallRecommendation).color}`}>
                          {(() => {
                            const badge = getRecommendationBadge(activeApplicant.aiAnalysis.overallRecommendation);
                            const IconComponent = badge.icon;
                            return (
                              <>
                                {IconComponent && <IconComponent className="mr-1" size={12} />}
                                {badge.text}
                              </>
                            );
                          })()}
                        </div>
                      )}

                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${activeApplicant.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : activeApplicant.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : activeApplicant.status === "interview_scheduled"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                      >
                        {activeApplicant.status === "interview_scheduled"
                          ? "Interview Scheduled"
                          : activeApplicant.status.charAt(0).toUpperCase() + activeApplicant.status.slice(1)}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Applied: {new Date(activeApplicant.applicationDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* AI Analysis Section */}
                  {activeApplicant.aiAnalysis && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6 border border-purple-200">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-gray-900 flex items-center">
                          <FiZap className="mr-2 text-purple-600" />
                          AI Analysis & Insights
                        </h4>
                        <div className="flex flex-col items-end space-y-1">
                          {/* Analysis Type Badge */}
                          {(() => {
                            const indicator = getAnalysisTypeIndicator(activeApplicant.aiAnalysis);
                            const IndicatorIcon = indicator.icon;
                            return (
                              <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${indicator.color}`}>
                                <IndicatorIcon className="mr-1" size={12} />
                                {indicator.text}
                              </div>
                            );
                          })()}
                          {/* Analysis Date */}
                          <div className="text-xs text-gray-500">
                            {new Date(activeApplicant.aiAnalysis.analyzedAt).toLocaleString()}
                          </div>
                          {/* AI Model Used */}
                          {activeApplicant.aiAnalysis.aiModel && (
                            <div className="text-xs text-gray-400">
                              Model: {activeApplicant.aiAnalysis.aiModel}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* AI Explanation */}
                        <div>
                          <h5 className="font-medium text-gray-800 mb-1">AI Summary</h5>
                          <p className="text-sm text-gray-700">{activeApplicant.aiAnalysis.explanation}</p>
                        </div>

                        {/* Skills Match */}
                        {activeApplicant.aiAnalysis.skillsMatch && (
                          <div className="grid md:grid-cols-3 gap-4">
                            {activeApplicant.aiAnalysis.skillsMatch.matched?.length > 0 && (
                              <div>
                                <h6 className="font-medium text-green-700 mb-2 flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Matching Skills ({activeApplicant.aiAnalysis.skillsMatch.matched.length})
                                </h6>
                                <div className="flex flex-wrap gap-1">
                                  {activeApplicant.aiAnalysis.skillsMatch.matched.map((skill, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {activeApplicant.aiAnalysis.skillsMatch.missing?.length > 0 && (
                              <div>
                                <h6 className="font-medium text-red-700 mb-2 flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                  Missing Skills ({activeApplicant.aiAnalysis.skillsMatch.missing.length})
                                </h6>
                                <div className="flex flex-wrap gap-1">
                                  {activeApplicant.aiAnalysis.skillsMatch.missing.map((skill, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {activeApplicant.aiAnalysis.skillsMatch.additional?.length > 0 && (
                              <div>
                                <h6 className="font-medium text-blue-700 mb-2 flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                  </svg>
                                  Bonus Skills ({activeApplicant.aiAnalysis.skillsMatch.additional.length})
                                </h6>
                                <div className="flex flex-wrap gap-1">
                                  {activeApplicant.aiAnalysis.skillsMatch.additional.map((skill, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Experience & Education Match */}
                        <div className="grid md:grid-cols-2 gap-4">
                          {activeApplicant.aiAnalysis.experienceMatch && (
                            <div>
                              <h6 className="font-medium text-gray-800 mb-1">Experience Match</h6>
                              <div className="flex items-center mb-1">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${getMatchScoreColor(activeApplicant.aiAnalysis.experienceMatch.score).replace('text-', 'bg-').replace('-600', '-500')}`}>
                                  {activeApplicant.aiAnalysis.experienceMatch.score}
                                </div>
                                <span className="ml-2 text-sm font-medium">{activeApplicant.aiAnalysis.experienceMatch.score}/100</span>
                              </div>
                              <p className="text-xs text-gray-600">{activeApplicant.aiAnalysis.experienceMatch.explanation}</p>
                            </div>
                          )}

                          {activeApplicant.aiAnalysis.educationMatch && (
                            <div>
                              <h6 className="font-medium text-gray-800 mb-1">Education Match</h6>
                              <div className="flex items-center mb-1">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${getMatchScoreColor(activeApplicant.aiAnalysis.educationMatch.score).replace('text-', 'bg-').replace('-600', '-500')}`}>
                                  {activeApplicant.aiAnalysis.educationMatch.score}
                                </div>
                                <span className="ml-2 text-sm font-medium">{activeApplicant.aiAnalysis.educationMatch.score}/100</span>
                              </div>
                              <p className="text-xs text-gray-600">{activeApplicant.aiAnalysis.educationMatch.explanation}</p>
                            </div>
                          )}
                        </div>

                        {/* Re-analyze Button */}
                        <div className="border-t border-purple-200 pt-3">
                          <button
                            onClick={() => analyzeApplication(activeApplicant._id)}
                            className="text-sm px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
                          >
                            <FiRefreshCw className="mr-2" size={14} />
                            Re-analyze with AI
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Add Analyze Button if no AI analysis */}
                  {!activeApplicant.aiAnalysis && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
                      <FiZap className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <h4 className="font-medium text-gray-800 mb-1">No AI Analysis Yet</h4>
                      <p className="text-sm text-gray-600 mb-3">Get AI-powered insights about this candidate</p>
                      <button
                        onClick={() => analyzeApplication(activeApplicant._id)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center mx-auto"
                      >
                        <FiZap className="mr-2" size={16} />
                        Analyze with AI
                      </button>
                    </div>
                  )}

                  <CVPreview
                    cvData={activeApplicant.cvProfileId}
                    template="modern"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No applicant selected
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Select an applicant from the list to view their CV
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Candidates Modal */}
      {showTopCandidates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <FiAward className="mr-2 text-green-600" />
                Top 5 AI-Recommended Candidates
              </h2>
              <button
                onClick={() => setShowTopCandidates(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {topCandidates.length > 0 ? (
              <div className="space-y-4">
                {topCandidates.map((candidate, index) => {
                  const badge = getRecommendationBadge(candidate.recommendation);
                  const IconComponent = badge.icon;

                  return (
                    <div key={candidate.applicationId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-500' :
                              index === 1 ? 'bg-gray-400' :
                                index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                              }`}>
                              #{index + 1}
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {candidate.candidateDetails?.name || 'Candidate'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Applied: {new Date(candidate.candidateDetails?.applicationDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              Status: <span className="capitalize">{candidate.candidateDetails?.status}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end space-y-2">
                          <div className={`px-3 py-1 rounded-full text-sm font-bold ${getMatchScoreColor(candidate.matchScore)}`}>
                            {candidate.matchScore}% Match
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${badge.color}`}>
                            {IconComponent && <IconComponent className="mr-1" size={12} />}
                            {badge.text}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-medium text-gray-800 mb-2">AI Summary</h4>
                        <p className="text-sm text-gray-600 mb-3">{candidate.summary}</p>

                        <div className="grid md:grid-cols-2 gap-4">
                          {candidate.keyStrengths && candidate.keyStrengths.length > 0 && (
                            <div>
                              <h5 className="font-medium text-green-700 mb-1 flex items-center">
                                <FiStar className="mr-1" size={14} />
                                Key Strengths
                              </h5>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {candidate.keyStrengths.map((strength, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="text-green-500 mr-1">•</span>
                                    {strength}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {candidate.concerns && candidate.concerns.length > 0 && (
                            <div>
                              <h5 className="font-medium text-orange-700 mb-1 flex items-center">
                                <FiTarget className="mr-1" size={14} />
                                Areas to Consider
                              </h5>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {candidate.concerns.map((concern, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="text-orange-500 mr-1">•</span>
                                    {concern}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => {
                              const application = applications.find(app => app._id === candidate.applicationId);
                              if (application) {
                                setActiveApplicant(application);
                                setShowTopCandidates(false);
                              }
                            }}
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            View Full CV
                          </button>
                          <button
                            onClick={() => {
                              setSelectedApplicants([candidate.applicationId]);
                              setShowTopCandidates(false);
                              openBulkScheduleModal();
                            }}
                            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Schedule Interview
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiBarChart2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Analysis Available</h3>
                <p className="text-gray-600 mb-4">Run AI analysis on applications to see top candidates</p>
                <button
                  onClick={() => {
                    setShowTopCandidates(false);
                    batchAnalyzeApplications(false);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Analyze All Applications
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bulk Schedule Modal */}
      {showBulkScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex-shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold flex items-center">
                    <FiCalendar className="mr-3" size={24} />
                    Schedule Interview
                  </h2>
                  <p className="text-blue-100 mt-1">
                    {selectedApplicants.length === 1
                      ? `Schedule interview for 1 selected applicant`
                      : `Schedule interviews for ${selectedApplicants.length} selected applicants`
                    }
                  </p>
                </div>
                <button
                  onClick={closeBulkScheduleModal}
                  className="text-white hover:text-red-200 transition-colors p-2 hover:bg-white/10 rounded-full"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Calendar Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Select Available Dates
                </h3>

                <div className="bg-gray-50 rounded-xl p-6">
                  {/* Calendar Navigation */}
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={() => navigateMonth(-1)}
                      className="p-3 hover:bg-white rounded-xl transition-colors text-gray-600 hover:text-blue-600 border border-gray-200 hover:border-blue-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h3 className="text-xl font-bold text-gray-800">
                      {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button
                      onClick={() => navigateMonth(1)}
                      className="p-3 hover:bg-white rounded-xl transition-colors text-gray-600 hover:text-blue-600 border border-gray-200 hover:border-blue-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-sm font-semibold text-gray-600 p-3">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, index) => (
                      <div key={index} className="p-3"></div>
                    ))}
                    {Array.from({ length: getDaysInMonth(currentDate) }).map((_, index) => {
                      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), index + 1);
                      const isSelected = isDateSelected(date);
                      const isPast = isDatePast(date);

                      return (
                        <button
                          key={index}
                          onClick={() => handleDateClick(date)}
                          disabled={isPast}
                          className={`p-3 text-sm rounded-xl font-medium transition-all duration-200 ${isSelected
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                            : isPast
                              ? 'text-gray-300 cursor-not-allowed bg-gray-100'
                              : 'hover:bg-blue-100 hover:text-blue-700 text-gray-700 bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md'
                            }`}
                        >
                          {index + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Selected Dates and Time Slots */}
              {selectedDates.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Configure Time Slots
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      {selectedDates.length} {selectedDates.length === 1 ? 'date' : 'dates'} selected
                    </span>
                  </h3>

                  <div className="grid gap-4">
                    {selectedDates.map((selectedDate, dateIndex) => (
                      <div key={dateIndex} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center">
                            <div className="bg-blue-100 text-blue-700 p-2 rounded-lg mr-3">
                              <FiCalendar size={18} />
                            </div>
                            <div>
                              <span className="font-semibold text-lg text-gray-800">
                                {selectedDate.date.toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                              <p className="text-sm text-gray-500">Available time slots</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDateClick(selectedDate.date)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        <div className="space-y-3">
                          {selectedDate.timeSlots.map((time, slotIndex) => (
                            <div key={slotIndex} className="flex items-center gap-3">
                              <div className="flex-1">
                                <input
                                  type="time"
                                  value={time}
                                  onChange={(e) => handleTimeSlotChange(dateIndex, slotIndex, e.target.value)}
                                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                                />
                              </div>
                              {selectedDate.timeSlots.length > 1 && (
                                <button
                                  onClick={() => removeTimeSlot(dateIndex, slotIndex)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={() => addTimeSlot(dateIndex)}
                            className="w-full py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors font-medium flex items-center justify-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Time Slot
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Additional Information
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <textarea
                    name="note"
                    value={scheduleData.note}
                    onChange={handleScheduleChange}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows="4"
                    placeholder="Add meeting link, location, special instructions, or other details for the interview..."
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer - Fixed at bottom */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center flex-shrink-0">
              <div className="text-sm text-gray-600">
                {selectedDates.length === 0 ? (
                  <span className="flex items-center text-orange-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Please select at least one date to continue
                  </span>
                ) : (
                  <span className="flex items-center text-green-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Ready to schedule {selectedDates.reduce((total, date) => total + date.timeSlots.length, 0)} time slots
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={closeBulkScheduleModal}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={sendBulkInterviewInvitations}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-medium flex items-center"
                  disabled={selectedDates.length === 0}
                >
                  <FiCalendar className="mr-2" size={16} />
                  Schedule {selectedApplicants.length === 1 ? 'Interview' : 'Interviews'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveCV;
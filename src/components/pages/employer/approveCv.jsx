import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CVPreview from '../jobseeker/CVPreview';
import HeaderEmployer from "../../layout/headeremp";
import toastr from "toastr";
import { FiUser, FiCalendar, FiMapPin, FiBriefcase, FiMail, FiPhone, FiChevronRight,FiCheckSquare  } from "react-icons/fi";

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

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);

  const getAuthToken = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.accessToken || "";
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
    if (selectedApplicants.length === applications.length) {
      setSelectedApplicants([]);
    } else {
      setSelectedApplicants(applications.map(app => app._id));
    }
  };

  // Handle schedule input changes
  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    setScheduleData(prev => ({ ...prev, [name]: value }));
  };

  // Calendar helper functions
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
            jobId,
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

  useEffect(() => {
    fetchApplications();
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
              onClick={() => navigate(`/employer/job/${jobId}`)}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm md:text-base"
            >
              View Job Details
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openBulkScheduleModal}
            disabled={selectedApplicants.length === 0}
            className={`px-4 py-2 rounded-md font-medium ${selectedApplicants.length === 0
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
          >
            Schedule Interview ({selectedApplicants.length})
          </button>
        </div>

        {/* Split View Container */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Applicants List Panel */}
          <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">Applicants</h2>
              <div className="flex items-center">
              <button
                onClick={toggleSelectAll}
                className={`flex items-center text-sm ${
                  selectedApplicants.length === applications.length && applications.length > 0
                    ? 'text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                <FiCheckSquare className="mr-1" size={16} />
                <span>
                  {selectedApplicants.length === applications.length && applications.length > 0
                    ? 'Deselect All'
                    : 'Select All'}
                </span>
              </button>
            </div>
              <p className="text-sm text-gray-600 mt-1">Click to view details</p>
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
                              {application.userId?.fullName || "Applicant"}
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
                          </div>
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
                          className={`text-xs px-2.5 py-1.5 rounded bg-green-100 text-green-800 hover:bg-green-200
                            }`}
                        >
                          Accept
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateApplicationStatus(application._id, "rejected");
                          }}
                          className={`text-xs px-2.5 py-1.5 rounded bg-red-100 text-red-800 hover:bg-red-200
                            }`}
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
                  ? `Viewing ${activeApplicant.userId?.fullName || "applicant"}'s CV`
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
                          {activeApplicant.userId?.fullName || "Applicant"}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <FiMail className="mr-1.5" size={14} />
                          {activeApplicant.userId?.email || "No email"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${activeApplicant.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : activeApplicant.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                          }`}
                      >
                        {activeApplicant.status.charAt(0).toUpperCase() + activeApplicant.status.slice(1)}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Applied: {new Date(activeApplicant.applicationDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

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

      {showBulkScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Schedule Interview for {selectedApplicants.length} Applicants
            </h2>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  ←
                </button>
                <h3 className="text-lg font-semibold">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  →
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, index) => (
                  <div key={index} className="p-2"></div>
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
                      className={`p-2 text-sm rounded hover:bg-gray-100 ${isSelected
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : isPast
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'hover:bg-gray-100'
                        }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Dates and Time Slots */}
            {selectedDates.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Selected Available Slots:</h4>
                <div className="space-y-3">
                  {selectedDates.map((selectedDate, dateIndex) => (
                    <div key={dateIndex} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">
                          {selectedDate.date.toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => handleDateClick(selectedDate.date)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove Date
                        </button>
                      </div>

                      <div className="space-y-2">
                        {selectedDate.timeSlots.map((time, slotIndex) => (
                          <div key={slotIndex} className="flex items-center gap-2">
                            <input
                              type="time"
                              value={time}
                              onChange={(e) => handleTimeSlotChange(dateIndex, slotIndex, e.target.value)}
                              className="p-1 border border-gray-300 rounded text-sm"
                            />
                            {selectedDate.timeSlots.length > 1 && (
                              <button
                                onClick={() => removeTimeSlot(dateIndex, slotIndex)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => addTimeSlot(dateIndex)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          + Add Time Slot
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                name="note"
                value={scheduleData.note}
                onChange={handleScheduleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="3"
                placeholder="Add meeting link, location, or other details"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeBulkScheduleModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={sendBulkInterviewInvitations}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={selectedDates.length === 0}
              >
                Schedule All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveCV;
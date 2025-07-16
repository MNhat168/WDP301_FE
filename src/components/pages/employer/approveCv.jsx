import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CVPreview from '../jobseeker/CVPreview';
import HeaderEmployer from "../../layout/headeremp";
import toastr from "toastr";

const ApproveCV = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
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

  // Update application status (reject only - accept goes through schedule modal)
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

      // Refresh applications
      fetchApplications();
    } catch (error) {
      toastr.error(error.message || "Status update failed");
      console.error("Update error:", error);
    }
  };

  const viewCVProfile = (application) => {
    setSelectedApplication(application);
  };

  // Close CV view
  const closeCVView = () => {
    setSelectedApplication(null);
  };

  // Open schedule modal
  const openScheduleModal = (applicationId) => {
    setSelectedApplicationId(applicationId);
    setShowScheduleModal(true);
    setSelectedDates([]);
    setScheduleData({ availableSlots: [], note: "" });
  };

  // Close schedule modal
  const closeScheduleModal = () => {
    setShowScheduleModal(false);
    setSelectedDates([]);
    setScheduleData({ availableSlots: [], note: "" });
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

  // Handle date selection
  const handleDateClick = (date) => {
    if (isDatePast(date)) return;

    const dateStr = formatDate(date);
    const existingIndex = selectedDates.findIndex(selected => 
      formatDate(selected.date) === dateStr
    );

    if (existingIndex >= 0) {
      // Remove date
      setSelectedDates(prev => prev.filter((_, index) => index !== existingIndex));
    } else {
      // Add date with default time slots
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

  // Send interview invitation
  const sendInterviewInvitation = async () => {
    if (selectedDates.length === 0) {
      toastr.error("Please select at least one available date");
      return;
    }

    const token = getAuthToken();
    try {
      const response = await fetch(
        `http://localhost:5000/api/applications/${selectedApplicationId}/schedule`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({
            availableSlots: selectedDates,
            note: scheduleData.note
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to send invitation");

      const data = await response.json();
      toastr.success("Interview invitation sent successfully");

      // Update application status to "accepted"
      await updateApplicationStatus(selectedApplicationId, "accepted");

      closeScheduleModal();
    } catch (error) {
      toastr.error(error.message || "Failed to send invitation");
      console.error("Invitation error:", error);
    }
  };

  // Calendar navigation
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Applications for: {jobDetails?.title || "Job"}
          </h1>
          <p className="text-gray-600 mt-2">
            {applications.length} application{applications.length !== 1 ? "s" : ""} received
          </p>
        </div>

        {/* Applications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((application) => (
            <div
              key={application._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {application.userId?.fullName || "Applicant"}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {application.userId?.email || "No email"}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${application.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : application.status === "accepted"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                    }`}
                >
                  {application.status.charAt(0).toUpperCase() +
                    application.status.slice(1)}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-gray-700">
                  Applied on:{" "}
                  {new Date(application.applicationDate).toLocaleDateString()}
                </p>
                <p className="text-gray-700">
                  CV Completion:{" "}
                  <span className="font-semibold">
                    {application.cvProfileId?.completionPercentage || 0}%
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => viewCVProfile(application)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  View CV
                </button>

                {application.status === "pending" && (
                  <>
                    <button
                      onClick={() => openScheduleModal(application._id)}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(application._id, "rejected")}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors text-sm"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {applications.length === 0 && (
          <div className="text-center py-12">
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
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No applications yet
            </h3>
            <p className="mt-1 text-gray-500">
              Applicants will appear here when they apply to this job.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate(`/employer/job/${jobId}`)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                View Job Details
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CV Profile Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">CV Profile</h2>
                <button
                  onClick={closeCVView}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <CVPreview
                cvData={selectedApplication.cvProfileId}
                template="modern"
              />
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal with Calendar */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Schedule Interview</h2>
            
            {/* Calendar */}
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
                {/* Empty cells for days before month starts */}
                {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, index) => (
                  <div key={index} className="p-2"></div>
                ))}
                
                {/* Days of the month */}
                {Array.from({ length: getDaysInMonth(currentDate) }).map((_, index) => {
                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), index + 1);
                  const isSelected = isDateSelected(date);
                  const isPast = isDatePast(date);
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleDateClick(date)}
                      disabled={isPast}
                      className={`p-2 text-sm rounded hover:bg-gray-100 ${
                        isSelected 
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

            <div className="flex justify-end gap-3">
              <button
                onClick={closeScheduleModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={sendInterviewInvitation}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={selectedDates.length === 0}
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveCV;
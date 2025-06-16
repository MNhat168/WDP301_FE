import React, { useEffect, useState, useCallback, useMemo } from "react";
import HeaderEmployer from "../../layout/headeremp";
import useBanCheck from "../admin/checkban";

const CompanyDetail = () => {
  const [companyData, setCompanyData] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    companyName: "",
    aboutUs: "",
    address: "",
    image: null,
  });
  const BanPopup = useBanCheck();

  const isNewCompany = !companyData || !companyData.com || Object.keys(companyData.com).length === 0 || !companyData.com._id;

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.accessToken) {
      console.error("User not logged in or access token is missing.");
      // If user is not logged in, we can assume no company profile.
      setCompanyData({ com: {} });
      return;
    }

    fetch("http://localhost:5000/api/companies/my-profile", {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${user.accessToken}`
      },
    })
      .then((response) => {
        if (response.status === 404) {
          return null; // Indicates company not found, which is a valid state for this page
        }
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data === null) {
          // Company not found, set state to show create form
          setCompanyData({ com: {} });
        } else {
          // Company found, populate data - Map to expected structure
          const company = data.result || data; // Handle both nested and direct response
          setCompanyData({ com: company });
          setEditFormData({
            companyName: company.companyName || "",
            aboutUs: company.aboutUs || "",
            address: company.address || "",
            image: null,
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching company profile:", error);
        // In case of any error, we'll assume no company profile exists 
        // and show the create view to prevent the user being stuck on the loader.
        setCompanyData({ com: {} });
      });
  };

  const handleEditSubmit = useCallback(async (event) => {
    event.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.accessToken) {
      console.error("User not logged in or access token is missing.");
      return;
    }

    const endpoint = isNewCompany 
      ? "http://localhost:5000/api/companies/" 
      : `http://localhost:5000/api/companies/${companyData.com.companyId}`;
      
    const method = isNewCompany ? "POST" : "PUT";

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: editFormData.companyName,
          aboutUs: editFormData.aboutUs,
          address: editFormData.address,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error:", response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCompanyData({ com: data.result });
      setIsEditModalOpen(false);
      fetchCompanyData(); // Re-fetch data to show the latest profile
      
    } catch (error) {
      console.error("Error saving company profile:", error);
    }
  }, [editFormData, companyData, isNewCompany]);

  const handleInputChange = useCallback((field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const openModalFor = useCallback((company = null) => {
    if (company) {
      // Editing an existing company
      setEditFormData({
        companyName: company.companyName || "",
        aboutUs: company.aboutUs || "",
        address: company.address || "",
        image: null,
      });
    } else {
      // Creating a new company
      setEditFormData({
        companyName: "",
        aboutUs: "",
        address: "",
        image: null,
      });
    }
    setIsEditModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  // Memoized EditModal to prevent re-creation on every render
  const EditModal = useMemo(() => {
    if (!isEditModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h3 className="text-xl font-semibold text-gray-900">
              {isNewCompany ? "Create Company Profile" : "Edit Company Profile"}
            </h3>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleEditSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={editFormData.companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter your company name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Description
                </label>
                <textarea
                  rows="4"
                  value={editFormData.aboutUs}
                  onChange={(e) => handleInputChange("aboutUs", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Describe your company, what you do, your mission..."
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Address
                </label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter your company's full address"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  📍 Example: 123 Nguyen Hue Street, District 1, Ho Chi Minh City
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleInputChange("image", e.target.files[0])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Upload your company logo or image (JPG, PNG, GIF)
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition duration-200"
              >
                {isNewCompany ? "Create Company" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }, [isEditModalOpen, isNewCompany, editFormData, handleEditSubmit, handleInputChange, closeModal]);

  if (!companyData) {
    return (
      <>
        {BanPopup}
        <div className="min-h-screen bg-gray-50">
          <HeaderEmployer />
          <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 80px)' }}>
            <div className="text-center">
              <div className="inline-flex items-center px-8 py-4 bg-white rounded-2xl shadow-lg">
                <svg className="animate-spin h-8 w-8 text-orange-500 mr-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-xl font-semibold text-gray-700">Loading Company Profile...</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {BanPopup}
      <div className="min-h-screen bg-gray-50">
        <HeaderEmployer />

        {isNewCompany ? (
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="mx-auto w-32 h-32 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-6">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-3">Welcome, Employer!</h1>
              <p className="text-gray-600 mb-8">
                It looks like you haven't set up your company profile yet. <br />
                Create one now to start posting jobs and attracting talent.
              </p>
              <button
                onClick={() => openModalFor()}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <span>Create Company Profile</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="relative pb-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
            {/* Banner Image */}
            <div className="h-64 md:h-80 bg-cover bg-center shadow-inner relative"
              style={{
                backgroundImage: `url(${'/assets/images/heading-6-1920x500.jpg'})`,
              }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            </div>

            {/* Main content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Floating Info Card */}
              <div className="-mt-20 sm:-mt-24 md:-mt-32">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                    {/* Company Logo */}
                    <div className="flex-shrink-0 relative">
                      <img
                        className="h-32 w-32 md:h-40 md:w-40 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-xl"
                        src={`http://localhost:5000${companyData.com.url || "/assets/images/default-image.jpg"}`}
                        alt="Company Logo"
                      />
                      <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg">
                        <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>

                    {/* Company Info */}
                    <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
                            {companyData.com.companyName}
                          </h1>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            Company ID: #{companyData.com._id?.slice(-8) || 'N/A'}
                          </p>
                        </div>
                        <button
                          onClick={() => openModalFor(companyData.com)}
                          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-200 transform hover:scale-105"
                        >
                          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Edit Profile
                        </button>
                      </div>

                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Status */}
                        <div className="flex items-center justify-center md:justify-start">
                          {companyData.com.status?.toLowerCase() === "active" ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                                <circle cx="4" cy="4" r="3" />
                              </svg>
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-red-400" fill="currentColor" viewBox="0 0 8 8">
                                <circle cx="4" cy="4" r="3" />
                              </svg>
                              Inactive
                            </span>
                          )}
                        </div>

                        {/* Location */}
                        <div className="flex items-center justify-center md:justify-start text-gray-600 dark:text-gray-300">
                          <svg className="h-5 w-5 mr-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium">{companyData.com.address}</span>
                        </div>

                        {/* Join Date */}
                        <div className="flex items-center justify-center md:justify-start text-gray-600 dark:text-gray-300">
                          <svg className="h-5 w-5 mr-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium">
                            Founded {new Date(companyData.com.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats & About Section */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Company Stats */}
                <div className="lg:col-span-1">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company Stats</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Status</span>
                        <span className={`font-medium ${companyData.com.status?.toLowerCase() === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                          {companyData.com.status?.charAt(0).toUpperCase() + companyData.com.status?.slice(1) || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Company ID</span>
                        <span className="font-mono text-sm text-gray-900 dark:text-white">
                          #{companyData.com._id?.slice(-8) || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Member Since</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {new Date(companyData.com.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {new Date(companyData.com.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* About Us */}
                <div className="lg:col-span-2">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-6">
                      <div className="h-8 w-1 bg-gradient-to-b from-orange-500 to-red-500 rounded-full mr-4"></div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">About {companyData.com.companyName}</h2>
                    </div>
                    <div className="text-gray-700 dark:text-gray-300 text-base leading-relaxed space-y-4">
                      {companyData.com.aboutUs ? (
                        companyData.com.aboutUs.split('\n').map((paragraph, index) => (
                          <p key={index} className="leading-7">{paragraph}</p>
                        ))
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">
                          No company description available. Click "Edit Profile" to add one.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {EditModal}
      </div>
    </>
  );
};

export default CompanyDetail;

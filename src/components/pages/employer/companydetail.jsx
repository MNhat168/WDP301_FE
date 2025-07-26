import React, { useEffect, useState, useCallback, useMemo } from "react";
import HeaderEmployer from "../../layout/headeremp";
import useBanCheck from "../admin/checkban";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const isNewCompany = !companyData || !companyData.com || Object.keys(companyData.com).length === 0 || !companyData.com._id;

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.accessToken) {
      console.error("User not logged in or access token is missing.");
      setCompanyData({ com: {} });
      return;
    }

    fetch("https://wdp301-lzse.onrender.com/api/companies/my-profile", {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${user.accessToken}`
      },
    })
      .then((response) => {
        if (response.status === 404) {
          return null;
        }
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data === null) {
          setCompanyData({ com: {} });
        } else {
          const company = data.result || data;
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
        setCompanyData({ com: {} });
      });
  };

  const uploadImage = useCallback(async (imageFile) => {
    if (!imageFile) return null;

    try {
      console.log('Uploaded file:', imageFile); // Fixed log
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.accessToken) {
        console.error("User not logged in or access token is missing.");
        return null;
      }

      const formData = new FormData();
      formData.append('images', imageFile); // Use the parameter directly

      const response = await fetch('https://wdp301-lzse.onrender.com/api/user/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Image upload failed');

      const data = await response.json();
      return data.result.images;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  }, []);

  const handleEditSubmit = useCallback(async (event) => {
    event.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.accessToken) {
      console.error("User not logged in or access token is missing.");
      return;
    }
    let imageUrl = companyData?.com?.url || '';
    if (editFormData.image) {
      const uploadedUrl = await uploadImage(editFormData.image);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    const endpoint = isNewCompany
      ? "https://wdp301-lzse.onrender.com/api/companies/"
      : `https://wdp301-lzse.onrender.com/api/companies/${companyData.com._id}`;

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
          url: imageUrl,  // Add image URL to request
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
  }, [editFormData, companyData, isNewCompany, uploadImage]);

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

  const EditModal = useMemo(() => {
    if (!isEditModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
          {/* Modal Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isNewCompany ? "Create your company page" : "Edit company page"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {isNewCompany
                  ? "Share your company story and attract top talent"
                  : "Keep your company information up to date"}
              </p>
            </div>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-full"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Content */}
          <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
            <form onSubmit={handleEditSubmit} className="p-6">
              {/* Company Logo Section */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Logo
                </label>
                <div className="flex items-start space-x-6">
                  {/* Logo Preview */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      {editFormData.image ? (
                        <img
                          src={URL.createObjectURL(editFormData.image)}
                          alt="Company logo preview"
                          className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200 shadow-md"
                        />
                      ) : companyData?.com?.url ? (
                        <img
                          src={companyData.com.url}
                          alt="Current company logo"
                          className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200 shadow-md"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      )}
                      <label className="absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-1.5 shadow-lg cursor-pointer">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleInputChange("image", e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Logo Upload Info */}
                  <div className="flex-1">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Upload a high-quality logo that represents your company.
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Recommended: Square image, at least 300x300px</li>
                        <li>• PNG or JPG format</li>
                        <li>• Max file size: 10MB</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Basic Information */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={editFormData.companyName}
                      onChange={(e) => handleInputChange("companyName", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg font-medium"
                      placeholder="Enter your company name"
                      required
                    />
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Industry *
                    </label>
                    <select
                      value={editFormData.industry || ""}
                      onChange={(e) => handleInputChange("industry", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select industry</option>
                      <option value="Technology">Technology</option>
                      <option value="Finance">Finance</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Retail">Retail</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Hospitality">Hospitality</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Company Size */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Company Size *
                    </label>
                    <select
                      value={editFormData.companySize || ""}
                      onChange={(e) => handleInputChange("companySize", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select size</option>
                      <option value="1-10 employees">1-10 employees</option>
                      <option value="11-50 employees">11-50 employees</option>
                      <option value="51-200 employees">51-200 employees</option>
                      <option value="201-500 employees">201-500 employees</option>
                      <option value="501-1000 employees">501-1000 employees</option>
                      <option value="1001-5000 employees">1001-5000 employees</option>
                      <option value="5001-10,000 employees">5001-10,000 employees</option>
                      <option value="10,001+ employees">10,001+ employees</option>
                    </select>
                  </div>

                  {/* Website */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Website
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <input
                        type="url"
                        value={editFormData.website || ""}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="https://www.example.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Description */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  About Your Company
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Company Description *
                  </label>
                  <textarea
                    rows="6"
                    value={editFormData.aboutUs}
                    onChange={(e) => handleInputChange("aboutUs", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Tell potential employees about your company's mission, values, culture, and what makes it a great place to work. Be authentic and engaging!"
                    required
                  />
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs text-gray-500">
                      {editFormData.aboutUs.length}/2000 characters
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Company Address *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={editFormData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="123 Nguyen Hue Street, District 1, Ho Chi Minh City"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={editFormData.phone || ""}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="+84 123 456 789"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={editFormData.email || ""}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="contact@company.com"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Social Media
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* LinkedIn */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      LinkedIn
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </div>
                      <input
                        type="url"
                        value={editFormData.linkedin || ""}
                        onChange={(e) => handleInputChange("linkedin", e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="https://linkedin.com/company/yourcompany"
                      />
                    </div>
                  </div>

                  {/* Facebook */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Facebook
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                        </svg>
                      </div>
                      <input
                        type="url"
                        value={editFormData.facebook || ""}
                        onChange={(e) => handleInputChange("facebook", e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="https://facebook.com/yourcompany"
                      />
                    </div>
                  </div>

                  {/* Twitter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Twitter
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                        </svg>
                      </div>
                      <input
                        type="url"
                        value={editFormData.twitter || ""}
                        onChange={(e) => handleInputChange("twitter", e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="https://twitter.com/yourcompany"
                      />
                    </div>
                  </div>

                  {/* Instagram */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Instagram
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-[#E1306C]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </div>
                      <input
                        type="url"
                        value={editFormData.instagram || ""}
                        onChange={(e) => handleInputChange("instagram", e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="https://instagram.com/yourcompany"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">Tips for a great company page</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Use a professional, high-quality logo and cover image</li>
                      <li>• Write a compelling description that showcases your company culture</li>
                      <li>• Keep your information accurate and up-to-date</li>
                      <li>• Highlight what makes your company unique</li>
                      <li>• Include links to your social media profiles</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                >
                  {isNewCompany ? (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create Company Page
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }, [isEditModalOpen, isNewCompany, editFormData, handleEditSubmit, handleInputChange, closeModal, companyData]);

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
                        src={companyData.com.url || "/assets/images/default-image.jpg"}
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

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
import HeaderEmployer from "../../layout/headeremp";
import useBanCheck from "../admin/checkban";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const CreateJob = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    categoryId: "",
    description: "",
    location: "",
    salary: 0,
    experienceYears: 0,
    endDate: "",
    applicantCount:0,
  });
  const [message, setMessage] = useState(null);
  const [position, setPosition] = useState([0, 0]);
  const [isLocationFetched, setIsLocationFetched] = useState(false);
  const BanPopup = useBanCheck();
  const [location, setLocation] = useState("");

  // Custom select states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://localhost:5000/api/categories/", {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setCategories(data.result.categories || []);
        } else {
          setMessage({ type: "error", text: "Failed to fetch categories." });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage({ type: "error", text: "An error occurred while fetching data." });
      }
    }

    fetchData();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
          setIsLocationFetched(true);
        },
        (error) => {
          console.error(error);
          setPosition([21.0285, 105.8542]); // Default to Hanoi
          setIsLocationFetched(true);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setPosition([21.0285, 105.8542]); // Default to Hanoi
      setIsLocationFetched(true);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.relative')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Custom select helper functions
  const filteredCategories = categories.filter(category =>
    category.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setFormData(prev => ({
      ...prev,
      categoryId: category._id,
    }));
    setSearchTerm("");
    setIsDropdownOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCategory) {
      setMessage({ type: "error", text: "Please select a job category." });
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));

    // Prepare job data to match backend schema
    const cleanedData = {
      companyId: user.userData?.companyInfo?._id,
      categoryId: formData.categoryId,
      title: formData.title,
      description: formData.description,
      location: location || `${position[0]}, ${position[1]}`,
      salary: parseInt(formData.salary) || 0,
      experienceYears: parseInt(formData.experienceYears) || 0,
      applicantCount :formData.applicantCount,
      endDate: formData.endDate
    };

    try {
      const response = await fetch("http://localhost:5000/api/jobs/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify(cleanedData),
        credentials: "include",
      });

      if (response.status === 200) {
        const data = await response.json();
        setMessage({ type: "success", text: "Job posted successfully!" });
        // Reset form
        setFormData({
          title: "",
          categoryId: "",
          description: "",
          location: "",
          salary: 0,
          experienceYears: 0,
          endDate: "",
          applicantCount: 0,
        });
        setSelectedCategory(null);
        setSearchTerm("");
      } else {
        const errorData = await response.json();
        setMessage({ type: "error", text: errorData.message || "Failed to create job." });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage({ type: "error", text: "An error occurred while sending the request." });
    }
  };

  const SearchBar = () => {
    const map = useMap();

    useEffect(() => {
      const provider = new OpenStreetMapProvider();
      const searchControl = new GeoSearchControl({
        provider,
        style: "bar",
        autoClose: true,
        showMarker: true,
        keepResult: true,
      });

      map.addControl(searchControl);

      map.on("geosearch/showlocation", (e) => {
        const { x, y, label } = e.location;
        setPosition([y, x]);
        setLocation(label);
      });

      return () => {
        map.removeControl(searchControl);
      };
    }, [map]);

    return null;
  };

  if (!isLocationFetched) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center px-8 py-4 bg-white rounded-2xl shadow-lg">
            <svg className="animate-spin h-8 w-8 text-blue-600 mr-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-xl font-semibold text-gray-700">Loading location...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {BanPopup}
      <HeaderEmployer />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">Post a New Job</h1>
          <p className="text-xl text-blue-100">Find the perfect candidate for your team</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">

          {/* Success/Error Message */}
          {message && (
            <div className={`mb-8 p-4 rounded-2xl shadow-lg ${message.type === "success"
              ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800"
              : "bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-800"
              }`}>
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${message.type === "success" ? "bg-green-200" : "bg-red-200"
                  }`}>
                  {message.type === "success" ? (
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="font-semibold">{message.text}</span>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <form onSubmit={handleSubmit} className="p-8 space-y-8">

              {/* Basic Information Section */}
              <div className="space-y-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
                </div>

                {/* Job Title */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Senior Software Developer"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all duration-300"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Job Category */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Job Category *
                    </label>
                    <div className="relative">
                      {/* Custom Select Button */}
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all duration-300 bg-white text-left flex items-center justify-between"
                      >
                        <span className={selectedCategory ? "text-gray-900" : "text-gray-500"}>
                          {selectedCategory ? selectedCategory.categoryName : "Select Category"}
                        </span>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Dropdown */}
                      {isDropdownOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-hidden">
                          {/* Search Input */}
                          <div className="p-3 border-b border-gray-100">
                            <input
                              type="text"
                              placeholder="Search categories..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              autoFocus
                            />
                          </div>

                          {/* Options List */}
                          <div className="max-h-48 overflow-y-auto">
                            {filteredCategories.length > 0 ? (
                              filteredCategories.map((category) => (
                                <button
                                  key={category.categoryId}
                                  type="button"
                                  onClick={() => handleCategorySelect(category)}
                                  className="w-full px-4 py-3 text-left hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 border-b border-gray-50 last:border-b-0"
                                >
                                  {category.categoryName}
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-gray-500 text-center">
                                No categories found
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Experience Years */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Experience Required (Years)
                    </label>
                    <input
                      type="number"
                      name="experienceYears"
                      value={formData.experienceYears}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="e.g. 3"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Applicants count:
                    </label>
                    <input
                      type="number"
                      name="applicantCount"
                      value={formData.applicantCount}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="e.g. 3"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Salary */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Salary (VND)
                  </label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="Enter salary amount"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all duration-300"
                  />
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Application End Date *
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Location Section */}
              <div className="space-y-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Job Location</h2>
                </div>

                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <MapContainer
                    center={position}
                    zoom={12}
                    style={{ width: "100%", height: "300px" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={position}>
                      <Popup>Job Location</Popup>
                    </Marker>
                    <SearchBar />
                  </MapContainer>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Job Description</h2>
                </div>

                <div className="space-y-2">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="6"
                    placeholder="Provide a detailed description of the job role, responsibilities, and what you're looking for in a candidate..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all duration-300 resize-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-6">
                <button
                  type="submit"
                  className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                    </svg>
                    <span>Post Job</span>
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateJob;
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
  const [company, setCompany] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    cateID: "",
    description: "",
    requirements: [""],
    benefits: [""],
    location: "",
    jobType: "full-time",
    salary: {
      min: "",
      max: "",
      currency: "VND"
    },
    experience: "",
    education: "",
    skills: [""],
    deadline: "",
  });
  const [message, setMessage] = useState(null);
  const [position, setPosition] = useState([0, 0]);
  const [isLocationFetched, setIsLocationFetched] = useState(false);
  const BanPopup = useBanCheck();
  const [location, setLocation] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://localhost:5000/api/jobs/categories", {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('salary.')) {
      const salaryField = name.split('.')[1];
      setFormData((prevData) => ({
        ...prevData,
        salary: {
          ...prevData.salary,
          [salaryField]: value
        }
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleArrayChange = (index, value, field) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ""]
    }));
  };

  const removeArrayField = (index, field) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Filter out empty strings from arrays
    const cleanedData = {
      ...formData,
      requirements: formData.requirements.filter(req => req.trim() !== ""),
      benefits: formData.benefits.filter(benefit => benefit.trim() !== ""),
      skills: formData.skills.filter(skill => skill.trim() !== ""),
      location: location || `${position[0]}, ${position[1]}`,
      salary: {
        min: parseInt(formData.salary.min),
        max: parseInt(formData.salary.max),
        currency: formData.salary.currency
      }
    };

    try {
      const response = await fetch("http://localhost:5000/api/job/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedData),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: "success", text: "Job posted successfully!" });
        // Reset form
        setFormData({
          title: "",
          cateID: "",
          description: "",
          requirements: [""],
          benefits: [""],
          location: "",
          jobType: "full-time",
          salary: { min: "", max: "", currency: "VND" },
          experience: "",
          education: "",
          skills: [""],
          deadline: "",
        });
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
            <div className={`mb-8 p-4 rounded-2xl shadow-lg ${
              message.type === "success" 
                ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800" 
                : "bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-800"
            }`}>
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                  message.type === "success" ? "bg-green-200" : "bg-red-200"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Job Category */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Job Category *
                    </label>
                    <select
                      name="cateID"
                      value={formData.cateID}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all duration-300"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.categoryId} value={category.categoryId}>
                          {category.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Job Type */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Job Type *
                    </label>
                    <select
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all duration-300"
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                      <option value="remote">Remote</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Experience */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Experience Required
                    </label>
                    <input
                      type="text"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      placeholder="e.g. 3-5 years"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all duration-300"
                    />
                  </div>

                  {/* Education */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Education Level
                    </label>
                    <select
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all duration-300"
                    >
                      <option value="">Select Education Level</option>
                      <option value="High School">High School</option>
                      <option value="Associate Degree">Associate Degree</option>
                      <option value="Bachelor's Degree">Bachelor's Degree</option>
                      <option value="Master's Degree">Master's Degree</option>
                      <option value="PhD">PhD</option>
                    </select>
                  </div>
                </div>

                {/* Salary Range */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Salary Range
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <input
                        type="number"
                        name="salary.min"
                        value={formData.salary.min}
                        onChange={handleInputChange}
                        placeholder="Minimum salary"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        name="salary.max"
                        value={formData.salary.max}
                        onChange={handleInputChange}
                        placeholder="Maximum salary"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <select
                        name="salary.currency"
                        value={formData.salary.currency}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all duration-300"
                      >
                        <option value="VND">VND</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Deadline */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Application Deadline *
                  </label>
                  <input
                    type="datetime-local"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Requirements Section */}
              <div className="space-y-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Requirements</h2>
                </div>

                <div className="space-y-4">
                  {formData.requirements.map((requirement, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={requirement}
                        onChange={(e) => handleArrayChange(index, e.target.value, 'requirements')}
                        placeholder={`Requirement ${index + 1}`}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-50 focus:border-green-500 transition-all duration-300"
                      />
                      {formData.requirements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField(index, 'requirements')}
                          className="px-4 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('requirements')}
                    className="w-full px-4 py-3 border-2 border-dashed border-green-300 rounded-xl text-green-600 hover:border-green-400 hover:bg-green-50 transition-all duration-300 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Add Requirement
                  </button>
                </div>
              </div>

              {/* Benefits Section */}
              <div className="space-y-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Benefits</h2>
                </div>

                <div className="space-y-4">
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => handleArrayChange(index, e.target.value, 'benefits')}
                        placeholder={`Benefit ${index + 1}`}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-50 focus:border-purple-500 transition-all duration-300"
                      />
                      {formData.benefits.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField(index, 'benefits')}
                          className="px-4 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('benefits')}
                    className="w-full px-4 py-3 border-2 border-dashed border-purple-300 rounded-xl text-purple-600 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Add Benefit
                  </button>
                </div>
              </div>

              {/* Skills Section */}
              <div className="space-y-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Required Skills</h2>
                </div>

                <div className="space-y-4">
                  {formData.skills.map((skill, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => handleArrayChange(index, e.target.value, 'skills')}
                        placeholder={`Skill ${index + 1}`}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-yellow-50 focus:border-yellow-500 transition-all duration-300"
                      />
                      {formData.skills.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField(index, 'skills')}
                          className="px-4 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('skills')}
                    className="w-full px-4 py-3 border-2 border-dashed border-yellow-300 rounded-xl text-yellow-600 hover:border-yellow-400 hover:bg-yellow-50 transition-all duration-300 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Add Skill
                  </button>
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
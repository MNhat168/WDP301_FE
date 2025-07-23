import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../layout/adminsidebar';
import { FiPackage, FiEdit3, FiTrash2, FiPlus, FiX, FiDollarSign, FiSettings, FiZap, FiStar, FiClock, FiCheck, FiAlertCircle } from 'react-icons/fi';

const PackageManagement = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);
    const [formData, setFormData] = useState({
        packageName: '',
        description: '',
        basePrice: '',
        pricing: { monthly: '', yearly: '', discount: '' },
        features: '',
        duration: '',
        packageType: '',
        limits: {
            monthlyApplications: 0,
            favoriteJobs: 0,
            cvProfiles: 0,
            jobAlerts: 0
        },
        maxJobPostings: '',
        maxApplications: '',
        isActive: true,
        features_config: {
            canApplyUnlimited: false,
            prioritySupport: false,
            advancedFilters: false,
            resumeBuilder: false
        },
        promotions: {
            isOnSale: false,
            freeTrialDays: 0,
            saleDiscount: 0,
            isPopular: false
        }
    });
    const navigate = useNavigate();
    const [packages, setPackages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('http://localhost:5000/api/subscriptions/plans', {
                withCredentials: true
            });

            console.log('Raw response:', response);
            setPackages(response.data?.result || []);

        } catch (error) {
            console.error('Error fetching packages:', error);
            setError('Failed to load packages');
            setPackages([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const features = formData.features.split('\n').map(f => f.trim()).filter(Boolean);
            const pricing = {
                monthly: Number(formData.pricing.monthly),
                yearly: Number(formData.pricing.yearly),
                discount: Number(formData.pricing.discount)
            };
            const body = {
                packageName: formData.packageName,
                description: formData.description,
                basePrice: Number(formData.basePrice),
                pricing,
                features,
                duration: Number(formData.duration),
                packageType: formData.packageType,
                limits: formData.limits,
                maxJobPostings: Number(formData.maxJobPostings),
                maxApplications: Number(formData.maxApplications),
                isActive: !!formData.isActive,
                features_config: formData.features_config,
                promotions: formData.promotions
            };
            if (editingPackage) {
                await axios.put(`http://localhost:5000/api/subscriptions/admin/${editingPackage._id || editingPackage.packageId}`,
                    body,
                    { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
                );
            } else {
                await axios.post('http://localhost:5000/api/subscriptions/admin',
                    body,
                    { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
                );
            }
            setIsModalOpen(false);
            setEditingPackage(null);
            setFormData({
                packageName: '',
                description: '',
                basePrice: '',
                pricing: { monthly: '', yearly: '', discount: '' },
                features: '',
                duration: '',
                packageType: '',
                limits: { monthlyApplications: 0, favoriteJobs: 0, cvProfiles: 0, jobAlerts: 0 },
                maxJobPostings: '',
                maxApplications: '',
                isActive: true,
                features_config: { canApplyUnlimited: false, prioritySupport: false, advancedFilters: false, resumeBuilder: false },
                promotions: { isOnSale: false, freeTrialDays: 0, saleDiscount: 0, isPopular: false }
            });
            fetchPackages();
        } catch (error) {
            console.error('Error saving package:', error);
            setError(error.response?.data?.message || 'Error saving package');
        }
    };

    const handleDelete = async (packageId) => {
        if (window.confirm('Are you sure you want to delete this package?')) {
            try {
                await axios.delete(`http://localhost:5000/api/subscriptions/admin/${packageId}`, {
                    withCredentials: true
                });
                fetchPackages();
            } catch (error) {
                console.error('Error deleting package:', error);
                setError('Failed to delete package');
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        // Handle limits fields
        if (name.startsWith('limits.')) {
            const key = name.replace('limits.', '');
            setFormData(prev => ({
                ...prev,
                limits: {
                    ...prev.limits,
                    [key]: value === '' ? '' : Number(value)
                }
            }));
            return;
        }
        
        // Handle features_config fields
        if (name.startsWith('features_config.')) {
            const key = name.replace('features_config.', '');
            setFormData(prev => ({
                ...prev,
                features_config: {
                    ...prev.features_config,
                    [key]: type === 'checkbox' ? checked : value
                }
            }));
            return;
        }
        
        // Handle promotions fields
        if (name.startsWith('promotions.')) {
            const key = name.replace('promotions.', '');
            setFormData(prev => ({
                ...prev,
                promotions: {
                    ...prev.promotions,
                    [key]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
                }
            }));
            return;
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEdit = (pkg) => {
        setEditingPackage(pkg);
        setFormData({
            packageName: pkg.packageName || '',
            description: pkg.description || '',
            basePrice: pkg.basePrice || '',
            pricing: pkg.pricing || { monthly: '', yearly: '', discount: '' },
            features: Array.isArray(pkg.features) ? pkg.features.join('\n') : '',
            duration: pkg.duration || '',
            packageType: pkg.packageType || '',
            limits: pkg.limits || { monthlyApplications: 0, favoriteJobs: 0, cvProfiles: 0, jobAlerts: 0 },
            maxJobPostings: pkg.maxJobPostings || '',
            maxApplications: pkg.maxApplications || '',
            isActive: pkg.isActive !== undefined ? pkg.isActive : true,
            features_config: pkg.features_config || { canApplyUnlimited: false, prioritySupport: false, advancedFilters: false, resumeBuilder: false },
            promotions: pkg.promotions || { isOnSale: false, freeTrialDays: 0, saleDiscount: 0, isPopular: false }
        });
        setIsModalOpen(true);
    };
    
    return (
        <>
            <AdminSidebar />
            <div className="flex-1 ml-64 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                {/* Enhanced Header Section */}
                <div className="relative overflow-hidden bg-white shadow-xl border-b border-gray-100">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-5"></div>
                    <div className="relative py-8 px-8">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    <FiPackage className="text-white text-xl" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                        Package Management
                                    </h1>
                                    <p className="text-gray-600 mt-1">Create and manage subscription packages with ease</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setEditingPackage(null);
                                    setFormData({
                                        packageName: '',
                                        description: '',
                                        basePrice: '',
                                        pricing: { monthly: '', yearly: '', discount: '' },
                                        features: '',
                                        duration: '',
                                        packageType: '',
                                        limits: { monthlyApplications: 0, favoriteJobs: 0, cvProfiles: 0, jobAlerts: 0 },
                                        maxJobPostings: '',
                                        maxApplications: '',
                                        isActive: true,
                                        features_config: { canApplyUnlimited: false, prioritySupport: false, advancedFilters: false, resumeBuilder: false },
                                        promotions: { isOnSale: false, freeTrialDays: 0, saleDiscount: 0, isPopular: false }
                                    });
                                    setIsModalOpen(true);
                                }}
                                className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
                            >
                                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-200"></div>
                                <FiPlus className="mr-2 text-lg" />
                                Add New Package
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    {/* Enhanced Error Message */}
                    {error && (
                        <div className="mb-8 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 p-6 rounded-xl shadow-sm">
                            <div className="flex items-center">
                                <FiAlertCircle className="h-6 w-6 text-red-500 mr-3" />
                                <span className="text-red-800 font-medium">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Enhanced Loading State */}
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="text-center">
                                <div className="relative w-16 h-16 mx-auto mb-6">
                                    <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                                </div>
                                <p className="text-gray-600 text-lg">Loading packages...</p>
                            </div>
                        </div>
                    ) : (
                        /* Enhanced Package List */
                        <div className="">
                            {packages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                                        <FiPackage className="w-12 h-12 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No packages found</h3>
                                    <p className="text-gray-500 mb-6">Create your first package to get started</p>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
                                    >
                                        Create Package
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {packages.map((pkg) => (
                                        <div key={pkg._id || pkg.packageId} className="group relative bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                                            {/* Package Header */}
                                            <div className="relative p-6 bg-gradient-to-br from-blue-50 to-purple-50">
                                                {/* Badges */}
                                                <div className="absolute top-4 right-4 flex gap-2">
                                                    {pkg.isPopular && (
                                                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                                            <FiStar className="inline w-3 h-3 mr-1" />
                                                            Popular
                                                        </span>
                                                    )}
                                                    {pkg.promotions?.isOnSale && (
                                                        <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                                            <FiZap className="inline w-3 h-3 mr-1" />
                                                            Sale
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Package Icon & Title */}
                                                <div className="flex items-start space-x-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                                                        <FiPackage className="text-white text-xl" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-xl font-bold text-gray-900 truncate">{pkg.packageName}</h3>
                                                        <p className="text-sm text-gray-600 mt-1">{pkg.packageType}</p>
                                                    </div>
                                                </div>

                                                {/* Pricing */}
                                                <div className="mt-4 flex items-baseline space-x-2">
                                                    <span className="text-3xl font-bold text-gray-900">
                                                        {pkg.pricing?.monthly === 0 ? 'Free' : `$${pkg.pricing?.monthly}`}
                                                    </span>
                                                    {pkg.pricing?.monthly > 0 && <span className="text-gray-500">/month</span>}
                                                    {pkg.pricing?.yearly > 0 && (
                                                        <span className="text-sm text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                                                            Save ${((pkg.pricing.monthly * 12) - pkg.pricing.yearly).toFixed(0)}/year
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Package Body */}
                                            <div className="p-6">
                                                {/* Description */}
                                                <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-2">{pkg.description}</p>

                                                {/* Limits Pills */}
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {pkg.limits?.monthlyApplications !== undefined && (
                                                        <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                            <FiClock className="w-3 h-3 mr-1" />
                                                            {pkg.limits.monthlyApplications === -1 ? '∞' : pkg.limits.monthlyApplications} applications
                                                        </span>
                                                    )}
                                                    {pkg.limits?.favoriteJobs !== undefined && (
                                                        <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                                            <FiStar className="w-3 h-3 mr-1" />
                                                            {pkg.limits.favoriteJobs === -1 ? '∞' : pkg.limits.favoriteJobs} favorites
                                                        </span>
                                                    )}
                                                    {pkg.limits?.cvProfiles !== undefined && (
                                                        <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                                            <FiSettings className="w-3 h-3 mr-1" />
                                                            {pkg.limits.cvProfiles === -1 ? '∞' : pkg.limits.cvProfiles} CVs
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Features */}
                                                <div className="mb-6">
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Features</h4>
                                                    <ul className="space-y-1">
                                                        {pkg.features?.slice(0, 4).map((feature, idx) => (
                                                            <li key={idx} className="flex items-center text-sm text-gray-600">
                                                                <FiCheck className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                                                <span className="line-clamp-1">{feature}</span>
                                                            </li>
                                                        ))}
                                                        {pkg.features?.length > 4 && (
                                                            <li className="text-xs text-gray-400 ml-6">
                                                                +{pkg.features.length - 4} more features
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>

                                                {/* Promotions */}
                                                {(pkg.promotions?.freeTrialDays > 0 || pkg.pricing?.discount > 0) && (
                                                    <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                                                        {pkg.promotions?.freeTrialDays > 0 && (
                                                            <p className="text-sm text-green-700 font-medium flex items-center">
                                                                <FiZap className="w-4 h-4 mr-1" />
                                                                {pkg.promotions.freeTrialDays} days free trial
                                                            </p>
                                                        )}
                                                        {pkg.pricing?.discount > 0 && (
                                                            <p className="text-sm text-blue-700 font-medium flex items-center">
                                                                <FiDollarSign className="w-4 h-4 mr-1" />
                                                                Save {pkg.pricing.discount}% with yearly plan
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => handleEdit(pkg)}
                                                        className="flex-1 group relative bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 hover:from-blue-100 hover:to-indigo-100 font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center border border-blue-200 hover:border-blue-300"
                                                    >
                                                        <FiEdit3 className="mr-2 text-sm group-hover:scale-110 transition-transform" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(pkg._id || pkg.packageId)}
                                                        className="flex-1 group relative bg-gradient-to-r from-red-50 to-pink-50 text-red-700 hover:from-red-100 hover:to-pink-100 font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center border border-red-200 hover:border-red-300"
                                                    >
                                                        <FiTrash2 className="mr-2 text-sm group-hover:scale-110 transition-transform" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Status Indicator */}
                                            <div className={`absolute top-0 left-0 w-full h-1 ${pkg.isActive ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-gray-300'}`}></div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Enhanced Modal */}
                    {isModalOpen && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden animate-slideUp">
                                {/* Modal Header */}
                                <div className="relative px-8 py-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
                                    <div className="absolute inset-0 bg-black/10"></div>
                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                                {editingPackage ? <FiEdit3 className="text-xl" /> : <FiPlus className="text-xl" />}
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold">
                                                    {editingPackage ? 'Edit Package' : 'Create New Package'}
                                                </h2>
                                                <p className="text-blue-100 text-sm">
                                                    {editingPackage ? 'Modify package details' : 'Add a new subscription package'}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setIsModalOpen(false)}
                                            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors duration-200"
                                        >
                                            <FiX className="text-xl" />
                                        </button>
                                    </div>
                                </div>

                                {/* Modal Body */}
                                <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
                                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                                        {/* Section: Basic Info */}
                                        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200">
                                            <div className="flex items-center space-x-3 mb-6">
                                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                                    <FiPackage className="text-white text-sm" />
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-800">Basic Information</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                <div className="lg:col-span-1">
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Package Name</label>
                                                    <input 
                                                        type="text" 
                                                        name="packageName" 
                                                        value={formData.packageName} 
                                                        onChange={handleInputChange} 
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                                                        placeholder="e.g., Premium Plan"
                                                        required 
                                                    />
                                                </div>
                                                <div className="lg:col-span-1">
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Package Type</label>
                                                    <input 
                                                        type="text" 
                                                        name="packageType" 
                                                        value={formData.packageType} 
                                                        onChange={handleInputChange} 
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                                                        placeholder="e.g., Professional"
                                                        required 
                                                    />
                                                </div>
                                                <div className="lg:col-span-1">
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Base Price ($)</label>
                                                    <input 
                                                        type="number" 
                                                        name="basePrice" 
                                                        value={formData.basePrice} 
                                                        onChange={handleInputChange} 
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                                                        placeholder="99"
                                                    />
                                                </div>
                                                <div className="lg:col-span-1">
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (days)</label>
                                                    <input 
                                                        type="number" 
                                                        name="duration" 
                                                        value={formData.duration} 
                                                        onChange={handleInputChange} 
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                                                        placeholder="30"
                                                    />
                                                </div>
                                                <div className="lg:col-span-1">
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Max Job Postings</label>
                                                    <input 
                                                        type="number" 
                                                        name="maxJobPostings" 
                                                        value={formData.maxJobPostings} 
                                                        onChange={handleInputChange} 
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                                                        placeholder="10"
                                                    />
                                                </div>
                                                <div className="lg:col-span-1">
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Max Applications</label>
                                                    <input 
                                                        type="number" 
                                                        name="maxApplications" 
                                                        value={formData.maxApplications} 
                                                        onChange={handleInputChange} 
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                                                        placeholder="50"
                                                    />
                                                </div>
                                                <div className="lg:col-span-3 flex items-center space-x-3 pt-4">
                                                    <input 
                                                        type="checkbox" 
                                                        name="isActive" 
                                                        checked={formData.isActive} 
                                                        onChange={e => setFormData(f => ({ ...f, isActive: e.target.checked }))} 
                                                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                                                    />
                                                    <label className="text-sm font-medium text-gray-700">Package is active and available for purchase</label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section: Description & Features */}
                                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                                            <div className="flex items-center space-x-3 mb-6">
                                                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                                    <FiEdit3 className="text-white text-sm" />
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-800">Description & Features</h3>
                                            </div>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Package Description</label>
                                                    <textarea 
                                                        name="description" 
                                                        value={formData.description} 
                                                        onChange={handleInputChange} 
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200" 
                                                        rows="4" 
                                                        placeholder="Describe what this package offers..."
                                                        required 
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Features (one per line)</label>
                                                    <textarea 
                                                        name="features" 
                                                        value={formData.features} 
                                                        onChange={handleInputChange} 
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200" 
                                                        rows="4" 
                                                        placeholder="Unlimited job applications, Priority support, Advanced search filters"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section: Pricing */}
                                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                                            <div className="flex items-center space-x-3 mb-6">
                                                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                                    <FiDollarSign className="text-white text-sm" />
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-800">Pricing Structure</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Price ($)</label>
                                                    <input 
                                                        type="number" 
                                                        value={formData.pricing.monthly} 
                                                        onChange={e => setFormData(f => ({ ...f, pricing: { ...f.pricing, monthly: e.target.value } }))} 
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200" 
                                                        placeholder="29"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Yearly Price ($)</label>
                                                    <input 
                                                        type="number" 
                                                        value={formData.pricing.yearly} 
                                                        onChange={e => setFormData(f => ({ ...f, pricing: { ...f.pricing, yearly: e.target.value } }))} 
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200" 
                                                        placeholder="299"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Yearly Discount (%)</label>
                                                    <input 
                                                        type="number" 
                                                        value={formData.pricing.discount} 
                                                        onChange={e => setFormData(f => ({ ...f, pricing: { ...f.pricing, discount: e.target.value } }))} 
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200" 
                                                        placeholder="15"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section: Limits & Config */}
                                        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
                                            <div className="flex items-center space-x-3 mb-6">
                                                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                                                    <FiSettings className="text-white text-sm" />
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-800">Usage Limits & Configuration</h3>
                                            </div>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-4">Usage Limits</label>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                                                            <span className="text-sm font-medium text-gray-700">Monthly Applications</span>
                                                            <input 
                                                                type="number" 
                                                                name="limits.monthlyApplications" 
                                                                value={formData.limits.monthlyApplications} 
                                                                onChange={handleInputChange} 
                                                                className="w-20 px-3 py-1 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200" 
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                                                            <span className="text-sm font-medium text-gray-700">Favorite Jobs</span>
                                                            <input 
                                                                type="number" 
                                                                name="limits.favoriteJobs" 
                                                                value={formData.limits.favoriteJobs} 
                                                                onChange={handleInputChange} 
                                                                className="w-20 px-3 py-1 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200" 
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                                                            <span className="text-sm font-medium text-gray-700">CV Profiles</span>
                                                            <input 
                                                                type="number" 
                                                                name="limits.cvProfiles" 
                                                                value={formData.limits.cvProfiles} 
                                                                onChange={handleInputChange} 
                                                                className="w-20 px-3 py-1 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200" 
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                                                            <span className="text-sm font-medium text-gray-700">Job Alerts</span>
                                                            <input 
                                                                type="number" 
                                                                name="limits.jobAlerts" 
                                                                value={formData.limits.jobAlerts} 
                                                                onChange={handleInputChange} 
                                                                className="w-20 px-3 py-1 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200" 
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-2">Use -1 for unlimited</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-4">Advanced Features</label>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                                                            <span className="text-sm font-medium text-gray-700">Unlimited Applications</span>
                                                            <input 
                                                                type="checkbox" 
                                                                name="features_config.canApplyUnlimited" 
                                                                checked={formData.features_config.canApplyUnlimited} 
                                                                onChange={handleInputChange} 
                                                                className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded transition-all duration-200"
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                                                            <span className="text-sm font-medium text-gray-700">Priority Support</span>
                                                            <input 
                                                                type="checkbox" 
                                                                name="features_config.prioritySupport" 
                                                                checked={formData.features_config.prioritySupport} 
                                                                onChange={handleInputChange} 
                                                                className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded transition-all duration-200"
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                                                            <span className="text-sm font-medium text-gray-700">Advanced Filters</span>
                                                            <input 
                                                                type="checkbox" 
                                                                name="features_config.advancedFilters" 
                                                                checked={formData.features_config.advancedFilters} 
                                                                onChange={handleInputChange} 
                                                                className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded transition-all duration-200"
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                                                            <span className="text-sm font-medium text-gray-700">Resume Builder</span>
                                                            <input 
                                                                type="checkbox" 
                                                                name="features_config.resumeBuilder" 
                                                                checked={formData.features_config.resumeBuilder} 
                                                                onChange={handleInputChange} 
                                                                className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded transition-all duration-200"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section: Promotions */}
                                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-200">
                                            <div className="flex items-center space-x-3 mb-6">
                                                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                                                    <FiZap className="text-white text-sm" />
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-800">Promotions & Special Offers</h3>
                                            </div>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-4">Promotional Settings</label>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                                                            <span className="text-sm font-medium text-gray-700">Mark as Popular</span>
                                                            <input 
                                                                type="checkbox" 
                                                                name="promotions.isPopular" 
                                                                checked={formData.promotions.isPopular} 
                                                                onChange={handleInputChange} 
                                                                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-all duration-200"
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                                                            <span className="text-sm font-medium text-gray-700">On Sale</span>
                                                            <input 
                                                                type="checkbox" 
                                                                name="promotions.isOnSale" 
                                                                checked={formData.promotions.isOnSale} 
                                                                onChange={handleInputChange} 
                                                                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-all duration-200"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-4">Offer Details</label>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-2">Free Trial Days</label>
                                                            <input 
                                                                type="number" 
                                                                name="promotions.freeTrialDays" 
                                                                value={formData.promotions.freeTrialDays} 
                                                                onChange={handleInputChange} 
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
                                                                placeholder="7"
                                                                min="0"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-2">Sale Discount (%)</label>
                                                            <input 
                                                                type="number" 
                                                                name="promotions.saleDiscount" 
                                                                value={formData.promotions.saleDiscount} 
                                                                onChange={handleInputChange} 
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
                                                                placeholder="20"
                                                                min="0"
                                                                max="100"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                                            <button 
                                                type="button" 
                                                onClick={() => setIsModalOpen(false)} 
                                                className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                type="submit" 
                                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105"
                                            >
                                                {editingPackage ? 'Update Package' : 'Create Package'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom CSS for animations */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { 
                        opacity: 0; 
                        transform: translateY(20px) scale(0.95); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0) scale(1); 
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                .animate-slideUp {
                    animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .line-clamp-1 {
                    display: -webkit-box;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </>
    );
};

export default PackageManagement;
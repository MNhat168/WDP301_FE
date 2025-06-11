import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../layout/header';
// import toastr from 'toastr';
// import 'toastr/build/toastr.min.css';
import useBanCheck from '../admin/checkban';

const Profile = () => {
    const BanPopup = useBanCheck();
    const navigate = useNavigate();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        email: '',
        city: '',
        phoneNumber: '',
        dateOfBirth: '',
        username: ''
    });
    const [message, setMessage] = useState('');

    const API_BASE_URL = 'http://localhost:5000/api/user'

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user) {
            navigate('/login');
            return;
        }
        setIsLoggedIn(true);
        fetchProfile();
    }, [navigate]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const fetchProfile = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const response = await fetch(`${API_BASE_URL}/current`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${user.accessToken}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                
                const userData = data.result;
                setProfile({
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    email: userData.email || '',
                    city: userData.city || '',
                    phoneNumber: userData.phone || '',
                    dateOfBirth: formatDate(userData.dateOfBirth),
                    username: userData.username || ''
                });
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to load profile');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            alert('Failed to load profile');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const formattedProfile = {
                firstName: profile.firstName,
                lastName: profile.lastName,
                email: profile.email,
                city: profile.city,
                phone: profile.phoneNumber, 
                dateOfBirth: formatDate(profile.dateOfBirth),
            };

            const response = await fetch(`${API_BASE_URL}/current`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.accessToken}`
                },
                credentials: 'include',
                body: JSON.stringify(formattedProfile)
            });

            if (response.status === 200) {
                setShowSuccessModal(true);
                setTimeout(() => {
                    setShowSuccessModal(false);
                }, 3000);
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <>
            {BanPopup}
            <Header />
            {showSuccessModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
                    <div className="bg-white rounded-2xl p-8 z-50 relative shadow-2xl transform transition-all duration-300 scale-105">
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-10 h-10 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-center mb-3 text-gray-800">Success!</h3>
                        <p className="text-gray-600 text-center mb-6">Your profile has been updated successfully.</p>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
            
            {/* Background with gradient */}
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="container mx-auto pt-32 pb-12 px-4">
                    <div className="max-w-6xl mx-auto">
                        {/* Header Section */}
                        <div className="text-center mb-12">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                                Profile Settings
                            </h1>
                            <p className="text-gray-600 text-lg">Manage your personal information and account settings</p>
                        </div>

                        {/* Main Profile Card */}
                        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                            {/* Header with gradient */}
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8">
                                <div className="flex items-center space-x-6">
                                    <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">
                                            {profile.firstName} {profile.lastName}
                                        </h2>
                                        <p className="text-blue-100">@{profile.username}</p>
                                        <p className="text-blue-100">{profile.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Form Content */}
                            <div className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid lg:grid-cols-2 gap-8">
                                        {/* Personal Information Card */}
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                                            <div className="flex items-center mb-6">
                                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
                                                    <p className="text-gray-600">Your basic profile details</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                                                        <input
                                                            type="text"
                                                            name="firstName"
                                                            value={profile.firstName}
                                                            onChange={handleInputChange}
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-300 bg-white shadow-sm"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                                                        <input
                                                            type="text"
                                                            name="lastName"
                                                            value={profile.lastName}
                                                            onChange={handleInputChange}
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-300 bg-white shadow-sm"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={profile.email}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed shadow-sm"
                                                        readOnly
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Account Settings Card */}
                                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                                            <div className="flex items-center mb-6">
                                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-800">Account Settings</h3>
                                                    <p className="text-gray-600">Contact and location details</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">City/Province</label>
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        value={profile.city}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-50 transition-all duration-300 bg-white shadow-sm"
                                                        placeholder="Enter your city"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                                    <input
                                                        type="text"
                                                        name="phoneNumber"
                                                        value={profile.phoneNumber}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-50 transition-all duration-300 bg-white shadow-sm"
                                                        placeholder="Enter your phone number"
                                                        pattern="\d+"
                                                        title="Please enter a valid phone number (digits only)"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                                                    <input
                                                        type="date"
                                                        name="dateOfBirth"
                                                        value={profile.dateOfBirth || ''}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-50 transition-all duration-300 bg-white shadow-sm"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Save Button */}
                                    <div className="flex justify-center pt-8">
                                        <button
                                            type="submit"
                                            className="px-12 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-2xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                                                </svg>
                                                <span>Save Changes</span>
                                            </div>
                                        </button>
                                    </div>

                                    {message && (
                                        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 rounded-xl text-center font-medium">
                                            {message}
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;
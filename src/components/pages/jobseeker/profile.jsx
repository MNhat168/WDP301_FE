import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../layout/header';
import useBanCheck from '../admin/checkban';
import { 
    FiUser, FiShield, FiBell, FiSettings, FiMail, FiPhone, 
    FiMapPin, FiCalendar, FiEdit2, FiCheck, FiLock, FiEye, FiEyeOff 
} from 'react-icons/fi';

const Profile = () => {
    const BanPopup = useBanCheck();
    const navigate = useNavigate();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        email: '',
        city: '',
        phoneNumber: '',
        dateOfBirth: '',
        username: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        otp: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [passwordError, setPasswordError] = useState('');

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

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
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
                setMessage('Profile updated successfully');
                setTimeout(() => {
                    setShowSuccessModal(false);
                    setMessage('');
                }, 3000);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile');
        }
    };

    // Step 1: Send OTP for password change
    const requestPasswordOtp = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/forgotpassword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: profile.email })
            });

            const data = await response.json();

            if (response.ok) {
                setShowOtpInput(true);
                setMessage('OTP sent to your email. Please check your inbox.');
                setTimeout(() => setMessage(''), 5000);
            } else {
                setPasswordError(data.message || 'Failed to send OTP');
            }
        } catch (error) {
            console.error('Error requesting OTP:', error);
            setPasswordError('Failed to send OTP');
        }
    };

    // Step 2: Verify OTP and change password
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        if (!showOtpInput) {
            // First step: Request OTP
            await requestPasswordOtp();
            return;
        }

        if (!passwordData.otp) {
            setPasswordError('Please enter the OTP sent to your email');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/verify-forgot-pass/${profile.email}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    otp: passwordData.otp,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                setShowSuccessModal(true);
                setMessage('Password changed successfully');
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                    otp: ''
                });
                setShowOtpInput(false);
                setTimeout(() => {
                    setShowSuccessModal(false);
                    setMessage('');
                }, 3000);
            } else {
                setPasswordError(data.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            setPasswordError('An error occurred while changing password');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="p-6">
                        <form onSubmit={handleProfileSubmit} className="space-y-8">
                            {/* Profile Picture Section */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-6">
                                        <div className="relative">
                                            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                                <FiUser className="w-12 h-12 text-white" />
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full border-4 border-blue-100 flex items-center justify-center shadow-md cursor-pointer hover:shadow-lg transition-all">
                                                <FiEdit2 className="w-4 h-4 text-blue-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                                {profile.firstName} {profile.lastName}
                                            </h2>
                                            <div className="flex items-center space-x-2">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                    @{profile.username}
                                                </span>
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                    <FiCheck className="w-3 h-3 mr-1" />
                                                    Verified
                                                </span>
                                            </div>
                                            <p className="text-gray-600 mt-2 flex items-center">
                                                <FiMail className="w-4 h-4 mr-2" />
                                                {profile.email}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium transition-all duration-200 hover:shadow-md"
                                    >
                                        Upload Photo
                                    </button>
                                </div>
                            </div>

                            {/* Personal Information */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <FiUser className="w-5 h-5 mr-2 text-blue-600" />
                                        Personal Information
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">Update your personal details and contact information</p>
                                </div>
                                
                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={profile.firstName}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                                                placeholder="Enter your first name"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={profile.lastName}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                                                placeholder="Enter your last name"
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                name="email"
                                                value={profile.email}
                                                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                                                readOnly
                                            />
                                            <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        </div>
                                        <p className="text-xs text-gray-500 flex items-center">
                                            <FiShield className="w-3 h-3 mr-1" />
                                            Your email address is protected and cannot be changed
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <FiPhone className="w-5 h-5 mr-2 text-green-600" />
                                        Contact Information
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">Your contact details for communication</p>
                                </div>
                                
                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                City/Province
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={profile.city}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                                                    placeholder="Enter your city"
                                                    required
                                                />
                                                <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                Phone Number
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="phoneNumber"
                                                    value={profile.phoneNumber}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                                                    placeholder="Enter your phone number"
                                                    pattern="\d+"
                                                    title="Please enter a valid phone number (digits only)"
                                                    required
                                                />
                                                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Date of Birth
                                        </label>
                                        <div className="relative max-w-xs">
                                            <input
                                                type="date"
                                                name="dateOfBirth"
                                                value={profile.dateOfBirth || ''}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                                                required
                                            />
                                            <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-4 pt-6">
                                <button
                                    type="button"
                                    className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md"
                                >
                                    Cancel Changes
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                                >
                                    Update Profile
                                </button>
                            </div>
                        </form>
                    </div>
                );

            case 'account':
                return (
                    <div className="p-6">
                        <div className="max-w-2xl">
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                                    <FiLock className="w-6 h-6 mr-3 text-red-500" />
                                    Change Password
                                </h3>
                                <p className="text-gray-600 mt-2">Secure your account with a strong password</p>
                            </div>
                            
                            {passwordError && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-red-800 font-medium">{passwordError}</span>
                                    </div>
                                </div>
                            )}

                            {message && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                                    <div className="flex items-center">
                                        <FiCheck className="w-5 h-5 text-green-500 mr-2" />
                                        <span className="text-green-800 font-medium">{message}</span>
                                    </div>
                                </div>
                            )}

                            {!showOtpInput && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h4 className="text-sm font-semibold text-blue-800 mb-1">Security Notice</h4>
                                            <p className="text-sm text-blue-700">
                                                We'll send a verification code to <strong>{profile.email}</strong> to confirm your identity before changing your password.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                                                placeholder="Enter your new password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        <div className="text-xs text-gray-500 space-y-1">
                                            <p>Password requirements:</p>
                                            <ul className="list-disc list-inside pl-4 space-y-0.5">
                                                <li>At least 8 characters long</li>
                                                <li>Include uppercase and lowercase letters</li>
                                                <li>Include at least one number</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                                                placeholder="Confirm your new password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {showOtpInput && (
                                        <div className="space-y-2 border-t border-gray-200 pt-6">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                Verification Code (OTP)
                                            </label>
                                            <input
                                                type="text"
                                                name="otp"
                                                value={passwordData.otp}
                                                onChange={handlePasswordChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 text-center text-lg font-mono tracking-widest"
                                                placeholder="000000"
                                                maxLength="6"
                                                required
                                            />
                                            <p className="text-xs text-gray-500 text-center">
                                                Enter the 6-digit code sent to your email
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between items-center pt-4">
                                    <div className="flex space-x-3">
                                        {showOtpInput && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowOtpInput(false);
                                                    setPasswordData(prev => ({ ...prev, otp: '' }));
                                                    setPasswordError('');
                                                }}
                                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                                            >
                                                ← Back
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-105"
                                    >
                                        {showOtpInput ? 'Change Password' : 'Send Verification Code'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="p-6">
                        <div className="text-center py-16">
                            <div className="w-24 h-24 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <FiSettings className="w-12 h-12 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h3>
                            <p className="text-gray-600 mb-8">This feature is currently under development</p>
                            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-xl text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L10 9.586V6z" clipRule="evenodd" />
                                </svg>
                                Stay tuned for updates
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <>
            {BanPopup}
            <Header />
            {showSuccessModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"></div>
                    <div className="bg-white rounded-2xl p-8 z-50 relative shadow-2xl border max-w-md w-full mx-4 transform transition-all duration-300 scale-110">
                        <div className="text-center">
                            {/* Success Icon */}
                            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            
                            {/* Title */}
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
                            
                            {/* Message */}
                            <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>
                            
                            {/* Button */}
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-lg"
                            >
                                Continue
                            </button>
                        </div>
                        
                        {/* Close button */}
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <div className="max-w-6xl mx-auto pt-8 pb-12 px-4">
                    {/* Navigation breadcrumb */}
                    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
                        <span className="hover:text-blue-600 cursor-pointer transition-colors">Settings</span>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold text-gray-900">Edit Profile</span>
                    </nav>

                    {/* Page Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">
                            Account <span className="text-blue-600">Settings</span>
                        </h1>
                        <p className="text-lg text-gray-600">Manage your profile and account preferences</p>
                    </div>

                    <div className="grid grid-cols-12 gap-8">
                        {/* Sidebar Navigation */}
                        <div className="col-span-12 lg:col-span-3">
                            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden sticky top-8">
                                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                        <FiSettings className="w-5 h-5 mr-2 text-blue-600" />
                                        Settings
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">Customize your account</p>
                                </div>
                                <nav className="p-3">
                                    <button 
                                        onClick={() => setActiveTab('profile')}
                                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl mb-2 transition-all duration-200 ${
                                            activeTab === 'profile' 
                                                ? 'text-white bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg transform scale-105' 
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                                        }`}
                                    >
                                        <FiUser className="w-4 h-4 mr-3" />
                                        Profile Information
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('account')}
                                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl mb-2 transition-all duration-200 ${
                                            activeTab === 'account' 
                                                ? 'text-white bg-gradient-to-r from-red-500 to-pink-600 shadow-lg transform scale-105' 
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-red-600'
                                        }`}
                                    >
                                        <FiLock className="w-4 h-4 mr-3" />
                                        Password & Security
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('security')}
                                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl mb-2 transition-all duration-200 ${
                                            activeTab === 'security' 
                                                ? 'text-white bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg transform scale-105' 
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-green-600'
                                        }`}
                                    >
                                        <FiShield className="w-4 h-4 mr-3" />
                                        Security Settings
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('notifications')}
                                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                                            activeTab === 'notifications' 
                                                ? 'text-white bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg transform scale-105' 
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-purple-600'
                                        }`}
                                    >
                                        <FiBell className="w-4 h-4 mr-3" />
                                        Notifications
                                    </button>
                                </nav>
                                
                                {/* Quick Info */}
                                <div className="p-4 m-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                            <FiUser className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {profile.firstName} {profile.lastName}
                                            </p>
                                            <p className="text-xs text-gray-600">{profile.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="col-span-12 lg:col-span-9">
                            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
                                {/* Header */}
                                <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-900">
                                                {activeTab === 'profile' && 'Profile Information'}
                                                {activeTab === 'account' && 'Password & Security'}
                                                {activeTab === 'security' && 'Security Settings'}
                                                {activeTab === 'notifications' && 'Notification Settings'}
                                            </h1>
                                            <p className="text-gray-600 mt-1">
                                                {activeTab === 'profile' && 'Update your personal information and contact details'}
                                                {activeTab === 'account' && 'Manage your password and security preferences'}
                                                {activeTab === 'security' && 'Configure your security and privacy settings'}
                                                {activeTab === 'notifications' && 'Customize your notification preferences'}
                                            </p>
                                        </div>
                                        <div className="hidden sm:block">
                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                                                {activeTab === 'profile' && <FiUser className="w-6 h-6 text-white" />}
                                                {activeTab === 'account' && <FiLock className="w-6 h-6 text-white" />}
                                                {activeTab === 'security' && <FiShield className="w-6 h-6 text-white" />}
                                                {activeTab === 'notifications' && <FiBell className="w-6 h-6 text-white" />}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {renderTabContent()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;
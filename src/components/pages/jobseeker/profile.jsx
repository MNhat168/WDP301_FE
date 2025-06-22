import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../layout/header';
import useBanCheck from '../admin/checkban';

const Profile = () => {
    const BanPopup = useBanCheck();
    const navigate = useNavigate();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showOtpInput, setShowOtpInput] = useState(false);
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
                    <form onSubmit={handleProfileSubmit} className="divide-y divide-gray-200">
                        {/* Profile Picture Section */}
                        <div className="px-6 py-5">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                                        <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-5 flex-1">
                                    <div className="flex items-center space-x-3">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {profile.firstName} {profile.lastName}
                                        </h3>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            @{profile.username}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{profile.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="px-6 py-5">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal information</h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First name
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={profile.firstName}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last name
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={profile.lastName}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profile.email}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 text-sm"
                                    readOnly
                                />
                                <p className="text-xs text-gray-500 mt-1">Your email address cannot be changed.</p>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="px-6 py-5">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact information</h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        City/Province
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={profile.city}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        placeholder="Enter your city"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone number
                                    </label>
                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        value={profile.phoneNumber}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        placeholder="Enter your phone number"
                                        pattern="\d+"
                                        title="Please enter a valid phone number (digits only)"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of birth
                                </label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={profile.dateOfBirth || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm max-w-xs"
                                    required
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                            <button
                                type="button"
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                Update profile
                            </button>
                        </div>
                    </form>
                );

            case 'account':
                return (
                    <div className="px-6 py-5">
                        <h3 className="text-lg font-medium text-gray-900 mb-6">Change Password</h3>
                        
                        {passwordError && (
                            <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">
                                {passwordError}
                            </div>
                        )}

                        {message && (
                            <div className="p-4 mb-4 text-green-700 bg-green-100 rounded-md">
                                {message}
                            </div>
                        )}

                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            {!showOtpInput && (
                                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-blue-700">
                                                To change your password, we'll send a verification code to your email address.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    placeholder="Enter new password"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    placeholder="Confirm new password"
                                    required
                                />
                            </div>

                            {showOtpInput && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Verification Code (OTP)
                                    </label>
                                    <input
                                        type="text"
                                        name="otp"
                                        value={passwordData.otp}
                                        onChange={handlePasswordChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        placeholder="Enter the 6-digit code from your email"
                                        maxLength="6"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Check your email for the verification code.</p>
                                </div>
                            )}

                            <div className="pt-4 flex space-x-3">
                                {showOtpInput && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowOtpInput(false);
                                            setPasswordData(prev => ({ ...prev, otp: '' }));
                                            setPasswordError('');
                                        }}
                                        className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                    >
                                        Back
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                >
                                    {showOtpInput ? 'Change Password' : 'Send Verification Code'}
                                </button>
                            </div>
                        </form>
                    </div>
                );

            default:
                return <div className="px-6 py-5">Coming soon...</div>;
        }
    };

    return (
        <>
            {BanPopup}
            <Header />
            {showSuccessModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black bg-opacity-25"></div>
                    <div className="bg-white rounded-lg p-6 z-50 relative shadow-lg border max-w-sm w-full mx-4">
                        <div className="flex items-center mb-4">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Success!</h3>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">{message}</p>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}
            
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-5xl mx-auto pt-8 pb-12 px-4">
                    {/* Navigation breadcrumb */}
                    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
                        <span>Settings</span>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium text-gray-900">Edit Profile</span>
                    </nav>

                    <div className="grid grid-cols-12 gap-6">
                        {/* Sidebar Navigation */}
                        <div className="col-span-12 lg:col-span-3">
                            <div className="bg-white border border-gray-200 rounded-lg">
                                <div className="p-4 border-b border-gray-200">
                                    <h2 className="font-semibold text-gray-900">Settings</h2>
                                </div>
                                <nav className="p-2">
                                    <button 
                                        onClick={() => setActiveTab('profile')}
                                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 ${
                                            activeTab === 'profile' 
                                                ? 'text-gray-900 bg-gray-50' 
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                        Profile
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('account')}
                                        className={`w-full flex items-center px-3 py-2 text-sm rounded-md mb-1 ${
                                            activeTab === 'account' 
                                                ? 'text-gray-900 bg-gray-50 font-medium' 
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                                        </svg>
                                        Account
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('security')}
                                        className={`w-full flex items-center px-3 py-2 text-sm rounded-md mb-1 ${
                                            activeTab === 'security' 
                                                ? 'text-gray-900 bg-gray-50 font-medium' 
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                        Security
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('notifications')}
                                        className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                                            activeTab === 'notifications' 
                                                ? 'text-gray-900 bg-gray-50 font-medium' 
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                                        </svg>
                                        Notifications
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="col-span-12 lg:col-span-9">
                            <div className="bg-white border border-gray-200 rounded-lg">
                                {/* Header */}
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h1 className="text-xl font-semibold text-gray-900">
                                                {activeTab === 'profile' && 'Public profile'}
                                                {activeTab === 'account' && 'Account Settings'}
                                                {activeTab === 'security' && 'Security Settings'}
                                                {activeTab === 'notifications' && 'Notification Settings'}
                                            </h1>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {activeTab === 'profile' && 'This information will be displayed publicly so be careful what you share.'}
                                                {activeTab === 'account' && 'Manage your account settings and change your password.'}
                                                {activeTab === 'security' && 'Configure your security preferences.'}
                                                {activeTab === 'notifications' && 'Manage your notification preferences.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Tab Content */}
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
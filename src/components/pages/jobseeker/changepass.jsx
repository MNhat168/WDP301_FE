import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../layout/header';
import useBanCheck from '../admin/checkban';
import { FiLock, FiCheckCircle, FiEye, FiEyeOff } from 'react-icons/fi';

const ChangePassword = () => {
    const BanPopup = useBanCheck();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [formData, setFormData] = useState({
        currentpass: '',
        newpass: '',
        confirmnewpass: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Visibility toggles
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Client-side validation
        if (formData.newpass !== formData.confirmnewpass) {
            setError('New password and confirmation do not match');
            return;
        }

        try {
            setIsSubmitting(true);
            setError('');
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user?.token && !user?.accessToken) {
                setError('User not authenticated. Please login again.');
                return;
            }

            const response = await fetch('https://wdp301-lzse.onrender.com/api/user/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token || user.accessToken}`
                },
                credentials: 'include',
                body: JSON.stringify({
                    currentPassword: formData.currentpass,
                    newPassword: formData.newpass
                })
            });

            const data = await response.json();

            if (response.ok && data.status) {
                setShowSuccessModal(true);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(data.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('An error occurred while changing password');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {BanPopup}
            <Header />
            {showSuccessModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black opacity-50"></div>
                    <div className="bg-white rounded-lg p-8 z-50 relative">
                        <div className="flex items-center justify-center mb-4">
                            <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-center mb-2">Success!</h3>
                        <p className="text-gray-600 text-center">Password changed successfully. Please login again.</p>
                    </div>
                </div>
            )}

            {/* Background wrapper */}
            <div className="min-h-screen pt-32 pb-16 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-start justify-center">
                {/* Glass card */}
                <div className="w-full max-w-md bg-white/80 backdrop-blur-md border border-white/50 rounded-3xl shadow-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="mb-6 text-center">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Change Password</h2>
                            <p className="text-gray-500 text-sm">Keep your account secure by using a strong password.</p>
                        </div>

                        {error && (
                            <div className="flex items-start p-4 mb-4 text-red-700 bg-red-100 rounded-md">
                                <FiLock className="mt-0.5 mr-2" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                <div className="relative">
                                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type={showCurrent ? 'text' : 'password'}
                                        name="currentpass"
                                        value={formData.currentpass}
                                        onChange={handleInputChange}
                                        className="pl-10 pr-10 py-2 block w-full rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition shadow-sm"
                                        placeholder="Enter current password"
                                        required
                                    />
                                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 focus:outline-none">
                                        {showCurrent ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <div className="relative">
                                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type={showNew ? 'text' : 'password'}
                                        name="newpass"
                                        value={formData.newpass}
                                        onChange={handleInputChange}
                                        className="pl-10 pr-10 py-2 block w-full rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition shadow-sm"
                                        placeholder="Enter new password"
                                        required
                                    />
                                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 focus:outline-none">
                                        {showNew ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                <div className="relative">
                                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        name="confirmnewpass"
                                        value={formData.confirmnewpass}
                                        onChange={handleInputChange}
                                        className="pl-10 pr-10 py-2 block w-full rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition shadow-sm"
                                        placeholder="Confirm new password"
                                        required
                                    />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 focus:outline-none">
                                        {showConfirm ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center pt-2">
                            <button
                                type="submit"
                                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-full shadow-lg transform transition active:scale-95 disabled:opacity-60"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default ChangePassword;
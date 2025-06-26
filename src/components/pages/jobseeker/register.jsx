import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import OTPVerificationModal from "../../layout/otpchecker";
import mainImage from '../../../assets/3dimage.png';
import logoGoogle from '../../../assets/google.svg';
import { FiUser, FiMail, FiPhone, FiCalendar, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const Register = () => {
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        username: "",
        dateOfBirth: "",
        phone: ""
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);


    const handleRegister = async () => {
        setIsLoading(true);
        try {
            // Send as JSON object instead of FormData
            const dataToSend = {
                firstname: formData.firstname,
                lastname: formData.lastname,
                email: formData.email,
                password: formData.password,
                username: formData.username,
                dateOfBirth: formData.dateOfBirth,
                phone: formData.phone
            };

            const response = await axios.post('http://localhost:5000/api/user/register-jobseeker',
                dataToSend,  // Send as JSON
                {
                    headers: {
                        'Content-Type': 'application/json',  // Changed to JSON content type
                    },
                    withCredentials: true
                }
            );

            if (response.data) {
                setShowOtpModal(true); // Show OTP modal instead of navigating
            }
        } catch (error) {
            console.error("Registration error:", error);
            setError(error.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <div
            className="flex justify-center items-center w-full h-screen bg-gradient-to-r from-yellow-400 via-orange-500 to-brown-700"
        >
            {showOtpModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 w-[400px] relative shadow-lg">
                        {/* Close button */}
                        <button
                            onClick={() => setShowOtpModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
                        >
                            ×
                        </button>
    
                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
                            Enter OTP
                        </h2>
                        <p className="text-gray-600 text-center mb-8">
                            We have sent a verification code to your email
                        </p>
    
                        <OTPVerificationModal
                            onSuccess={() => {
                                setShowOtpModal(false);
                                navigate('/login?success=true');
                            }}
                            onClose={() => setShowOtpModal(false)}
                            email={formData.email}
                        />
                    </div>
                </div>
            )}
            <div className="flex w-[1000px] h-[700px] bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Left Side */}
                <div className="w-2/5 bg-gradient-to-b from-yellow-400 via-orange-500 to-brown-700 p-8 flex flex-col justify-center items-center relative">
                    <div className="relative w-[314px] h-[72px]">
                        <p className="absolute top-10 left-1/2 transform -translate-x-1/2 text-shadow-[0px_3px_3px_#00000040] font-bold text-white text-3xl tracking-[0] leading-[normal] whitespace-nowrap">
                            Create Your <br /> Account
                        </p>
                    </div>
                    <div className="w-[457px] h-[591px] relative">
                        <img
                            className="absolute w-[457px] h-[578px] top-5 left-14 object-cover"
                            alt="Main image"
                            src={mainImage}
                        />
                    </div>
                </div>
    
                {/* Right Side - Form */}
                <div className="w-3/5 flex justify-center items-center bg-white">
                    <div className="w-[80%] bg-white rounded-2xl p-10 shadow-md">
                        <div className="flex flex-col items-center">
                         
                            <h2 className="text-3xl font-semibold text-gray-800 mb-8">
                                Sign up
                            </h2>
                        </div>
    
                        {/* Form Fields */}
                        <div className="space-y-6">
                            {/* First & Last Name */}
                            <div className="flex gap-4">
                                <div className="relative w-1/2">
                                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="firstname"
                                        className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        value={formData.firstname}
                                        onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                                        placeholder="First Name"
                                    />
                                </div>
                                <div className="relative w-1/2">
                                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="lastname"
                                        className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        value={formData.lastname}
                                        onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                                        placeholder="Last Name"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="relative w-1/2">
                                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="username"
                                        className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        placeholder="Username"
                                    />
                                </div>
                                <div className="relative w-1/2">
                                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="Email"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="relative w-1/2">
                                    <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="Phone Number"
                                    />
                                </div>
                                <div className="relative w-1/2">
                                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                    />
                                </div>
                            </div>
    
                            {/* Password */}
                            <div className="relative">
                                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    className="pl-10 pr-10 py-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Password"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 focus:outline-none">
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>
    
                        {/* Register Button */}
                        <button
                            className="w-full mt-8 p-3 bg-yellow-400 text-white font-medium rounded-md shadow-md hover:bg-yellow-500 transition flex items-center justify-center"
                            onClick={handleRegister}
                            disabled={isLoading}
                        >
                            <span>{isLoading ? "Registering..." : "Register"}</span>
                        </button>
    
                        {/* Error Message */}
                        {error && (
                            <p className="text-red-500 text-sm mt-2 text-center">
                                {error}
                            </p>
                        )}
    
                        {/* Divider */}
                        <div className="flex items-center my-8">
                            <div className="flex-grow h-px bg-gray-300"></div>
                            <span className="mx-3 text-gray-500 font-medium">or</span>
                            <div className="flex-grow h-px bg-gray-300"></div>
                        </div>
    
                        {/* Google Sign Up */}
                        <button
                            className="flex items-center justify-center w-full p-3 border border-gray-300 rounded-md hover:bg-gray-100 transition"
                           
                        >
                             <img className="w-6 mr-3" src={logoGoogle} alt="Logo Google" />
                            <span className="text-gray-600 font-medium">Sign up with Google</span>
                        </button>
    
                        {/* Login Link */}
                        <p className="text-center text-gray-600 text-sm mt-6">
                            Already have an account?{" "}
                            <a
                                href="/login"
                                className="text-yellow-500 hover:text-yellow-600 underline"
                            >
                                Sign in
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}    
export default Register;
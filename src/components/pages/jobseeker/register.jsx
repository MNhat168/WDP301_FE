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
    const [errors, setErrors] = useState({});
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Validation functions
    const validateName = (name) => {
        const nameRegex = /^[a-zA-ZÀ-ỹ\s]{2,30}$/;
        return nameRegex.test(name.trim());
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateVietnamesePhone = (phone) => {
        // Vietnamese phone number patterns:
        // Mobile: 03x, 05x, 07x, 08x, 09x (10 digits total)
        // Landline: 02x (10 digits total)
        const phoneRegex = /^(0[235789])[0-9]{8}$/;
        return phoneRegex.test(phone);
    };

    const validatePassword = (password) => {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };

    const validateUsername = (username) => {
        // Username: 3-20 characters, alphanumeric and underscores only
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        return usernameRegex.test(username);
    };

    const validateDateOfBirth = (date) => {
        if (!date) return false;
        const today = new Date();
        const birthDate = new Date(date);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        // Check if user is at least 13 years old
        if (age < 13 || (age === 13 && monthDiff < 0) || 
            (age === 13 && monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            return false;
        }
        
        // Check if date is not in the future
        return birthDate <= today;
    };

    const validateField = (name, value) => {
        let error = "";
        
        switch (name) {
            case 'firstname':
                if (!value.trim()) {
                    error = "First name is required";
                } else if (!validateName(value)) {
                    error = "Invalid first name format";
                }
                break;
            case 'lastname':
                if (!value.trim()) {
                    error = "Last name is required";
                } else if (!validateName(value)) {
                    error = "Invalid last name format";
                }
                break;
            case 'email':
                if (!value.trim()) {
                    error = "Email is required";
                } else if (!validateEmail(value)) {
                    error = "Invalid email format";
                }
                break;
            case 'username':
                if (!value.trim()) {
                    error = "Username is required";
                } else if (!validateUsername(value)) {
                    error = "Username: 3-20 chars, letters/numbers/_";
                }
                break;
            case 'phone':
                if (!value.trim()) {
                    error = "Phone is required";
                } else if (!validateVietnamesePhone(value)) {
                    error = "Invalid Vietnamese phone number";
                }
                break;
            case 'dateOfBirth':
                if (!value) {
                    error = "Date of birth is required";
                } else if (!validateDateOfBirth(value)) {
                    error = "Must be at least 13 years old";
                }
                break;
            case 'password':
                if (!value) {
                    error = "Password is required";
                } else if (!validatePassword(value)) {
                    error = "8+ chars with upper, lower, number, special char";
                }
                break;
            default:
                break;
        }
        
        return error;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Real-time validation
        const fieldError = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: fieldError
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) {
                newErrors[key] = error;
            }
        });
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validateForm()) {
            setError("Please fix the errors above");
            return;
        }

        setIsLoading(true);
        setError("");
        
        try {
            const dataToSend = {
                firstname: formData.firstname.trim(),
                lastname: formData.lastname.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
                username: formData.username.trim(),
                dateOfBirth: formData.dateOfBirth,
                phone: formData.phone.trim()
            };

            const response = await axios.post('http://localhost:5000/api/user/register-jobseeker',
                dataToSend,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true
                }
            );

            if (response.data) {
                setShowOtpModal(true);
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
                    <div className="bg-white rounded-lg p-[2vh] w-[25vw] relative shadow-lg">
                        {/* Close button */}
                        <button
                            onClick={() => setShowOtpModal(false)}
                            className="absolute top-[1vh] right-[1vw] text-gray-500 hover:text-gray-700 text-xl"
                        >
                            ×
                        </button>

                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-[1vh]">
                            Enter OTP
                        </h2>
                        <p className="text-gray-600 text-center mb-[2vh]">
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
            <div className="flex w-[69vw] h-[75vh] bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Left Side */}
                <div className="w-2/5 bg-gradient-to-b from-yellow-400 via-orange-500 to-brown-700 p-[2vh] flex flex-col justify-center items-center relative">
                    <div className="relative w-[20vw] h-[10vh]">
                        <p className="absolute top-[2vh] left-1/2 transform -translate-x-1/2 text-shadow-[0px_3px_3px_#00000040] font-bold text-white text-3xl tracking-[0] leading-[normal] whitespace-nowrap">
                            Create Your <br /> Account
                        </p>
                    </div>
                    <div className="w-[25vw] h-[50vh] relative">
                        <img
                            className="absolute w-[25vw] h-[49vh] top-[1vh] object-cover"
                            alt="Main image"
                            src={mainImage}
                        />
                    </div>
                </div>
    
                {/* Right Side - Form */}
                <div className="w-3/5 flex justify-center items-center bg-white overflow-y-auto">
                    <div className="w-[80%] bg-white rounded-2xl p-[2vh] shadow-md max-h-full overflow-y-auto">
                        <div className="flex flex-col items-center">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-[1.5vh]">
                                Sign up
                            </h2>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-[1vh]">
                            {/* First & Last Name */}
                            <div className="flex gap-[1vw]">
                                <div className="relative w-1/2">
                                    <FiUser className="absolute left-[0.8vw] top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="firstname"
                                        className={`pl-[2.5vw] pr-[1vw] py-[1vh] w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                                            errors.firstname ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-yellow-500'
                                        }`}
                                        value={formData.firstname}
                                        onChange={handleInputChange}
                                        placeholder="First Name"
                                    />
                                    {errors.firstname && (
                                        <p className="text-red-500 text-xs mt-[0.3vh]">{errors.firstname}</p>
                                    )}
                                </div>
                                <div className="relative w-1/2">
                                    <FiUser className="absolute left-[0.8vw] top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="lastname"
                                        className={`pl-[2.5vw] pr-[1vw] py-[1vh] w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                                            errors.lastname ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-yellow-500'
                                        }`}
                                        value={formData.lastname}
                                        onChange={handleInputChange}
                                        placeholder="Last Name"
                                    />
                                    {errors.lastname && (
                                        <p className="text-red-500 text-xs mt-[0.3vh]">{errors.lastname}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-[1vw]">
                                <div className="relative w-1/2">
                                    <FiUser className="absolute left-[0.8vw] top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="username"
                                        className={`pl-[2.5vw] pr-[1vw] py-[1vh] w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                                            errors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-yellow-500'
                                        }`}
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        placeholder="Username"
                                    />
                                    {errors.username && (
                                        <p className="text-red-500 text-xs mt-[0.3vh]">{errors.username}</p>
                                    )}
                                </div>
                                <div className="relative w-1/2">
                                    <FiMail className="absolute left-[0.8vw] top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        className={`pl-[2.5vw] pr-[1vw] py-[1vh] w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                                            errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-yellow-500'
                                        }`}
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Email"
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-xs mt-[0.3vh]">{errors.email}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-[1vw]">
                                <div className="relative w-1/2">
                                    <FiPhone className="absolute left-[0.8vw] top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        className={`pl-[2.5vw] pr-[1vw] py-[1vh] w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                                            errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-yellow-500'
                                        }`}
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="Phone Number"
                                    />
                                    {errors.phone && (
                                        <p className="text-red-500 text-xs mt-[0.3vh]">{errors.phone}</p>
                                    )}
                                </div>
                                <div className="relative w-1/2">
                                    <FiCalendar className="absolute left-[0.8vw] top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        className={`pl-[2.5vw] pr-[1vw] py-[1vh] w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                                            errors.dateOfBirth ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-yellow-500'
                                        }`}
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                    />
                                    {errors.dateOfBirth && (
                                        <p className="text-red-500 text-xs mt-[0.3vh]">{errors.dateOfBirth}</p>
                                    )}
                                </div>
                            </div>
    
                            {/* Password */}
                            <div className="relative">
                                <FiLock className="absolute left-[0.8vw] top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    className={`pl-[2.5vw] pr-[2.5vw] py-[1vh] w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                                        errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-yellow-500'
                                    }`}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Password"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-[0.8vw] top-1/2 transform -translate-y-1/2 text-gray-400 focus:outline-none">
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-[0.3vh]">{errors.password}</p>
                                )}
                            </div>
                        </div>

                        {/* Register Button */}
                        <button
                            className="w-full mt-[2vh] p-[1vh] bg-yellow-400 text-white font-medium rounded-md shadow-md hover:bg-yellow-500 transition flex items-center justify-center"
                            onClick={handleRegister}
                            disabled={isLoading}
                        >
                            <span>{isLoading ? "Registering..." : "Register"}</span>
                        </button>

                        {/* Error Message */}
                        {error && (
                            <p className="text-red-500 text-sm mt-[0.5vh] text-center">
                                {error}
                            </p>
                        )}

                        {/* Divider */}
                        <div className="flex items-center my-[2vh]">
                            <div className="flex-grow h-px bg-gray-300"></div>
                            <span className="mx-[0.8vw] text-gray-500 font-medium">or</span>
                            <div className="flex-grow h-px bg-gray-300"></div>
                        </div>

                        {/* Google Sign Up */}
                        <button
                            className="flex items-center justify-center w-full p-[1vh] border border-gray-300 rounded-md hover:bg-gray-100 transition"
                           
                        >
                             <img className="w-[1.5vw] mr-[0.8vw]" src={logoGoogle} alt="Logo Google" />
                            <span className="text-gray-600 font-medium">Sign up with Google</span>
                        </button>

                        {/* Login Link */}
                        <p className="text-center text-gray-600 text-sm mt-[1.5vh]">
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
};

export default Register;
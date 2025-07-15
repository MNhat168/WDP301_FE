import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import OTPVerificationModal from "../../layout/otpchecker";
import mainImage from '../../../assets/3dimage.png';
import logoGoogle from '../../../assets/google.svg';

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
                    error = "First name must be 2-30 characters and contain only letters";
                }
                break;
            case 'lastname':
                if (!value.trim()) {
                    error = "Last name is required";
                } else if (!validateName(value)) {
                    error = "Last name must be 2-30 characters and contain only letters";
                }
                break;
            case 'email':
                if (!value.trim()) {
                    error = "Email is required";
                } else if (!validateEmail(value)) {
                    error = "Please enter a valid email address";
                }
                break;
            case 'username':
                if (!value.trim()) {
                    error = "Username is required";
                } else if (!validateUsername(value)) {
                    error = "Username must be 3-20 characters (letters, numbers, underscores only)";
                }
                break;
            case 'phone':
                if (!value.trim()) {
                    error = "Phone number is required";
                } else if (!validateVietnamesePhone(value)) {
                    error = "Please enter a valid Vietnamese phone number (e.g., 0987654321)";
                }
                break;
            case 'dateOfBirth':
                if (!value) {
                    error = "Date of birth is required";
                } else if (!validateDateOfBirth(value)) {
                    error = "You must be at least 13 years old";
                }
                break;
            case 'password':
                if (!value) {
                    error = "Password is required";
                } else if (!validatePassword(value)) {
                    error = "Password must be at least 8 characters with uppercase, lowercase, number, and special character";
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
    };

    const getInputClassName = (fieldName) => {
        const baseClass = "p-3 pt-5 w-full border rounded-md shadow-sm focus:outline-none transition-colors";
        const errorClass = "border-red-500 focus:ring-2 focus:ring-red-500";
        const successClass = "border-gray-300 focus:ring-2 focus:ring-yellow-500";
        
        return `${baseClass} ${errors[fieldName] ? errorClass : successClass}`;
    };

    const getLabelClassName = (fieldName) => {
        const baseClass = "absolute top-3 left-3 text-xs transition-all transform -translate-y-2 scale-75 origin-left bg-white px-1 pointer-events-none";
        const errorClass = "text-red-500";
        const normalClass = "text-gray-600";
        
        return `${baseClass} ${errors[fieldName] ? errorClass : normalClass}`;
    };

    return (
        <div className="flex justify-center items-center w-full h-screen bg-gradient-to-r from-yellow-400 via-orange-500 to-brown-700">
            {showOtpModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 w-[400px] relative shadow-lg">
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
                            <div className="flex gap-4">
                                <div className="relative w-1/2">
                                    <input
                                        type="text"
                                        name="firstname"
                                        className={getInputClassName('firstname')}
                                        value={formData.firstname}
                                        onChange={handleInputChange}
                                        placeholder=" "
                                    />
                                    <label className={getLabelClassName('firstname')}>
                                        First Name *
                                    </label>
                                    {errors.firstname && (
                                        <p className="text-red-500 text-xs mt-1">{errors.firstname}</p>
                                    )}
                                </div>
                                <div className="relative w-1/2">
                                    <input
                                        type="text"
                                        name="lastname"
                                        className={getInputClassName('lastname')}
                                        value={formData.lastname}
                                        onChange={handleInputChange}
                                        placeholder=" "
                                    />
                                    <label className={getLabelClassName('lastname')}>
                                        Last Name *
                                    </label>
                                    {errors.lastname && (
                                        <p className="text-red-500 text-xs mt-1">{errors.lastname}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="relative w-1/2">
                                    <input
                                        type="text"
                                        name="username"
                                        className={getInputClassName('username')}
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        placeholder=" "
                                    />
                                    <label className={getLabelClassName('username')}>
                                        Username *
                                    </label>
                                    {errors.username && (
                                        <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                                    )}
                                </div>
                                <div className="relative w-1/2">
                                    <input
                                        type="email"
                                        name="email"
                                        className={getInputClassName('email')}
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder=" "
                                    />
                                    <label className={getLabelClassName('email')}>
                                        Email *
                                    </label>
                                    {errors.email && (
                                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="relative w-1/2">
                                    <input
                                        type="tel"
                                        name="phone"
                                        className={getInputClassName('phone')}
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder=" "
                                    />
                                    <label className={getLabelClassName('phone')}>
                                        Phone Number *
                                    </label>
                                    {errors.phone && (
                                        <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                                    )}
                                </div>
                                <div className="relative w-1/2">
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        className={getInputClassName('dateOfBirth')}
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        placeholder=" "
                                    />
                                    <label className={getLabelClassName('dateOfBirth')}>
                                        Date of Birth *
                                    </label>
                                    {errors.dateOfBirth && (
                                        <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
                                    )}
                                </div>
                            </div>

                            <div className="relative">
                                <input
                                    type="password"
                                    name="password"
                                    className={getInputClassName('password')}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder=" "
                                />
                                <label className={getLabelClassName('password')}>
                                    Password *
                                </label>
                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                                )}
                                <div className="mt-2 text-xs text-gray-500">
                                    Password must contain at least 8 characters with uppercase, lowercase, number, and special character
                                </div>
                            </div>
                        </div>

                        {/* Register Button */}
                        <button
                            className="w-full mt-8 p-3 bg-yellow-400 text-white font-medium rounded-md shadow-md hover:bg-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleRegister}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin h-5 w-5 mr-3"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Registering...
                                </div>
                            ) : (
                                "Register"
                            )}
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
                        <button className="flex items-center justify-center w-full p-3 border border-gray-300 rounded-md hover:bg-gray-100 transition">
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
};

export default Register;
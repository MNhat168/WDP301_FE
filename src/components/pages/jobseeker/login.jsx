import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../Context";
import mainImage from '../../../assets/3dimage.png';
import logoGoogle from '../../../assets/google.svg';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(UserContext);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const credentials = { email, password };
      const response = await axios.post("https://wdp301-lzse.onrender.com/api/user/login", credentials, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true
      });
  
      const user = response.data;
      if (user.status === 'banned') {
        setError("Your account has been banned. Please contact support for assistance.");
        return;
      }
  
      login(user);
      localStorage.setItem("accessToken", user.accessToken);
      if (user.userData.roleId && user.userData.roleId.roleName === 'ROLE_JOBSEEKER') {
        navigate("/home");
      } else {
        navigate("/admin/home");
      }
    } catch (error) {
      console.error("Login error:", error.response ? error.response.data : error.message);
      setError(error.response?.status === 403 
        ? "Your account has been banned. Please contact support for assistance."
        : "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google?type=jobseeker";
  };

  return (
    <div
        className="flex justify-center items-center w-full h-screen bg-gradient-to-r from-yellow-400 via-orange-500 to-brown-700"
    >
        {/* Main Container */}
        <div className="flex w-[1200px] h-[800px] bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Left Section */}
            <div className="w-2/5 bg-gradient-to-b from-yellow-400 via-orange-500 to-brown-700 p-8 flex flex-col justify-center items-center relative">
                {/* Logo */}
                <div className="absolute top-6 left-6">
                    <img className="w-10 h-10" src="/images/easyjobwithouttext.png" alt="Logo" />
                </div>

                {/* Welcome Text */}
                <div className="relative w-[314px] h-[72px]">
                    <p className="absolute top-10 left-1/2 transform -translate-x-1/2 text-shadow-[0px_3px_3px_#00000040] font-bold text-white text-3xl tracking-[0] leading-[normal] whitespace-nowrap">
                        Sign in to Get <br /> Started
                    </p>
                </div>

                {/* Image */}
                <div className="w-[457px] h-[591px] relative">
                    <img
                        className="absolute w-[457px] h-[578px] top-5 left-14 object-cover"
                        alt="Main image"
                        src={mainImage}
                    />
                </div>
            </div>

            {/* Right Section - Form */}
            <div className="w-3/5 flex justify-center items-center bg-white">
                <div className="w-[80%] bg-white rounded-2xl p-10 shadow-md">
                    <div className="flex flex-col items-center">
                        <img
                            className="w-13 h-13 mb-4"
                            src="/images/easyjobwithouttext.png"
                            alt="Logo"
                        />
                        <h2 className="text-3xl font-semibold text-gray-800 mb-8">Sign in</h2>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-6">
                        {/* Email */}
                        <div className="relative">
                            <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                className="pl-10 pr-4 py-3 pt-4 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                            />
                        </div>
                        {/* Password */}
                        <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="pl-10 pr-10 py-3 pt-4 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 focus:outline-none">
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        className="w-full mt-8 p-3 bg-yellow-400 text-white font-medium rounded-md shadow-md hover:bg-yellow-500 transition flex items-center justify-center"
                        onClick={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
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
                        ) : null}
                        <span>{isLoading ? "Logging in..." : "Login"}</span>
                    </button>

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

                    {/* Google Login */}
                    <button
                        onClick={handleGoogleLogin}
                        className="flex items-center justify-center w-full p-3 border border-gray-300 rounded-md hover:bg-gray-100 transition gap-2"
                    >
                          <img className="w-6 mr-3" src={logoGoogle} alt="Logo Google" />
                        <span className="text-gray-600 font-medium">
                            Login with Google
                        </span>
                    </button>

                    {/* Register Link */}
                    <p className="text-center text-gray-600 text-sm mt-6">
                        You don't have an account?{" "}
                        <a
                            href="/register"
                            className="text-yellow-500 hover:text-yellow-600 underline"
                        >
                            Create one
                        </a>
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
}

export default Login;
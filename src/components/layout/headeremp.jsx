import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from "../../Context";
import axios from 'axios';
import ChatBox from './chatbox';

const HeaderEmployer = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const { user, logout } = useContext(UserContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const user = localStorage.getItem("user");
  //   setIsLoggedIn(!!user);

  //   if (user) {
  //     fetchNotifications();
  //   }
  // }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/notification/employer-notifications",
        { withCredentials: true }
      );

      // Retrieve existing read status from local storage
      const existingReadStatus = JSON.parse(localStorage.getItem("notificationReadStatus")) || {};

      // Update notifications with read status from local storage
      const updatedNotifications = response.data.map((notif) => ({
        ...notif,
        read: existingReadStatus[notif.id] || false, // Use stored read status
      }));

      setNotifications(updatedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((notif) => ({
      ...notif,
      read: true,
    }));
    setNotifications(updatedNotifications);

    // Update local storage with the new read status
    const readStatus = {};
    updatedNotifications.forEach((notif) => {
      readStatus[notif.id] = true; // Mark all as read
    });
    localStorage.setItem("notificationReadStatus", JSON.stringify(readStatus));
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowAccountMenu(false); // Close account menu
    if (!showNotifications) {
      markAllAsRead(); // Mark all as read when opening
    }
  };

  const toggleAccountMenu = () => {
    setShowAccountMenu(!showAccountMenu);
    setShowNotifications(false); // Close notifications
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowNotifications(false);
        setShowAccountMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-gradient-to-r from-white via-blue-50 to-indigo-50 backdrop-blur-md shadow-xl sticky top-0 z-50 border-b border-white/20">
      <nav className="flex items-center justify-between h-20 px-6 sm:px-12 max-w-7xl mx-auto">
        {/* Logo and Branding */}
        <Link to="/homeemp" className="flex items-center space-x-3 group">
          <div className="relative">
            <img
              src="/images/easyjobb.png"
              alt="EasyJob"
              className="w-12 h-12 rounded-2xl object-cover shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent tracking-tight">
              EasyJob
            </span>
            <span className="text-xs text-gray-500 font-medium">For Employers</span>
          </div>
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="sm:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="w-5 h-5 flex flex-col justify-between space-y-1">
            <span className={`w-full h-0.5 bg-gray-700 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`w-full h-0.5 bg-gray-700 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-full h-0.5 bg-gray-700 transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </div>
        </button>

        {/* Main Navigation Links - Desktop */}
        <ul className="hidden sm:flex items-center space-x-2">
          <li>
            <Link
              to="/company"
              className="group flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/40 backdrop-blur-sm hover:bg-white/60 text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:shadow-lg"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <span>Company</span>
            </Link>
          </li>
          <li>
            <Link
              to="/create-job"
              className="group flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/40 backdrop-blur-sm hover:bg-white/60 text-gray-700 hover:text-purple-600 font-medium transition-all duration-300 hover:shadow-lg"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              <span>Post Job</span>
            </Link>
          </li>
          <li>
            <Link
              to="/jobslist"
              className="group flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/40 backdrop-blur-sm hover:bg-white/60 text-gray-700 hover:text-indigo-600 font-medium transition-all duration-300 hover:shadow-lg"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"></path>
                </svg>
              </div>
              <span>My Jobs</span>
            </Link>
          </li>
          <li>
            <Link
              to="/listApplyCv"
              className="group flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/40 backdrop-blur-sm hover:bg-white/60 text-gray-700 hover:text-orange-600 font-medium transition-all duration-300 hover:shadow-lg"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <span>CVs</span>
            </Link>
          </li>
        </ul>

        {/* Right Section (Icons & Profile) */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <div className="relative dropdown-container">
            <button
              onClick={toggleNotifications}
              className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              {notifications.filter((notif) => !notif.read).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {notifications.filter((notif) => !notif.read).length}
                </span>
              )}
              <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-96 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 transform transition-all duration-300 animate-in slide-in-from-top-2">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Notifications</h3>
                    <span className="text-sm text-gray-500">{notifications.filter(n => !n.read).length} unread</span>
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-3">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                          </svg>
                        </div>
                        <p className="text-gray-500 font-medium">No notifications yet</p>
                        <p className="text-gray-400 text-sm">We'll notify you when something happens</p>
                      </div>
                    ) : (
                      notifications.map((notif, index) => (
                        <div
                          key={notif.id}
                          className={`p-4 rounded-xl transition-all duration-300 ${notif.read
                            ? "bg-gray-50/50 border border-gray-100"
                            : "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm"
                            }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${notif.read ? 'bg-gray-300' : 'bg-blue-500'}`}></div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-700 leading-relaxed">{notif.message}</p>
                              <p className="text-xs text-gray-500 mt-1">Just now</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <Link
            to="/messageListAccount"
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <svg className="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </Link>

          {/* Account Menu */}
          <div className="relative dropdown-container">
            <button
              onClick={toggleAccountMenu}
              className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </button>

            {/* Account Dropdown Menu */}
            {showAccountMenu && (
              <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 transform transition-all duration-300 animate-in slide-in-from-top-2">
                <div className="p-2">
                  <Link
                    to="/viewprofilejb"
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors duration-300">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </div>
                    <span className="font-medium">Edit Profile</span>
                  </Link>

                  <Link
                    to="/changepass"
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center transition-colors duration-300">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                    </div>
                    <span className="font-medium">Change Password</span>
                  </Link>

                  <div className="h-px bg-gray-200 my-2 mx-4"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100 group-hover:bg-red-200 flex items-center justify-center transition-colors duration-300">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                      </svg>
                    </div>
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white/95 backdrop-blur-lg border-t border-white/20">
          <div className="px-6 py-4 space-y-2">
            <Link
              to="/company"
              className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-blue-50 transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <span className="font-medium text-gray-700">Company Profile</span>
            </Link>

            <Link
              to="/create-job"
              className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-purple-50 transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              <span className="font-medium text-gray-700">Post a Job</span>
            </Link>

            <Link
              to="/jobslist"
              className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-indigo-50 transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"></path>
                </svg>
              </div>
              <span className="font-medium text-gray-700">My Jobs</span>
            </Link>

            <Link
              to="/employer/blogs"
              className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-green-50 transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"></path>
                </svg>
              </div>
              <span className="font-medium text-gray-700">Blogs</span>
            </Link>

            <Link
              to="/listApplyCv"
              className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-orange-50 transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <span className="font-medium text-gray-700">CV Applications</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default HeaderEmployer;
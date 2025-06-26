import { useState, useRef, useEffect } from 'react';
import { Link,  useNavigate } from 'react-router-dom';
import { FiZap, FiUser, FiBarChart, FiSettings, FiStar } from 'react-icons/fi'
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import { useContext } from "react";
import { UserContext } from "../../Context";

import axios from 'axios';
import ChatBox from './chatbox';

// Custom styles to fix dropdown alignment
const customStyles = `
  .navbar .dropdown-toggle {
    display: flex !important;
    align-items: center !important;
  }
  
  .navbar .dropdown-toggle::after {
    margin-left: 0.5rem !important;
    vertical-align: middle !important;
  }
`;

const Header = () => {
  const { user, logout } = useContext(UserContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [usageStats, setUsageStats] = useState(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/notification/jobseeker-notifications",
        { withCredentials: true }
      );

      const existingReadStatus = JSON.parse(localStorage.getItem("notificationReadStatus")) || {};
      const updatedNotifications = response.data.map((notif) => ({
        ...notif,
        read: existingReadStatus[notif.id] || false,
      }));

      setNotifications(updatedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((notif) => ({
      ...notif,
      read: true,
    }));
    setNotifications(updatedNotifications);

    const readStatus = {};
    updatedNotifications.forEach((notif) => {
      readStatus[notif.id] = true;
    });
    localStorage.setItem("notificationReadStatus", JSON.stringify(readStatus));
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      markAllAsRead();
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/home");
  };

  // Get user token
  const getUserToken = () => {
    return user?.accessToken || user?.token;
  };

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      const token = getUserToken();
      if (!token) return;

      try {
        // Fetch current subscription - Updated endpoint
        const subResponse = await fetch('http://localhost:5000/api/subscriptions/my-subscription', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (subResponse.ok) {
          const subData = await subResponse.json();
          setSubscription(subData.result);
        }

        // Fetch usage stats
        const usageResponse = await fetch('http://localhost:5000/api/subscriptions/usage-stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (usageResponse.ok) {
          const usageData = await usageResponse.json();
          setUsageStats(usageData.result);
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error);
      }
    };

    fetchSubscriptionData();
  }, [user]);

  // Subscription status component
  const SubscriptionStatus = () => {
    if (!user) return null;

    const planName = subscription?.planId?.name || 'Free';
    const isFreePlan = planName === 'Free' || !subscription;
    const isTrial = subscription?.status === 'trial';

    const handleUpgradeClick = () => {
      navigate('/packages');
    };

    return (
      <div className="flex items-center mr-4">
        {isFreePlan ? (
          <button 
            onClick={handleUpgradeClick}
            className="flex items-center bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full hover:from-blue-600 hover:to-purple-600 transition-all text-sm font-semibold transform hover:scale-105 border-0"
          >
            <FiZap className="mr-2 text-sm"/>
            Upgrade to Pro
          </button>
        ) : (
          <div className="flex items-center bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 px-4 py-2 rounded-full border border-orange-200">
            <FiStar className="mr-2 text-sm"/>
            <span className="text-sm font-semibold">
              {isTrial ? `${planName} Trial` : planName}
            </span>
          </div>
        )}
      </div>
    );
  };

  // Usage indicator component  
  const UsageIndicator = () => {
    if (!usageStats || !user) return null;

    // Add safe guards for usage data
    const savedJobsUsage = usageStats.savedJobs || { used: 0, limit: 0 };
    const applicationsUsage = usageStats.jobApplications || { used: 0, limit: 0 };

    const getUsageColor = (used, limit) => {
      if (!used || !limit || limit === -1) return 'text-green-600';
      const percentage = used / limit;
      if (percentage >= 0.9) return 'text-red-600';
      if (percentage >= 0.7) return 'text-orange-600';
      return 'text-green-600';
    };

    const formatUsage = (used, limit) => {
      return limit === -1 ? `${used || 0}` : `${used || 0}/${limit || 0}`;
    };

    return (
      <NavDropdown
        title={
          <div className="flex items-center">
            <FiBarChart className="mr-2"/>
            <span className="text-sm">Usage</span>
          </div>
        }
        id="usage-dropdown"
        className="mr-3 d-flex align-items-center"
      >
        <div className="px-4 py-3 min-w-[250px]">
          <h6 className="text-gray-800 font-semibold mb-3">Monthly Usage</h6>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Job Applications</span>
              <span className={`text-sm font-semibold ${getUsageColor(applicationsUsage.used, applicationsUsage.limit)}`}>
                {formatUsage(applicationsUsage.used, applicationsUsage.limit)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Saved Jobs</span>
              <span className={`text-sm font-semibold ${getUsageColor(savedJobsUsage.used, savedJobsUsage.limit)}`}>
                {formatUsage(savedJobsUsage.used, savedJobsUsage.limit)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Profile Views</span>
              <span className="text-sm font-semibold text-blue-600">
                {usageStats.profileViews || 0}
              </span>
            </div>
          </div>

          <hr className="my-3"/>
          
          <Link 
            to="/packages" 
            className="block w-full text-center bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all text-sm font-semibold no-underline"
          >
            View All Plans
          </Link>
        </div>
      </NavDropdown>
    );
  };

  return (
    <>
      <style>{customStyles}</style>
      <Navbar bg="white" expand="lg" className="shadow-sm fixed-top" style={{ zIndex: 1030 }}>
        <Container>
          <Navbar.Brand as={Link} to="/">
            <img
              src="/logo.png"
              width="40"
              height="40"
              className="d-inline-block align-top"
              alt="Logo"
            />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/home">Home</Nav.Link>
              <Nav.Link as={Link} to="/jobsearch">Find Jobs</Nav.Link>
              <Nav.Link as={Link} to="/companies">Companies</Nav.Link>
              <Nav.Link as={Link} to="/blogs">Blogs</Nav.Link>
            </Nav>
            <Nav className="align-items-center">
              {user ? (
                <>
                  <SubscriptionStatus />
                  <UsageIndicator />
                  <NavDropdown
                    title={
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-2">
                          <FiUser className="text-white text-sm"/>
                        </div>
                        <span className="text-sm font-medium">{user.fullName || user.email}</span>
                      </div>
                    }
                    id="user-dropdown"
                    className="d-flex align-items-center"
                  >
                    <NavDropdown.Item as={Link} to="/profile">
                      <div className="flex items-center">
                        <FiUser className="mr-2"/>
                        My Profile
                      </div>
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/application">
                      <div className="flex items-center">
                        <FiBarChart className="mr-2"/>
                        My Applications
                      </div>
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/favorite-jobs">
                      <div className="flex items-center">
                        <FiZap className="mr-2"/>
                        Saved Jobs
                      </div>
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/cvprofile">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Create CV
                      </div>
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/packages">
                      <div className="flex items-center">
                        <FiStar className="mr-2"/>
                        Subscription
                      </div>
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/changepass">
                      <div className="flex items-center">
                        <FiSettings className="mr-2"/>
                        Settings
                      </div>
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={handleLogout}>
                      <div className="flex items-center">
                        <span>Logout</span>
                      </div>
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login" className="btn btn-outline-primary me-2">
                    <div className="flex items-center">
                      Login
                    </div>
                  </Nav.Link>
                  <Nav.Link as={Link} to="/loginemployeer" className="btn btn-primary text-white">
                    <div className="flex items-center">
                      Post A Job
                    </div>
                  </Nav.Link>
                  <Nav.Link as={Link} to="/register" className="btn btn-primary text-white">
                    <div className="flex items-center">
                      Sign Up
                    </div>
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default Header;
// src/pages/admin/DashboardAdmin.jsx
import React, { useState ,useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {getAdminProfile} from "./admin/adminService";
import { useDispatch, useSelector } from "react-redux";

import ManageUsers from './admin/ManageUsers'; // Adjust path as needed
import ManageEvents from './admin/ManageEvents'; // Adjust path as needed


import { 
  FiUsers, 
  FiCalendar, 
  FiBriefcase, 
  FiBell, 
  FiMessageSquare,
  FiHeart,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX
} from "react-icons/fi";
import "./css/DashboardAdmin.css";
import "./css/ManageEvents.css";

function DashboardAdmin() {

  const dispatch = useDispatch();    
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user , setUser] = useState(null);
  
  const { token, roleName: userRole } = useSelector((state) => state.auth); 
  const admin = userRole;
   // Fetch admin profile data
   useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        setLoading(true);
        const profileData = await getAdminProfile(token);
        console.log("profileData"+ profileData);
        setUser(profileData);
        
         
      } catch (err) {
        setError(err.message || "Failed to load admin profile");
        console.error("Admin profile error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token && userRole == "admin") {
      fetchAdminProfile();
    } else {
      setLoading(false);
    }
  }, [token, userRole == "admin", dispatch]);

  
  const renderContent = () => {
    switch(activeTab) {
      case "manageUsers":
        return <ManageUsers />;
      case "manageEvents":
        return <ManageEvents />;
      case "reviewCompanies":
        return <ReviewCompanies />;
      case "sendNotifications":
        return <SendNotifications />;
      case "moderateReviews":
        return <ModerateReviews />;
      case "manageCharities":
        return <ManageCharities />;
      default:
        return <DashboardOverview />;
    }
  };

//   const handleLogout = () => {
//     localStorage.removeItem("adminToken");
//     navigate("/admin/login");
//   };

    // Render loading state
    if (loading) {
        return (
          <div className="admin-dashboard">
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>Loading admin data...</p>
            </div>
          </div>
        );
      }
    
      // Render error state
      if (error) {
        return (
          <div className="admin-dashboard">
            <div className="error-container">
              <h2>Error Loading Dashboard</h2>
              <p>{error}</p>
              <button 
                className="btn-retry"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>
        );
      }


  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <button className="mobile-close-btn" onClick={() => setMobileMenuOpen(false)}>
            <FiX />
          </button>
        </div>
        
         
        <div className="admin-profile">
          <div className="profile-image">
            {admin?.profilePic ? (
              <img src={admin.profilePic} alt="Admin" />
            ) : (
              <div className="avatar-placeholder">
                {admin?.userName?.charAt(0) || 'A'}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h3>{user?.userName || 'Admin'}</h3>
            <p>{user?.email || 'admin@example.com'}</p>
            <span className="role-badge admin">
              {user?.roleId?.roleName || 'Admin'}
            </span>
          </div>
        </div>

        <nav className="admin-nav">
          <button 
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => setActiveTab("dashboard")}
          >
            <FiSettings /> Dashboard
          </button>
          
          <button 
            className={activeTab === "manageUsers" ? "active" : ""}
            onClick={() => setActiveTab("manageUsers")}
          >
            <FiUsers /> Manage Users
          </button>
          
          <button 
            className={activeTab === "manageEvents" ? "active" : ""}
            onClick={() => setActiveTab("manageEvents")}
          >
            <FiCalendar /> Manage Events
          </button>
          
          <button 
            className={activeTab === "reviewCompanies" ? "active" : ""}
            onClick={() => setActiveTab("reviewCompanies")}
          >
            <FiBriefcase /> Review Companies
          </button>
          
          <button 
            className={activeTab === "sendNotifications" ? "active" : ""}
            onClick={() => setActiveTab("sendNotifications")}
          >
            <FiBell /> Send Notifications
          </button>
          
          <button 
            className={activeTab === "moderateReviews" ? "active" : ""}
            onClick={() => setActiveTab("moderateReviews")}
          >
            <FiMessageSquare /> Moderate Reviews
          </button>
          
          <button 
            className={activeTab === "manageCharities" ? "active" : ""}
            onClick={() => setActiveTab("manageCharities")}
          >
            <FiHeart /> Manage Charities
          </button>
        </nav>
        
        {/* <div className="sidebar-footer">
          <button onClick={handleLogout}>
            <FiLogOut /> Logout
          </button>
        </div> */}
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <div className="admin-header">
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
            <FiMenu />
          </button>
          <div className="header-search">
            <input type="text" placeholder="Search..." />
          </div>
          <div className="header-actions">
            <button className="notification-btn">
              <FiBell />
              <span className="badge">3</span>
            </button>
            <div className="admin-dropdown">
              <img src="/path/to/admin-avatar.jpg" alt="Admin" />
            </div>
          </div>
        </div>

        <div className="admin-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

// Dashboard Overview Component
function DashboardOverview() {
  // Sample data for dashboard stats
  const stats = [
    { title: "Total Users", value: "2,842", icon: <FiUsers />, change: "+12%" },
    { title: "Pending Companies", value: "24", icon: <FiBriefcase />, change: "+3" },
    { title: "Active Events", value: "18", icon: <FiCalendar />, change: "-2" },
    { title: "Charity Requests", value: "7", icon: <FiHeart />, change: "+1" }
  ];

  return (
    <div className="dashboard-overview">
      <h1>Admin Dashboard</h1>
      
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div className="stat-card" key={index}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-info">
              <h3>{stat.title}</h3>
              <p>{stat.value}</p>
              <span className={stat.change.startsWith('+') ? "positive" : "negative"}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">
              <FiUsers />
            </div>
            <div className="activity-content">
              <p><strong>John Doe</strong> registered as a new user</p>
              <small>2 hours ago</small>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <FiBriefcase />
            </div>
            <div className="activity-content">
              <p><strong>TechCorp</strong> submitted for review</p>
              <small>5 hours ago</small>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <FiMessageSquare />
            </div>
            <div className="activity-content">
              <p><strong>Sarah Johnson</strong> posted a new review</p>
              <small>Yesterday</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Manage Users Component


// Placeholder components for other sections


function ReviewCompanies() {
  return <div className="manage-section"><h2>Review Companies</h2><p>Company review content goes here...</p></div>;
}

function SendNotifications() {
  return <div className="manage-section"><h2>Send Notifications</h2><p>Notification system content goes here...</p></div>;
}

function ModerateReviews() {
  return <div className="manage-section"><h2>Moderate Reviews</h2><p>Review moderation content goes here...</p></div>;
}

function ManageCharities() {
  return <div className="manage-section"><h2>Manage Charities</h2><p>Charity management content goes here...</p></div>;
}

export default DashboardAdmin;

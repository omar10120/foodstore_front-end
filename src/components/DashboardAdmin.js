// src/pages/admin/DashboardAdmin.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAdminProfile } from "./admin/adminService";
import { useDispatch, useSelector } from "react-redux";

import ManageUsers from './admin/ManageUsers';
import ManageEvents from './admin/ManageEvents'; 
import ManageCharities from './admin/ManageCharities'; 
import SendNotifications from './admin/SendNotifications';  
import ModerateReviews from './admin/ModerateReviews'; 

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
import "./css/SendNotifications.css";
import "./css/ModerateReviews.css";

function DashboardAdmin() {
  const dispatch = useDispatch();    
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  
  const { token, roleName: userRole } = useSelector((state) => state.auth); 
  const admin = userRole;

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        setLoading(true);
        const profileData = await getAdminProfile(token);
        setUser(profileData);
      } catch (err) {
        setError(err.message || "Failed to load admin profile");
        console.error("Admin profile error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token && userRole === "admin") {
      fetchAdminProfile();
    } else {
      setLoading(false);
    }
  }, [token, userRole, dispatch]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoadingNotifications(true);
        
        // Fetch unread notifications count
        const unreadResponse = await fetch('http://localhost:8080/notifications/me/unread', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!unreadResponse.ok) {
          throw new Error(`Failed to fetch unread notifications: ${unreadResponse.status}`);
        }
        
        const unreadData = await unreadResponse.json();
        setUnreadCount(unreadData.length);
        
        // Fetch all notifications
        const allResponse = await fetch('http://localhost:8080/notifications/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!allResponse.ok) {
          throw new Error(`Failed to fetch notifications: ${allResponse.status}`);
        }
        
        const allData = await allResponse.json();
        
        // Sort notifications by createdAt date (newest first)
        const sortedNotifications = [...allData].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        // Get the newest 5 notifications
        const recentNotifications = sortedNotifications.slice(0, 5);
        setNotifications(recentNotifications);
        
      } catch (err) {
        console.error('Notification fetch error:', err);
      } finally {
        setLoadingNotifications(false);
      }
    };

    if (token) {
      fetchNotifications();
    }
  }, [token]);

  // Mark notification as read
  const markNotificationAsRead = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/notifications/read/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.status}`);
      }
      
      // Update notification state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      
      // Update unread count
      setUnreadCount(prev => prev - 1);
      
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('http://localhost:8080/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to mark all as read: ${response.status}`);
      }
      
      // Update all notifications to read
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
      
    } catch (err) {
      console.error('Mark all as read error:', err);
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case "manageUsers":
        return <ManageUsers />;
      case "manageEvents":
        return <ManageEvents />;
      // case "reviewCompanies":
      //   return <ReviewCompanies />;
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
    <div className="admin-dashboard" >
      <div className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <button className="mobile-close-btn" onClick={() => setMobileMenuOpen(false)}>
            <FiX />
          </button>
        </div>
        
        <div className="admin-profile">
          <div className="profile-image">
            {user?.profilePic ? (
              <img src={user.profilePic} alt="Admin" />
            ) : (
              <div className="avatar-placeholder">
                {user?.userName?.charAt(0) || 'A'}
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
          {/* <button 
            className={activeTab === "reviewCompanies" ? "active" : ""}
            onClick={() => setActiveTab("reviewCompanies")}
          >
            <FiBriefcase /> Review Companies
          </button> */}
          <button 
            className={activeTab === "sendNotifications" ? "active" : ""}
            onClick={() => setActiveTab("sendNotifications")}
          >
            <FiBell /> Send Notifications
          </button>
          <button 
            className={activeTab === "moderateReviews" ? "active" : "" }  
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
      </div>

      <div className="admin-main">
        <div className="admin-header">
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
            <FiMenu />
          </button>
          <div className="header-search">
            <input type="text" placeholder="Search..." />
          </div>
          <div className="header-actions">
            <div className="notification-container">
              <button 
                className="notification-btn" 
                onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
              >
                <FiBell />
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
              </button>
              
              {notificationDropdownOpen && (
                <div className="notification-dropdown">
                  <div className="dropdown-header">
                    <h3>Notifications</h3>
                    <button 
                      className="mark-all-read"
                      onClick={markAllAsRead}
                      disabled={unreadCount === 0}
                    >
                      Mark all as read
                    </button>
                  </div>
                  
                  {loadingNotifications ? (
                    <div className="notification-loading">
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="notification-empty">
                      No notifications
                    </div>
                  ) : (
                    <div className="notification-list">
                      {notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                          onClick={() => !notification.read && markNotificationAsRead(notification.id)}
                        >
                          <div className="notification-title">
                            {notification.title}
                            {!notification.read && <span className="unread-dot"></span>}
                          </div>
                          <div className="notification-message">
                            {notification.message.split('\n').map((line, i) => (
                              <p key={i}>{line}</p>
                            ))}
                          </div>
                          <div className="notification-time">
                            {new Date(notification.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
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

function DashboardOverview() {
  const token = useSelector((state) => state.auth.token);
  const [stats, setStats] = useState([
    { title: "Total Users", value: "0", icon: <FiUsers />, change: "+0%", loading: true },
    { title: "Pending Companies", value: "0", icon: <FiBriefcase />, change: "+0", loading: true },
    { title: "Active Events", value: "0", icon: <FiCalendar />, change: "-0", loading: true },
    { title: "Charity Requests", value: "0", icon: <FiHeart />, change: "+0", loading: true }
  ]);
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [errorUsers, setErrorUsers] = useState(null);
  const [errorActivities, setErrorActivities] = useState(null);

  // Format time difference for recent activities
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    }
    
    return date.toLocaleDateString();
  };

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/users', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.status}`);
        }

        const data = await response.json();
        const newStats = [...stats];
        newStats[0] = { 
          ...newStats[0], 
          value: data.length.toString(), 
          loading: false 
        };
        setStats(newStats);
        setErrorUsers(null);
      } catch (err) {
        setErrorUsers(err.message);
        console.error('Fetch users error:', err);
        const newStats = [...stats];
        newStats[0] = { 
          ...newStats[0], 
          value: 'Error', 
          loading: false 
        };
        setStats(newStats);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (token) {
      fetchUsers();
    }
  }, [token]);

  // Fetch recent activities (notifications)
  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        setLoadingActivities(true);
        const response = await fetch('http://localhost:8080/notifications/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch activities: ${response.status}`);
        }

        const data = await response.json();
        
        // Sort by createdAt (newest first)
        const sortedActivities = [...data].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        // Get the 3 most recent activities
        const recentActivities = sortedActivities.slice(0, 3);
        setRecentActivities(recentActivities);
        setErrorActivities(null);
      } catch (err) {
        setErrorActivities(err.message);
        console.error('Fetch activities error:', err);
        setRecentActivities([]);
      } finally {
        setLoadingActivities(false);
      }
    };

    if (token) {
      fetchRecentActivities();
    }
  }, [token]);

  return (
    <div className="dashboard-overview">
      <h1>Admin Dashboard</h1>
      
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div className="stat-card" key={index}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-info">
              <h3>{stat.title}</h3>
              {stat.loading ? (
                <div className="stat-loading">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
              ) : (
                <p>{stat.value}</p>
              )}
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
          {loadingActivities ? (
            <div className="activity-loading">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          ) : errorActivities ? (
            <div className="activity-error">
              <p>Failed to load recent activities</p>
              <button 
                className="btn-retry-small"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="activity-empty">
              <p>No recent activities</p>
            </div>
          ) : (
            recentActivities.map(activity => {
              // Choose icon based on notification type
              let icon;
              switch(activity.type) {
                case 'EVENT':
                  icon = <FiCalendar />;
                  break;
                case 'USER':
                  icon = <FiUsers />;
                  break;
                case 'CHARITY':
                  icon = <FiHeart />;
                  break;
                case 'COMPANY':
                  icon = <FiBriefcase />;
                  break;
                default:
                  icon = <FiBell />;
              }
              
              return (
                <div className="activity-item" key={activity.id}>
                  <div className="activity-icon">
                    {icon}
                  </div>
                  <div className="activity-content">
                    <p>
                      <strong>{activity.title}</strong>
                      <br />
                      {activity.message.split('\n')[0]}
                    </p>
                    <small>{formatTimeAgo(activity.createdAt)}</small>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewCompanies() {
  return <div className="manage-section"><h2>Review Companies</h2><p>Company review content goes here...</p></div>;
}



export default DashboardAdmin;
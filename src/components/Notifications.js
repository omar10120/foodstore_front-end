// src/pages/NotificationsPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiBell, FiCheck, FiCheckSquare, FiArrowLeft } from "react-icons/fi";
import "./css/Notifications.css";

function NotificationsPage() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Format time difference for notifications
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hr ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch unread notifications count
      const unreadResponse = await fetch('http://localhost:8080/notifications/me/unread', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (unreadResponse.ok) {
        const unreadData = await unreadResponse.json();
        setUnreadCount(unreadData.length);
      }
      
      // Fetch all notifications
      const allResponse = await fetch('http://localhost:8080/notifications/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (allResponse.ok) {
        const allData = await allResponse.json();
        
        // Sort notifications by createdAt date (newest first)
        const sortedNotifications = [...allData].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setNotifications(sortedNotifications);
      } else {
        throw new Error('Failed to fetch notifications');
      }
      
    } catch (err) {
      setError(err.message || "Failed to load notifications");
      console.error('Notification fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
      
      if (response.ok) {
        // Update notification state
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === id ? { ...notif, read: true } : notif
          )
        );
        
        // Update unread count
        setUnreadCount(prev => prev - 1);
      }
      
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
      
      if (response.ok) {
        // Update all notifications to read
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
        
        // Reset unread count
        setUnreadCount(0);
      }
      
    } catch (err) {
      console.error('Mark all as read error:', err);
    }
  };

  // Group notifications by date
  const groupNotificationsByDate = () => {
    const grouped = {};
    
    notifications.forEach(notification => {
      const date = new Date(notification.createdAt);
      const dateStr = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      
      grouped[dateStr].push(notification);
    });
    
    return grouped;
  };
  
  const groupedNotifications = groupNotificationsByDate();

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <Link to="/" className="back-button">
          <FiArrowLeft size={20} /> Back
        </Link>
        <h1>
          <FiBell className="header-icon" /> Notifications
        </h1>
        <div style={{marginTop:"90px"}}>
        {unreadCount > 0 && (
          <button 
            className="mark-all-button" style={{}}
            onClick={markAllAsRead}
          >
            <FiCheckSquare size={16} /> Mark all as read
          </button>
        )}
        </div>
      </div>
      
      {loading ? (
        <div className="loading-section">
          <div className="spinner"></div>
          <p>Loading notifications...</p>
        </div>
      ) : error ? (
        <div className="error-section">
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={fetchNotifications}
          >
            Retry
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="empty-section">
          <FiBell size={48} className="empty-icon" />
          <h2>No notifications yet</h2>
          <p>You'll see notifications here when you have updates.</p>
        </div>
      ) : (
        <div className="notifications-container">
          {Object.entries(groupedNotifications).map(([date, notifications]) => (
            <div key={date} className="notification-group">
              <h2 className="group-date">{date}</h2>
              <div className="notification-list">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  >
                    <div className="notification-content">
                      <div className="notification-title">
                        {notification.title}
                        {!notification.read && (
                          <button 
                            className="mark-read-button"
                            onClick={() => markNotificationAsRead(notification.id)}
                            title="Mark as read"
                          >
                            <FiCheck size={16} />
                          </button>
                        )}
                      </div>
                      <div className="notification-message">
                        {notification.message.split('\n').map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                      <div className="notification-time">
                        {formatTimeAgo(notification.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;
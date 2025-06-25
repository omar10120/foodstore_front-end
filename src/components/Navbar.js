// src/components/NavBar.js
import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "./Redux/Slices/AuthSlice"; 
import { 
  FiBell, 
  FiMail, 
  FiUser, 
  FiLogOut,
  FiCheckSquare,
  FiMessageSquare,
  FiSend,
  FiPhone,
  FiMail as FiEmailIcon
} from "react-icons/fi";
import "./css/NavBar.css";
import axios from "axios";


function NavBar() {
  const [showModal, setShowModal] = useState(false);
  const [showModalDiscounts, setShowModalDiscounts] = useState(false);
  const [message, setMessage] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [sendStatus, setSendStatus] = useState(null);
  const [showToast, setShowToast] = useState(false);
  // Get auth state
  // const { token, userName } = useSelector((state) => state.auth);
  const { token, userName, email } = useSelector((state) => state.auth);
  const roleName = useSelector((state) => state.auth.roleName);
  const displayName = userName || "User";
  const [isSending, setIsSending] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return;
      
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
          
          // Get the newest 5 notifications
          const recentNotifications = sortedNotifications.slice(0, 5);
          setNotifications(recentNotifications);
        }
        
      } catch (err) {
        console.error('Notification fetch error:', err);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();
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

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    setShowUserMenu(false);
  };

  const showToastMessage = (msg, type) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      showToastMessage("Please enter a message", "error");
      return;
    }
    
    setIsSending(true);
    setSendStatus(null);
    
    try {
      const payload = {
        message: message.trim()
      };
      
      // Add seller email if the user is a seller
      if (roleName === "seller" && email) {
        payload.sellerEmail = email;
      }
      
      const response = await axios.post(
        "http://localhost:8080/api/feedback",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.status === 200) {
        setSendStatus("success");
        setMessage("");
        showToastMessage("Message sent successfully!", "success");
        setTimeout(() => {
          setShowModal(false);
          setSendStatus(null);
        }, 2000);
      } else {
        setSendStatus("error");
        showToastMessage("Failed to send message", "error");
      }
    } catch (error) {
      console.error("Error sending feedback:", error);
      setSendStatus("error");
      showToastMessage("Failed to send message", "error");
    } finally {
      setIsSending(false);
    }
  };


  const handleSendDiscounts = () => {
    setShowModalDiscounts(false);
  };

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
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Close notification dropdown
      if (notificationDropdownOpen && !e.target.closest('.notification-container')) {
        setNotificationDropdownOpen(false);
      }
      
      // Close user menu
      if (showUserMenu && !e.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu, notificationDropdownOpen]);

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            Naema نعمة
          </Link>
          <img 
              src={`${process.env.PUBLIC_URL}/images/Naema Logo-01.png`} 
              alt="Naema Logo"
              style={{ 
                height: "50px", 
                marginRight: "10px",
                objectFit: "contain"
              }}
            />
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {[
              { to: "/", title: "Home" },
              { to: "/Discounts", title: "Discounts" },
              { to: "/charity", title: "Charities" },
              { to: "/advices", title: "Advices" },
              { to: "/cart", title: "Cart" },
              {
                to: "#",
                title: "Contact Us",
                onClick: () => setShowModal(true),
              },
              { to: "/about", title: "About" },
            ].map((item, index) => (
              <li
                className="nav-item"
                style={{ marginLeft: "50px", marginTop: "-16px" }}
                key={index}
              >
                <Link
                  className="nav-link py-3 border-bottom rounded-0"
                  aria-label={item.title}
                  title={item.title}
                  to={item.to}
                  onClick={item.onClick}
                >
                  {item.title}
                </Link>
              </li>
            ))}
            
            {/* Notification Bell */}
            {token && roleName != "admin" &&(
              <li className="nav-item notification-container" style={{ marginLeft: "30px", marginTop: "0px" }}>
                <div 
                  className="notification-bell"
                  onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                >
                  <FiBell size={20} />
                  {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                </div>
                
                {notificationDropdownOpen && (
                  <div className="notification-dropdown">
                    <div className="dropdown-header">
                      <h3>Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          className="mark-all-read"
                          onClick={markAllAsRead}
                        >
                          <FiCheckSquare size={16} /> Mark all read
                        </button>
                      )}
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
                              {notification.message.split('\n')[0]}
                            </div>
                            
                            <div className="notification-time">
                              {formatTimeAgo(notification.createdAt)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="dropdown-footer">
                      <Link to="/notifications" onClick={() => setNotificationDropdownOpen(false)}>
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </li>
            )}
            
            {/* User Profile Section */}
            {token ? (
              <li className="nav-item user-menu-container" style={{ marginLeft: "30px", marginTop: "0px" }}>
                
                <div 
                  className="user-avatar-container  dropdown-toggle"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="user-avatar ">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="user-name">{displayName}</span>
                </div>
                
                {showUserMenu && (
                  <div className="user-menu">
                    <Link 
                      to="/profile" 
                      className="menu-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FiUser className="menu-icon" /> My Profile
                    </Link>
                    <div className="divider"></div>
                    <button 
                      className="menu-item logout-btn"
                      onClick={handleLogout}
                    >
                      <FiLogOut className="menu-icon" /> Logout
                    </button>
                  </div>
                )}
              </li>
            ) : (
              <li 
                className="nav-item" 
                style={{ marginLeft: "50px", marginTop: "-16px" }}
              >
                <Link
                  className="nav-link py-3 border-bottom rounded-0"
                  to="/login"
                >
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </nav>

      {/* Contact Us Modal */}
       {/* Contact Us Modal */}
       <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        aria-labelledby="contact-modal"
        centered
        dialogClassName="contact-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title id="contact-modal">
            <div className="modal-title-container">
              <FiMessageSquare className="modal-title-icon "  style={{color: "white"}}/>
              <span>Contact Us</span>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="contact-info-container">
            <div className="contact-info-item">
              <FiPhone className="contact-icon" />
              <div className="contact-details">
                <div className="contact-label">Phone</div>
                <div className="contact-value">0999999999</div>
              </div>
            </div>
            
            <div className="contact-info-item">
              <FiEmailIcon className="contact-icon" />
              <div className="contact-details">
                <div className="contact-label">Email</div>
                <div className="contact-value">admin@admin.com</div>
              </div>
            </div>
          </div>
          
          <div className="message-form-container">
            <div className="form-group">
              <label htmlFor="message-text" className="form-label">
                Your Message:
              </label>
              <textarea
                className="form-control message-textarea"
                id="message-text"
                rows={5}
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSending}
              />
            </div>
            
            {sendStatus === 'success' && (
              <div className="alert alert-success mt-3">
                <FiSend className="me-2" />
                Message sent successfully!
              </div>
            )}
            
            {sendStatus === 'error' && (
              <div className="alert alert-danger mt-3">
                <FiSend className="me-2" />
                Failed to send message. Please try again.
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowModal(false)}
            disabled={isSending}
          >
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSendMessage}
            disabled={isSending || !message.trim()}
          >
            {isSending ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Sending...
              </>
            ) : (
              <>
                <FiSend className="me-2" />
                Send Message
              </>
            )}
          </button>
        </Modal.Footer>
      </Modal>

      {/* Discounts Modal */}
      <Modal
        show={showModalDiscounts}
        onHide={() => setShowModalDiscounts(false)}
        aria-labelledby="modalLabel"
        dialogClassName="custom-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title id="modalLabel">Discounts</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          <form>
            <div className="container-discounts">
              <h3>Choose Your Discount</h3>
              <div
                className="card-discounts"
                style={{
                  width: "100%",
                  height: "300px",
                  backgroundColor: "blue",
                  marginLeft: "0",
                  marginTop: "30px",
                }}
              >
                <div className="mb-3">
                  <h1 className="discount1">Discount No:1</h1>
                  <h1>--------------------</h1>
                  <img
                    style={{
                      width: "150px",
                      height: "50px",
                      marginLeft: "20px",
                      marginTop: "10px",
                    }}
                    src={`${process.env.PUBLIC_URL}/images/th.jfif`}
                    alt="Discount Product"
                  />
                </div>
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer
          style={{ display: "flex", justifyContent: "center", gap: "10px" }}
        >
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSendDiscounts}
            style={{ width: "100px", height: "50px" }}
          >
            Apply Discount
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowModalDiscounts(false)}
            style={{ width: "100px", height: "50px" }}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default NavBar;
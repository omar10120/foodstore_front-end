import React, { useState, useEffect } from "react";
import { FiSend, FiBell, FiTrash2, FiMail, FiCheck, FiX } from "react-icons/fi";
import { useSelector } from "react-redux";

function SendNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "INFO"
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const token = useSelector((state) => state.auth.token);
  const admin = useSelector((state) => state.auth.user);

  // Fetch notifications data from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/notifications/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      // Sort by created date descending
      const sortedData = data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setNotifications(sortedData);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is changed
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ""
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.message.trim()) errors.message = "Message is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch('http://localhost:8080/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to send notification');
      }
      
      // Show success message
      setSuccessMessage("Notification sent successfully!");
      
      // Reset form
      setFormData({
        title: "",
        message: "",
        type: "INFO"
      });
      
      // Refresh notifications after a short delay
      setTimeout(() => {
        fetchNotifications();
        setSuccessMessage(null);
      }, 2000);
      
    } catch (err) {
      console.error("Send notification error:", err);
      setFormErrors({ submit: err.message || "Failed to send notification" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render loading state
  if (loading) {
    return (
      <div className="send-notifications">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="send-notifications">
        <div className="error-alert">
          <strong>Error:</strong> {error}
          <button 
            className="btn-retry"
            onClick={fetchNotifications}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="send-notifications">
      <div className="section-header">
        <h2>Notifications</h2>
        <div className="actions">
          <button 
            className="btn-primary"
            onClick={() => setShowSendModal(true)}
          >
            <FiSend /> Send Notification
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="success-message">
          <FiCheck /> {successMessage}
        </div>
      )}

      <div className="notifications-container">
        <div className="notifications-header">
          <h3>Notification History</h3>
          <div className="stats">
            <span className="total">Total: {notifications.length}</span>
            <span className="unread">
              Unread: {notifications.filter(n => !n.read).length}
            </span>
          </div>
        </div>
        
        <div className="notifications-list">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-card ${notification.read ? 'read' : 'unread'}`}
              >
                <div className="notification-icon">
                  {notification.type === 'INFO' ? (
                    <FiMail className="info" />
                  ) : (
                    <FiBell className="promo" />
                  )}
                </div>
                
                <div className="notification-content">
                  <div className="notification-header">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-date">
                      {formatDate(notification.createdAt)}
                    </div>
                  </div>
                  
                  <div className="notification-message">
                    {notification.message}
                  </div>
                  
                  <div className="notification-footer">
                    <div className="notification-meta">
                      <span className={`type-badge ${notification.type.toLowerCase()}`}>
                        {notification.type}
                      </span>
                      <span className="recipient">
                        To: {notification.userName || "All Users"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-notifications">
              <div className="no-notifications-content">
                <FiMail className="empty-icon" />
                <p>No notifications found</p>
                <button 
                  className="btn-send-first"
                  onClick={() => setShowSendModal(true)}
                >
                  Send your first notification
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Send Notification Modal */}
      {showSendModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Send Notification</h2>
              <button 
                className="modal-close"
                onClick={() => setShowSendModal(false)}
                disabled={isSubmitting}
              >
                <FiX />
              </button>
            </div>
            
            <div className="modal-body">
              {formErrors.submit && (
                <div className="form-error">
                  {formErrors.submit}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter notification title"
                    className={formErrors.title ? "error" : ""}
                  />
                  {formErrors.title && <div className="error-message">{formErrors.title}</div>}
                </div>
                
                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="5"
                    placeholder="Enter your notification message"
                    className={formErrors.message ? "error" : ""}
                  />
                  {formErrors.message && <div className="error-message">{formErrors.message}</div>}
                </div>
                
                <div className="form-group">
                  <label>Type</label>
                  <div className="type-options">
                    <label className={`type-option ${formData.type === 'INFO' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="type"
                        value="INFO"
                        checked={formData.type === 'INFO'}
                        onChange={handleInputChange}
                      />
                      <span>Information</span>
                    </label>
                    
                    <label className={`type-option ${formData.type === 'PROMO' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="type"
                        value="PROMO"
                        checked={formData.type === 'PROMO'}
                        onChange={handleInputChange}
                      />
                      <span>Promotion</span>
                    </label>
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowSendModal(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="submitting-spinner"></div>
                    ) : (
                      <>
                        <FiSend /> Send Notification
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SendNotifications;
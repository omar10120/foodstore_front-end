import React, { useState, useEffect } from "react";
import { FiCalendar, FiEdit, FiTrash2, FiPlus, FiSearch, FiX } from "react-icons/fi";
import { useSelector } from "react-redux";

function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    eventDate: "",
    charityId: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const eventsPerPage = 5;
  
  const token = useSelector((state) => state.auth.token);
  const admin = useSelector((state) => state.auth.user);

  // Fetch events data from API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const data = await response.json();
      setEvents(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  // Fetch charities for dropdown
  const fetchCharities = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/charities', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch charities');
      }
      
      const data = await response.json();
      setCharities(data);
    } catch (err) {
      console.error("Charity fetch error:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchCharities();
  }, [token]);

  // Handle event deletion
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(eventId);
      setDeleteError(null);
      
      const response = await fetch(`http://localhost:8080/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete event');
      }
      
      // Remove event from local state
      setEvents(events.filter(event => event.eventId !== eventId));
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteError(err.message || "Failed to delete event");
    } finally {
      setDeletingId(null);
    }
  };

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
    if (!formData.description.trim()) errors.description = "Description is required";
    if (!formData.location.trim()) errors.location = "Location is required";
    if (!formData.eventDate) errors.eventDate = "Date is required";
    if (!formData.charityId) errors.charityId = "Charity is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch('http://localhost:8080/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          // Convert to UTC format
          eventDate: new Date(formData.eventDate).toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create event');
      }
      
      const newEvent = await response.json();
      
      // Add the new event to the list
      setEvents([newEvent, ...events]);
      
      // Reset form and close modal
      setFormData({
        title: "",
        description: "",
        location: "",
        eventDate: "",
        charityId: ""
      });
      setShowCreateModal(false);
    } catch (err) {
      console.error("Create event error:", err);
      setFormErrors({ submit: err.message || "Failed to create event" });
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

  // Filter events based on search
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.targetCharity?.charityName?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  // Render loading state
  if (loading) {
    return (
      <div className="manage-events">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="manage-events">
        <div className="error-alert">
          <strong>Error:</strong> {error}
          <button 
            className="btn-retry"
            onClick={fetchEvents}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-events">
      <div className="section-header">
        <h2>Manage Events</h2>
        <div className="actions">
          <div className="search-box with-icon">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search events..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus /> Create Event
          </button>
        </div>
      </div>

      {deleteError && (
        <div className="delete-error">
          <strong>Delete failed:</strong> {deleteError}
          <button onClick={() => setDeleteError(null)}>Dismiss</button>
        </div>
      )}

      <div className="events-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Date & Time</th>
              <th>Location</th>
              <th>Charity</th>
              <th>Created By</th>
              {/* <th>Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {currentEvents.length > 0 ? (
              currentEvents.map(event => (
                <tr key={event.eventId}>
                  <td>
                    <div className="event-info">
                      <div className="event-icon">
                        <FiCalendar />
                      </div>
                      <div>
                        <div className="event-title">{event.title}</div>
                        <div className="event-description">{event.description}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="event-date">
                      {formatDate(event.eventDate)}
                    </div>
                  </td>
                  <td>{event.location}</td>
                  <td>
                    {event.targetCharity ? (
                      <div className="charity-info">
                        <div className="charity-name">{event.targetCharity.charityName}</div>
                        <div className="charity-id">ID: {event.targetCharity.charityId}</div>
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>
                    {event.createdBy ? (
                      <div className="creator-info">
                        <div className="creator-name">{event.createdBy.userName}</div>
                        <div className="creator-email">{event.createdBy.email}</div>
                      </div>
                    ) : (
                      "System"
                    )}
                  </td>
                  {/* <td>
                    <div className="table-actions">
                      <button className="btn-icon" title="Edit">
                        <FiEdit />
                      </button>
                      
                      <button 
                        className="btn-icon danger" 
                        title="Delete Event"
                        onClick={() => handleDeleteEvent(event.eventId)}
                        disabled={deletingId === event.eventId}
                      >
                        {deletingId === event.eventId ? (
                          <div className="deleting-spinner"></div>
                        ) : (
                          <FiTrash2 />
                        )}
                      </button>
                    </div>
                  </td> */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-events">
                  <div className="no-events-content">
                    <p>No events found</p>
                    {searchTerm && (
                      <button onClick={() => setSearchTerm('')}>
                        Clear search
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredEvents.length > 0 && (
        <div className="pagination">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          
          <span>Page {currentPage} of {totalPages}</span>
          
          <button 
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Event</h2>
              <button 
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
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
                    className={formErrors.title ? "error" : ""}
                  />
                  {formErrors.title && <div className="error-message">{formErrors.title}</div>}
                </div>
                
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className={formErrors.description ? "error" : ""}
                  />
                  {formErrors.description && <div className="error-message">{formErrors.description}</div>}
                </div>
                
                <div className="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={formErrors.location ? "error" : ""}
                  />
                  {formErrors.location && <div className="error-message">{formErrors.location}</div>}
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Date & Time *</label>
                    <input
                      type="datetime-local"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleInputChange}
                      className={formErrors.eventDate ? "error" : ""}
                    />
                    {formErrors.eventDate && <div className="error-message">{formErrors.eventDate}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label>Charity *</label>
                    <select
                      name="charityId"
                      value={formData.charityId}
                      onChange={handleInputChange}
                      className={formErrors.charityId ? "error" : ""}
                    >
                      <option value="">Select a charity</option>
                      {charities.map(charity => (
                        <option key={charity.charityId} value={charity.charityId}>
                          {charity.charityName}
                        </option>
                      ))}
                    </select>
                    {formErrors.charityId && <div className="error-message">{formErrors.charityId}</div>}
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowCreateModal(false)}
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
                      "Create Event"
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

export default ManageEvents;
import React, { useState, useEffect } from "react";
import { FiTrash2, FiEdit, FiPlus, FiSearch, FiX } from "react-icons/fi";
import { useSelector } from "react-redux";

function ManageCharities() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentCharity, setCurrentCharity] = useState(null);
  const [formData, setFormData] = useState({
    charityName: "",
    charityDescription: "",
    charityInfo: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const charitiesPerPage = 5;
  
  const token = useSelector((state) => state.auth.token);

  // Fetch charities data from API
  const fetchCharities = async () => {
    try {
      setLoading(true);
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
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load charities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharities();
  }, [token]);

  // Handle charity deletion
  const handleDeleteCharity = async (charityId) => {
    if (!window.confirm('Are you sure you want to delete this charity? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(charityId);
      setDeleteError(null);
      
      const response = await fetch(`http://localhost:8080/api/charities/${charityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete charity');
      }
      
      // Remove charity from local state
      setCharities(charities.filter(charity => charity.charityId !== charityId));
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteError(err.message || "Failed to delete charity");
    } finally {
      setDeletingId(null);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (currentCharity) {
      setCurrentCharity({
        ...currentCharity,
        [name]: value
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error when field is changed
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ""
      });
    }
  };

  // Validate form
  const validateForm = (data) => {
    const errors = {};
    
    if (!data.charityName.trim()) errors.charityName = "Name is required";
    if (!data.charityDescription.trim()) errors.charityDescription = "Description is required";
    if (!data.charityInfo.trim()) errors.charityInfo = "Contact info is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle create form submission
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm(formData)) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch('http://localhost:8080/api/charities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create charity');
      }
      
      const newCharity = await response.json();
      
      // Add the new charity to the list
      setCharities([newCharity, ...charities]);
      
      // Reset form and close modal
      setFormData({
        charityName: "",
        charityDescription: "",
        charityInfo: ""
      });
      setShowCreateModal(false);
    } catch (err) {
      console.error("Create charity error:", err);
      setFormErrors({ submit: err.message || "Failed to create charity" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm(currentCharity)) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`http://localhost:8080/api/charities/${currentCharity.charityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          charityName: currentCharity.charityName,
          charityDescription: currentCharity.charityDescription,
          charityInfo: currentCharity.charityInfo
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update charity');
      }
      
      const updatedCharity = await response.json();
      
      // Update charity in local state
      setCharities(charities.map(charity => 
        charity.charityId === currentCharity.charityId ? updatedCharity : charity
      ));
      
      // Close modal
      setShowEditModal(false);
      setCurrentCharity(null);
    } catch (err) {
      console.error("Update charity error:", err);
      setFormErrors({ submit: err.message || "Failed to update charity" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit modal
  const handleEditClick = (charity) => {
    setCurrentCharity(charity);
    setShowEditModal(true);
    setFormErrors({});
  };

  // Filter charities based on search
  const filteredCharities = charities.filter(charity => 
    charity.charityName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    charity.charityDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    charity.charityInfo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastCharity = currentPage * charitiesPerPage;
  const indexOfFirstCharity = indexOfLastCharity - charitiesPerPage;
  const currentCharities = filteredCharities.slice(indexOfFirstCharity, indexOfLastCharity);
  const totalPages = Math.ceil(filteredCharities.length / charitiesPerPage);

  // Render loading state
  if (loading) {
    return (
      <div className="manage-charities">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading charities...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="manage-charities">
        <div className="error-alert">
          <strong>Error:</strong> {error}
          <button 
            className="btn-retry"
            onClick={fetchCharities}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-charities">
      <div className="section-header">
        <h2>Manage Charities</h2>
        <div className="actions">
          <div className="search-box with-icon">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search charities..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus /> Add Charity
          </button>
        </div>
      </div>

      {deleteError && (
        <div className="delete-error">
          <strong>Delete failed:</strong> {deleteError}
          <button onClick={() => setDeleteError(null)}>Dismiss</button>
        </div>
      )}

      <div className="charities-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Charity</th>
              <th>Description</th>
              <th>Contact Info</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentCharities.length > 0 ? (
              currentCharities.map(charity => (
                <tr key={charity.charityId}>
                  <td>
                    <div className="charity-info">
                      <div className="charity-name">{charity.charityName}</div>
                      {/* <div className="charity-id">ID: {charity.charityId}</div> */}
                    </div>
                  </td>
                  <td>
                    <div className="charity-description">
                      {charity.charityDescription}
                    </div>
                  </td>
                  <td>{charity.charityInfo}</td>
                  <td>
                    <div className="table-actions">
                      {/* <button 
                        className="btn-icon" 
                        title="Edit"
                        onClick={() => handleEditClick(charity)}
                      >
                        <FiEdit />
                      </button> */}
                      
                      <button 
                        className="btn-icon danger" 
                        title="Delete Charity"
                        onClick={() => handleDeleteCharity(charity.charityId)}
                        disabled={deletingId === charity.charityId}
                      >
                        {deletingId === charity.charityId ? (
                          <div className="deleting-spinner"></div>
                        ) : (
                          <FiTrash2 />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-charities">
                  <div className="no-charities-content">
                    <p>No charities found</p>
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
      {filteredCharities.length > 0 && (
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

      {/* Create Charity Modal */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Charity</h2>
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
              
              <form onSubmit={handleCreateSubmit}>
                <div className="form-group">
                  <label>Charity Name *</label>
                  <input
                    type="text"
                    name="charityName"
                    value={formData.charityName}
                    onChange={handleInputChange}
                    className={formErrors.charityName ? "error" : ""}
                  />
                  {formErrors.charityName && <div className="error-message">{formErrors.charityName}</div>}
                </div>
                
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    name="charityDescription"
                    value={formData.charityDescription}
                    onChange={handleInputChange}
                    rows="4"
                    className={formErrors.charityDescription ? "error" : ""}
                  />
                  {formErrors.charityDescription && <div className="error-message">{formErrors.charityDescription}</div>}
                </div>
                
                <div className="form-group">
                  <label>Contact Information *</label>
                  <input
                    type="text"
                    name="charityInfo"
                    value={formData.charityInfo}
                    onChange={handleInputChange}
                    className={formErrors.charityInfo ? "error" : ""}
                  />
                  {formErrors.charityInfo && <div className="error-message">{formErrors.charityInfo}</div>}
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
                      "Create Charity"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Charity Modal */}
      {showEditModal && currentCharity && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Charity</h2>
              <button 
                className="modal-close"
                onClick={() => setShowEditModal(false)}
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
              
              <form onSubmit={handleEditSubmit}>
                <div className="form-group">
                  <label>Charity Name *</label>
                  <input
                    type="text"
                    name="charityName"
                    value={currentCharity.charityName}
                    onChange={handleInputChange}
                    className={formErrors.charityName ? "error" : ""}
                  />
                  {formErrors.charityName && <div className="error-message">{formErrors.charityName}</div>}
                </div>
                
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    name="charityDescription"
                    value={currentCharity.charityDescription}
                    onChange={handleInputChange}
                    rows="4"
                    className={formErrors.charityDescription ? "error" : ""}
                  />
                  {formErrors.charityDescription && <div className="error-message">{formErrors.charityDescription}</div>}
                </div>
                
                <div className="form-group">
                  <label>Contact Information *</label>
                  <input
                    type="text"
                    name="charityInfo"
                    value={currentCharity.charityInfo}
                    onChange={handleInputChange}
                    className={formErrors.charityInfo ? "error" : ""}
                  />
                  {formErrors.charityInfo && <div className="error-message">{formErrors.charityInfo}</div>}
                </div>
                
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowEditModal(false)}
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
                      "Update Charity"
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

export default ManageCharities;
import React, { useEffect, useState } from "react";
import axios from "axios";
import './css/profile.css';
import { useSelector } from 'react-redux';

function ProfileSeller() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/users/me`, 
          { headers: { Authorization: `Bearer ${token}` } });
        setUserData(response.data);
      } catch (err) {
        setError(err.response ? err.response.data : err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserData();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <div className="spinner-border text-light" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
          <div className="profile-body text-center py-4">
            <p>Loading profile data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <span>!</span>
            </div>
            <h2 className="profile-name">Error</h2>
          </div>
          <div className="profile-body text-center py-4">
            <div className="alert alert-danger">
              Error: {error.message || JSON.stringify(error)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <span>?</span>
            </div>
            <h2 className="profile-name">No Data</h2>
          </div>
          <div className="profile-body text-center py-4">
            <p>No user data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Create initials for avatar
  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {getInitials(userData.userName)}
          </div>
          <h2 className="profile-name">{userData.userName}</h2>
          <div className="profile-role">
            {userData.roleId?.roleName || "Seller"}
          </div>
        </div>

        <div className="profile-body">
          <div className="profile-section">
            <h2>Personal Information</h2>
            
            <div className="profile-field">
              <div className="field-label">Full Name</div>
              <div className="field-value">{userData.userName}</div>
            </div>
            
            <div className="profile-field">
              <div className="field-label">Email</div>
              <div className="field-value">{userData.email}</div>
            </div>
            
            <div className="profile-field">
              <div className="field-label">Phone Number</div>
              <div className="field-value">{userData.phoneNumber || "Not provided"}</div>
            </div>
            
            <div className="profile-field">
              <div className="field-label">Account Type</div>
              <div className="field-value">{userData.roleId?.roleName || "Seller"}</div>
            </div>
          </div>

          {userData.location && (
            <div className="profile-section">
              <h2>Location</h2>
              
              <div className="profile-field">
                <div className="field-label">Address</div>
                <div className="field-value">
                  {userData.location.address || "Not specified"}
                </div>
              </div>
              
              <div className="profile-field">
                <div className="coordinates-container">
                  <div className="coordinate-input">
                    <label>Latitude</label>
                    <div className="field-value">{userData.location.latitude || "N/A"}</div>
                  </div>
                  <div className="coordinate-input">
                    <label>Longitude</label>
                    <div className="field-value">{userData.location.longitude || "N/A"}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="profile-section">
            <h2>Account Status</h2>
            
            <div className="profile-field">
              <div className="field-label">Verification</div>
              <div className="field-value">
                {userData.verified ? (
                  <span className="active">Verified</span>
                ) : (
                  <span className="inactive">Not Verified</span>
                )}
              </div>
            </div>
            
            <div className="profile-field">
              <div className="field-label">Subscription</div>
              <div className="field-value">
                {userData.subscriptionStatus ? (
                  <span className="active">Active</span>
                ) : (
                  <span className="inactive">Inactive</span>
                )}
              </div>
            </div>
            
            <div className="profile-field">
              <div className="field-label">Loyalty Points</div>
              <div className="field-value points">
                {userData.points !== undefined ? userData.points : "0"}
              </div>
            </div>
          </div>

          {userData.revenue !== undefined && (
            <div className="profile-section">
              <h2>Business Information</h2>
              
              <div className="profile-field">
                <div className="field-label">Total Revenue</div>
                <div className="field-value">
                  {userData.revenue !== undefined 
                    ? `₫${userData.revenue.toLocaleString()}` 
                    : "N/A"}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="profile-footer">
          <button className="edit-profile">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileSeller;
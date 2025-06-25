// src/components/Profile.js
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import './css/profile.css';
import { useSelector } from "react-redux";

function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    phoneNumber: "",
    address: "",
    latitude: "",
    longitude: "",
    password: ""
  });
  const [formErrors, setFormErrors] = useState({});
  
  const token = useSelector((state) => state.auth.token);
  const debounceTimeout = useRef(null);

  // Reverse geocoding function using OpenStreetMap
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      
      if (response.data && response.data.display_name) {
        return response.data.display_name;
      }
      return "Address not found";
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return "Could not retrieve address";
    }
  };

  // Geolocation handler
  const handleGeolocation = async () => {
    if (navigator.geolocation) {
      setIsFetchingAddress(true);
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude.toString();
          const lng = position.coords.longitude.toString();
          
          // Get human-readable address
          const address = await reverseGeocode(lat, lng);
          
          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            address: address
          }));
          
          setIsFetchingAddress(false);
        },
        (error) => {
          setIsFetchingAddress(false);
          setUpdateError("Failed to get location: " + error.message);
        }
      );
    } else {
      setUpdateError("Geolocation is not supported by your browser.");
    }
  };

  // Fetch address suggestions
  const fetchAddressSuggestions = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1`
      );
      
      if (response.data && Array.isArray(response.data)) {
        setSuggestions(response.data.map(item => ({
          display_name: item.display_name,
          lat: item.lat,
          lon: item.lon
        })));
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
      setSuggestions([]);
    }
  };

  // Handle selecting a suggestion
  const handleSelectSuggestion = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      address: suggestion.display_name,
      latitude: suggestion.lat,
      longitude: suggestion.lon
    }));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const source = axios.CancelToken.source();
    let isMounted = true;

    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/users/me", 
          {
            headers: { Authorization: `Bearer ${token}` },
            cancelToken: source.token
          }
        );
        if (isMounted) {
          setUserData(response.data);
          // Initialize form values
          setFormData({
            userName: response.data.userName,
            email: response.data.email,
            phoneNumber: response.data.phoneNumber,
            address: response.data.location.address,
            latitude: String(response.data.location.latitude),
            longitude: String(response.data.location.longitude),
            password: ""
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(axios.isCancel(err) 
            ? "Request canceled" 
            : err.response?.data || err.message
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (token) {
      fetchUserData();
    } else {
      setError("No authentication token found");
      setLoading(false);
    }

    return () => {
      isMounted = false;
      source.cancel("Component unmounted, canceling request");
    };
  }, [token]);

  const handleEditProfile = () => {
    setIsEditing(true);
    setUpdateSuccess(false);
    setUpdateError(null);
    setFormErrors({});
    setSuggestions([]);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to original values
    if (userData) {
      setFormData({
        userName: userData.userName,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        address: userData.location.address,
        latitude: String(userData.location.latitude),
        longitude: String(userData.location.longitude),
        password: ""
      });
    }
    setSuggestions([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
    
    // Debounce address suggestions
    if (name === "address") {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => {
        fetchAddressSuggestions(value);
      }, 300);
    }
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9\s+\-()]{7,15}$/;
    
    if (!formData.userName.trim()) errors.userName = "Username is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!emailRegex.test(formData.email)) errors.email = "Invalid email format";
    if (!formData.phoneNumber.trim()) errors.phoneNumber = "Phone number is required";
    else if (!phoneRegex.test(formData.phoneNumber)) errors.phoneNumber = "Invalid phone number";
    if (!formData.address.trim()) errors.address = "Address is required";
    
    // Fix for latitude/longitude validation
    if (formData.latitude === null || formData.latitude === undefined || formData.latitude === '') {
      errors.latitude = "Latitude is required";
    }
    
    if (formData.longitude === null || formData.longitude === undefined || formData.longitude === '') {
      errors.longitude = "Longitude is required";
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    try{
      e.preventDefault();
    
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      
      try {
        const updateData = {
          userName: formData.userName,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          password: formData.password || undefined,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          address: formData.address
        };
  
        const response = await axios.put(
          "http://localhost:8080/api/users/me",
          updateData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
  
        setUserData(response.data);
        setIsEditing(false);
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      } catch (err) {
        setUpdateError(err.response?.data?.message || "Failed to update profile");
        console.error("Update error:", err);
      }
    }catch (error){
        console.log(error);
    }
  };  

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <p>⚠️ Error loading profile</p>
        <p>{error.message || JSON.stringify(error)}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (!userData) {
    return <div className="profile-empty">No user data available</div>;
  }

  return (
    <div className="profile-container">
      {updateSuccess && (
        <div className="profile-update-success">
          <span>✓</span> Profile updated successfully!
        </div>
      )}
      
      <div className={`profile-card ${isEditing ? 'editing' : ''}`}>
        <div className="profile-header">
          <div className="profile-avatar">
            {userData.userName.charAt(0).toUpperCase()}
          </div>
          <h1 className="profile-name">
            {isEditing ? (
              <input
                className={`profile-input ${formErrors.userName ? 'input-error' : ''}`}
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
              />
            ) : (
              userData.userName
            )}
          </h1>
          {formErrors.userName && <p className="error-message">{formErrors.userName}</p>}
          <span className={`profile-role ${userData.roleId.roleName}`}>
            {userData.roleId.roleName}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="profile-body">
          <div className="profile-section">
            <h2>Contact Information</h2>
            <div className="profile-field">
              <span className="field-label">Email:</span>
              {isEditing ? (
                <>
                  <input
                    className={`profile-input ${formErrors.email ? 'input-error' : ''}`}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  {formErrors.email && <p className="error-message">{formErrors.email}</p>}
                </>
              ) : (
                <span className="field-value">{userData.email}</span>
              )}
            </div>
            <div className="profile-field">
              <span className="field-label">Phone:</span>
              {isEditing ? (
                <>
                  <input
                    className={`profile-input ${formErrors.phoneNumber ? 'input-error' : ''}`}
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                  />
                  {formErrors.phoneNumber && <p className="error-message">{formErrors.phoneNumber}</p>}
                </>
              ) : (
                <span className="field-value">{userData.phoneNumber}</span>
              )}
            </div>
          </div>

          <div className="profile-section">
            <h2>Location</h2>
            <div className="profile-field">
              <span className="field-label">Address:</span>
              {isEditing ? (
                <div className="address-input-container">
                  <input
                    className={`profile-input ${formErrors.address ? 'input-error' : ''}`}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    autoComplete="off"
                    onFocus={() => setShowSuggestions(true)}
                  />
                  <button 
                    type="button" 
                    className="get-location-btn"
                    onClick={handleGeolocation}
                    disabled={isFetchingAddress}
                  >
                    {isFetchingAddress ? (
                      <span className="location-spinner"></span>
                    ) : (
                      "📍 Get Location"
                    )}
                  </button>
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="suggestions-container">
                      {suggestions.map((item, index) => (
                        <div 
                          key={index}
                          className="suggestion-item"
                          onClick={() => handleSelectSuggestion(item)}
                        >
                          {item.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <span className="field-value">{userData.location.address}</span>
              )}
              {formErrors.address && <p className="error-message">{formErrors.address}</p>}
            </div>
            <div className="profile-field">
              <span className="field-label">Coordinates:</span>
              {isEditing ? (
                <div className="coordinates-container">
                  <div className="coordinate-input">
                    <label>Latitude:</label>
                    <input
                      className={`profile-input ${formErrors.latitude ? 'input-error' : ''}`}
                      type="number"
                      step="0.000001"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                    />
                    {formErrors.latitude && <p className="error-message">{formErrors.latitude}</p>}
                  </div>
                  <div className="coordinate-input">
                    <label>Longitude:</label>
                    <input
                      className={`profile-input ${formErrors.longitude ? 'input-error' : ''}`}
                      type="number"
                      step="0.000001"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                    />
                    {formErrors.longitude && <p className="error-message">{formErrors.longitude}</p>}
                  </div>
                </div>
              ) : (
                <span className="field-value">
                  {userData.location.latitude}, {userData.location.longitude}
                </span>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="profile-section">
              <h2>Security</h2>
              <div className="profile-field">
                <span className="field-label">Password:</span>
                <input
                  className="profile-input"
                  type="password"
                  name="password"
                  placeholder="Leave blank to keep current"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <div className="password-hint">
                  Enter a new password only if you want to change it
                </div>
              </div>
            </div>
          )}

          <div className="profile-section">
            <h2>Account Status</h2>
            <div className="profile-field">
              <span className="field-label">Subscription:</span>
              <span className={`field-value ${userData.subscriptionStatus ? 'active' : 'inactive'}`}>
                {userData.subscriptionStatus ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="profile-field">
              <span className="field-label">Points:</span>
              <span className="field-value points">{userData.points}</span>
            </div>
          </div>
        
          <div className="profile-footer">
            {isEditing ? (
              <div className="edit-buttons">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="save-btn"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <button 
                type="button"
                className="edit-profile"
                onClick={handleEditProfile}
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>
        
        {updateError && (
          <div className="update-error">
            <p>⚠️ {updateError} , try again...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
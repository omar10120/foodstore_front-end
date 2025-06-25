import React, { useState, useEffect, useRef } from "react";
import "./css/Register.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");
  const [activeRole, setActiveRole] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const [iscreating , setiscreating] = useState(false);
  const navigate = useNavigate();
  const debounceTimeout = useRef(null);
  
  const [register, setRegister] = useState({
    name: "",
    phoneNumber: "",
    roleId: null,
    email: "",
    password: "",
    latitude: "",
    longitude: "",
    address: "",
  });

  // Calculate password strength
  useEffect(() => {
    const calculatePasswordStrength = () => {
      let strength = 0;
      const { password } = register;
      
      if (password.length >= 8) strength += 1;
      if (/[A-Z]/.test(password)) strength += 1;
      if (/[a-z]/.test(password)) strength += 1;
      if (/[0-9]/.test(password)) strength += 1;
      if (/[^A-Za-z0-9]/.test(password)) strength += 1;
      
      setPasswordStrength(strength);
    };
    
    calculatePasswordStrength();
  }, [register.password]);

  // Fetch address suggestions
  const fetchAddressSuggestions = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    
    try {
      // Use OpenStreetMap Nominatim API for address suggestions
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

  // Reverse geocoding to get address from coordinates
  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
      );
      
      if (response.data && response.data.display_name) {
        return response.data.display_name;
      }
      return "Address not found";
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      return "Could not retrieve address";
    }
  };

  const handleShowToast = (message, type) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const selectRole = (roleId) => {
    setRegister(prev => ({ ...prev, roleId }));
    setActiveRole(roleId);
  };

  const submit = async (e) => {
    setiscreating(true)
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/register",
        register
      );
      handleShowToast("Registration successful! Welcome!", "success");
      setRegister({
        name: "",
        phoneNumber: "",
        roleId: null,
        email: "",
        password: "",
        latitude: "",
        longitude: "",
        address: "",
      });
      setActiveRole(null);
      navigate("/VerifyEmail", { state: { email: register.email } });
    } catch (error) {
      console.error("Registration failed:", error);
      handleShowToast(
        error.response?.data || "Registration failed. Please try again.",
        "error"
      );
    }finally{
      setiscreating(false)
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegister(prev => ({ ...prev, [name]: value }));
    
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

  const handleGeolocation = async () => {
    if (navigator.geolocation) {
      setIsFetchingAddress(true);
      handleShowToast("Getting your location...", "info");
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude.toString();
          const lng = position.coords.longitude.toString();
          
          // Get human-readable address
          const address = await reverseGeocode(lat, lng);
          
          setRegister(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            address: address
          }));
          
          setIsFetchingAddress(false);
          handleShowToast("Location retrieved successfully!", "success");
        },
        (error) => {
          setIsFetchingAddress(false);
          handleShowToast("Failed to get location: " + error.message, "error");
        }
      );
    } else {
      handleShowToast("Geolocation is not supported by your browser.", "error");
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setRegister(prev => ({
      ...prev,
      address: suggestion.display_name,
      latitude: suggestion.lat,
      longitude: suggestion.lon
    }));
    setSuggestions([]);
  };

  return (
    <div className="reg-container">
      <div className="register-grid">
        {/* Left Column - Form */}
        <div className="register-form-container">
          <div className="register-form-wrapper">
            <div className="register-header">
              <h2>Create Your Account</h2>
              <p>Join our community today</p>
            </div>
            
            <form onSubmit={submit} className="register-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={register.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={register.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={register.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    required
                  />
                  <div className="password-strength">
                    <div className="strength-meter">
                      <div 
                        className="strength-meter-fill" 
                        data-strength={passwordStrength}
                      ></div>
                    </div>
                    <div className="strength-label">
                      {passwordStrength === 0 && "Very Weak"}
                      {passwordStrength === 1 && "Weak"}
                      {passwordStrength === 2 && "Medium"}
                      {passwordStrength === 3 && "Strong"}
                      {passwordStrength >= 4 && "Very Strong"}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={register.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={register.address}
                    onChange={handleChange}
                    placeholder="Start typing your address"
                    required
                    autoComplete="off"
                    onFocus={() => setShowSuggestions(true)}
                  />
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
              </div>
              
              <div className="form-row dual-input">
                <div className="form-group">
                  <label htmlFor="latitude">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    id="latitude"
                    name="latitude"
                    value={register.latitude}
                    onChange={handleChange}
                    placeholder="e.g. 40.7128"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="longitude">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    id="longitude"
                    name="longitude"
                    value={register.longitude}
                    onChange={handleChange}
                    placeholder="e.g. -74.0060"
                    required
                  />
                </div>
                
                <div className="form-group geolocation-group">
                  <label>&nbsp;</label>
                  <button 
                    type="button" 
                    className="geolocation-btn"
                    onClick={handleGeolocation}
                    disabled={isFetchingAddress}
                  >
                    {isFetchingAddress ? (
                      <>
                        <i className="bi bi-arrow-repeat spin"></i> Locating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-geo-alt"></i> Get My Location
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="form-row role-selection">
                <p className="role-label">Select Your Role:</p>
                <div className="role-buttons">
                  <div className="role-btn-container">
                    <button
                      type="button"
                      className={`role-btn ${activeRole === 3 ? 'active' : ''}`}
                      onClick={() => selectRole(3)}
                      onMouseEnter={() => setActiveTooltip(3)}
                      onMouseLeave={() => setActiveTooltip(null)}
                    >
                      <i className="bi bi-cash-coin"></i>
                      <span>Seller</span>
                    </button>
                    {activeTooltip === 3 && (
                      <div className="tooltip">
                        As a seller, you can list products and manage your own store
                      </div>
                    )}
                  </div>
                  
                  <div className="role-btn-container">
                    <button
                      type="button"
                      className={`role-btn ${activeRole === 1 ? 'active' : ''}`}
                      onClick={() => selectRole(1)}
                      onMouseEnter={() => setActiveTooltip(1)}
                      onMouseLeave={() => setActiveTooltip(null)}
                    >
                      <i className="bi bi-cart4"></i>
                      <span>Buyer</span>
                    </button>
                    {activeTooltip === 1 && (
                      <div className="tooltip">
                        As a buyer, you can browse and purchase products from sellers
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="form-row submit-row">
                <button type="submit" className="submit-btn" disabled={iscreating} >
                 
                  {iscreating ? (
                      <>
                        <i className="bi bi-arrow-repeat spin"></i> Creating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-geo-alt"></i>  Create Account
                      </>
                    )}
                </button>
              </div>
            </form>
            
            <div className="login-redirect">
              <p>Already have an account? <a href="/login">Log in</a></p>
            </div>
          </div>
        </div>
        
        {/* Right Column - Image */}
        <div className="register-image-container">
          <div className="register-image-wrapper">
            <img
              src={`${process.env.PUBLIC_URL}/images/OIP (1).jfif`}
              alt="Register Illustration"
              className="register-image"
            />
            <div className="image-overlay">
              <h3>Join Our Community</h3>
              <p>Connect with buyers and sellers in your area</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast Notification */}
      {showToast && (
        <div className={`toast-notification ${toastType}`}>
          <div className="toast-content">
            <div className="toast-icon">
              {toastType === "success" ? (
                <i className="bi bi-check-circle-fill"></i>
              ) : toastType === "error" ? (
                <i className="bi bi-exclamation-circle-fill"></i>
              ) : toastType === "info" ? (
                <i className="bi bi-info-circle-fill"></i>
              ) : (
                <i className="bi bi-exclamation-triangle-fill"></i>
              )}
            </div>
            <div className="toast-message">
              <p>{toastMessage}</p>
            </div>
            <button 
              className="toast-close"
              onClick={() => setShowToast(false)}
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;
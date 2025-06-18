import React, { useState } from "react";
import "./css/Register.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");
  const [activeRole, setActiveRole] = useState(null);
  const navigate = useNavigate();
  
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
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegister(prev => ({ ...prev, [name]: value }));
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
                    placeholder="Enter your address"
                    required
                  />
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
              </div>
              
              <div className="form-row role-selection">
                <p className="role-label">Select Your Role:</p>
                <div className="role-buttons">
                  <button
                    type="button"
                    className={`role-btn ${activeRole === 3 ? 'active' : ''}`}
                    onClick={() => selectRole(3)}
                  >
                    <i className="bi bi-cash-coin"></i>
                    <span>Seller</span>
                  </button>
                  
                  <button
                    type="button"
                    className={`role-btn ${activeRole === 1 ? 'active' : ''}`}
                    onClick={() => selectRole(1)}
                  >
                    <i className="bi bi-cart4"></i>
                    <span>Buyer</span>
                  </button>
                </div>
              </div>
              
              <div className="form-row submit-row">
                <button type="submit" className="submit-btn">
                  Create Account
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
              ) : (
                <i className="bi bi-exclamation-circle-fill"></i>
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
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/VerifyEmail.css"; // We'll create this CSS file next

function VerifyEmail() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get email from navigation state
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
    
    // Setup resend code timer
    let timer;
    if (resendDisabled && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setResendDisabled(false);
      setResendTimer(30);
    }
    
    return () => clearInterval(timer);
  }, [resendDisabled, resendTimer, email, navigate]);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/verify-email",
        { email, code: parseInt(code) }
      );
      
      // Save token and user info
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify({
        userId: response.data.userId,
        userName: response.data.userName,
        roleName: response.data.roleName,
        email: response.data.email,
        

      }));
      
      showToast("Email verified successfully!", "success");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      console.error("Verification failed:", err);
      setError(err.response?.data || "Invalid verification code");
      showToast("Verification failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendDisabled(true);
    try {
      await axios.post("http://localhost:8080/api/auth/resend-code", { email });
      showToast("Verification code resent successfully!", "success");
    } catch (err) {
      console.error("Resend failed:", err);
      showToast("Failed to resend code. Please try again.", "error");
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-card">
        <div className="verify-header">
          <h2>Verify Your Email</h2>
          <p>Enter the 6-digit code sent to <strong>{email}</strong></p>
        </div>

        <form onSubmit={handleVerify} className="verify-form">
          <div className="input-group">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter verification code"
              maxLength={6}
              required
            />
            {error && <p className="error-message">{error}</p>}
          </div>

          <button 
            type="submit" 
            className="verify-btn"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="resend-section">
          <p>Didn't receive the code?</p>
          <button
            onClick={handleResendCode}
            disabled={resendDisabled}
            className={`resend-btn ${resendDisabled ? "disabled" : ""}`}
          >
            {resendDisabled ? `Resend in ${resendTimer}s` : "Resend Code"}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-content">
            <div className="toast-icon">
              {toast.type === "success" ? (
                <i className="bi bi-check-circle-fill"></i>
              ) : (
                <i className="bi bi-exclamation-circle-fill"></i>
              )}
            </div>
            <div className="toast-message">
              <p>{toast.message}</p>
            </div>
            <button 
              className="toast-close"
              onClick={() => setToast({ show: false, message: "", type: "" })}
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VerifyEmail;
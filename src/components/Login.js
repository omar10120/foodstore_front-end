import './css/Login.css';
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchLogin } from "./Redux/Slices/AuthSlice";

function Login() {
    const [showToast, setShowToast] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');

    const { token, roleName } = useSelector((state) => state.auth);

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleShowToast = () => {
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    };
    
    useEffect(() => {
        if (token && roleName === 'seller') {
            navigate('/weclome');
        } else if (token) {
            navigate('/weclome');
        }
    }, [token, roleName, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address.');
            return;
        } else {
            setEmailError('');
        }

        const credentials = { email, password };
        try {
            await dispatch(fetchLogin(credentials)).unwrap();
            handleShowToast();
        } catch (error) {
            console.error("Login failed:", error);
            setEmailError('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="login-container">
        <div className="login-row">
          {/* القسم الأيسر - النموذج */}
          <div className="login-form-col">
            <div className="login-form-card">
              <div className="login-form-container">
                <div className="login-header">
                  <h2 className="login-title">Login</h2>
                  <p className="login-subtitle">Welcome To Naema App</p>
                </div>
                
                <form onSubmit={handleLogin} className="login-form">
                  <div className="login-form-group">
                    <label htmlFor="login-email" className="login-label">Email</label>
                    <input
                      type="email"
                      className="login-input"
                      id="login-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    {emailError && <div className="login-error">{emailError}</div>}
                  </div>
                  
                  <div className="login-form-group">
                    <label htmlFor="login-password" className="login-label">Password</label>
                    <input
                      type="password"
                      className="login-input"
                      id="login-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <button type="submit" className="login-submit-btn">Login</button>
                  
                  <div className="login-footer">
                    <p className="login-footer-text">Don't have an account?</p>
                    <Link to="/register" className="login-footer-link">Create Account</Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          {/* القسم الأيمن - الصورة */}
          <div className="login-image-col">
            <div className="login-image-container">
              <img
                src={`${process.env.PUBLIC_URL}/images/OIP (1).jfif`}
                alt="Login Illustration"
                className="login-image"
              />
              <div className="login-image-overlay">
                <h3 className="login-overlay-title">Join Our Community</h3>
                <p className="login-overlay-text">Connect with buyers and sellers in your area</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Toast Notification */}
        {showToast && (
          <div className="login-toast">
            <div className="login-toast-header">
              <strong>Message</strong>
              <button 
                className="login-toast-close"
                onClick={() => setShowToast(false)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="login-toast-body">
              Hello, Welcome!
            </div>
          </div>
        )}
      </div>
    );
}

export default Login;
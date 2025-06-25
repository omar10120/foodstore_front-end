import React from 'react';
import { useNavigate } from "react-router-dom";
import './css/Welcome.css'; 
import { useSelector } from 'react-redux';

function Welcome() {
    const navigate = useNavigate();
    const { token, roleName: userRole } = useSelector((state) => state.auth); 

    const handleStartShopping = () => {
        if (token && userRole === 'seller') {
            navigate('/dashboard');
        }
        else if(token && userRole ==='admin'){
            navigate('/dashboardadmin');
        }
         else {
            navigate('/home');
        }
    };

    return (
        <main className="welcome-container">
            <div className="welcome-glass-card">
                {/* Logo with modern animation */}
                <div className="logo-animation-container">
                    <div className="logo-circle">
                        <img 
                            src={`${process.env.PUBLIC_URL}/images/Naema Logo-04.png`} 
                            alt="Naema Logo"
                            className="welcome-logo"
                        />
                    </div>
                    <div className="circle-pulse"></div>
                    <div className="circle-pulse delay-1"></div>
                    <div className="circle-pulse delay-2"></div>
                </div>
                
                <h1 className="welcome-title">
                    Welcome to <span className="highlight">نعمة</span>
                    <div className="subtitle">Together, we reduce waste and create blessings!</div>
                </h1>
                
                <div className="welcome-content">
                    <p className="welcome-text">
                        Welcome to Naema نعمة – where sustainability meets generosity!
                    </p>
                    <p className="welcome-text">
                        We're thrilled to have you join us on our mission to reduce food waste, 
                        support sustainability, and empower communities.
                    </p>
                    <div className="quote-box">
                        "Your contributions matter. Let's make a difference, one step at a time!"
                    </div>
                </div>
                
                <button 
                    onClick={handleStartShopping} 
                    className="cta-button"
                >
                    Start Shopping Now
                    <span className="arrow">→</span>
                </button>
                
                <div className="signature">
                    Warm regards,
                    <br />
                    The Naema Team
                </div>
            </div>
        </main>
    );
}

export default Welcome;
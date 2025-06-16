import React, { useEffect } from 'react';
import './css/About.css';

const AboutUs = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className='container_about'>
      <div className="about-us-container">
        <div className='card_about'>
          <div className="about-header">
            <h1>About Us – Naema نعمة</h1>
            <div className="divider"></div>
          </div>
          
          <div className="about-content">
            <p className="lead-text">
              Naema is an innovative platform designed to reduce food waste by offering products nearing their expiration dates at discounted prices. 
            </p>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">💳</div>
                <h3>Electronic Payments</h3>
                <p>Secure and convenient payment options</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">❤️</div>
                <h3>Charity Support</h3>
                <p>Easy donations to charitable organizations</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>Exclusive Deals</h3>
                <p>Subscription plans for special discounts</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🌱</div>
                <h3>Sustainable Focus</h3>
                <p>Educational resources on reducing waste</p>
              </div>
            </div>
            
            <div className="mission-section">
              <h2>Our Mission</h2>
              <p>
                We promote sustainable consumption habits, reduce food waste, and create a positive social and environmental impact. Together, we can make a difference!
              </p>
            </div>
          </div>
          
          <div className="image-container">
            <img 
              src={`${process.env.PUBLIC_URL}/images/OIP (8).jfif`} 
              alt="Sustainable Food Platform" 
              className="about-image"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
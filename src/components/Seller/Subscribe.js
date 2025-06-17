import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import "../css/Subscribe.css";

const Subscribe = () => {
  const [paymentMethod, setPaymentMethod] = useState('PAYPAL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [subscriptionData, setSubscriptionData] = useState(null);
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();

  const paymentMethods = [
    { id: 'PAYPAL', name: 'PayPal', icon: 'paypal' },
    { id: 'CREDIT_CARD', name: 'Credit Card', icon: 'credit_card' },
    { id: 'BANK_TRANSFER', name: 'Bank Transfer', icon: 'account_balance' },
  ];

  const handleSubscribe = async () => {
    if (!paymentMethod) {
      setError('Please select a payment method');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      const response = await axios.post(
        'http://localhost:8080/api/billing/subscribe',
        { paymentMethod },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSubscriptionData(response.data);
    } catch (err) {
      console.error('Subscription failed:', err);
      setError(err.response?.data?.message || 'Subscription failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (subscriptionData) {
    return (
      <div className="subscription-success" >
        <div className="success-card">
          <div className="success-icon">🎉</div>
          <h2>Subscription Successful!</h2>
          
          <div className="success-details">
            <div className="detail-item">
              <span>Buyer:</span>
              <span>{subscriptionData.buyerName}</span>
            </div>
            <div className="detail-item">
              <span>Payment Method:</span>
              <span>{subscriptionData.paymentMethod}</span>
            </div>
            <div className="detail-item">
              <span>Total Amount:</span>
              <span>${subscriptionData.totalAmount.toFixed(2)}</span>
            </div>
            <div className="detail-item">
              <span>Earned Points:</span>
              <span>{subscriptionData.earnedPoints} points</span>
            </div>
            <div className="detail-item">
              <span>Status:</span>
              <span className="status-badge">{subscriptionData.paymentStatus}</span>
            </div>
          </div>
          
          <button 
            className="continue-button"
            onClick={() => navigate('/home')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="subscribe-container">
      <div className="subscribe-card">
        <div className="card-header">
          <h1>Premium Subscription</h1>
          <p>Unlock exclusive features and benefits</p>
        </div>
        
        <div className="pricing-section">
          <div className="price-display">
            <span className="amount">$300</span>
            <span className="period">/year</span>
          </div>
          <ul className="benefits-list">
            <li>✅ Exclusive discounts on all products</li>
            <li>✅ Priority customer support</li>
            <li>✅ Early access to new features</li>
            <li>✅ Free shipping on all orders</li>
            <li>✅ Earn 30 bonus points immediately</li>
          </ul>
        </div>
        
        <div className="payment-section">
          <h3>Select Payment Method</h3>
          
          <div className="payment-methods">
            {paymentMethods.map(method => (
              <div 
                key={method.id}
                className={`payment-option ${paymentMethod === method.id ? 'selected' : ''}`}
                onClick={() => setPaymentMethod(method.id)}
              >
                <span className="material-icons">{method.icon}</span>
                <span>{method.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button 
          className="subscribe-button"
          onClick={handleSubscribe}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner"></span> Processing...
            </>
          ) : (
            'Subscribe Now'
          )}
        </button>
        
        <div className="security-note">
          <span className="lock-icon">🔒</span>
          <p>Your payment information is securely encrypted</p>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import './css/Checkout.css';
import { useNavigate  } from 'react-router-dom';
const Checkout = () => {
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expDate, setExpDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate()
  const goBack = () => {
    navigate(-1); // Navigate to previous page
  };
  // Fetch cart data
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setIsLoading(true);
        // Fetch cart details
        const cartResponse = await axios.get(
          'http://localhost:8080/api/cart/me',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const cartData = cartResponse.data;
        setCart(cartData);
        
        // Fetch cart items using cartId
        const itemsResponse = await axios.get(
          `http://localhost:8080/api/cart-items/${cartData.cartId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setCartItems(itemsResponse.data);
      } catch (error) {
        console.error("Error fetching cart data:", error);
        setError("Failed to load cart data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartData();
  }, [token]);

  // Handle checkout
  const handleCheckout = async () => {
    if (paymentMethod === 'CREDIT_CARD' && 
        (!cardName || !cardNumber || !expDate || !cvv)) {
      setError("Please fill all credit card details");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      
      // Call checkout API
      const response = await axios.post(
        'http://localhost:8080/api/billing/checkout',
        { paymentMethod },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setOrderDetails(response.data);
    } catch (error) {
      console.error("Checkout error:", error);
      setError("Checkout failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Format card number for display
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    }
    return value;
  };

  // Handle card number input
  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  if (isLoading) {
    return (
      <div className="loading-container">

      <button className="back-button-checkout"  onClick={goBack}>
        &larr; Back
      </button>
      <div className="spinner"></div> 
      <p>Loading your cart...</p>
    </div>
    );
  }

  if (error && !cart) {
    return (
      <div className="error-container">

      <button className="back-button-checkout" onClick={goBack}>
        &larr; Back
      </button>
      <div className="error-icon">⚠️</div>
      <h3>Error Loading Cart</h3>
      <p>{error}</p>
      <button className="retry-button" onClick={() => window.location.reload()}>
        Try Again
      </button>
    </div>
    );
  }

  if (orderDetails) {
    return (
      <div className="confirmation-container">
            <button className="back-button-checkout" onClick={goBack}>
            &larr; Back
          </button>
        <div className="checkout-header">

        </div>
        <div className="confirmation-card">
          <div className="confirmation-header">
            <div className="checkmark">✓</div>
            <h2>Thank You for Your Order!</h2>
            <p>Your payment was successful</p>
          </div>
          
          <div className="order-summary">
            <div className="summary-item">
              <span>Order Date:</span>
              <span>{new Date(orderDetails.createdAt).toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <span>Buyer:</span>
              <span>{orderDetails.buyerName}</span>
            </div>
            <div className="summary-item">
              <span>Payment Method:</span>
              <span>{orderDetails.paymentMethod}</span>
            </div>
            <div className="summary-item">
              <span>Payment Status:</span>
              <span className="status-badge">{orderDetails.paymentStatus}</span>
            </div>
            
            <div className="total-row">
              <span>Total Amount:</span>
              <span className="total-amount">{cart.totalPrice.toFixed(2)} SAR</span>
            </div>
            
            <div className="points-earned">
              <span>★</span>
              <span>Earned {orderDetails.earnedPoints} points</span>
            </div>
          </div>
          
          <button className="continue-shopping" onClick={() => window.location.href = '/'}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        
        <button className="back-button-checkout" onClick={goBack}>
          &larr; Back
        </button>
        <h1>Checkout</h1>
        <p>Complete your purchase</p>
      </div>
      
      <div className="checkout-content">
        <div className="payment-section">
          <h2>Payment Method</h2>
          
          <div className="payment-options">
            <div 
              className={`payment-card ${paymentMethod === 'CREDIT_CARD' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('CREDIT_CARD')}
            >
              <div className="payment-icon">
                <div className="credit-card-icon">💳</div>
              </div>
              <div className="payment-info">
                <h3>Credit Card</h3>
                <p>Visa, Mastercard, etc.</p>
              </div>
            </div>
            
            <div 
              className={`payment-card ${paymentMethod === 'PAYPAL' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('PAYPAL')}
            >
              <div className="payment-icon">
                <div className="paypal-icon">P</div>
              </div>
              <div className="payment-info">
                <h3>PayPal</h3>
                <p>Safer, easier way to pay</p>
              </div>
            </div>
            
            <div 
              className={`payment-card ${paymentMethod === 'BANK_TRANSFER' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('BANK_TRANSFER')}
            >
              <div className="payment-icon">
                <div className="bank-icon">🏦</div>
              </div>
              <div className="payment-info">
                <h3>Bank Transfer</h3>
                <p>Direct bank payment</p>
              </div>
            </div>
          </div>
          
          <div className="payment-details">
            {paymentMethod === 'CREDIT_CARD' && (
              <div className="credit-card-form">
                <h3>Card Details</h3>
                
                <div className="form-group">
                  <label>Cardholder Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>Card Number</label>
                  <input 
                    type="text" 
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiration Date</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY"
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>CVV</label>
                    <input 
                      type="text" 
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      maxLength={3}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {paymentMethod === 'PAYPAL' && (
              <div className="paypal-info">
                <div className="info-box">
                  <div className="paypal-logo">PayPal</div>
                  <p>You will be redirected to PayPal to complete your payment securely.</p>
                </div>
              </div>
            )}
            
            {paymentMethod === 'BANK_TRANSFER' && (
              <div className="bank-transfer-info">
                <h3>Bank Transfer Details</h3>
                
                <div className="bank-details">
                  <div className="detail-item">
                    <span>Bank Name:</span>
                    <span>National Bank</span>
                  </div>
                  
                  <div className="detail-item">
                    <span>Account Name:</span>
                    <span>DiscountHub</span>
                  </div>
                  
                  <div className="detail-item">
                    <span>Account Number:</span>
                    <span>SA03 8000 0000 6080 1016 7519</span>
                  </div>
                  
                  <div className="detail-item">
                    <span>IBAN:</span>
                    <span>SA03 8000 0000 6080 1016 7519</span>
                  </div>
                </div>
                
                <div className="bank-note">
                  <p>Please use your order ID as the payment reference. Your order will be processed once payment is received.</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="order-summary">
          <h2>Order Summary</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="order-items">
            {cartItems.map(item => (
              <div key={item.cartItemId} className="order-item">
                <div className="item-info">
                  <span className="item-name">{item.productId?.price || 'Product'}</span>
                  <span className="item-quantity">× {item.quantity}</span>
                </div>
                <div className="item-price">{(item.price * item.quantity).toFixed(2)} SAR</div>
              </div>
            ))}
          </div>
          
          <div className="price-breakdown">
            <div className="price-row">
              <span>Subtotal:</span>
              <span>{cart.totalPrice.toFixed(2)} SAR</span>
            </div>
            <div className="price-row">
              <span>Shipping:</span>
              <span className="free">FREE</span>
            </div>
            <div className="price-row">
              <span>Tax:</span>
              <span>0.00 SAR</span>
            </div>
          </div>
          
          <div className="order-total">
            <span>Total:</span>
            <span>{cart.totalPrice.toFixed(2)} SAR</span>
          </div>
          
          <button 
            className={`checkout-button ${isProcessing ? 'loading' : ''}`}
            onClick={handleCheckout}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="spinner"></span>
                Processing Payment...
              </>
            ) : (
              `Pay ${cart.totalPrice.toFixed(2)} SAR`
            )}
          </button>
          
          <div className="terms">
            <p>By completing your purchase, you agree to our <a href="#">Terms of Service</a></p>
            <div className="secure-payment">
              <div className="lock-icon">🔒</div>
              <span>Secure Payment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
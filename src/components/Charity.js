// Charity.js
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { fetchGetAllCharities } from './Redux/Slices/CharitySlice';
import CartButton from './CartButton';
import { useNavigate } from 'react-router-dom';
import './css/Charity.css';

function Charity(productid) {
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const { charity, error, loading } = useSelector(state => state.charitySlice);
  const products = useSelector(state => state.productSlice.productsArray); 
  const dispatch = useDispatch();
  const [inputAmount, setInputAmount] = useState(1);
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const toggleDropdown = () => {
    setShowCart(prevShow => !prevShow);
  };

  useEffect(() => {
    dispatch(fetchGetAllCharities());
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const handleButtonClick = () => {
    setShowErrorToast(true);
    setTimeout(() => {
      setShowErrorToast(false);
    }, 3000);
  };

  const addToCart = (charity, product) => {
    if (!charity || !product || !inputAmount || inputAmount < 1) {
      return; 
    }

    const newItem = {
      name: charity.charityName, 
      productName: product.productName, 
      quantity: inputAmount,
      charityId: charity.charityId,
      charityInfo: charity.charityInfo
    };

    setCartItems(prevItems => [...prevItems, newItem]); 
    setInputAmount(1); 
    handleButtonClick(); 
  };

  const updateQuantity = (index, value) => {
    const updatedItems = [...cartItems];
    updatedItems[index].quantity = Math.max(1, value);
    setCartItems(updatedItems);
  };

  const removeCartItem = (index) => {
    const updatedItems = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedItems);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading charities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Charities</h3>
        <p>{error}</p>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="charity-page">
      <div className="charity-header">
        <h1>Support Our Charities</h1>
        <p>Make a difference by donating to these wonderful organizations</p>
      </div>
      
      <CartButton cartItems={cartItems} toggleDropdown={toggleDropdown} />
      
      {showCart && (
        <div className="cart-dropdown">
          <div className="cart-header">
            <h3>Your Donations</h3>
            <button className="close-cart" onClick={() => setShowCart(false)}>
              &times;
            </button>
          </div>
          
          {cartItems.length > 0 ? (
            <div className="cart-items-container">
              {cartItems.map((item, index) => (
                <div key={index} className="cart-item">
                  <div className="cart-item-content">
                    <h4>{item.name}</h4>
                    <p>Donation: {item.productName}</p>
                    <div className="quantity-controls">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(index, e.target.value)}
                      />
                      <button 
                        className="remove-btn"
                        onClick={() => removeCartItem(index)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-cart">No donations in your cart</p>
          )}
          
          {cartItems.length > 0 && (
            <div className="cart-footer">
              <button 
                className="checkout-btn"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      )}

      <div className="charity-grid">
        {charity.map(ch => (
          <div className="charity-card" key={ch.charityId}>
            <div className="card-header">
              <div className="charity-logo">
                <div className="logo-placeholder">{ch.charityName.charAt(0)}</div>
              </div>
              <div className="charity-info">
                <h3>{ch.charityName}</h3>
                <div className="contact-info">
                  <span>📞 {ch.charityInfo}</span>
                </div>
              </div>
            </div>
            
            <div className="card-body">
              <p className="description">{ch.charityDescription}</p>
              
              <div className="donation-controls">
                <div className="input-group">
                  <label>Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    value={inputAmount}
                    onChange={(e) => setInputAmount(Math.max(1, e.target.value))}
                  />
                </div>
                
                <button 
                  className="donate-btn"
                  onClick={() => addToCart(ch, products[0])}
                >
                  <span>Donate Now</span>
                  <span className="heart-icon">❤️</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showErrorToast && (
        <div className="toast show">
          <div className="toast-content">
            <div className="message">
              <span className="check-icon">✓</span>
              <div>
                <span className="text-1">Success!</span>
                <span className="text-2">Charity added to donations!</span>
              </div>
            </div>
            <button className="close-btn" onClick={() => setShowErrorToast(false)}>
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Charity;
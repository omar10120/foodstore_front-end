
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGetAllCharities } from './Redux/Slices/CharitySlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/Charity.css'
function Charity() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector(state => state.auth.token);
  const { charity, error, loading } = useSelector(state => state.charitySlice);
  const products = useSelector(state => state.productSlice.productsArray);
  
  // States
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [inputAmount, setInputAmount] = useState(1);
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [events, setEvents] = useState([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participationType, setParticipationType] = useState('VOLUNTEER');
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventError, setEventError] = useState(null);
  const [myParticipations, setMyParticipations] = useState([]);
  const [loadingParticipations, setLoadingParticipations] = useState(true);

  // Fetch charities
  useEffect(() => {
    dispatch(fetchGetAllCharities());
  }, [dispatch]);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:8080/events', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setEvents(response.data);
        setLoadingEvents(false);
      } catch (err) {
        setEventError('Failed to fetch events');
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [token]);

  // Fetch my participations
  useEffect(() => {
    const fetchMyParticipations = async () => {
      try {
        const response = await axios.get('http://localhost:8080/participants/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setMyParticipations(response.data);
        console.log(response.data)
        setLoadingParticipations(false);
      } catch (err) {
        console.error('Error fetching participations:', err);
        setLoadingParticipations(false);
      }
    };

    fetchMyParticipations();
  }, [token]);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Toggle cart dropdown
  const toggleDropdown = () => {
    setShowCart(prevShow => !prevShow);
  };

  // Show success toast
  const handleButtonClick = () => {
    setShowErrorToast(true);
    setTimeout(() => {
      setShowErrorToast(false);
    }, 3000);
  };

  // Add to cart function
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

  // Update cart item quantity
  const updateQuantity = (index, value) => {
    const updatedItems = [...cartItems];
    updatedItems[index].quantity = Math.max(1, value);
    setCartItems(updatedItems);
  };

  // Remove cart item
  const removeCartItem = (index) => {
    const updatedItems = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedItems);
  };

  // Open join event modal
  const openJoinModal = (event) => {
    setSelectedEvent(event);
    setShowJoinModal(true);
  };

  // Close join event modal
  const closeJoinModal = () => {
    setShowJoinModal(false);
    setSelectedEvent(null);
  };

  // Handle join event submission
  const handleJoinEvent = async () => {
    if (!selectedEvent) return;
    
    try {
      const response = await axios.post(
        'http://localhost:8080/events/participate',
        {
          eventId: selectedEvent.eventId,
          participationType: participationType
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Add to participations
      setMyParticipations(prev => [...prev, {
        eventId: selectedEvent.eventId,
        eventTitle: selectedEvent.title,
        participationType: participationType,
        joinedAt: new Date().toISOString()
      }]);
      
      // Show success message
      alert(`Successfully joined the event as a ${participationType.toLowerCase()}!`);
      closeJoinModal();
      
    } catch (err) {
      console.error('Error joining event:', err);
      alert('Failed to join event. Please try again.');
    }
  };

  // Handle leave event
  const handleLeaveEvent = async (participationId) => {

    try {
      await axios.delete(`http://localhost:8080/participants/leave/${participationId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Remove from participations
      setMyParticipations(prev => prev.filter(p => p.id !== participationId));
      
      alert('You have successfully left the event'  );
      fetchGetAllCharities();
    } catch (err) {
      console.error('Error leaving event:', err);
      alert('Failed to leave event. Please try again.' +participationId);
    }
  };

  // Format event date
  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format participation type with color
  const formatParticipationType = (type) => {
    let color = '#4A5568'; // Default gray
    
    if (type === 'VOLUNTEER') color = '#4299E1'; // Volunteer blue
    if (type === 'ATTENDEE') color = '#3182CE'; // Attendee blue
    if (type === 'DONOR') color = '#2B6CB0'; // Donor blue
    
    return (
      <span style={{ 
        backgroundColor: `${color}20`, 
        color: color,
        padding: '4px 10px',
        borderRadius: '20px',
        fontWeight: '600'
      }}>
        {type.charAt(0) + type.slice(1).toLowerCase()}
      </span>
    );
  };

  // Loading state
  if (loading || loadingEvents || loadingParticipations) {
    return (
      <div className="charity-loading-container">
        <div className="charity-spinner"></div>
        <p>Loading content...</p>
      </div>
    );
  }

  // Error state
  if (error || eventError) {
    return (
      <div className="charity-error-container">
        <div className="charity-error-icon">⚠️</div>
        <h3>Error Loading Content</h3>
        <p>{error || eventError}</p>
        <button className="charity-retry-button" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="charity-page">
      {/* Header Section */}
      <div className="charity-header">
        <div className="charity-header-content">
          <h1>Make a Difference</h1>
          <p>Support charities and participate in events to create positive change</p>
        </div>
        <div className="charity-impact-badge">
          <span>Community Impact</span>
        </div>
      </div>
      
      {/* Cart Button */}
      <div className="charity-cart-button-container">
        <button className="charity-cart-button" onClick={toggleDropdown}>
          <svg className="charity-cart-icon" viewBox="0 0 24 24">
            <path d="M17 18a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2c0-1.11.89-2 2-2zM1 2h3.27l.94 2H20a1 1 0 0 1 1 1c0 .17-.05.34-.12.5l-3.58 6.47c-.34.61-1 1.03-1.79 1.03H8.1l-.9 1.63-.03.12a.25.25 0 0 0 .25.25H19v2H7a2 2 0 0 1-2-2c0-.35.09-.68.24-.96l1.36-2.45L3 4H1V2m6 16a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2c0-1.11.89-2 2-2m9-7l2.78-5H6.14l2.36 5H16z"/>
          </svg>
          <span className="charity-cart-badge">{cartItems.length}</span>
        </button>
      </div>
      
      {/* Cart Dropdown */}
      {showCart && (
        <div className="charity-cart-dropdown">
          <div className="charity-cart-header">
            <h3>Your Donations</h3>
            <button className="charity-close-cart" onClick={() => setShowCart(false)}>
              &times;
            </button>
          </div>
          
          {cartItems.length > 0 ? (
            <div className="charity-cart-items-container">
              {cartItems.map((item, index) => (
                <div key={index} className="charity-cart-item">
                  <div className="charity-cart-item-content">
                    <h4>{item.name}</h4>
                    <p>Donation: {item.productName}</p>
                    <div className="charity-quantity-controls">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(index, e.target.value)}
                      />
                      <button 
                        className="charity-remove-btn"
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
            <p className="charity-empty-cart">No donations in your cart</p>
          )}
          
          {cartItems.length > 0 && (
            <div className="charity-cart-footer">
              <button 
                className="charity-checkout-btn"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      )}

      {/* My Participations Section */}
      {myParticipations.length > 0 && (
        <section className="charity-participations-section">
          <div className="charity-section-header">
            <h2>My Event Participations</h2>
            <p>Events you've committed to support</p>
          </div>
          
          <div className="charity-participations-grid">
            {myParticipations.map(participation => (
              <div className="charity-participation-card" key={participation.id}>
                <div className="charity-participation-header">
                  <h3>{participation.eventTitle}</h3>
                  {formatParticipationType(participation.participationType)}
                </div>
                
                <div className="charity-participation-body">
                  <p>
                    <svg className="charity-icon" viewBox="0 0 24 24">
                      <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z"/>
                    </svg>
                    Joined on: {formatEventDate(participation.joinedAt)}
                  </p>
                </div>
                
                <div className="charity-participation-footer">
                  <button 
                    className="charity-leave-btn"
                    onClick={() => handleLeaveEvent(participation.eventId)}
                  >
                    Leave Event 
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Events Section */}
      <section className="charity-events-section">
        <div className="charity-section-header">
          <h2>Upcoming Charity Events</h2>
          <p>Join these events to make a direct impact in your community</p>
        </div>
        
        <div className="charity-events-grid">
          {events.map(event => (
            <div className="charity-event-card" key={event.eventId}>
              <div className="charity-event-header">
                <div className="charity-event-date">
                  <span className="charity-date-day">{new Date(event.eventDate).getDate()}</span>
                  <span className="charity-date-month">{new Date(event.eventDate).toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div className="charity-event-info">
                  <h3>{event.title}</h3>
                  <p className="charity-event-location">
                    <svg className="charity-icon" viewBox="0 0 24 24">
                      <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"/>
                    </svg>
                    {event.location}
                  </p>
                </div>
              </div>
              
              <div className="charity-event-body">
                <p className="charity-event-description">{event.description}</p>
                
                <div className="charity-charity-info">
                  <div className="charity-charity-icon">
                    <svg className="charity-icon" viewBox="0 0 24 24">
                      <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>
                    </svg>
                  </div>
                  <div>
                    <h4>Benefiting:</h4>
                    <p>{event.targetCharity.charityName}</p>
                  </div>
                </div>
                
                <div className="charity-event-time">
                  <svg className="charity-icon" viewBox="0 0 24 24">
                    <path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
                  </svg>
                  {formatEventDate(event.eventDate)}
                </div>
              </div>
              
              <div className="charity-event-footer">
                <button 
                  className="charity-join-btn"
                  onClick={() => openJoinModal(event)}
                >
                  Join Event
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Charities Section */}
      <section className="charity-charities-section">
        <div className="charity-section-header">
          <h2>Support Our Charities</h2>
          <p>Make a difference by donating to these wonderful organizations</p>
        </div>
        
        <div className="charity-charity-grid">
          {charity.map(ch => (
            <div className="charity-charity-card" key={ch.charityId}>
              <div className="charity-charity-tier">
                <span className="charity-tier-gold">Featured Charity</span>
              </div>
              
              <div className="charity-card-header">
                <div className="charity-charity-logo">
                  <div className="charity-logo-placeholder">{ch.charityName.charAt(0)}</div>
                </div>
                <div className="charity-charity-info">
                  <h3>{ch.charityName}</h3>
                  <div className="charity-contact-info">
                    <svg className="charity-icon" viewBox="0 0 24 24">
                      <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/>
                    </svg>
                    <span>{ch.charityInfo}</span>
                  </div>
                </div>
              </div>
              
              <div className="charity-card-body">
                <p className="charity-description">{ch.charityDescription}</p>
                
                <div className="charity-donation-controls">
                  {/* <div className="charity-input-group">
                    <label>Quantity:</label>
                    <input
                      type="number"
                      min="1"
                      value={inputAmount}
                      onChange={(e) => setInputAmount(Math.max(1, e.target.value))}
                    />
                  </div> */}
                  
                  {/* <button 
                    className="charity-donate-btn"
                    onClick={() => addToCart(ch, products[0])}
                  >
                    <span>Donate Now</span>
                    <svg className="charity-heart-icon" viewBox="0 0 24 24">
                      <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>
                    </svg>
                  </button> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Join Event Modal */}
      {showJoinModal && selectedEvent && (
        <div className="charity-modal-overlay">
          <div className="charity-join-modal">
            <div className="charity-modal-header">
              <h3>Join Event</h3>
              <button className="charity-close-modal" onClick={closeJoinModal}>
                &times;
              </button>
            </div>
            
            <div className="charity-modal-body">
              <h4>{selectedEvent.title}</h4>
              <p className="charity-modal-description">{selectedEvent.description}</p>
              
              <div className="charity-modal-info">
                <p>
                  <svg className="charity-icon" viewBox="0 0 24 24">
                    <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z"/>
                  </svg>
                  {formatEventDate(selectedEvent.eventDate)}
                </p>
                <p>
                  <svg className="charity-icon" viewBox="0 0 24 24">
                    <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"/>
                  </svg>
                  {selectedEvent.location}
                </p>
                <p>
                  <svg className="charity-icon" viewBox="0 0 24 24">
                    <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>
                  </svg>
                  Benefiting: {selectedEvent.targetCharity.charityName}
                </p>
              </div>
              
              <div className="charity-participation-type">
                <label>I want to participate as:</label>
                <div className="charity-radio-group">
                  <label className="charity-volunteer-option">
                    <input 
                      type="radio" 
                      name="participationType" 
                      value="VOLUNTEER"
                      checked={participationType === 'VOLUNTEER'}
                      onChange={() => setParticipationType('VOLUNTEER')}
                    />
                    <span>Volunteer</span>
                  </label>
                  
                  <label className="charity-attendee-option">
                    <input 
                      type="radio" 
                      name="participationType" 
                      value="ATTENDEE"
                      checked={participationType === 'ATTENDEE'}
                      onChange={() => setParticipationType('ATTENDEE')}
                    />
                    <span>Attendee</span>
                  </label>
                  
                  <label className="charity-donor-option">
                    <input 
                      type="radio" 
                      name="participationType" 
                      value="DONOR"
                      checked={participationType === 'DONOR'}
                      onChange={() => setParticipationType('DONOR')}
                    />
                    <span>Donor</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="charity-modal-footer">
              <button className="charity-cancel-btn" onClick={closeJoinModal}>
                Cancel
              </button>
              <button className="charity-confirm-btn" onClick={handleJoinEvent}>
                Confirm Participation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showErrorToast && (
        <div className="charity-toast charity-show">
          <div className="charity-toast-content">
            <div className="charity-message">
              <svg className="charity-check-icon" viewBox="0 0 24 24">
                <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
              </svg>
              <div>
                <span className="charity-text-1">Success!</span>
                <span className="charity-text-2">Charity added to donations!</span>
              </div>
            </div>
            <button className="charity-close-btn" onClick={() => setShowErrorToast(false)}>
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Charity;
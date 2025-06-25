import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./css/Product.css";
import "./css/Cart.css";
import { fetchGetAllProducts } from "./Redux/Slices/ProductSlice";
import CartButton from "./CartButton";
import axios from 'axios';

function Products({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  
  // Product-specific states
  const [quantity, setQuantity] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(false);
  
  // Cart states (shared across all product cards)
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartId, setCartId] = useState(null);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch user data and subscription status
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) return;
      
      try {
        const response = await axios.get(
          "http://localhost:8080/api/users/me", 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if(response.status === 200) {
          setSubscriptionStatus(response.data.subscriptionStatus);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, [token]);

  // Fetch cart data
  useEffect(() => {
    const fetchCartData = async () => {
      if (!token) return;
      
      try {
        setCartLoading(true);
        const cartResponse = await axios.get(
          'http://localhost:8080/api/cart/me',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const cart = cartResponse.data;
        if (cart && cart.cartId) {
          setCartId(cart.cartId);
          const itemsResponse = await axios.get(
            `http://localhost:8080/api/cart-items/${cart.cartId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setCartItems(itemsResponse.data);
        }
      } catch (error) {
        console.error("Error fetching cart data:", error);
      } finally {
        setCartLoading(false);
      }
    };

    fetchCartData();
  }, [token]);

  // Close cart dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        const cartButton = document.querySelector('.cart-button');
        if (cartButton && !cartButton.contains(event.target)) {
          setShowCart(false);
        }
      }
    };

    if (showCart) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCart]);

  // Handle quantity change
  const handleQuantityChange = (value) => {
    const numValue = Math.max(1, parseInt(value) || 1);
    setQuantity(numValue);
  };

  // Add product to cart
  const addToCart = async () => {
    if (!product || quantity < 1) return;

    try {
      await axios.post(
        'http://localhost:8080/api/cart-items/add',
        {
          productId: product.productId,
          quantity: quantity
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      setShowCart(true)
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      
      // Refresh cart items
      const itemsResponse = await axios.get(
        `http://localhost:8080/api/cart-items/${cartId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(itemsResponse.data);
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product: ' + (error.response?.data?.message || error.message));
    }
  };

  // Donate product
  const donateProduct = async () => {
    if (!subscriptionStatus) {
      navigate("../subscribe");
      return;
    }
    
    if (!product || quantity < 1) return;

    try {
      await axios.post(
        'http://localhost:8080/api/cart-items/donate',
        {
          productId: product.productId,
          quantity: quantity,
          charityId: cartId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      // Refresh cart items
      const itemsResponse = await axios.get(
        `http://localhost:8080/api/cart-items/${cartId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(itemsResponse.data);
    } catch (error) {
      console.error('Donation error:', error);
      alert('Donation failed: ' + (error.response?.data?.message || error.message));
    }
  };

  // View product details
  const showDetails = () => {
    navigate(`/detailsproducts/${product.productId}`);
  };

  // Remove item from cart
  const removeCartItem = async (cartItemId) => {
    try {
      await axios.delete(
        `http://localhost:8080/api/cart-items/${cartItemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item: ' + (error.response?.data?.message || error.message));
    }
  };

  // Update item quantity in cart
  const updateCartItemQuantity = async (cartItemId, newQuantity) => {
    try {
      await axios.put(
        `http://localhost:8080/api/cart-items/${cartItemId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(prev => prev.map(item => 
        item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Update failed: ' + (error.response?.data?.message || error.message));
    }
  };

  // Fetch reviews for a seller
  const fetchReviews = async () => {
    if (!product?.sellerId?.userId) return;
    
    try {
      setLoadingReviews(true);
      const response = await axios.get(
        `http://localhost:8080/reviews/seller/${product.sellerId.userId}/details`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data) {
        setReviews(response.data.reviews || []);
        setAverageRating(response.data.averageRating || 0);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Submit a new review
  const submitReview = async () => {
    if (!token) {
      alert("Please login to submit a review");
      return;
    }
    
    try {
      await axios.post(
        'http://localhost:8080/reviews',
        {
          sellerId: product.sellerId.userId,
          productId: product.productId,
          rating: newReview.rating,
          comment: newReview.comment
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh reviews
      await fetchReviews();
      
      // Reset form
      setNewReview({
        rating: 5,
        comment: ""
      });
      
      alert("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review: " + (error.response?.data?.message || error.message));
    }
  };

  // Toggle cart visibility
  const toggleCart = () => {
    setShowCart(prev => !prev);
  };

  // Filter reviews for this specific product
  const filteredReviews = reviews.filter(
    review => review.product?.productId === product.productId
  );

  return (
    <div className="product-card-wrapper">
      {/* Cart Manager - Positioned absolutely relative to the viewport */}
      <div className="cart-manager">
        <CartButton 
          cartItems={cartItems} 
          toggleDropdown={toggleCart} 
          cartLoading={cartLoading}
        />
        
        {/* Cart Dropdown */}
        <div 
          ref={dropdownRef}
          className={`cart-dropdown ${showCart ? 'show' : 'hide'}`}
        >
          <div className="cart-header">
            <h3 style={{color:"black"}}>Your Cart</h3>
            <button className="close-cart" onClick={() => setShowCart(false)}>
              &times;
            </button>
          </div>
          
          {cartLoading ? (
            <div className="cart-loading">
              <div className="spinner"></div>
              <p>Loading cart...</p>
            </div>
          ) : cartItems.length > 0 ? (
            <div className="cart-items-container">
              {cartItems.map((item) => (
                <div key={item.cartItemId} className="cart-item">
                  {item.productId?.imagePath ? (
                    <img 
                      src={item.productId.imagePath} 
                      alt={item.productId.productName} 
                      className="cart-item-image" 
                    />
                  ) : (
                    <div className="cart-item-placeholder">No Image</div>
                  )}
                  <div className="cart-item-details">
                    <p className="cart-item-name">
                      {item.productId?.productName || `Donation (ID: ${item.cartItemId})`}
                    </p>
                    <div className="cart-item-meta">
                      <p className="cart-item-price">{item.price} SAR</p>
                      <div className="cart-item-controls">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateCartItemQuantity(
                            item.cartItemId, 
                            Math.max(1, parseInt(e.target.value)))
                          }
                          className="cart-item-quantity"
                        />
                        <button
                          className="cart-item-remove"
                          onClick={() => removeCartItem(item.cartItemId)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="cart-item-subtotal">
                      Subtotal: {item.price * item.quantity} SAR
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="cart-empty-message">Your cart is empty</p>
          )}
          
          {cartItems.length > 0 && (
            <div className="cart-footer">
              <div className="cart-total">
                <p>
                  Total:{" "}
                  {cartItems.reduce(
                    (total, item) => total + item.price * item.quantity, 0
                  ).toFixed(2)} SAR
                </p>
                <button
                  className="checkout-button"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Card */}
      <div className="product-card">
        <div className="product-image-container">
          {product.imagePath ? (
            <img
              src={"http://localhost:8080"+product.imagePath}
              alt={product.productName}
              className="product-image"
            />
          ) : (
            <div className="product-image-placeholder">
              <div className="placeholder-icon">📦</div>
              <p>No Image Available</p>
            </div>
          )}
          {(product.availabilityStatus === false || product.quantity === 0) && (
            <div className="out-of-stock-badge">Out of Stock</div>
          )}
          <div className="product-category">
            {product.categoryId?.categoriesName || "Uncategorized"}
          </div>
        </div>
        <div className="product-details-products">
          <h3 className="product-name">{product.productName}</h3>
          <p className="product-description">
            {product.productDescription}
          </p>
          <div className="product-meta">
            <div className="product-price-container">
              <span className="product-price">
                ${product.productPrice.toFixed(2)}
              </span>
              <span className="product-expiry">
                Expires: {new Date(product.expiryDate).toLocaleDateString()}
              </span>
            </div>
            <div className="product-stock-container">
              <span
                className={`product-status ${
                  (product.availabilityStatus && product.quantity !== 0) 
                    ? "in-stock" 
                    : "out-of-stock"
                }`}
              >
                {(product.availabilityStatus && product.quantity !== 0)
                  ? `In Stock (${product.quantity})`
                  : `Out of Stock`}
              </span>
            </div>
          </div>
          <div className="product-actions">
            <div className="quantity-selector">
              <label>Qty:</label>
              <input
                type="number"
                min="1"
                max={product.quantity}
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="quantity-input"
                disabled={!product.availabilityStatus || product.quantity === 0}
              />
            </div>
            <div className="action-buttons">
              <button
                className="add-to-cart-button"
                onClick={addToCart}
                disabled={!product.availabilityStatus || product.quantity === 0}
              >
                <span className="button-icon">🛒</span> Add to Cart
              </button>
              <div className="secondary-actions">
                <button
                  className="details-button"
                  onClick={showDetails}
                  disabled={!product.availabilityStatus || product.quantity === 0}
                >
                  Details
                </button>
                <button
                  className="donate-button"
                  onClick={donateProduct}
                  disabled={!product.availabilityStatus || product.quantity === 0}
                >
                  Donate
                </button>
              </div>
            </div>
          </div>
          
          {/* Reviews Button */}
          <button
            className="reviews-button"
            onClick={() => {
              setExpanded(!expanded);
              if (!expanded && reviews.length === 0) {
                fetchReviews();
              }
            }}
            disabled={!product.availabilityStatus || product.quantity === 0}
          >
            {expanded ? "Hide Reviews" : `Reviews (${filteredReviews.length})`}
          </button>
          
          {/* Reviews Section */}
          {expanded && (
            <div className="reviews-section">
              <div className="reviews-summary">
                <div className="average-rating">
                  <span className="rating-stars">
                    {"★".repeat(Math.round(averageRating))}
                    {"☆".repeat(5 - Math.round(averageRating))}
                  </span>
                  <span>{averageRating.toFixed(1)}</span>
                </div>
                <p>{filteredReviews.length} reviews</p>
              </div>

              {loadingReviews ? (
                <div className="reviews-loading">
                  <div className="spinner"></div>
                  <p>Loading reviews...</p>
                </div>
              ) : (
                <>
                  <div className="reviews-list">
                    {filteredReviews.length > 0 ? (
                      filteredReviews.map(review => (
                        <div key={review.reviewId} className="review-item">
                          <div className="review-header">
                            <span className="reviewer-name">
                              {review.buyer?.userName || "Anonymous"}
                            </span>
                            <span className="review-rating">
                              {"★".repeat(review.rating)}
                              {"☆".repeat(5 - review.rating)}
                            </span>
                            <span className="review-date">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="review-comment">{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p className="no-reviews">No reviews yet for this product</p>
                    )}
                  </div>

                  {/* Add Review Form */}
                  <div className="add-review-form">
                    <h4>Add Your Review</h4>
                    <div className="rating-input">
                      <label>Rating:</label>
                      <select
                        value={newReview.rating}
                        onChange={(e) => setNewReview({
                          ...newReview,
                          rating: parseInt(e.target.value)
                        })}
                      >
                        {[1, 2, 3, 4, 5].map(num => (
                          <option key={num} value={num}>
                            {num} ★
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="comment-input">
                      <label>Comment:</label>
                      <textarea
                        value={newReview.comment}
                        onChange={(e) => setNewReview({
                          ...newReview,
                          comment: e.target.value
                        })}
                        placeholder="Share your experience with this product..."
                      />
                    </div>
                    <button
                      className="submit-review-button"
                      onClick={submitReview}
                    >
                      Submit Review
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Toast Notification */}
        {showErrorToast && (
          <div className="toast-container">
            <div className="toast">
              <div className="toast-icon">✅</div>
              <div className="toast-content">
                <div className="toast-header">
                  <strong>Added to Cart</strong>
                  <button
                    type="button"
                    className="toast-close"
                    onClick={() => setShowErrorToast(false)}
                  >
                    &times;
                  </button>
                </div>
                <div className="toast-body">
                  Product added to cart successfully!
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
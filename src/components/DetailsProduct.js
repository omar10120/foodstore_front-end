import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from "react-redux";
import './css/DetailsProducts.css';

function DetailsProduct() {
    const [product, setProduct] = useState(null);
    const [addToCart, setAddToCart] = useState(false);
    const [showErrorToast, setShowErrorToast] = useState(false);
    const [inputAmount, setInputAmount] = useState(1);
    const [errorMessage, setErrorMessage] = useState('');
    const [subscriptionStatus, setSubscriptionStatus] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [toastQueue, setToastQueue] = useState([]);
    const [message , setmessage] = useState(null)
    const navigate = useNavigate();
    const { productId } = useParams();
    const token = useSelector((state) => state.auth.token);
    
    // Fetch user data
    useEffect(() => {
        const source = axios.CancelToken.source();
        let isMounted = true;
        
        const fetchUserData = async () => {
          try {
            const response = await axios.get(
              "http://localhost:8080/api/users/me", 
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (isMounted && response.status === 200) {
                setSubscriptionStatus(response.data.subscriptionStatus);
            }
            
          } catch (err) {
            if (isMounted) {
              setErrorMessage(axios.isCancel(err) 
                ? "Request canceled" 
                : err.response?.data || err.message
              );
              showToast(err.response?.data || err.message, 'error');
            }
          }
        };
    
        if (token) {
          fetchUserData();
        } else {
            setErrorMessage("No authentication token found");
            showToast("Please log in to view product details", 'error');
        }
    
        return () => {
          isMounted = false;
          source.cancel("Component unmounted, canceling request");
        };
    }, [token]);
    
    // Fetch product data
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const baseurl = subscriptionStatus 
                    ? "http://localhost:8080/api/products/nearby"
                    : "http://localhost:8080/api/products";
                
                const response = await axios.get(baseurl, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const foundProduct = response.data.find(p => p.productId == productId);
                
                if (foundProduct) {
                    setProduct(foundProduct);
                    // Fetch seller reviews when product is found
                    fetchSellerReviews(foundProduct.sellerId.userId);
                } else {
                    throw new Error('Product not found');
                }
            } catch (error) {
                console.error('Error fetching product data:', error);
                setErrorMessage('Product not found!');
                showToast('Product not found!', 'error');
            }
        };

        fetchProduct();
    }, [productId, subscriptionStatus, token]);

    // Fetch seller reviews
    const fetchSellerReviews = async (sellerId) => {
        try {
            const response = await axios.get(
                `http://localhost:8080/reviews/seller/${sellerId}/details`,{
                    headers:{Authorization :` Bearer ${token}`}
                    
                }
            );
            setReviews(response.data.reviews);
            setAverageRating(response.data.averageRating);
        } catch (error) {
            console.error('Error fetching seller reviews:', error);
            setErrorMessage('Failed to load reviews');
            showToast('Failed to load seller reviews', 'error');
        }
    };

    // Handle review submission
    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                'http://localhost:8080/reviews',
                {
                    sellerId: product.sellerId.userId,
                    productId: product.productId,
                    rating: newReview.rating,
                    comment: newReview.comment
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            // Refresh reviews after submission
            fetchSellerReviews(product.sellerId.userId);
            setNewReview({ rating: 5, comment: '' });
            setShowReviewForm(false);
            showToast('Review submitted successfully!', 'success');
        } catch (error) {
            console.error('Error submitting review:', error);
            setErrorMessage('Failed to submit review');
            showToast('Failed to submit review', 'error');
        }
    };

    // Handle amount change
    const handleAmountChange = (value) => {
        const amount = parseInt(value, 10) || 0;
        let error = '';

        if (!product) return;

        if (amount > product.quantity) {
            error = `Error: The amount entered (${amount}) exceeds available amount (${product.quantity})`;
        } else if (amount < 1) {
            error = `Error: Please enter a valid amount`;
        }

        setErrorMessage(error);
        setInputAmount(amount);
    };

    // Increment/decrement quantity
    const adjustQuantity = (amount) => {
        const newAmount = inputAmount + amount;
        if (newAmount >= 1 && newAmount <= product.quantity) {
            setInputAmount(newAmount);
            setErrorMessage('');
        }
    };

    // Add product to cart
    const addProductToCart = async () => {
        if (!inputAmount || inputAmount < 1) {
            setShowErrorToast(true);
            showToast('Please enter a valid amount', 'error');
            return;
        }
    
        try {
            await axios.post(
                'http://localhost:8080/api/cart-items/add',
                { productId, quantity: inputAmount },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );
            // showToast('Product added to cart!', 'success');
            setmessage('Product added to cart!', 'success')
            setTimeout(() => {
                setmessage(null)
            }, 2500);
        } catch (error) {
            console.error('Error adding product to cart:', error);
            setErrorMessage('Failed to add product to the cart.');
            showToast('Failed to add product to cart', 'error');
        }
    };

    // Donate product
    const donateProduct = async () => {
        if (!inputAmount || inputAmount < 1) {
            setShowErrorToast(true);
            showToast('Please enter a valid amount', 'error');
            return;
        }
    
        try {
            await axios.post(
                'http://localhost:8080/api/cart-items/donate',
                {
                    productId,
                    quantity: inputAmount,
                    charityId: 3,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );
            showToast('Product donated successfully!', 'success');
            // navigate('/charity');    
        } catch (error) {
            console.error('Error donating product:', error);
            setErrorMessage('Failed to donate the product.');
            showToast('Failed to donate product', 'error');
        }
    };

    // Modern toast system
    const showToast = (message, type) => {
        const id = Date.now();
        const toast = { id, message, type };
        
        setToastQueue(prev => [...prev, toast]);
        
        setTimeout(() => {
            setToastQueue(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    if (!product) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading product details...</p>
            </div>
        );
    }

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="details-page">
            {/* Product Details Section */}
       
            <div className="product-details-container">
                <div className="product-image-container">
                    <img 
                        src={product.imagePath} 
                        alt={product.productName} 
                        className="product-image"
                    />
                </div>
                   
                <div className="product-info">
                    <div className="product-header">
                        <div className="category-badge">
                        
                            {product.categoryId?.categoriesName || 'N/A'}
                        </div>
                        <h1 className="product-title">{product.productName}</h1>
                        <div className="rating-badge">
                            <div className="stars">
                                {'★'.repeat(Math.round(averageRating))}
                                {'☆'.repeat(5 - Math.round(averageRating))}
                            </div>
                            <span className="average-rating">{averageRating.toFixed(1)}</span>
                            <span className="reviews-count">({reviews.length})</span>
                        </div>
                    </div>
                    
                    <div className="product-description">
                        <p>{product.productDescription}</p>
                    </div>
                    
                    <div className="product-meta-grid">
                        <div className="meta-item">
                            <div className="meta-label">Expiration Date</div>
                            <div className="meta-value">{formatDate(product.expiryDate)}</div>
                        </div>
                        
                        <div className="meta-item">
                            <div className="meta-label">Available Stock</div>
                            <div className="meta-value">{product.quantity} units</div>
                        </div>
                        
                        <div className="meta-item">
                            <div className="meta-label">Status</div>
                            <div className={`meta-value ${product.availabilityStatus ? 'available' : 'unavailable'}`}>
                                {product.availabilityStatus ? 'In Stock' : 'Out of Stock'}
                            </div>
                        </div>
                        
                        <div className="meta-item">
                            <div className="meta-label">Seller</div>
                            <div className="meta-value">{product.sellerId.userName}</div>
                        </div>
                    </div>
                    
                    <div className="price-container">
                        <div className="price-label">Total Price</div>
                        <div className="price-value">{product.productPrice * inputAmount} SP</div>
                        <div className="unit-price">{product.productPrice} SP per unit</div>
                    </div>
                    
                    {product.availabilityStatus && (
                        <div className="purchase-section">
                            <div className="quantity-control">
                                <div className="quantity-label">Quantity: {product.quantity}</div>
                                <div className="quantity-selector">
                                    <button 
                                        className="quantity-btn" 
                                        onClick={() => adjustQuantity(-1)}
                                        disabled={inputAmount <= 1}
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        max={product.quantity}
                                        value={inputAmount}
                                        onChange={(e) => handleAmountChange(e.target.value)}
                                        className="quantity-input"
                                    />
                                    <button 
                                        className="quantity-btn" 
                                        onClick={() => adjustQuantity(1)}
                                        disabled={inputAmount >= product.quantity}
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="available-stock">Available: {product.quantity} units</div>
                            </div>
                            
                            {errorMessage && (
                                <div className="error-message">{errorMessage}</div>
                            )}
                            
                            <div className="action-buttons">
                                <button 
                                    className="btn primary-btn"
                                    onClick={addProductToCart}
                                >
                                    <i className="bi bi-cart-plus"></i> Add to Cart
                                </button>
                                
                                {message!= null &&(
                                <div class="alert alert-success" role="alert">
                                      {message}
                                </div>
                                )}
                                <button 
                                    className="btn secondary-btn"
                                    onClick={donateProduct}
                                >
                                    <i className="bi bi-gift"></i> Donate
                                </button>
                                <button 
                                    className="btn secondary-btn"
                                    onClick={() => navigate("/checkout")}
                                >
                                    <i className="bi bi-cart"></i> Checkout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Seller Information Section */}
            <div className="seller-section">
                <div className="seller-header">
                    <h2>Seller Information</h2>
                    <div className="rating-badge">
                        <div className="stars">
                            {'★'.repeat(Math.round(averageRating))}
                            {'☆'.repeat(5 - Math.round(averageRating))}
                        </div>
                        <span className="average-rating">{averageRating.toFixed(1)}</span>
                        <span className="reviews-count">({reviews.length} reviews)</span>
                    </div>
                </div>
                
                <div className="seller-info-card">
                    <div className="seller-avatar">
                        <div className="avatar-placeholder">
                            {product.sellerId.userName.charAt(0)}
                        </div>
                    </div>
                    
                    <div className="seller-details">
                        <h3 className="seller-name">{product.sellerId.userName}</h3>
                        
                        <div className="seller-contact">
                            <div className="contact-item">
                                <i className="bi bi-envelope"></i>
                                <span>{product.sellerId.email}</span>
                            </div>
                            
                            <div className="contact-item">
                                <i className="bi bi-telephone"></i>
                                <span>{product.sellerId.phoneNumber}</span>
                            </div>
                            
                            <div className="contact-item">
                                <i className="bi bi-geo-alt"></i>
                                <span>{product.sellerId.location.address}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Reviews Section */}
                <div className="reviews-section">
                    <div className="reviews-header">
                        <h3>Customer Reviews</h3>
                        <button 
                            className="btn write-review-btn"
                            onClick={() => setShowReviewForm(!showReviewForm)}
                        >
                            {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                        </button>
                    </div>
                    
                    {/* Review Form */}
                    {showReviewForm && (
                        <div className="review-form-container">
                            <h4>Write Your Review</h4>
                            <form onSubmit={handleSubmitReview}>
                                <div className="form-group">
                                    <label>Rating:</label>
                                    <div className="rating-input">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span 
                                                key={star}
                                                className={`star ${star <= newReview.rating ? 'selected' : ''}`}
                                                onClick={() => setNewReview({...newReview, rating: star})}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="review-comment">Comment:</label>
                                    <textarea 
                                        id="review-comment"
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                                        placeholder="Share your experience with this seller..."
                                        required
                                    />
                                </div>
                                
                                <button type="submit" className="btn submit-review-btn">
                                    Submit Review
                                </button>
                            </form>
                        </div>
                    )}
                    
                    {/* Reviews List */}
                    <div className="reviews-list">
                        {reviews.length > 0 ? (
                            reviews.map((review, index) => (
                                <div className="review-card" key={index}>
                                    <div className="review-header">
                                        <div className="reviewer-info">
                                            <div className="reviewer-avatar">
                                                {review.buyerName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="reviewer-name">{review.buyerName}</div>
                                                <div className="review-date">2 days ago</div>
                                            </div>
                                        </div>
                                        <div className="review-rating">
                                            {'★'.repeat(review.rating)}
                                            {'☆'.repeat(5 - review.rating)}
                                        </div>
                                    </div>
                                    <p className="review-comment">{review.comment}</p>
                                </div>
                            ))
                        ) : (
                            <div className="no-reviews">
                                <p>No reviews yet. Be the first to review this seller!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Modern Toast Notifications */}
            <div className="toast-container">
                {toastQueue.map(toast => (
                    <div 
                        key={toast.id} 
                        className={`toast ${toast.type}`}
                    >
                        <div className="toast-icon">
                            {toast.type === 'success' ? (
                                <i className="bi bi-check-circle-fill"></i>
                            ) : (
                                <i className="bi bi-exclamation-circle-fill"></i>
                            )}
                        </div>
                        <div className="toast-message">{toast.message}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DetailsProduct;
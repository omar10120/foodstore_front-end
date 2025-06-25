import React, { useState, useEffect } from "react";
import { FiStar, FiTrash2, FiUser, FiSearch } from "react-icons/fi";
import { useSelector } from "react-redux";

function ModerateReviews() {
  const [sellers, setSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const token = useSelector((state) => state.auth.token);

  // Fetch sellers data from API
  const fetchSellers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch sellers');
      }
      
      const data = await response.json();
      // Filter for sellers only
      const sellerUsers = data.filter(user => 
        user.roleId.roleName.toLowerCase() === 'seller' && user.verified
      );
      setSellers(sellerUsers);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load sellers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, [token]);

  // Fetch reviews for selected seller
  const fetchReviews = async (sellerId) => {
    try {
      setLoading(true);
      setReviews(null);
      
      const response = await fetch(`http://localhost:8080/reviews/seller/${sellerId}/details`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      
      const data = await response.json();
      setReviews(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  // Handle seller selection
  const handleSellerSelect = (seller) => {
    setSelectedSeller(seller);
    fetchReviews(seller.userId);
  };

  // Handle review deletion
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(reviewId);
      setDeleteError(null);
      
      const response = await fetch(`http://localhost:8080/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete review');
      }
      
      // Remove review from local state
      setReviews({
        ...reviews,
        reviews: reviews.reviews.filter(review => review.reviewId !== reviewId)
      });
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteError(err.message || "Failed to delete review");
    } finally {
      setDeletingId(null);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="moderate-reviews">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="moderate-reviews">
        <div className="error-alert">
          <strong>Error:</strong> {error}
          <button 
            className="btn-retry"
            onClick={fetchSellers}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Filter reviews based on search
  const filteredReviews = reviews?.reviews?.filter(review => 
    review.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    review.comment.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="moderate-reviews">
      <div className="section-header">
        <h2>Moderate Reviews</h2>
        <div className="actions">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search reviews..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={!selectedSeller}
            />
          </div>
        </div>
      </div>

      {deleteError && (
        <div className="delete-error">
          <strong>Delete failed:</strong> {deleteError}
          <button onClick={() => setDeleteError(null)}>Dismiss</button>
        </div>
      )}

      <div className="seller-selector">
        <h3>Select a Seller</h3>
        <div className="sellers-grid">
          {sellers.length > 0 ? (
            sellers.map(seller => (
              <div 
                key={seller.userId}
                className={`seller-card ${selectedSeller?.userId === seller.userId ? 'active' : ''}`}
                onClick={() => handleSellerSelect(seller)}
              >
                <div className="seller-avatar">
                  <FiUser />
                </div>
                <div className="seller-info">
                  <div className="seller-name">{seller.userName}</div>
                  <div className="seller-email">{seller.email}</div>
                  {/* <div className="seller-id">ID: {seller.userId}</div> */}
                </div>
              </div>
            ))
          ) : (
            <div className="no-sellers">
              <p>No sellers found</p>
            </div>
          )}
        </div>
      </div>

      {selectedSeller && reviews && (
        <div className="reviews-container">
          <div className="reviews-header">
            <div className="seller-summary">
              <div className="seller-details">
                <div className="seller-name">{selectedSeller.userName}</div>
                <div className="seller-rating">
                  <span className="rating-value">{reviews.averageRating}</span>
                  <FiStar className="star-icon" />
                  <span className="rating-label">Average Rating</span>
                  <span className="reviews-count">({reviews.reviews.length} reviews)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="reviews-list">
            {filteredReviews.length > 0 ? (
              filteredReviews.map(review => (
                <div key={review.reviewId} className="review-card">
                  <div className="review-header">
                    <div className="buyer-info">
                      <div className="buyer-avatar">
                        <FiUser />
                      </div>
                      <div className="buyer-name">{review.buyerName}</div>
                    </div>
                    <div className="review-rating">
                      {[...Array(5)].map((_, i) => (
                        <FiStar 
                          key={i}
                          className={`star ${i < review.rating ? 'filled' : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="review-content">
                    {review.comment ? (
                      <p>{review.comment}</p>
                    ) : (
                      <p className="no-comment">No comment provided</p>
                    )}
                  </div>
                  
                  <div className="review-actions">
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeleteReview(review.reviewId)}
                      disabled={deletingId === review.reviewId}
                    >
                      {deletingId === review.reviewId ? (
                        <div className="deleting-spinner"></div>
                      ) : (
                        <>
                          <FiTrash2 /> Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-reviews">
                <p>No reviews found for {selectedSeller.userName}</p>
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')}>
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ModerateReviews;
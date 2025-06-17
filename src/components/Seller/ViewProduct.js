import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import '../css/viewProduct.css';
import { useNavigate } from 'react-router-dom';
function ViewProduct() {
    const { productId } = useParams();
    const token = useSelector((state) => state.auth.token);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8080/api/products/seller/product/${productId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setProduct(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch product details ' + productId);
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId, token]);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) return <div className="loading-spinner"></div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!product) return <div className="not-found-message">Product not found</div>;

    return (
        <div className="product-view-container">
            <div className="product-grid">
                {/* Product Image Section */}
                <div className="product-image-container">
                    <img 
                        src={product.imagePath || "https://via.placeholder.com/600x600?text=No+Image"} 
                        alt={product.productName}
                        className="product-image"
                    />
                </div>

                {/* Product Details Section */}
                <div className="product-details-container">
                    <h1 className="product-title">{product.productName}</h1>
                    <div className="price-availability">
                        <span className="product-price">${product.productPrice.toLocaleString()}</span>
                        <span className={`availability-badge ${product.availabilityStatus ? 'available' : 'unavailable'}`}>
                            {product.availabilityStatus ? 'In Stock' : 'Out of Stock'}
                        </span>
                    </div>

                    <div className="product-meta">
                        <div className="meta-item">
                            <span className="meta-label">Category</span>
                            <span className="meta-value">{product.categoryId.categoriesName}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Quantity</span>
                            <span className="meta-value">{product.quantity} units</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Expires</span>
                            <span className="meta-value">{formatDate(product.expiryDate)}</span>
                        </div>
                    </div>

                    <div className="product-description">
                        <h3>Product Details</h3>
                        <p>{product.productDescription}</p>
                    </div>

                    <div className="action-buttons">
                        <button className="btn-primary" onClick={() => navigate('/ProductSellers')}>Back to product list</button>
                        
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ViewProduct;
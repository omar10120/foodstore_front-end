// ProductCard.jsx
import React from "react";
import { Link } from "react-router-dom";

function ProductCard({ product }) {
    return (
        <div className="product-card">
            <div className="product-image-container">
                {product.imagePath ? (
                    <img
                        src={product.imagePath}
                        alt={product.productName}
                        className="product-image"
                    />
                ) : (
                    <div className="product-image-placeholder">
                        No Image
                    </div>
                )}
                {!product.availabilityStatus && (
                    <div className="out-of-stock-badge">Out of Stock</div>
                )}
            </div>
            
            <div className="product-details">
                <h3 className="product-name">{product.productName}</h3>
                <p className="product-description">
                    {product.productDescription.substring(0, 100)}...
                </p>
                
                <div className="product-meta">
                    <span className="product-price">
                        ${product.productPrice.toFixed(2)}
                    </span>
                    <span className="product-quantity">
                        {product.availabilityStatus ? `In Stock (${product.quantity})` : "Out of Stock"}
                    </span>
                </div>
                
                <div className="product-actions">
                    <Link 
                        to={`/detailsproducts/${product.productId}`}
                        className="details-button"
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
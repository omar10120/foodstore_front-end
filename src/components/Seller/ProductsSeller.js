import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import '../css/ProductSellers.css'

function ProductSellers() {
    const token = useSelector((state) => state.auth.token);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    // Fetch products from API
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(
                    'http://localhost:8080/api/products/seller',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                setProducts(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch products');
                setLoading(false);
            }
        };

        fetchProducts();
    }, [token]);

    // Delete product
    const handleDelete = async (productId) => {
        try {
            await axios.delete(
                `http://localhost:8080/api/products/delete/${productId}?productId=${productId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setProducts(products.filter(product => product.productId !== productId));
        } catch (err) {
            setError('Failed to delete product');
        }
    };

    // Handle sorting
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Apply sorting and filtering
    const getFilteredAndSortedProducts = () => {
        let filteredProducts = products;
        
        // Filter by search term
        if (searchTerm) {
            filteredProducts = filteredProducts.filter(product => 
                product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.categoryId.categoriesName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Apply sorting
        if (sortConfig.key) {
            filteredProducts = [...filteredProducts].sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        
        return filteredProducts;
    };

    // Format date to YYYY-MM-DD
    const formatDate = (dateString) => {
        return new Date(dateString).toISOString().split('T')[0];
    };

    // Render sort indicator
    const renderSortIndicator = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? '▲' : '▼';
        }
        return null;
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading your products...</p>
            </div>
        );
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    const filteredProducts = getFilteredAndSortedProducts();

    return (
        <div className="product-seller-dashboard">
            <div className="dashboard-header">
                <h1>Product Management</h1>
                <p>Manage your inventory and product listings</p>
            </div>
            
            <div className="dashboard-controls">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <i className="bi bi-search"></i>
                </div>
                
                <div className="button-group">
                    <Link to="/dashboard" className="btn btn-back">
                        <i className="bi bi-arrow-left"></i>
                        Back to Dashboard
                    </Link>
                    <Link to="/AddProduct" className="btn btn-primary">
                        <i className="bi bi-plus-circle"></i>
                        Add New Product
                    </Link>
                </div>
            </div>
            
            <div className="stats-container">
                <div className="stat-card">
                    <h3>{products.length}</h3>
                    <p>Total Products</p>
                </div>
                <div className="stat-card">
                    <h3>{products.filter(p => p.availabilityStatus).length}</h3>
                    <p>Active Products</p>
                </div>
                <div className="stat-card">
                    <h3>{products.reduce((acc, curr) => acc + curr.quantity, 0)}</h3>
                    <p>Total Stock</p>
                </div>
            </div>
            
            <div className="products-table-container">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('productId')}>
                                ID {renderSortIndicator('productId')}
                            </th>
                            <th>Image</th>
                            <th onClick={() => handleSort('productName')}>
                                Product Name {renderSortIndicator('productName')}
                            </th>
                            <th>Description</th>
                            <th onClick={() => handleSort('expiryDate')}>
                                Expiration {renderSortIndicator('expiryDate')}
                            </th>
                            <th onClick={() => handleSort('categoryId.categoriesName')}>
                                Category {renderSortIndicator('categoryId.categoriesName')}
                            </th>
                            <th onClick={() => handleSort('quantity')}>
                                Stock {renderSortIndicator('quantity')}
                            </th>
                            <th onClick={() => handleSort('productPrice')}>
                                Price {renderSortIndicator('productPrice')}
                            </th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                                <tr key={product.productId}>
                                    <td className="product-id">{product.productId}</td>
                                    <td className="product-image">
                                        <img 
                                            src={product.imagePath || 'https://via.placeholder.com/50'} 
                                            alt={product.productName} 
                                        />
                                    </td>
                                    <td className="product-name">{product.productName}</td>
                                    <td className="product-desc">{product.productDescription}</td>
                                    <td className="expiry-date">{formatDate(product.expiryDate)}</td>
                                    <td className="product-category">{product.categoryId.categoriesName}</td>
                                    <td className="product-stock">{product.quantity}</td>
                                    <td className="product-price">${product.productPrice.toLocaleString()}</td>
                                    <td className="availability">
                                        {product.availabilityStatus ? (
                                            <span className="available">
                                                <i className="bi bi-check-circle-fill"></i> Available
                                            </span>
                                        ) : (
                                            <span className="not-available">
                                                Not Available
                                            </span>
                                        )}
                                    </td>
                                    <td className="actions">
                                        <Link 
                                            to={`/viewProduct/${product.productId}`} 
                                            className="btn-action btn-view"
                                        >
                                            <i className="bi bi-eye"></i>
                                        </Link>
                                        <Link 
                                            to={`/EditProduct/${product.productId}`} 
                                            className="btn-action btn-edit"
                                        >
                                            <i className="bi bi-pencil"></i>
                                        </Link>
                                        <button 
                                            className="btn-action btn-delete"
                                            onClick={() => handleDelete(product.productId)}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10" className="no-results">
                                    <i className="bi bi-exclamation-circle"></i>
                                    No products found matching your search
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="dashboard-footer">
                <p>Showing {filteredProducts.length} of {products.length} products</p>
                <div className="pagination">
                    <button className="btn-pagination">← Previous</button>
                    <span>Page 1 of 1</span>
                    <button className="btn-pagination" disabled>Next →</button>
                </div>
            </div>
        </div>
    );
}

export default ProductSellers;
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

function ProductSellers() {
    const token = useSelector((state) => state.auth.token);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    if (loading) {
        return (
            <div className="d-flex justify-content-center mt-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-danger mt-3">{error}</div>;
    }

    // Format date to YYYY-MM-DD
    const formatDate = (dateString) => {
        return new Date(dateString).toISOString().split('T')[0];
    };

    return (
        <div className='card-p' style={{ margin: '7px', width: '100%', marginTop: '70px' }}>
            <div className="text-right mb-3" style={{ fontSize: '16px', padding: '5px 10px', marginLeft: '100px', marginTop: '-10px' }}>
                <Link 
                    to="/AddProduct" 
                    className="btn btn-success" 
                    style={{ fontSize: '16px', padding: '5px 10px', marginLeft: '900px', marginTop: '10px' }}
                >
                    <i className="bi bi-plus-circle-fill"></i>
                    Add New Product
                </Link>
            </div>
            <div className="text-right mb-3" style={{ fontSize: '16px', padding: '5px 10px', marginLeft: '100px', marginTop: '-10px' }}>
                <Link 
                    to="/dashboard" 
                    className="btn btn-success" 
                    style={{ fontSize: '16px', padding: '5px 10px', marginLeft: '900px', marginTop: '10px' }}
                >
                    <i class="bi bi-arrow-left"></i>
                    Back to dashboard
                </Link>
            </div>
            <h2>Products</h2>
            <div className="table-responsive" style={{ margin: '7px', width: '100%' }}>
                <table className="table table-striped table-sm">
                    <thead>
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Image</th>
                            <th scope="col">Name Product</th>
                            <th scope="col">Details about Product</th>
                            <th scope="col">Expiration Date</th>
                            <th scope="col">Category</th>
                            <th scope="col">Amount</th>
                            <th scope="col">Price</th>
                            <th scope="col">Availability</th>
                            <th scope="col">Operations</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.productId}>
                                <td>{product.productId}</td>
                                <td>
                                    <img 
                                        src={product.imagePath || 'https://via.placeholder.com/50'} 
                                        alt={product.productName} 
                                        style={{ width: '50px', height: '50px' }} 
                                    />
                                </td>
                                <td>{product.productName}</td>
                                <td>{product.productDescription}</td>
                                <td>{formatDate(product.expiryDate)}</td>
                                <td>{product.categoryId.categoriesName}</td>
                                <td>{product.quantity}</td>
                                <td>${product.productPrice.toLocaleString()}</td>
                                <td>
                                    {product.availabilityStatus ? (
                                        <i className="bi bi-check-circle-fill" style={{ color: 'green' }}></i>
                                    ) : (
                                        ' Not Available'
                                    )}
                                </td>
                                <td>
                                    <Link 
                                        to={`/viewProduct/${product.productId}`} 
                                        className="btn btn-info btn-sm mt-2" 
                                        style={{ fontSize: '12px', padding: '5px 10px', marginLeft: '4px', backgroundColor: 'gray' }}
                                    >
                                        <i className="bi bi-info-circle"></i> View
                                    </Link>
                                        

                                    <button 
                                        className="btn btn-danger btn-sm mt-2" 
                                        style={{ fontSize: '12px', padding: '5px 10px', marginLeft: '5px' }}
                                        onClick={() => handleDelete(product.productId)}
                                    >
                                        <i className="bi bi-file-earmark-x"></i> Delete
                                    </button>

                                    <Link 
                                        to={`/EditProduct/${product.productId}`} 
                                        className="btn btn-info btn-sm mt-2" 
                                        style={{ fontSize: '12px', padding: '5px 10px', marginLeft: '4px', backgroundColor: 'gray' }}
                                    >
                                        <i className="bi bi-pencil-fill"></i> Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ProductSellers;
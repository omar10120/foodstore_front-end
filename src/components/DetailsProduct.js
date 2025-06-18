import './css/DetailsProducts.css';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from "react-redux";

function DetailsProduct() {
    const [product, setProduct] = useState(null);
    const [addToCart, setAddToCart] = useState(false);
    const [showMore, setShowMore] = useState(false);
    const [showErrorToast, setShowErrorToast] = useState(false);
    
    const [inputAmount, setInputAmount] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    
    const navigate = useNavigate();
    const { productId } = useParams();
    const token = useSelector((state) => state.auth.token);
    const [subscriptionStatus, setSubscriptionStatus] = useState(false);
    useEffect(() => {
        const source = axios.CancelToken.source();
        let isMounted = true;
        
        const fetchUserData = async () => {
          try {
            const response = await axios.get(
              "http://localhost:8080/api/users/me", 
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            // const cart = response.data;
            
                if(response.status == "200")
                setSubscriptionStatus(response.data.subscriptionStatus);
                
            
          } catch (err) {
            if (isMounted) {
              setErrorMessage(axios.isCancel(err) 
                ? "Request canceled" 
                : err.response?.data || err.message
              );
            }
          } finally {
            // if (isMounted) setLoading(false);
          }
        };
    
        if (token) {
          fetchUserData();
        } else {
            setErrorMessage("No authentication token found");
    
        }
    
        return () => {
          isMounted = false;
          source.cancel("Component unmounted, canceling request");
        };
    }, [token]);
    useEffect(() => {
        const fetchProduct = async () => {
            var baseurl;
            try {
                if (subscriptionStatus)
                     baseurl = "http://localhost:8080/api/products/nearby"
                else
                     baseurl = "http://localhost:8080/api/products"
                const response = await axios.get(baseurl,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const foundProduct = response.data.find(p => p.productId == productId);
                
                if (foundProduct) {
                    setProduct(foundProduct);
                } else {
                    throw new Error('Product not found');
                }
            } catch (error) {
                console.error('Error fetching product data:', error);
                alert('Product not found!');
            }
        };

        fetchProduct();
    }, [productId]);

    const handleAmountChange = (value) => {
        const amount = parseInt(value, 10) || 0;
        let error = '';

        if (!product) return;

        if (amount > product.quantity) {
            error = `Error: The amount entered (${amount}) exceeds available amount (${product.quantity}) for ${product.productName}.`;
        } else if (amount < 1) {
            error = `Error: Please enter a valid amount for ${product.productName}.`;
        }

        setErrorMessage(error);
        setInputAmount(amount);
    };

    const addProductToCart = async () => {
        if (!inputAmount || inputAmount < 1) {
            setShowErrorToast(true);
            setTimeout(() => setShowErrorToast(false), 3000);
            return;
        }
    
        try {
            // Fixed request structure
            await axios.post(
                'http://localhost:8080/api/cart-items/add',
                { productId, quantity: inputAmount },  // Request body
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );
            setAddToCart(true);
            setTimeout(() => setAddToCart(false), 3000);
        } catch (error) {
            console.error('Error adding product to cart:', error);
            alert('Failed to add product to the cart.');
        }
    };

    const donateProduct = async () => {
        if (!inputAmount || inputAmount < 1) {
            setShowErrorToast(true);
            setTimeout(() => setShowErrorToast(false), 3000);
            return;
        }
    
        try {
            await axios.post(
                'http://localhost:8080/api/cart-items/donate',
                {

                    productId,
                    quantity: inputAmount,
                    charityId: 1,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"

                    }
                }
            );
            navigate('/charity');
        } catch (error) {
            console.error('Error donating product:', error);
            alert('Failed to donate the product.');
        }
    };

    const toggleDetails = () => {
        setShowMore(!showMore);
    };

    if (!product) {
        return <div>Loading product details...</div>;
    }

    return (
        <div
            className="container12 detailsP"
            style={{
                display: 'flex',
                justifyContent: 'space-around',
                marginTop: '100px',
                border: '2px solid blue',
                borderRadius: '8px',
                padding: '10px',
            }}
        >
            <div style={{ width: '18rem' }}>
                <img
                    className="card1-img12-top1"
                    src={product.imagePath}
                    alt="Product"
                />
            </div>

            <div style={{ width: '60rem' }}>
                <p className="title1">{product.productName}</p>
                {showMore ? (
                    <>
                        <p className="title1">Details about the product: {product.productDescription}</p>
                        <span style={{ cursor: 'pointer', color: 'blue' }} onClick={toggleDetails}>
                            Read Less
                        </span>
                    </>
                ) : (
                    <>
                        <p className="title1">Details about the product: {product.productDescription?.substring(0, 50)}...</p>
                        <span style={{ cursor: 'pointer', color: 'blue' }} onClick={toggleDetails}>
                            Read More
                        </span>
                    </>
                )}

                <p className="title1">Expiration Date: {product.expiryDate}</p>
                <div className="row">
                    <p className="col-md-2" style={{ display: 'inline-block', marginRight: '30px' }}>
                        Price: {product.productPrice} SP
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                    <p className="title1" style={{ marginRight: '390px' }}>
                        Category: {product.categoryId?.categoriesName || 'N/A'}
                    </p>
                    <p className="title1" style={{ marginRight: '30px' }}>
                        Availability: {product.availabilityStatus ? 'Available' : 'Not Available'}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    {product.availabilityStatus ? (
                        <>
                            <input
                                type="number"
                                placeholder="Enter Amount"
                                value={inputAmount}
                                onChange={(e) => handleAmountChange(e.target.value)}
                                className={`form-control ${errorMessage ? 'is-invalid' : ''}`}
                            />
                            {errorMessage && (
                                <div className="error-message">{errorMessage}</div>
                            )}
                            <button
                                className="btn btn-success"
                                style={{ backgroundColor: 'blue' }}
                                onClick={addProductToCart}
                            >
                                Add to Cart
                            </button>
                            <button
                                className="btn btn-success"
                                style={{ backgroundColor: 'blue' }}
                                onClick={donateProduct}
                            >
                                Donate
                            </button>
                        </>
                    ) : (
                        <span style={{ color: 'red' }}>Not Available</span>
                    )}
                </div>

                {addToCart && (
                    <div className="toast-container position-fixed bottom-0 end-0 p-3">
                        <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
                            <div className="toast-header">
                                <strong className="me-auto">Cart</strong>
                                <small>Now</small>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setAddToCart(false)}
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="toast-body">
                                The product has been successfully added to the cart!
                            </div>
                        </div>
                    </div>
                )}

                {showErrorToast && (
                    <div className="toast-container position-fixed bottom-0 end-0 p-3">
                        <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
                            <div className="toast-header">
                                <strong className="me-auto">Warning</strong>
                                <small>Now</small>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowErrorToast(false)}
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="toast-body">Enter a valid amount</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DetailsProduct;
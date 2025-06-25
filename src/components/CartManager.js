import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import CartButton from "./CartButton";

function CartManager() {
    const [cartItems, setCartItems] = useState([]);
    const [show, setShow] = useState(false);
    const [cartLoading, setCartLoading] = useState(false);
    const [cartId, setCartId] = useState(null);
    const [subscriptionStatus, setSubscriptionStatus] = useState(false);
    const [showErrorToast, setShowErrorToast] = useState(false);
    const token = useSelector((state) => state.auth.token);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // Fetch cart data and user info
    useEffect(() => {
        const fetchCartData = async () => {
            if (!token) return;
            
            try {
                setCartLoading(true);
                // Fetch user data to get subscription status
                const userResponse = await axios.get(
                    "http://localhost:8080/api/users/me",
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                if (userResponse.status === 200) {
                    setSubscriptionStatus(userResponse.data.subscriptionStatus);
                }

                // Fetch cart data
                const cartResponse = await axios.get(
                    'http://localhost:8080/api/cart/me',
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                const cart = cartResponse.data;
                if (cart && cart.cartId) {
                    setCartId(cart.cartId);
                    
                    // Fetch cart items
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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                const cartButton = document.querySelector('.cart-button');
                if (cartButton && !cartButton.contains(event.target)) {
                    setShow(false);
                }
            }
        };

        if (show) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [show]);

    // Add product to cart
    const addProduct = async (product, quantity) => {
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
            
            setShow(true);
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
    const donateProduct = async (product, quantity) => {
        if (!subscriptionStatus) navigate("../subscribe");
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

    // Toggle cart visibility
    const toggleDropdown = () => {
        setShow(prev => !prev);
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

    // Proceed to checkout
    const handleCheckout = () => {
        navigate("/checkout");
        setShow(false);
    };

    return (
        <div className="cart-manager">
            <CartButton 
                cartItems={cartItems} 
                toggleDropdown={toggleDropdown} 
                cartLoading={cartLoading}
            />
            
            {/* Cart Dropdown */}
            <div 
                ref={dropdownRef}
                className={`cart-dropdown ${show ? 'show' : 'hide'}`}
            >
                <div className="cart-header">
                    <h3>Your Cart</h3>
                    <button className="close-cart" onClick={() => setShow(false)}>
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
                                onClick={handleCheckout}
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                )}
            </div>

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
    );
}

export default CartManager;
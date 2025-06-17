import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./css/Product.css";
import "./css/Cart.css";
import { fetchGetAllProducts } from "./Redux/Slices/ProductSlice";
import CartButton from "./CartButton";
import axios from 'axios';

function Products() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.productSlice.productsArray);
  const [showErrorToast1, setShowErrorToast1] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [cartItems, setCartItems] = useState([]);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);
  const token = useSelector((state) => state.auth.token);
  const [cartId, setCartId] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(false);
  
  // Ref for dropdown to detect outside clicks
  const dropdownRef = useRef(null);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        await dispatch(fetchGetAllProducts());
        setLoading(false);
      } catch (err) {
        setError("Failed to load products");
        setLoading(false);
      }
    };
    fetchProducts();
  }, [dispatch]);

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
          setSubscriptionStatus(cart.user.subscriptionStatus);



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

  // Initialize quantities
  useEffect(() => {
    if (products.length > 0) {
      const initialQuantities = {};
      products.forEach(product => {
        initialQuantities[product.productId] = 1;
      });
      setQuantities(initialQuantities);
    }
  }, [products]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside dropdown and not on cart button
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
  const addProduct = async (product) => {
    const quantity = quantities[product.productId] || 1;
    
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
      setShowErrorToast1(true);
      setTimeout(() => setShowErrorToast1(false), 3000);
      
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

  // Donate product
  const donate = async (product) => {
    const quantity = quantities[product.productId] || 1;
    
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

  // View product details
  const details = (product) => {
    navigate(`/detailsproducts/${product.productId}`);
  };

  // Handle quantity change
  const handleQuantityChange = (productId, value) => {
    const numValue = Math.max(1, parseInt(value) || 1);
    setQuantities(prev => ({ ...prev, [productId]: numValue }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="products-loading">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="products-error">
        <p>⚠️ Error loading products</p>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  // Deduplicate products
  const uniqueProducts = Array.from(new Set(products.map(p => p.productId)))
    .map(id => products.find(p => p.productId === id));

  return (
    <div className="products-container">
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
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="products-header">
        <h1>Available Products</h1>
        <p>Quality products at discounted prices</p>
      </div>

      <div className="products-grid">
        {uniqueProducts.length > 0 ? (
          uniqueProducts.map((product) => (
            <div key={product.productId} className="product-card">
              <div className="product-image-container">
                {product.imagePath ? (
                  <img
                    src={product.imagePath}
                    alt={product.productName}
                    className="product-image"
                  />
                ) : (
                  <div className="product-image-placeholder">
                    <div className="placeholder-icon">📦</div>
                    <p>No Image Available</p>
                  </div>
                )}
                {!product.availabilityStatus && (
                  <div className="out-of-stock-badge">Out of Stock</div>
                )}
                <div className="product-category">
                  {product.categoryId?.categoriesName || "Uncategorized"}
                </div>
              </div>
              <div className="product-details">
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
                        product.availabilityStatus ? "in-stock" : "out-of-stock"
                      }`}
                    >
                      {product.availabilityStatus
                        ? `In Stock (${product.quantity})`
                        : "Out of Stock"}
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
                      value={quantities[product.productId] || 1}
                      onChange={(e) => 
                        handleQuantityChange(product.productId, e.target.value)
                      }
                      className="quantity-input"
                      disabled={!product.availabilityStatus}
                    />
                  </div>
                  <div className="action-buttons">
                    <button
                      className="add-to-cart-button"
                      onClick={() => addProduct(product)}
                      disabled={!product.availabilityStatus}
                    >
                      <span className="button-icon">🛒</span> Add to Cart
                    </button>
                    <div className="secondary-actions">
                      <button
                        className="details-button"
                        onClick={() => details(product)}
                      >
                        Details
                      </button>
                      <button
                        className="donate-button"
                        onClick={() => donate(product)}
                        disabled={!product.availabilityStatus}
                      >
                        Donate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-products-message">
            <div className="empty-state">
              <div className="empty-icon">😢</div>
              <h3>No Products Available</h3>
              <p>Check back later for new items</p>
            </div>
          </div>
        )}
      </div>

      {showErrorToast1 && (
        <div className="toast-container">
          <div className="toast">
            <div className="toast-icon">✅</div>
            <div className="toast-content">
              <div className="toast-header">
                <strong>Added to Cart</strong>
                <button
                  type="button"
                  className="toast-close"
                  onClick={() => setShowErrorToast1(false)}
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

export default Products;
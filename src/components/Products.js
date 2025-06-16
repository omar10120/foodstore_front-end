import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./css/Product.css";
import "./css/Cart.css";
import { fetchGetAllProducts } from "./Redux/Slices/ProductSlice";
import CartButton from "./CartButton";

function Products() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.productSlice.productsArray);
  const [showErrorToast1, setShowErrorToast1] = useState(false);
  const [quantities, setQuantities] = useState({}); // Quantity per product
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // Deduplicate products based on productId
  const uniqueProducts = Array.from(new Set(products.map(p => p.productId)))
    .map(id => products.find(p => p.productId === id));

  // Initialize quantities
  useEffect(() => {
    if (uniqueProducts.length > 0) {
      const initialQuantities = {};
      uniqueProducts.forEach(product => {
        initialQuantities[product.productId] = 1;
      });
      setQuantities(initialQuantities);
    }
  }, [uniqueProducts]);

  const addProduct = (product) => {
    const quantity = quantities[product.productId] || 1;
    
    if (!product || quantity < 1) {
      return;
    }

    // Check if product already exists in cart
    const existingItemIndex = cartItems.findIndex(item => item.id === product.productId);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity
      };
      setCartItems(updatedItems);
    } else {
      // Add new item
      const newItem = {
        id: product.productId,
        name: product.productName,
        price: product.productPrice,
        quantity: quantity,
        image: product.imagePath
      };
      setCartItems((prevItems) => [...prevItems, newItem]);
    }
    
    setShowErrorToast1(true);
    setTimeout(() => setShowErrorToast1(false), 3000);
  };

  const toggleDropdown = () => {
    setShow((prevShow) => !prevShow);
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(cartItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setCartItems(items);
  };

  const donate = (product) => {
    const quantity = quantities[product.productId] || 1;
    
    if (!product || quantity < 1) {
      return;
    }

    const newItem = {
      id: product.productId,
      name: product.productName,
      price: product.productPrice,
      quantity: quantity,
      image: product.imagePath
    };

    setCartItems((prevItems) => [...prevItems, newItem]);
    navigate("/charity");
  };

  const details = (product) => {
    navigate(`/detailsproducts/${product.productId}`);
  };

  const handleQuantityChange = (productId, value) => {
    const numValue = Math.max(1, parseInt(value) || 1);
    setQuantities(prev => ({
      ...prev,
      [productId]: numValue
    }));
  };

  if (loading) {
    return (
      <div className="products-loading">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-error">
        <p>⚠️ Error loading products</p>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="products-container">
      <CartButton cartItems={cartItems} toggleDropdown={toggleDropdown} />
      
      {show && (
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="cartItems">
            {(provided) => (
              <div
                className="cart-dropdown"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                <div className="cart-header">
                  <h3>Your Cart</h3>
                  <button className="close-cart" onClick={() => setShow(false)}>
                    &times;
                  </button>
                </div>
                
                {cartItems.length > 0 ? (
                  <div className="cart-items-container">
                    {cartItems.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={String(item.id)}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="cart-item"
                          >
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="cart-item-image" />
                            ) : (
                              <div className="cart-item-placeholder">No Image</div>
                            )}
                            <div className="cart-item-details">
                              <p className="cart-item-name">{item.name}</p>
                              <div className="cart-item-meta">
                                <p className="cart-item-price">${item.price.toFixed(2)}</p>
                                <div className="cart-item-controls">
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => {
                                      const updatedItems = [...cartItems];
                                      updatedItems[index].quantity = Math.max(
                                        1,
                                        parseInt(e.target.value)
                                      );
                                      setCartItems(updatedItems);
                                    }}
                                    className="cart-item-quantity"
                                  />
                                  <button
                                    className="cart-item-remove"
                                    onClick={() => {
                                      const updatedItems = cartItems.filter(
                                        (_, i) => i !== index
                                      );
                                      setCartItems(updatedItems);
                                    }}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                              <p className="cart-item-subtotal">
                                Subtotal: ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </div>
                ) : (
                  <p className="cart-empty-message">Your cart is empty</p>
                )}
                {provided.placeholder}
                {cartItems.length > 0 && (
                  <div className="cart-footer">
                    <div className="cart-total">
                      <p>
                        Total: $
                        {cartItems
                          .reduce(
                            (total, item) =>
                              total + item.price * item.quantity,
                            0
                          )
                          .toFixed(2)}
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
            )}
          </Droppable>
        </DragDropContext>
      )}

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
                        product.availabilityStatus
                          ? "in-stock"
                          : "out-of-stock"
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
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/Cart.css";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [donationItems, setDonationItems] = useState([]);
  const [charities, setCharities] = useState({});
  const [cartId, setCartId] = useState(null);
  const [isCartEmpty, setIsCartEmpty] = useState(false);
  const [error, setError] = useState(null);
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();
  
  // Fetch cart items and calculate total price
  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/cart/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const cart = response.data;
        if (cart && cart.cartId) {
          setCartId(cart.cartId);
          axios
            .get(`http://localhost:8080/api/cart-items/${cart.cartId}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            .then((itemsResponse) => {
              const items = itemsResponse.data;
              setCartItems(items);
              console.log(response);
              
              const calculatedTotalPrice = items.reduce(
                (acc, item) => acc + item.price * item.quantity,
                0
              );
              setTotalPrice(calculatedTotalPrice);
              setIsCartEmpty(false);
              console.log(items);
            })
            .catch((error) => {
              console.error("Error fetching cart items:", error);
              setError("Failed to fetch cart items.");
            });
        }
      })
      .catch((error) => {
        console.error("Error fetching cart for buyer:", error);
        setError("Failed to fetch cart.");
      });
  }, [token]);

  // Function to remove an item from the cart with API call
  const removeItemFromCart = (cartItemId, index) => {
    axios
      .delete(`http://localhost:8080/api/cart-items/${cartItemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        // Update state after successful removal
        const updatedCartItems = cartItems.filter((_, i) => i !== index);
        setCartItems(updatedCartItems);
        
        // Recalculate total price
        const newTotalPrice = updatedCartItems.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        );
        setTotalPrice(newTotalPrice);
        
        // Update cart empty status if needed
        if (updatedCartItems.length === 0) {
          setIsCartEmpty(true);
        }
      })
      .catch((error) => {
        console.error("Error removing item:", error);
        setError("Failed to remove item. Please try again.");
      });
  };

  // Function to clear the cart
  const clearCart = () => {
    if (cartId) {
      axios
        .delete(`http://localhost:8080/api/cart/${cartId}/clean`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(() => {
          setCartItems([]);
          setTotalPrice(0);
          setDonationItems([]);
          setCharities({});
          setIsCartEmpty(true);
          alert("Cart cleared successfully!");
        })
        .catch((error) => {
          console.error("Error clearing the cart:", error);
          setError("Failed to clear the cart.");
        });
    }
  };

  // Render UI based on cart status
  return (
    <div className="container-cart">
      {error && <div className="alert alert-danger">{error}</div>}
      {isCartEmpty ? (
        <div>No items in the cart.</div>
      ) : (
        <div className="row">
          {/* Items in Cart Section */}
          <div className="col-md-6">
            <h3 style={{ color: "#480fe4" }}>Items in Cart:</h3>
            <div className="card-cart1" style={{ marginTop: "50px" }}>
              <div className="row g-1">
                {cartItems.map((item, index) => (
                  <div
                    key={index}
                    className="col-12 mb-3"
                    style={{ marginTop: "10px" }}
                  >
                    <div className="card12" style={{ marginTop: "5px" }}>
                      <div className="card-body">
                        <h5 className="card-title">{item.productName}</h5>
                        <div
                          className="d-flex justify-content-between"
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          <p className="card-text" style={{ margin: 0 }}>
                            Name: {item.productId.productName}
                          </p>
                          <p className="card-text" style={{ margin: 0 }}>
                            Price: {item.price} SAR
                          </p>
                          <p className="card-text" style={{ margin: "10px" }}>
                            Amount: {item.quantity}
                          </p>
                          <i
                            className="bi bi-trash3-fill"
                            style={{
                              color: "red",
                              cursor: "pointer",
                              marginRight: "40px",
                            }}
                            onClick={() => removeItemFromCart(item.cartItemId, index)}
                          ></i>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bills Section */}
          <div className="col-md-6">
            <div
              className="card_price mb-3"
              style={{ marginTop: "10px", height: "300px" }}
            >
              <div className="card-body" style={{ marginTop: "-10px" }}>
                <h3 style={{ color: "#480fe4" }}>Bills:</h3>
                <p className="card-text">Price: {totalPrice} $</p>
                <h3 style={{ marginLeft: "10px" }}>----------</h3>
                <p style={{ marginLeft: "10px" }}>
                  Final Price: {totalPrice} $
                </p>
                <button className="btn-buy" onClick={()=> navigate("/Checkout")}>Buy</button>
                

                

                
                
                {/* Clear Cart Button */}
                <button
                  className="btn-clear"
                  onClick={clearCart}
                  style={{
                    marginTop: "10px",
                    backgroundColor: "#ff4d4d",
                    color: "white",
                  }}
                >
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Donation Section */}
            <div className="card12" style={{ marginTop: "30px" }}>
              <div className="card-body" style={{ marginTop: "10px" }}>
                <h3 style={{ color: "#480fe4" }}>Donation Details:</h3>
                {/* Donation Items */}
                {donationItems.map((item, index) => (
                  <div
                    key={index}
                    className="donation-card"
                    style={{
                      marginTop: "15px",
                      width: "570px",
                      padding: "-10px",
                    }}
                  >
                    <div className="card12" style={{ marginTop: "10px" }}>
                      <div className="card-body">
                        <h5 className="card-title">
                          Donation for{" "}
                          {charities[item.charityId] || "Unknown Charity"}
                        </h5>
                        <div
                          className="d-flex justify-content-between"
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          <p className="card-text" style={{ margin: "10px" }}>
                            Amount: {item.quantity}
                          </p>
                          <i
                            className="bi bi-trash3-fill"
                            style={{
                              color: "red",
                              cursor: "pointer",
                              marginRight: "40px",
                            }}
                          ></i>
                        </div>
                        <p className="card-text">Price: {item.price} SAR</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
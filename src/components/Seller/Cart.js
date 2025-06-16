import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios for API calls
import "../css/Cart.css";

function Cart() {
  const buyerId = 28; // Static buyer ID
  const [cartItems, setCartItems] = useState([]); // Cart items
  const [totalPrice, setTotalPrice] = useState(0); // Total price of the cart
  const [donationItems, setDonationItems] = useState([]); // Donation details
  const [charities, setCharities] = useState({}); // Charity details
  const [cartId, setCartId] = useState(null); // State to store cart ID
  const [isCartEmpty, setIsCartEmpty] = useState(false); // State to track if cart is empty
  const [error, setError] = useState(null); // State to handle errors

  // Fetch cart items and calculate total price
  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/cart/user/${buyerId}`) // Fetch cart by buyer ID
      .then((response) => {
        const cart = response.data;
        if (cart && cart.cartId) {
          setCartId(cart.cartId); // Store cart ID
          // Once cart is retrieved, fetch cart items
          axios
            .get(`http://localhost:8080/api/cart-items/${cart.cartId}`)
            .then((itemsResponse) => {
              const items = itemsResponse.data;
              setCartItems(items);

              // Calculate total price from the fetched items
              const calculatedTotalPrice = items.reduce(
                (acc, item) => acc + item.price * item.quantity,
                0
              );
              setTotalPrice(calculatedTotalPrice);
              setIsCartEmpty(false); // Set cart as not empty
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
  }, [buyerId]);

  // Fetch donation items and charity details
  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/cart/user/${buyerId}`) // Fetch cart by buyer ID
      .then((response) => {
        const cart = response.data;
        if (cart && cart.cartId) {
          // Fetch donation items
          axios
            .get(`http://localhost:8080/api/cart-items/donation/${cart.cartId}`)
            .then((itemsResponse) => {
              const items = itemsResponse.data;
              setDonationItems(items);

              // Fetch charity details for each donation item
              const charityIds = items.map((item) => item.charityId);
              const uniqueCharityIds = [...new Set(charityIds)]; // Remove duplicates

              // Fetch charity names for all unique charity IDs
              Promise.all(
                uniqueCharityIds.map((charityId) =>
                  axios.get(`http://localhost:8080/api/charities/${charityId}`)
                )
              )
                .then((charityResponses) => {
                  const charityData = {};
                  charityResponses.forEach((response) => {
                    const charity = response.data;
                    charityData[charity.charityId] = charity.charityName;
                  });
                  setCharities(charityData);
                })
                .catch((error) => {
                  console.error("Error fetching charity details:", error);
                  setError("Failed to fetch charity details.");
                });
            })
            .catch((error) => {
              console.error("Error fetching donation items:", error);
              setError("Failed to fetch donation items.");
            });
        }
      })
      .catch((error) => {
        console.error("Error fetching cart for buyer:", error);
        setError("Failed to fetch cart.");
      });
  }, [buyerId]);

  // Function to remove an item from the cart
  const removeItemFromCart = (index) => {
    const updatedCartItems = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedCartItems);

    // Recalculate total price after removal
    const newTotalPrice = updatedCartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setTotalPrice(newTotalPrice);
  };

  // Function to clear the cart
  const clearCart = () => {
    if (cartId) {
      axios
        .delete(`http://localhost:8080/api/cart/${cartId}/clean`)
        .then(() => {
          setCartItems([]); // Clear cart items from state
          setTotalPrice(0); // Reset total price
          setDonationItems([]); // Clear donation items
          setCharities({}); // Reset charities
          setIsCartEmpty(true); // Set cart as empty
          alert("Cart cleared successfully!"); // Optional: Notify user
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
      {error && <div className="alert alert-danger">{error}</div>}{" "}
      {/* Error message */}
      {isCartEmpty ? (
        <div>No items in the cart.</div> // Message when cart is empty
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
                            onClick={() => removeItemFromCart(index)} // Call remove function on click
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
                <button className="btn-buy">Buy</button>
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

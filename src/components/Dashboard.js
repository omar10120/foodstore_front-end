import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./css/Dashborad.css";
import { useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { FiBox, FiMail, FiUser, FiDollarSign, FiPackage, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { BiCategory } from "react-icons/bi";

function Dashboard() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [products, setProducts] = useState([]);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products data from API
  useEffect(() => {
    
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch('http://localhost:8080/api/products/seller', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        setProducts(data);
        if (data.length > 0) {
          setSellerInfo(data[0].sellerId);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const productsPage = () => {
    navigate("/ProductSellers");
  };

  const profileSeller = () => {
    navigate("/ProfileSeller");
  };

  const handleSendMessage = () => {
    if (navigator.onLine) {
      console.log("Sending message to:", recipient, "Message:", message);
    } else {
      const newMessage = { recipient, message, timestamp: new Date() };
      const storedMessages = JSON.parse(localStorage.getItem("unreadMessages")) || [];
      storedMessages.push(newMessage);
      localStorage.setItem("unreadMessages", JSON.stringify(storedMessages));
      console.log("Message saved locally due to no internet connection.");
    }
    setShowModal(false);
  };

  useEffect(() => {
    const handleOnline = () => {
      const storedMessages = JSON.parse(localStorage.getItem("unreadMessages")) || [];
      storedMessages.forEach((msg) => {
        console.log("Sending locally saved message:", msg);
      });
      localStorage.removeItem("unreadMessages");
    };

    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // Prepare data for the chart
  const chartData = products.map(product => ({
    name: product.productName.substring(0, 10) + (product.productName.length > 10 ? '...' : ''),
    price: product.productPrice,
    quantity: product.quantity,
  }));

  // Calculate stats
  const totalProducts = products.length;
  const availableProducts = products.filter(p => p.availabilityStatus).length;
  const outOfStockProducts = totalProducts - availableProducts;
  const totalRevenue = sellerInfo?.revenue || 0;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SYP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <main className="dashboard-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard-container">
        <div className="error-alert">
          <strong>Error loading data:</strong> {error}
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-container">
      <div className="dashboard-header">
        <h1>Seller Dashboard</h1>
        <div className="header-actions">
          {/* <button type="button" className="btn-export">
            <FiDollarSign />
            Export Report
          </button> */}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-revenue">
          <div className="stat-content">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value">{formatCurrency(totalRevenue)}</div>
          </div>
          <FiDollarSign className="stat-icon" />
        </div>

        <div className="stat-card stat-products">
          <div className="stat-content">
            <div className="stat-label">Total Products</div>
            <div className="stat-value">{totalProducts}</div>
          </div>
          <FiPackage className="stat-icon" />
        </div>

        <div className="stat-card stat-available">
          <div className="stat-content">
            <div className="stat-label">Available Products</div>
            <div className="stat-value">{availableProducts}</div>
          </div>
          <FiCheckCircle className="stat-icon" />
        </div>

        <div className="stat-card stat-outofstock">
          <div className="stat-content">
            <div className="stat-label">Out of Stock</div>
            <div className="stat-value">{outOfStockProducts}</div>
          </div>
          <FiXCircle className="stat-icon" />
        </div>
      </div>

      {/* Chart */}
      <div className="chart-container">
        <div className="chart-header">
          <h2>Product Prices & Quantities</h2>
        </div>
        <div className="chart-body">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Legend />
              <Bar yAxisId="left" dataKey="price" name="Price (SYP)" fill="#8884d8" />
              <Bar yAxisId="right" dataKey="quantity" name="Quantity" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="actions-container-dashboard">
        <div className="actions-header">
          <h2>Quick Actions</h2>
        </div>
        <div className="actions-grid">
          <div className="action-card" onClick={productsPage}>
            <div className="action-content">
              <FiBox className="action-icon" />
              <h3>Manage Products</h3>
              <p>View and edit your product listings</p>
            </div>
          </div>
          
          <div className="action-card" onClick={() => setShowModal(true)}>
            <div className="action-content">
              <FiMail className="action-icon" />
              <h3>Messages</h3>
              <p>Contact customers and support</p>
            </div>
          </div>
          
          <div className="action-card" onClick={profileSeller}>
            <div className="action-content">
              <FiUser className="action-icon" />
              <h3>Profile</h3>
              <p>Manage your seller profile</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="products-container">
        <div className="products-header">
          <h2>Your Products</h2>
        </div>
        <div className="table-container-dashboard" >
          <table className="products-table-dashboard">
            <thead>
              <tr >
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Expiry Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.productId}>
                  <td>
                    <div className="product-info">
                      <div 
                        className="product-image"
                        style={{ 
                          backgroundImage: `url(${product.imagePath})`,
                        }}
                      />
                      <div className="product-details">
                        <div className="product-name">{product.productName}</div>
                        <div className="product-description">{product.productDescription.substring(0, 50)}...</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="category-badge">
                      <BiCategory /> 
                      {product.categoryId.categoriesName}
                    </span>
                  </td>
                  <td className="product-price">{formatCurrency(product.productPrice)}</td>
                  <td>{product.quantity}</td>
                  <td>{formatDate(product.expiryDate)}</td>
                  <td>
                    {product.availabilityStatus ? (
                      <span className="status-badge available">Available</span>
                    ) : (
                      <span className="status-badge outofstock">Out of Stock</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>New Message</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <form>
                <div className="form-group">
                  <label htmlFor="recipient-name">Recipient:</label>
                  <input
                    type="text"
                    id="recipient-name"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message-text">Message:</label>
                  <textarea
                    id="message-text"
                    rows="4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-send"
                onClick={handleSendMessage}
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Dashboard;
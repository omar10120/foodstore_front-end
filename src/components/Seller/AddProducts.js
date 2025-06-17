import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "../css/Edit.css";
import axios from 'axios';

function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState("");
  const token = useSelector((state) => state.auth.token);
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState([]);

  // Initialize form data with default values
  const [formData, setFormData] = useState({
    productName: "",
    productDescription: "",
    categoryIdInput: "",
    quantity: "",
    expiryDate: "",
    productPrice: "",
    availabilityStatus: true,
    image: null
  });

  // Create Axios instance with base configuration
  const axiosInstance = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/api/categories");
        
        setCategories(response.data);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          navigate("/login");
        } else {
          setError(err.response?.data?.message || "Failed to load categories");
          console.error("Fetch categories error:", err);
        }
      } finally {
        setCategoriesLoading(false);
      }
    };

    if (token) {
      fetchCategories();
    } else {
      setError("Authentication token not found");
      setCategoriesLoading(false);
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    // Handle file input separately
    if (type === "file") {
      setFormData({
        ...formData,
        [name]: files[0] // Only take the first file
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    if (!token) {
      setError("Authentication token not found");
      setLoading(false);
      return;
    }
    
    // Validate category selection
    if (!formData.categoryIdInput) {
      setError("Please select a category");
      setLoading(false);
      return;
    }
    
    // Prepare form data for submission
    const formDataToSend = new FormData();
    formDataToSend.append("productName", formData.productName);
    formDataToSend.append("productDescription", formData.productDescription);
    formDataToSend.append("categoryIdInput", formData.categoryIdInput);
    formDataToSend.append("quantity", formData.quantity);
    formDataToSend.append("expiryDate", formData.expiryDate);
    formDataToSend.append("productPrice", formData.productPrice);
    formDataToSend.append("availabilityStatus", formData.availabilityStatus);
    
    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }

    try {
      const response = await axiosInstance.post(
        "/api/products/seller",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      console.log("Product added:", response.data);
      setShowModal(true);
    } catch (error) {
      let errorMessage = "Failed to add product";
      
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error("Server responded with error:", error.response);
        
        if (error.response.status === 401) {
          navigate("/login");
          return;
        }
        
        if (error.response.data && typeof error.response.data === 'object') {
          errorMessage = error.response.data.message || JSON.stringify(error.response.data);
        } else if (error.response.data) {
          errorMessage = error.response.data;
        } else {
          errorMessage = `Server error: ${error.response.status} ${error.response.statusText}`;
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        errorMessage = "No response from server";
      } else {
        // Something happened in setting up the request
        console.error("Request setup error:", error.message);
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="EditProduct_container mt-5">
      <div
        className="card_add"
        style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}
      >
        {error && (
          <div className="alert alert-danger mb-4" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <h5 className="mb-4">Add New Product</h5>
          
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="productName" className="form-label">
                Product Name *
              </label>
              <input
                type="text"
                className="form-control"
                id="productName"
                name="productName"
                required
                value={formData.productName}
                onChange={handleChange}
              />
            </div>
            
            <div className="col-md-6">
              <label htmlFor="productDescription" className="form-label">
                Product Description *
              </label>
              <textarea
                className="form-control"
                id="productDescription"
                name="productDescription"
                required
                rows="3"
                value={formData.productDescription}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>
          
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="categoryIdInput" className="form-label">
                Category *
              </label>
              {categoriesLoading ? (
                <div className="d-flex align-items-center">
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <span>Loading categories...</span>
                </div>
              ) : (
                <select
                  className="form-select"
                  id="categoryIdInput"
                  name="categoryIdInput"
                  required
                  value={formData.categoryIdInput}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.categoriesId} value={category.categoriesId}>
                      {category.categoriesName}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            <div className="col-md-4">
              <label htmlFor="quantity" className="form-label">
                Quantity *
              </label>
              <input
                type="number"
                className="form-control"
                id="quantity"
                name="quantity"
                required
                min="0"
                value={formData.quantity}
                onChange={handleChange}
              />
            </div>
            
            <div className="col-md-4">
              <label htmlFor="expiryDate" className="form-label">
                Expiration Date *
              </label>
              <input
                type="date"
                className="form-control"
                id="expiryDate"
                name="expiryDate"
                required
                value={formData.expiryDate}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label htmlFor="productPrice" className="form-label">
                Price (₫) *
              </label>
              <input
                type="number"
                className="form-control"
                id="productPrice"
                name="productPrice"
                required
                // min="0"
                // step="1000"
                value={formData.productPrice}
                onChange={handleChange}
              />
            </div>
            
            <div className="col-md-6 d-flex align-items-end">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="availabilityStatus"
                  name="availabilityStatus"
                  checked={formData.availabilityStatus}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="availabilityStatus">
                  Product Available
                </label>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="image" className="form-label">
              Product Image
            </label>
            
            <input
              type="file"
              className="form-control"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleChange}
            />
            <div className="form-text">
              Upload product image (optional)
            </div>
          </div>
          
          <div className="d-flex justify-content-between mt-4">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("../ProductSellers")}
              disabled={loading || categoriesLoading}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "150px" }}
              disabled={loading || categoriesLoading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Adding...
                </>
              ) : (
                "Add Product"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => {
          setShowModal(false);
          navigate("../ProductSellers")
          
          
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="modal-title">Success</h5>
              <button
                type="button"
                className="close-button"
                onClick={() => {
                  setShowModal(false);
                  navigate("../ProductSellers")
                }}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>Your product has been added successfully!</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setShowModal(false);
                  navigate("../ProductSellers")
                }}
              >
                Back to Products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddProduct;
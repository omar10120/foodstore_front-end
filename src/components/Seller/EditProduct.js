import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/Edit.css";
import { useSelector } from "react-redux";
function EditProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [existingImage, setExistingImage] = useState("");
  const token = useSelector((state) => state.auth.token);
  const [formData, setFormData] = useState({
    productName: "",
    productDescription: "",
    categoryIdInput: "",
    quantity: "",
    expiryDate: "",
    productPrice: "",
    availabilityStatus: false,
    image: null
  });

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        const response = await fetch(
          `http://localhost:8080/api/products/seller/product/${productId}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }
        );
        
        if (!response.ok) {
          if (response.status === 401) {
            navigate("/login");
          }
          throw new Error("Failed to fetch product");
        }
        
        const product = await response.json();
        
        // Map API response to form fields based on actual response structure
        setExistingImage(
          product.imagePath 
            ? `http://localhost:8080${product.imagePath}`
            : ""
        );
        
        setFormData({
          productName: product.productName || "",
          productDescription: product.productDescription || "",
          categoryIdInput: product.categoryId?.categoriesId || "",
          quantity: product.quantity || "",
          expiryDate: product.expiryDate?.split("T")[0] || "",
          productPrice: product.productPrice || "",
          availabilityStatus: product.availabilityStatus || false,
          image: null
        });
      } catch (err) {
        setError(err.message || "Failed to load product data");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    
    
    if (!token) {
      setError("Authentication token not found");
      return;
    }
    
    const formDataToSend = new FormData();
    formDataToSend.append("productId", productId);
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
      const response = await fetch(
        "http://localhost:8080/api/products/edit",
        {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/login");
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "Update failed");
      }

      setShowModal(true);
    } catch (error) {
      console.error("Update error:", error);
      setError(error.message || "Failed to update product");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

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
          <h5 className="mb-4">Edit Product</h5>
          
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
              <select
                className="form-select"
                id="categoryIdInput"
                name="categoryIdInput"
                required
                value={formData.categoryIdInput}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                <option value="1">Fruits & Vegetables</option>
                <option value="2">Legumes</option>
                <option value="3">Bakery</option>
                <option value="4">Meat & Seafood</option>
                <option value="5">Dairy & Eggs</option>
                <option value="6">Beverages</option>
              </select>
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
                min="0"
                step="1000"
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
            
            {existingImage && (
              <div className="mb-2">
                <p className="mb-1">Current Image:</p>
                <img 
                  src={existingImage} 
                  alt="Current product" 
                  className="img-thumbnail"
                  style={{ maxHeight: "150px" }} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.parentNode.style.display = "none";
                  }}
                />
              </div>
            )}
            
            <input
              type="file"
              className="form-control"
              id="image"
              name="image"
              accept="image/*"
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.files[0] })
              }
            />
            <div className="form-text">
              Upload new image to replace existing one (optional)
            </div>
          </div>
          
          <div className="d-flex justify-content-between mt-4">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "150px" }}
            >
              Update Product
            </button>
          </div>
        </form>
      </div>

     {/* Success Modal */}
     {showModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">Success</h5>
        <button
          type="button"
          className="close-button"
          onClick={() => {
            setShowModal(false);
            navigate("/seller/dashboard/products");
          }}
        >
          &times;
        </button>
      </div>
      <div className="modal-body">
        <p>Your product has been updated successfully!</p>
      </div>
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setShowModal(false);
            navigate("/seller/dashboard/products");
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

export default EditProduct;
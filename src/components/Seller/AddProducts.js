import React, { useState } from "react";
import "../css/AddProduct.css";
import axios from "axios";

function AddProducts() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    quantity: "",
    expiration_date: "",
    after_discount: "",
    before_discount: "",
    availability: false,
    image: null,
  });

  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm(formData);

    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await axios.post("http://localhost:8080/api/cart-items/add", {
          productId: formData.category_id,
          quantity: formData.quantity
        });
        setApiResponse(response.data);
        setShowModal(true);
        resetForm();
      } catch (error) {
        console.error("Error submitting form:", error);
        setErrors({ submit: "Failed to add product to cart" });
      }
    } else {
      setErrors(newErrors);
    }
  };

  const validateForm = (data) => {
    const newErrors = {};
    if (!data.title) newErrors.title = "Title is required.";
    if (!data.description) newErrors.description = "Description is required.";
    if (!data.category_id) newErrors.category_id = "Category ID is required.";
    if (!data.quantity) newErrors.quantity = "Quantity is required.";
    if (!data.expiration_date) newErrors.expiration_date = "Expiration date is required.";
    if (!data.after_discount) newErrors.after_discount = "After discount price is required.";
    if (!data.before_discount) newErrors.before_discount = "Before discount price is required.";
    if (!data.image) newErrors.image = "Image upload is required.";
    return newErrors;
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category_id: "",
      quantity: "",
      expiration_date: "",
      after_discount: "",
      before_discount: "",
      availability: false,
      image: null,
    });
    setErrors({});
  };

  return (
    <div className="Add container mt-5" style={{  marginTop: "10px" }}>
      <div className="card_add" style={{  marginTop: "1.5rem" }}>
        <form onSubmit={handleSubmit} >
          <h5>Add New Product</h5>

          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="title" className="form-label">Name Product</label>
              <input
                type="text"
                className={`form-control ${errors.title ? "is-invalid" : ""}`}
                id="title"
                name="title"
                placeholder="Name Product"
                value={formData.title}
                onChange={handleChange}
                required
              />
              {errors.title && <div className="invalid-feedback">{errors.title}</div>}
            </div>
            <div className="col-md-6">
              <label htmlFor="description" className="form-label">Details about Product</label>
              <input
                type="text"
                className={`form-control ${errors.description ? "is-invalid" : ""}`}
                id="description"
                name="description"
                placeholder="Details about Product"
                value={formData.description}
                onChange={handleChange}
                required
              />
              {errors.description && <div className="invalid-feedback">{errors.description}</div>}
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="category_id" className="form-label">Category</label>
              <input
                type="number"
                className={`form-control ${errors.category_id ? "is-invalid" : ""}`}
                id="category_id"
                name="category_id"
                placeholder="Category"
                value={formData.category_id}
                onChange={handleChange}
                required
              />
              {errors.category_id && <div className="invalid-feedback">{errors.category_id}</div>}
            </div>
            <div className="col-md-4">
              <label htmlFor="quantity" className="form-label">Amount</label>
              <input
                type="number"
                className={`form-control ${errors.quantity ? "is-invalid" : ""}`}
                id="quantity"
                name="quantity"
                placeholder="Amount"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
              {errors.quantity && <div className="invalid-feedback">{errors.quantity}</div>}
            </div>
            <div className="col-md-4">
              <label htmlFor="expiration_date" className="form-label">Expiration Date</label>
              <input
                type="date"
                className={`form-control ${errors.expiration_date ? "is-invalid" : ""}`}
                id="expiration_date"
                name="expiration_date"
                value={formData.expiration_date}
                onChange={handleChange}
                required
              />
              {errors.expiration_date && <div className="invalid-feedback">{errors.expiration_date}</div>}
            </div>
          </div>
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <label htmlFor="after_discount" className="form-label">After Discount:</label>
              <input
                type="number"
                className={`form-control ${errors.after_discount ? "is-invalid" : ""}`}
                id="after_discount"
                name="after_discount"
                placeholder="After Discount:"
                value={formData.after_discount}
                onChange={handleChange}
                required
              />
              {errors.after_discount && <div className="invalid-feedback">{errors.after_discount}</div>}
            </div>
            <div className="col-md-4">
              <label htmlFor="before_discount" className="form-label">Before Discount:</label>
              <input
                type="number"
                className={`form-control ${errors.before_discount ? "is-invalid" : ""}`}
                id="before_discount"
                name="before_discount"
                placeholder="Before Discount:"
                value={formData.before_discount}
                onChange={handleChange}
                required
              />
              {errors.before_discount && <div className="invalid-feedback">{errors.before_discount}</div>}
            </div>
            <div className="col-md-4">
              <label htmlFor="availability" className="form-label">Availability:</label>
              <input
                type="checkbox"
                className="form-check-input"
                id="availability"
                name="availability"
                checked={formData.availability}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="availability">Available</label>
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="image" className="form-label">Upload Image</label>
            <input
              type="file"
              className={`form-control ${errors.image ? "is-invalid" : ""}`}
              id="image"
              name="image"
              onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
              required
            />
            {errors.image && <div className="invalid-feedback">{errors.image}</div>}
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "200px", backgroundColor: "gray", marginLeft: "350px" }}
          >
            Add
          </button>
        </form>
      </div>
      <div
        className={`modal fade ${showModal ? "show" : ""}`}
        id="staticBackdrop"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        style={{ display: showModal ? "block" : "none" }}
        tabIndex="-1"
        aria-labelledby="staticBackdropLabel"
        aria-hidden={!showModal}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel" style={{ marginLeft: "100px" }}>
                Success
              </h1>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {apiResponse ? (
                <>
                  <p>Product added to cart successfully!</p>
                  <p>Quantity: {apiResponse.quantity}</p>
                  <p>Price: {apiResponse.price}</p>
                </>
              ) : (
                <p>Your product has been added successfully!</p>
              )}
            </div>
            <div className="modal-footer" style={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowModal(false)}
                style={{ width: "100px", height: "37px" }}
              >
                Save
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
                style={{ width: "100px" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddProducts;
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/Edit.css";
function EditProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();

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

  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedData = {};
    for (const key in formData) {
      if (formData[key] !== "") {
        updatedData[key] = formData[key];
      }
    }

    try {
      const response = await fetch(
        `https://api.example.com/products/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      setShowModal(true);
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  return (
    <div className="EditProduct_container mt-5">
      <div
        className="card_add"
        style={{ height: "500px", width: "1000px", marginLeft: "100px" }}
      >
        <form onSubmit={handleSubmit}>
          <h5>Edit Product</h5>
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="title" className="form-label">
                Name Product
              </label>
              <input
                type="text"
                className="form-control"
                id="title"
                name="title"
                placeholder="Name Product"
                value={formData.title}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="description" className="form-label">
                Details about Product
              </label>
              <input
                type="text"
                className="form-control"
                id="description"
                name="description"
                placeholder="Details about Product"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="category_id" className="form-label">
                Category
              </label>
              <input
                type="number"
                className="form-control"
                id="category_id"
                name="category_id"
                placeholder="Category"
                value={formData.category_id}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="quantity" className="form-label">
                Amount
              </label>
              <input
                type="number"
                className="form-control"
                id="quantity"
                name="quantity"
                placeholder="Amount"
                value={formData.quantity}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="expiration_date" className="form-label">
                Expiration Date
              </label>
              <input
                type="date"
                className="form-control"
                id="expiration_date"
                name="expiration_date"
                value={formData.expiration_date}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <label htmlFor="after_discount" className="form-label">
                After Discount:
              </label>
              <input
                type="number"
                className="form-control"
                id="after_discount"
                name="after_discount"
                placeholder="After Discount:"
                value={formData.after_discount}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="before_discount" className="form-label">
                Before Discount:
              </label>
              <input
                type="number"
                className="form-control"
                id="before_discount"
                name="before_discount"
                placeholder="Before Discount:"
                value={formData.before_discount}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="availability" className="form-label">
                Availability:
              </label>
              <input
                type="checkbox"
                className="form-check-input"
                id="availability"
                name="availability"
                checked={formData.availability}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="availability">
                Available
              </label>
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="image" className="form-label">
              Upload Image
            </label>
            <input
              type="file"
              className="form-control"
              id="image"
              name="image"
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.files[0] })
              }
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: "200px",
              backgroundColor: "gray",
              marginLeft: "400px",
            }}
          >
            Edit
          </button>
        </form>
      </div>

      {/* Modal */}
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
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
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
              Your product has been updated successfully!
            </div>
            <div
              className="modal-footer"
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowModal(false)}
                style={{ width: "100px" }}
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

export default EditProduct;

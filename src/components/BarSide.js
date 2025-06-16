import React, { useEffect, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../App.css";
import { Link } from "react-router-dom";
import { Modal } from "react-bootstrap";
import Complaints from "./Complaints";

function BarSide() {
  const [showComplaints, setShowComplaints] = useState(false);
  const toggleComplaints = () => setShowComplaints((prev) => !prev);
  const [showModal, setShowModal] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    console.log("Sending message to:", recipient, "Message:", message);
    setShowModal(false);
  };

  useEffect(() => {
    if (window.bootstrap) {
      const tooltipTriggerList = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="tooltip"]')
      );
      tooltipTriggerList.forEach(
        (tooltipTriggerEl) => new window.bootstrap.Tooltip(tooltipTriggerEl)
      );
    } else {
      console.error("Bootstrap is not loaded");
    }
  }, []);

  return (
    <div
      className="d-flex flex-column flex-shrink-0 bg-body-tertiary"
      style={{ width: "4.5rem", marginTop: "-1350px" }}
    >
      <div className="dropdown border-top">
        <Modal show={showComplaints} onHide={toggleComplaints}>
          <Modal.Header closeButton>
            <Modal.Title>Complaints</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Complaints />
          </Modal.Body>
        </Modal>
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          aria-labelledby="modalLabel"
        >
          <Modal.Header closeButton>
            <Modal.Title id="modalLabel">New message</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <div className="mb-3">
                <label htmlFor="recipient-name" className="col-form-label">
                  Recipient:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="recipient-name"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="message-text" className="col-form-label">
                  Message:
                </label>
                <textarea
                  className="form-control"
                  id="message-text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer
            style={{ display: "flex", justifyContent: "center", gap: "5px" }}
          >
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSendMessage}
              style={{ width: "100px", height: "40px" }}
            >
              Send message
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowModal(false)}
              style={{ width: "100px", height: "40px" }}
            >
              Close
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default BarSide;

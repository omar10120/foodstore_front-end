import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./css/Dashborad.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import Modal from "react-bootstrap/Modal";
import { color } from "framer-motion";

function Dashboard() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const products = () => {
    navigate("/ProductSellers");
  };
  const profileSller = () => {
    navigate("/ProfileSeller");
  };
  const handleSendMessage = () => {
    if (navigator.onLine) {
      console.log("Sending message to:", recipient, "Message:", message);
    } else {
      const newMessage = { recipient, message, timestamp: new Date() };
      const storedMessages =
        JSON.parse(localStorage.getItem("unreadMessages")) || [];
      storedMessages.push(newMessage);
      localStorage.setItem("unreadMessages", JSON.stringify(storedMessages));
      console.log("Message saved locally due to no internet connection.");
    }
    setShowModal(false);
  };

  useEffect(() => {
    const handleOnline = () => {
      const storedMessages =
        JSON.parse(localStorage.getItem("unreadMessages")) || [];
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

  const data = [
    { date: "2023-12-01", price: -1.05 },
    { date: "2023-12-02", price: -1.07 },
    { date: "2023-12-03", price: -2.0 },
    { date: "2023-12-04", price: 1.08 },
    { date: "2023-12-05", price: -2.0 },
    { date: "2023-12-06", price: 1.1 },
  ];

  return (
    <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1
          className="h2"
          style={{ marginLeft: "-300px", marginTop: "20px", color: "blue" }}
        >
          Dashboard
        </h1>
        <div
          className="btn-toolbar mb-2 mb-md-0"
          style={{ fontSize: "0.1rem", padding: "0.5rem 0.5rem" }}
        >
          <div className="btn-group me-2">
            <button type="button" className="btn btn-sm btn-outline-secondary">
              Share
            </button>
            <button type="button" className="btn btn-sm btn-outline-secondary">
              Export
            </button>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary dropdown-toggle d-flex align-items-center gap-1"
            style={{ height: "30px", width: "195px" }}
          >
            <svg className="bi">
              <use xlinkHref="#calendar3"></use>
            </svg>
            This week
          </button>
        </div>
      </div>
      <div className="seller_BreAkar"></div>
      {/* 
      <div className="line-chart-container">
        <LineChart width={1000} height={300} data={data} className="line-chart">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="price" stroke="#8884d8" />
        </LineChart>
      </div> */}

      <div className="conatiner_da">
        <div className="row">
          <div className="col-12 col-sm-6 col-md-4 mb-4">
            <div
              className="card_por1"
              style={{ position: "relative" }}
              onClick={products}
            >
              <i
                className="bi bi-basket"
                style={{
                  fontSize: "130px",
                  position: "absolute",
                  left: "30px",
                  top: "-30px",
                  color: "blue",
                }}
              ></i>
            </div>
            <div
              className="card_cont"
              style={{ position: "relative" }}
              onClick={() => setShowModal(true)}
            >
              <i
                className="bi bi-envelope-at"
                style={{
                  fontSize: "130px",
                  position: "absolute",
                  left: "30px",
                  top: "-30px",
                  color: "blue",
                }}
              ></i>
            </div>
            <div
              className="card_file"
              style={{ position: "relative" }}
              onClick={profileSller}
            >
              <i
                className="bi bi-person"
                style={{
                  fontSize: "130px",
                  position: "absolute",
                  left: "40px",
                  top: "-30px",
                  color: "blue",
                }}
              ></i>
            </div>
          </div>
        </div>
      </div>

      <h2 style={{ marginLeft: "-510px", color: "blue" }}>Bills</h2>
      <div className="table-responsive" style={{ marginLeft: "-370px" }}>
        <table className="table table-striped table-sm">
          <thead>
            <tr>
              <th scope="col" style={{ color: "blue" }}>
                ID
              </th>
              <th scope="col" style={{ color: "blue" }}>
                UserID
              </th>
              <th scope="col" style={{ color: "blue" }}>
                ProductID
              </th>
              <th scope="col" style={{ color: "blue" }}>
                Amount
              </th>
              <th scope="col" style={{ color: "blue" }}>
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 15 }, (_, index) => (
              <tr key={index + 1001}>
                <td>{index + 1001}</td>
                <td>random</td>
                <td>data</td>
                <td>placeholder</td>
                <td>text</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSendMessage}
          >
            Send message
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowModal(false)}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </main>
  );
}

export default Dashboard;

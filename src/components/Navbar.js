// src/components/NavBar.js
import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
// import { logout } from "../Redux/Slices/AuthSlice";
import "./css/NavBar.css";
import {logout}from "./Redux/Slices/AuthSlice";

function NavBar() {
  const [showModal, setShowModal] = useState(false);
  const [showModalDiscounts, setShowModalDiscounts] = useState(false);
  const [message, setMessage] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get auth state
  const { token, roleName } = useSelector((state) => state.auth);
  const userName = useSelector((state) => state.auth.userName || "User");
  
  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    setShowUserMenu(false);
  };

  const handleSendMessage = () => {
    setShowModal(false);
  };

  const handleSendDiscounts = () => {
    setShowModalDiscounts(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showUserMenu && !e.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            Naema نعمة
          </Link>
          
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {[
              { to: "/", title: "Home" },
              { to: "/Discounts", title: "Discounts" },
              { to: "/charity", title: "Charities" },
              { to: "/advices", title: "advices" },
              { to: "/cart", title: "Cart" },
              {
                to: "#",
                title: "Contact Us",
                onClick: () => setShowModal(true),
              },
              { to: "/about", title: "About" },
            ].map((item, index) => (
              <li
                className="nav-item"
                style={{ marginLeft: "50px", marginTop: "-16px" }}
                key={index}
              >
                <Link
                  className="nav-link py-3 border-bottom rounded-0"
                  aria-label={item.title}
                  title={item.title}
                  to={item.to}
                  onClick={item.onClick}
                >
                  {item.title}
                </Link>
              </li>
            ))}
            
            {/* User Profile Section */}
            {token ? (
              <li className="nav-item user-menu-container" style={{ marginLeft: "50px", marginTop: "-16px" }}>
                <div 
                  className="user-avatar-container"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="user-avatar">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="user-name">{userName}</span>
                  <i className={`dropdown-icon ${showUserMenu ? 'active' : ''}`}></i>
                </div>
                
                {showUserMenu && (
                  <div className="user-menu">
                    <Link 
                      to="/profile" 
                      className="menu-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <i className="profile-icon"></i> My Profile
                    </Link>
                    <div className="divider"></div>
                    <button 
                      className="menu-item logout-btn"
                      onClick={handleLogout}
                    >
                      <i className="logout-icon"></i> Logout
                    </button>
                  </div>
                )}
              </li>
            ) : (
              <li 
                className="nav-item" 
                style={{ marginLeft: "50px", marginTop: "-16px" }}
              >
                <Link
                  className="nav-link py-3 border-bottom rounded-0"
                  to="/login"
                >
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </nav>

      {/* Contact Us Modal */}
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
          style={{ display: "flex", justifyContent: "center", gap: "10px" }}
        >
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSendMessage}
            style={{ width: "100px", height: "50px" }}
          >
            Send
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowModal(false)}
            style={{ width: "100px", height: "50px" }}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>

      {/* Discounts Modal */}
      <Modal
        show={showModalDiscounts}
        onHide={() => setShowModalDiscounts(false)}
        aria-labelledby="modalLabel"
        dialogClassName="custom-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title id="modalLabel">Discounts</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          <form>
            <div className="container-discounts">
              <h3>Choose Your Discount</h3>
              <div
                className="card-discounts"
                style={{
                  width: "100%",
                  height: "300px",
                  backgroundColor: "blue",
                  marginLeft: "0",
                  marginTop: "30px",
                }}
              >
                <div className="mb-3">
                  <h1 className="discount1">Discount No:1</h1>
                  <h1>--------------------</h1>
                  <img
                    style={{
                      width: "150px",
                      height: "50px",
                      marginLeft: "20px",
                      marginTop: "10px",
                    }}
                    src={`${process.env.PUBLIC_URL}/images/th.jfif`}
                    alt="Discount Product"
                  />
                </div>
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer
          style={{ display: "flex", justifyContent: "center", gap: "10px" }}
        >
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSendDiscounts}
            style={{ width: "100px", height: "50px" }}
          >
            Apply Discount
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowModalDiscounts(false)}
            style={{ width: "100px", height: "50px" }}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default NavBar;
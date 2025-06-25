import React from 'react';
import './css/CartButton.css';

const CartButton = ({ cartItems = [], toggleDropdown }) => {
  const itemCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);

  return (
    <button className="cb-button" onClick={(e) => {
      e.stopPropagation();
      toggleDropdown();
    }}>
      <i className="cb-icon bi bi-basket-fill"></i>
      {itemCount > 0 && <span className="cb-badge" >{itemCount}</span>}
    </button>
  );
};

export default CartButton;
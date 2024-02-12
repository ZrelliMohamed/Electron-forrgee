import React, { useState } from 'react'
import { Link, Outlet } from "react-router-dom"
import './FactureAchatUI.css'
function FactureAchatUI() {
  const [activeMenuItem, setActiveMenuItem] = useState(null);
  const handleMenuItemClick = (itemName) => {
    setActiveMenuItem(itemName);
  };
  return (
  <div className="container">
      <div className="menu">
        <Link to="ListAchat" className={activeMenuItem === 'ListAchat' ? 'active' : ''} onClick={() => handleMenuItemClick('ListAchat')}>List </Link>
        <Link to="AddAchat" className={activeMenuItem === 'AddAchat' ? 'active' : ''} onClick={() => handleMenuItemClick('AddAchat')}>Add one</Link>
      </div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

export default FactureAchatUI

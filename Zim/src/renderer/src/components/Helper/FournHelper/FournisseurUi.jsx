import React, { useState } from 'react'
import { Link, Outlet } from "react-router-dom"
import './FournisseurUi.css'
function FournisseurUi() {
  const [activeMenuItem, setActiveMenuItem] = useState(null);
  const handleMenuItemClick = (itemName) => {
    setActiveMenuItem(itemName);
  };
  return (
    <div className="container">
      <div className="menu">
        <Link to="List" className={activeMenuItem === 'List' ? 'active' : ''} onClick={() => handleMenuItemClick('List')}>List </Link>
        <Link to="AddFourn" className={activeMenuItem === 'AddFourn' ? 'active' : ''} onClick={() => handleMenuItemClick('AddFourn')}>Add one</Link>
      </div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  )
}

export default FournisseurUi

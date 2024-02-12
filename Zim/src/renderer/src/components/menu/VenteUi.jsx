import React, { useState , useEffect } from 'react'
import { Link, Outlet } from 'react-router-dom'
import './VenteUi.css'
function VenteUi() {
  const [activeMenuItem, setActiveMenuItem] = useState(null);
  const handleMenuItemClick = (itemName) => {
    setActiveMenuItem(itemName);
  };
  return (
    <div className="container">
      <div className="menu">
        <Link to="Clients" className={activeMenuItem === 'Clients' ? 'active' : ''} onClick={() => handleMenuItemClick('Clients')}>Clients</Link>
        <Link to="Articles" className={activeMenuItem === 'Articles' ? 'active' : ''} onClick={() => handleMenuItemClick('Articles')}>Articles</Link>
        <Link to="Facture" className={activeMenuItem === 'Facture' ? 'active' : ''} onClick={() => handleMenuItemClick('Facture')}>Facture</Link>
      </div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

export default VenteUi

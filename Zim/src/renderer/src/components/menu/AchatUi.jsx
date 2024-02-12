import React, { useState } from 'react'
import { Link, Outlet } from "react-router-dom"
import './AchatUI.css'
function AchatUi() {
  const [activeMenuItem, setActiveMenuItem] = useState(null);
  const handleMenuItemClick = (itemName) => {
    setActiveMenuItem(itemName);
  };
  return (
    <div className="container">
      <div className="menu">
        <Link to="FournisseurUI" className={activeMenuItem === 'FournisseurUI' ? 'active' : ''} onClick={() => handleMenuItemClick('FournisseurUI')}>Fournisseur</Link>
        <Link to="FacAchat" className={activeMenuItem === 'FacAchat' ? 'active' : ''} onClick={() => handleMenuItemClick('FacAchat')}>Facture Achat</Link>
      </div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

export default AchatUi

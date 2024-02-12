import { Link,Outlet } from "react-router-dom"
import './FactureUi.css'
import { useState } from "react";
function FactureUi() {
  const [activeMenuItem, setActiveMenuItem] = useState(null);
  const handleMenuItemClick = (itemName) => {
    setActiveMenuItem(itemName);
  };
  return (
    <div className="container">
      <div className="menu">
        <Link to="ListFac" className={activeMenuItem === 'ListFac' ? 'active' : ''} onClick={() => handleMenuItemClick('ListFac')}>List OF Facture</Link>
        <Link to="Fac" className={activeMenuItem === 'Fac' ? 'active' : ''} onClick={() => handleMenuItemClick('Fac')}>Create one</Link>
      </div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

export default FactureUi

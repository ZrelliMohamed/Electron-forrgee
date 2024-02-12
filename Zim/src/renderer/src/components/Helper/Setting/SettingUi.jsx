import { Link,Outlet } from "react-router-dom"
import './SettingUi.css'
import { useState } from "react";
function SettingUi() {
  const [activeMenuItem, setActiveMenuItem] = useState(null);
  const handleMenuItemClick = (itemName) => {
    setActiveMenuItem(itemName);
  };
  return (
    <div className="container">
      <div className="menu">
        <Link to="Facture" className={activeMenuItem === 'Facture' ? 'active' : ''} onClick={() => handleMenuItemClick('Facture')}>Facture</Link>&nbsp;&nbsp;
        <Link to="Database" className={activeMenuItem === 'Database' ? 'active' : ''} onClick={() => handleMenuItemClick('Database')}>Database</Link>
      </div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

export default SettingUi

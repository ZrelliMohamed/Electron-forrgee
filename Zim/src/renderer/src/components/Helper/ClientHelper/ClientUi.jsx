import { Link,Outlet } from "react-router-dom"
import './ClientUi.css'
import { useState } from "react";
function ClientUi() {
  const [activeMenuItem, setActiveMenuItem] = useState(null);
  const handleMenuItemClick = (itemName) => {
    setActiveMenuItem(itemName);
  };
  return (
    <div className="container">
      <div className="menu">
        <Link to="Cli" className={activeMenuItem === 'Cli' ? 'active' : ''} onClick={() => handleMenuItemClick('Cli')}>List OF Client</Link>
        <Link to="AddCli" className={activeMenuItem === 'AddCli' ? 'active' : ''} onClick={() => handleMenuItemClick('AddCli')}>Add one</Link>
      </div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

export default ClientUi

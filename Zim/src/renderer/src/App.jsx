import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import './App.css'
function App() {
  const [activeMenuItem, setActiveMenuItem] = useState(null);

  const handleMenuItemClick = (itemName) => {
    setActiveMenuItem(itemName);
  };
  return (
    <div className="container">
      <div className="header">
        <h1>Zrelli pour l'Industrie Moderne</h1>
      </div>

      <div className="menu">
        <Link to="Vente" className={activeMenuItem === 'Vente' ? 'active' : ''} onClick={() => handleMenuItemClick('Vente')}>Vente</Link>
        <Link to="Achat" className={activeMenuItem === 'Achat' ? 'active' : ''} onClick={() => handleMenuItemClick('Achat')}>Achat</Link>
        <Link to="Setting" className={activeMenuItem === 'Setting' ? 'active' : ''} onClick={() => handleMenuItemClick('Setting')}>Setting</Link>
      </div>

      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

export default App

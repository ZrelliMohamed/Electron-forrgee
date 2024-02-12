import React, { useState } from 'react'
import { Link,Outlet } from "react-router-dom"
function ArticleUi() {
  const [activeMenuItem, setActiveMenuItem] = useState(null);
  const handleMenuItemClick = (itemName) => {
    setActiveMenuItem(itemName);
  };
  return (
    <div className="container">
      <div className="menu">
        <Link to="artcl" className={activeMenuItem === 'artcl' ? 'active' : ''} onClick={() => handleMenuItemClick('artcl')}>List Of Articles</Link>
        <Link to="AddArtcl" className={activeMenuItem === 'AddArtcl' ? 'active' : ''} onClick={() => handleMenuItemClick('AddArtcl')}>Add one</Link>
      </div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

export default ArticleUi

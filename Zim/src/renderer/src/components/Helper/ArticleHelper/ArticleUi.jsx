import React from 'react'
import { Link,Outlet } from "react-router-dom"
function ArticleUi() {
  return (
    <div>
    <div>
        <Link to="artcl">List Of Articles</Link>&nbsp;&nbsp;
        <Link to="AddArtcl">Add one</Link>
    </div>
    <div>
      <Outlet/>
    </div>
  </div>
  )
}

export default ArticleUi

import { Link,Outlet } from "react-router-dom"

function FactureUi() {
  return (
    <div>
    <div>
        <Link to="ListFac">List OF Facture</Link>&nbsp;&nbsp;
        <Link to="Fac">Create one</Link>
    </div>
    <div>
      <Outlet/>
    </div>
  </div>
  )
}

export default FactureUi

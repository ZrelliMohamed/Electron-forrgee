import { Link,Outlet } from "react-router-dom"

function ClientUi() {
  return (
    <div>
    <div>
        <Link to="Cli">List OF CLient</Link>&nbsp;&nbsp;
        <Link to="AddCli">Add one</Link>
    </div>
    <div>
      <Outlet/>
    </div>
  </div>
  )
}

export default ClientUi

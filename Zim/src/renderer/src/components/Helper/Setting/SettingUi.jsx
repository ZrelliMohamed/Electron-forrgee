import { Link,Outlet } from "react-router-dom"

function SettingUi() {
  return (
    <div>
    <div>
        <Link to="Facture">Facture</Link>&nbsp;&nbsp;
        <Link to="Database">Database</Link>
    </div>
    <div>
      <Outlet/>
    </div>
  </div>
  )
}

export default SettingUi

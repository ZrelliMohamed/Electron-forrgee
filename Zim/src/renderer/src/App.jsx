import { Link, Outlet } from 'react-router-dom'


function App() {

  return ( <div>
    <div>
      <h1>Zim Pour L'industrie Moderne</h1>
      <Link to="Clients">Clients</Link> &nbsp;&nbsp;&nbsp;&nbsp;
      <Link to="Articles">Articles</Link> &nbsp;&nbsp;&nbsp;&nbsp;
      <Link to="Facture">Facture</Link> &nbsp;&nbsp;&nbsp;&nbsp;

    </div>
      <div >
      <Outlet />
      </div>
    </div>
  )
}

export default App

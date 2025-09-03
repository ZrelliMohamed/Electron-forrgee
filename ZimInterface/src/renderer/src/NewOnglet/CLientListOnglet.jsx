import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import AppClientList from '../NewOnglet/AppClientList.jsx'
import '../index.css'
ReactDOM.createRoot(document.getElementById('root')).render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<AppClientList />}></Route>
    </Routes>
  </HashRouter>
)


import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import ListeArticlePicker from '../modules/factures/vente/CreateFactureHelper/ListeArticlePicker'
import "../index.css"
ReactDOM.createRoot(document.getElementById('root')).render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<ListeArticlePicker/>}></Route>
    </Routes>
  </HashRouter>
)

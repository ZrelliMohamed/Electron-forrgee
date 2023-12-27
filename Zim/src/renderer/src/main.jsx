import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import ClientUi from './components/Helper/ClientHelper/ClientUi'
import AddClient from './components/Helper/ClientHelper/AddClient'
import Clients from './components/MainWindow/Clients'
import UpdateClient from './components/Helper/ClientHelper/UpdateClient'
import ArticleUi from './components/Helper/ArticleHelper/ArticleUi'
import AddArticle from './components/Helper/ArticleHelper/AddArticle'
import UpdateArtcl from './components/Helper/ArticleHelper/UpdateArtcl'
import Articles from './components/MainWindow/Articles'
import Facture from './components/MainWindow/Facture'
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="Clients" element={<ClientUi />}>
            <Route path="Cli" element={<Clients />} />
            <Route path="AddCli" element={<AddClient />} />
          <Route path="Update" element={<UpdateClient />} />
          </Route>
          <Route path="Articles" element={<ArticleUi />} >
          <Route path="artcl" element={<Articles />} />
          <Route path="AddArtcl" element={<AddArticle />} />
          <Route path="Update" element={<UpdateArtcl />} />
          </Route>
          <Route path="Facture" element={<Facture />} >
            
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)

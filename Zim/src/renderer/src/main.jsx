import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
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
import FactureUi from './components/Helper/FactureHelper/FactureUi'
import ListFac from './components/Helper/FactureHelper/ListFac'
import FacPrinter from './components/Helper/FactureHelper/FacPrinter'
import SettingUi from './components/Helper/Setting/SettingUi'
import FactureSetting from './components/Helper/Setting/FactureSetting'
import DataBase from './components/Helper/Setting/DataBase'
ReactDOM.createRoot(document.getElementById('root')).render(
    <HashRouter>
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
          <Route path="Facture" element={<FactureUi />} >
            <Route path="Fac" element={<Facture />} />
            <Route path="ListFac" element={<ListFac />} />
            <Route path="PrintFac" element={<FacPrinter />} />
          </Route>
          <Route path="Setting" element={<SettingUi />}>
            <Route path="Facture" element={<FactureSetting />} />
            <Route path="Database" element={<DataBase />} />
          </Route>
        </Route>
      </Routes>
    </HashRouter>
)

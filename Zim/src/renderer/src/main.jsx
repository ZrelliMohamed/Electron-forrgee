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
import AchatUi from './components/menu/AchatUi'
import VenteUi from './components/menu/VenteUi'
import FournisseurUi from './components/Helper/FournHelper/FournisseurUi'
import ListFourn from './components/Helper/FournHelper/ListFourn'
import AddFourn from './components/Helper/FournHelper/AddFourn'
import UpdateFourn from './components/Helper/FournHelper/UpdateFourn'
import FactureAchatUI from './components/Helper/FactureAchatHelper/FactureAchatUI'
import FactureAchat from './components/Helper/FactureAchatHelper/FactureAchat'
import ListFacAchat from './components/Helper/FactureAchatHelper/ListFacAchat'
ReactDOM.createRoot(document.getElementById('root')).render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<App />}>
      <Route path="Setting" element={<SettingUi />}>
        <Route path="Facture" element={<FactureSetting />} />
        <Route path="Database" element={<DataBase />} />
      </Route>
      <Route path='Achat' element={<AchatUi/>}>
        <Route path="FournisseurUI" element={<FournisseurUi />} >
          <Route path="List" element={<ListFourn />} />
          <Route path="AddFourn" element={<AddFourn />} />
          <Route path="UpdateFourn" element={<UpdateFourn />} />
        </Route>
        <Route path="FacAchat" element={<FactureAchatUI />} >
          <Route path="ListAchat" element={<ListFacAchat />} />
          <Route path="AddAchat" element={<FactureAchat />} />
        </Route>
     </Route>
      <Route path='Vente' element={<VenteUi/>}>
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
       </Route>
      </Route>
    </Routes>
  </HashRouter>
)

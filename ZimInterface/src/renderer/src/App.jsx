import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';

// Clientèle
import AddClient from './modules/clientele/AddClient.jsx';
import ClientList from './modules/clientele/ClientList.jsx';
import ClientSituation from './modules/clientele/ClientSituation.jsx';

// Fournisseurs
import AddFournisseur from './modules/fournisseurs/AddFournisseur.jsx';
import FournisseurList from './modules/fournisseurs/FournisseurList.jsx';
import FournisseurSituation from './modules/fournisseurs/FournisseurSituation.jsx';

// Factures → Vente
import CreateFactureVente from './modules/factures/vente/CreateFactureVente.jsx';
import FactureVenteList from './modules/factures/vente/FactureVenteList.jsx';

// Factures → Achat
import CreateFactureAchat from './modules/factures/achat/CreateFactureAchat.jsx';
import FactureAchatList from './modules/factures/achat/FactureAchatList.jsx';

// Articles
import AddArticle from './modules/articles/AddArticle.jsx';
import ArticleList from './modules/articles/ArticleList.jsx';
import ArticleMovement from './modules/articles/ArticleMovement.jsx';

// Settings
import SettingsPage from './modules/modules/settings/SettingsPage.jsx';
import FacPrinter from './modules/factures/vente/CreateFactureHelper/FacPrinter.jsx';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
         <Route path="/" element={<Navigate to="/factures/vente/list" replace />} />
          {/* Clientèle */}
          <Route path="clientele">
            <Route index element={<Navigate to="/clientele/list" replace />} />
            <Route path="add" element={<AddClient />} />
            <Route path="list" element={<ClientList />} />
            <Route path="situation" element={<ClientSituation />} />
          </Route>

          {/* Fournisseurs */}
          <Route path="fournisseurs">
            <Route index element={<Navigate to="/fournisseurs/list" replace />} />
            <Route path="add" element={<AddFournisseur />} />
            <Route path="list" element={<FournisseurList />} />
            <Route path="situation" element={<FournisseurSituation />} />
          </Route>

          {/* Factures */}
          <Route path="factures">
            <Route index element={<Navigate to="/factures/vente/list" replace />} />

            {/* Vente */}
            <Route path="vente">
              <Route index element={<Navigate to="/factures/vente/list" replace />} />
              <Route path="create" element={<CreateFactureVente />} />
              <Route path="list" element={<FactureVenteList />} />
              <Route path="PrintFac" element={<FacPrinter />} />
            </Route>

            {/* Achat */}
            <Route path="achat">
              <Route index element={<Navigate to="/factures/achat/list" replace />} />
              <Route path="create" element={<CreateFactureAchat />} />
              <Route path="list" element={<FactureAchatList />} />
            </Route>
          </Route>

          {/* Articles */}
          <Route path="articles">
            <Route index element={<Navigate to="/articles/list" replace />} />
            <Route path="add" element={<AddArticle />} />
            <Route path="list" element={<ArticleList />} />
            <Route path="movement" element={<ArticleMovement />} />
          </Route>

          {/* Settings */}
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

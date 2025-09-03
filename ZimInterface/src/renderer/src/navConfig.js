import {
  Users, Receipt, Boxes, Settings as SettingsIcon,
  UserPlus, List, ClipboardList, FilePlus2, ArrowLeftRight, PackagePlus, Truck
} from 'lucide-react';


export const MAIN_TABS = [
  { key: 'clientele', to: '/clientele', label: 'Clientèle', icon: Users },
  { key: 'fournisseurs', to: '/fournisseurs', label: 'Fournisseurs', icon: Truck },
  { key: 'articles', to: '/articles', label: 'Articles', icon: Boxes },
  { key: 'factures', to: '/factures', label: 'Factures', icon: Receipt },
  { key: 'settings', to: '/settings', label: 'Settings', icon: SettingsIcon },
];


export const SIDE_MENUS = {
  clientele: [
    { to: '/clientele/add', label: 'Ajouter un client', icon: UserPlus },
    { to: '/clientele/list', label: 'Liste des clients', icon: List },
    { to: '/clientele/situation', label: 'Situation client', icon: ClipboardList },
  ],

  fournisseurs: [
    { to: '/fournisseurs/add', label: 'Ajouter un fournisseur', icon: UserPlus },
    { to: '/fournisseurs/list', label: 'Liste des fournisseurs', icon: List },
    { to: '/fournisseurs/situation', label: 'Situation fournisseur', icon: ClipboardList },
  ],

  factures: [
    {
      section: 'Vente',
      items: [
        { to: '/factures/vente/create', label: 'Créer une facture vente', icon: FilePlus2 },
        { to: '/factures/vente/list', label: 'Liste factures vente', icon: ClipboardList },
      ]
    },
    {
      section: 'Achat',
      items: [
        { to: '/factures/achat/create', label: 'Créer une facture achat', icon: FilePlus2 },
        { to: '/factures/achat/list', label: 'Liste factures achat', icon: ClipboardList },
      ]
    }
  ],

  articles: [
    { to: '/articles/add', label: 'Ajouter un article', icon: PackagePlus },
    { to: '/articles/list', label: 'Liste articles', icon: List },
    { to: '/articles/movement', label: 'Mouvement articles', icon: ArrowLeftRight },
  ],

  settings: [
    { to: '/settings', label: 'Options', icon: SettingsIcon },
  ],
};

import TopNavBar from './TopNavBar.jsx';
import SideMenu from './SideMenu.jsx';
import { Outlet } from 'react-router-dom';


export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNavBar />
      <div className="flex flex-1 h-[calc(100vh-4rem)]"> {/* conteneur flex plein écran */}
        <SideMenu /> {/* SideMenu gère sa largeur avec collapsed */}
        <main className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-soft p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

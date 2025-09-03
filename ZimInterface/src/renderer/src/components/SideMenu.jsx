import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { SIDE_MENUS } from '../navConfig.js';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function currentSection(pathname) {
  const seg = pathname.split('/')[1] || 'factures';
  return seg;
}

export default function SideMenu() {
  const { pathname } = useLocation();
  const section = currentSection(pathname);
  const items = SIDE_MENUS[section] || [];

  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
     className={`relative flex-shrink-0 h-full p-3 border-r bg-white transition-all duration-300 ${
    collapsed ? 'w-20' : 'w-72'
  }`}
    >
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-white shadow"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div className="space-y-4 mt-10">
        {items.map((entry, idx) => {
          if (entry.section) {
            return (
              <div key={entry.section || idx}>
                {!collapsed && (
                  <h4 className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">
                    {entry.section}
                  </h4>
                )}
                <div className="space-y-2">
                  {entry.items.map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-sm transition ${
                          isActive
                            ? 'bg-brand-100 text-brand-800 border-brand-300'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300'
                        }`
                      }
                    >
                      <Icon size={18} />
                      {!collapsed && (
                        <span className="text-sm font-medium">{label}</span>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <NavLink
              key={entry.to}
              to={entry.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-sm transition ${
                  isActive
                    ? 'bg-brand-100 text-brand-800 border-brand-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300'
                }`
              }
            >
              <entry.icon size={18} />
              {!collapsed && (
                <span className="text-sm font-medium">{entry.label}</span>
              )}
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
}

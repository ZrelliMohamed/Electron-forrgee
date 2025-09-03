import { NavLink, useLocation } from 'react-router-dom';
import { MAIN_TABS } from '../navConfig.js';
import { motion } from 'framer-motion';

import ZimLogo from '../assets/images/ZimLogo.png';
export default function TopNavBar() {
const { pathname } = useLocation();


return (
<div className="sticky top-0 z-40 w-full backdrop-blur bg-white/80 border-b border-slate-200">
<div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
<div className="font-semibold tracking-tight text-slate-700"><img src={ZimLogo} width={150}/></div>
<nav className="ml-auto flex items-center gap-2">
{MAIN_TABS.map(({ key, to, label, icon: Icon }) => {
const active = pathname.startsWith('/' + key);
return (
<NavLink key={key} to={to} className="relative">
<motion.div
whileHover={{ y: -1 }}
className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm transition-all shadow-sm ${
active
? 'bg-brand-500 text-white border-brand-500'
: 'bg-white text-slate-700 border-slate-200 hover:border-brand-400'
}`}
>
<Icon size={18} />
<span>{label}</span>
</motion.div>
</NavLink>
);
})}
</nav>
</div>
</div>
);
}
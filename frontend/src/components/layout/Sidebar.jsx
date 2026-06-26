import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  FolderOpen,
  QrCode,
  Tag,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/dashboard/menu', icon: UtensilsCrossed, label: 'Menu' },
  { to: '/dashboard/categories', icon: FolderOpen, label: 'Categories' },
  { to: '/dashboard/tables', icon: QrCode, label: 'Tables' },
  { to: '/dashboard/offers', icon: Tag, label: 'Offers' },
  { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { restaurant, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-surface-900 text-white flex flex-col transition-all duration-300 z-40 ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
          <UtensilsCrossed className="w-4 h-4" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-semibold text-sm truncate">DineFlow</p>
            <p className="text-xs text-white/50 truncate">{restaurant?.name}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-1">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-white/50 hover:bg-white/10 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

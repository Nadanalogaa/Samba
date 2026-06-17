import { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  Users,
  ShoppingCart,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Plus,
} from 'lucide-react';

interface CashUser {
  id: number;
  username: string;
  fullName: string;
  districts?: string[];
  role?: string;
}

const NAV_ITEMS = [
  { to: '/cash-bill/new-order', icon: Plus, label: 'Proforma Entry / Cash Bill', end: false },
  { to: '/cash-bill/orders', icon: ShoppingCart, label: 'Orders', end: false },
  { to: '/cash-bill/bills', icon: FileText, label: 'Bills', end: false },
  { to: '/cash-bill', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/cash-bill/rate-master', icon: BookOpen, label: 'Rate Master', end: false },
  { to: '/cash-bill/customers', icon: Users, label: 'Customers', end: false },
  { to: '/cash-bill/reports', icon: BarChart3, label: 'Reports', end: false },
  { to: '/cash-bill/settings', icon: Settings, label: 'Settings', end: false },
];

export default function CashBillLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<CashUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('cash-bill-token');
    const userStr = localStorage.getItem('cash-bill-user');
    if (!token || !userStr) {
      navigate('/cash-bill/login', { replace: true });
      return;
    }
    try {
      setUser(JSON.parse(userStr));
    } catch {
      navigate('/cash-bill/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('cash-bill-token');
    localStorage.removeItem('cash-bill-user');
    navigate('/cash-bill/login', { replace: true });
  };

  if (!user) return null;

  const districts = user.districts || ['CHE', 'CBE'];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--theme-bg, #f9fafb)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: '#1e3a5f' }}
      >
        {/* Logo area */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
            <BookOpen size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">Cash Bill</p>
            <p className="text-[10px] text-white/50">Samba Publications</p>
          </div>
          <button
            className="lg:hidden text-white/70 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* District badges */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/10">
          {districts.map((d) => (
            <span
              key={d}
              className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: d === 'CHE' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)',
                color: d === 'CHE' ? '#fbbf24' : '#34d399',
              }}
            >
              {d}
            </span>
          ))}
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:bg-white/8 hover:text-white/90'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User area */}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white text-xs font-bold">
              {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.fullName}</p>
              <p className="text-[10px] text-white/40 truncate">{user.username}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b"
          style={{
            backgroundColor: 'var(--theme-surface, #ffffff)',
            borderColor: 'var(--theme-border, #e5e7eb)',
          }}
        >
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setSidebarOpen(true)}
            style={{ color: 'var(--theme-text, #1f2937)' }}
          >
            <Menu size={20} />
          </button>

          <div className="flex-1" />

          {/* District badges (top bar - desktop) */}
          <div className="hidden sm:flex items-center gap-1.5">
            {districts.map((d) => (
              <span
                key={d}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: d === 'CHE' ? '#fef3c7' : '#d1fae5',
                  color: d === 'CHE' ? '#92400e' : '#065f46',
                }}
              >
                {d}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span
              className="text-sm font-medium hidden sm:inline"
              style={{ color: 'var(--theme-text, #1f2937)' }}
            >
              {user.fullName}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-danger-600 hover:bg-danger-50 transition-colors duration-150"
              title="Logout"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

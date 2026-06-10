import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  School,
  ShoppingCart,
  FileText,
  BarChart3,
  Home,
  Search,
  ClipboardList,
  PlusSquare,
  X,
} from 'lucide-react';
import type { UserRole } from '../../types';

interface MenuItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const menuMap: Record<UserRole, MenuItem[]> = {
  admin: [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'Books', path: '/app/catalog', icon: BookOpen },
    { label: 'Representatives', path: '/app/representatives', icon: Users },
    { label: 'Schools', path: '/app/schools', icon: School },
    { label: 'Orders', path: '/app/orders', icon: ClipboardList },
    { label: 'Reports', path: '/app/reports', icon: BarChart3 },
  ],
  representative: [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'My Schools', path: '/app/my-schools', icon: School },
    { label: 'Book Catalog', path: '/app/catalog', icon: BookOpen },
    { label: 'Create Order', path: '/app/create-order', icon: PlusSquare },
    { label: 'My Orders', path: '/app/orders', icon: ClipboardList },
  ],
  school: [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'Book Catalog', path: '/app/catalog', icon: BookOpen },
    { label: 'Cart', path: '/app/cart', icon: ShoppingCart },
    { label: 'Orders', path: '/app/orders', icon: ClipboardList },
  ],
  individual: [
    { label: 'Home', path: '/app/dashboard', icon: Home },
    { label: 'Browse Books', path: '/app/catalog', icon: Search },
    { label: 'Cart', path: '/app/cart', icon: ShoppingCart },
    { label: 'My Orders', path: '/app/orders', icon: FileText },
  ],
};

interface SidebarProps {
  role: UserRole;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const items = menuMap[role] ?? menuMap.individual;

  const isActive = (path: string) => {
    if (path === '/app/dashboard') return location.pathname === '/app/dashboard' || location.pathname === '/app';
    return location.pathname.startsWith(path);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Mobile header inside sidebar */}
      <div className="flex items-center justify-between px-4 py-3 md:hidden border-b border-gray-100 dark:border-slate-700">
        <span className="text-sm font-semibold text-primary-500 dark:text-primary-300 uppercase tracking-widest">
          Menu
        </span>
        <button
          onClick={onClose}
          aria-label="Close sidebar"
          className="
            w-8 h-8 flex items-center justify-center rounded-full
            text-slate-500 dark:text-slate-400
            hover:bg-slate-100 dark:hover:bg-slate-700
            transition-colors duration-200
          "
        >
          <X size={16} />
        </button>
      </div>

      {/* Role badge */}
      <div className="px-4 py-4 border-b border-gray-100 dark:border-slate-700">
        <span className="
          inline-flex items-center px-2.5 py-1 rounded-full
          text-[11px] font-semibold uppercase tracking-wider
          bg-primary-500/10 text-primary-600
          dark:bg-primary-400/20 dark:text-primary-300
        ">
          {role}
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-sm font-medium
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-secondary-500/50
                ${active
                  ? 'bg-secondary-500/20 text-secondary-600 dark:text-secondary-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-white'
                }
              `}
            >
              {/* Active indicator */}
              <span className={`
                absolute left-0 w-1 h-8 rounded-r-full bg-secondary-500
                transition-all duration-200
                ${active ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'}
              `} />

              <Icon
                size={17}
                className={`
                  flex-shrink-0 transition-colors duration-200
                  ${active
                    ? 'text-secondary-500 dark:text-secondary-400'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }
                `}
              />
              <span className="truncate">{item.label}</span>

              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-secondary-500 flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-700">
        <p className="text-[11px] text-slate-400 dark:text-slate-600 text-center">
          © {new Date().getFullYear()} Samba Publications
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop — mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-[250px]
          bg-white dark:bg-slate-800
          border-r border-gray-200 dark:border-slate-700
          shadow-xl md:shadow-none
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:flex md:flex-col
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

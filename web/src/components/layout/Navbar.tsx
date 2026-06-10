import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, LogOut, BookOpen, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import ThemeToggle from './ThemeToggle';

interface NavbarProps {
  onMenuToggle?: () => void;
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const { user, logout } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems);
  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = totalItems();

  return (
    <header className="
      sticky top-0 z-50
      bg-primary-500 dark:bg-primary-800
      text-white
      shadow-lg
      transition-colors duration-300
    ">
      <div className="flex items-center gap-3 px-4 py-3">

        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
          className="
            md:hidden flex-shrink-0
            w-9 h-9 flex flex-col items-center justify-center gap-1.5
            rounded-lg bg-white/10 hover:bg-white/20
            transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50
          "
        >
          <span className="block w-5 h-0.5 bg-white rounded-full" />
          <span className="block w-5 h-0.5 bg-white rounded-full" />
          <span className="block w-5 h-0.5 bg-white rounded-full" />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="
            w-8 h-8 rounded-lg bg-secondary-500 flex items-center justify-center
            shadow-md flex-shrink-0
          ">
            <BookOpen size={16} className="text-primary-900" />
          </div>
          <span className="
            font-bold text-base sm:text-lg leading-tight tracking-tight hidden sm:block
          ">
            Samba Publications
          </span>
          <span className="font-bold text-base leading-tight tracking-tight sm:hidden">
            Samba
          </span>
        </div>

        {/* Search — grows to fill available space */}
        <div className="flex-1 max-w-xl mx-auto px-2">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books, subjects…"
              className="
                w-full pl-9 pr-4 py-2 rounded-lg text-sm
                bg-white/15 placeholder-white/60 text-white
                border border-white/20
                focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/20
                transition-all duration-200
              "
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <ThemeToggle />

          {/* Cart */}
          <Link
            to="/app/cart"
            aria-label={`Cart — ${cartCount} item${cartCount !== 1 ? 's' : ''}`}
            className="
              relative w-9 h-9 flex items-center justify-center
              rounded-full bg-white/10 hover:bg-white/20
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-white/50
            "
          >
            <ShoppingCart size={16} />
            {cartCount > 0 && (
              <span className="
                absolute -top-0.5 -right-0.5
                min-w-[18px] h-[18px] px-1
                bg-secondary-500 text-primary-900
                text-[10px] font-bold
                rounded-full flex items-center justify-center
                shadow-md animate-pulse
              ">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          {/* User info — hidden on very small screens */}
          {user && (
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-white/20">
              <div className="
                w-8 h-8 rounded-full bg-secondary-500 flex items-center justify-center
                text-primary-900 font-bold text-sm flex-shrink-0 shadow-md
              ">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={14} />
                )}
              </div>
              <div className="hidden md:block leading-tight">
                <p className="text-sm font-semibold truncate max-w-[120px]">{user.name}</p>
                <p className="text-[10px] text-white/70 capitalize">{user.role}</p>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={logout}
            aria-label="Log out"
            title="Log out"
            className="
              w-9 h-9 flex items-center justify-center rounded-full
              bg-white/10 hover:bg-danger-500
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-white/50
            "
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}

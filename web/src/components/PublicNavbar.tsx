import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, BookOpen, Menu, X, Moon, Palette } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useThemeStore, type PastelTheme } from '../store/themeStore';

const pastelThemes: { id: PastelTheme; label: string; color: string }[] = [
  { id: 'rose', label: 'Rose', color: '#f8bbd0' },
  { id: 'ocean', label: 'Ocean', color: '#b2ebf2' },
  { id: 'mint', label: 'Mint', color: '#c8e6c9' },
  { id: 'lavender', label: 'Lavender', color: '#e1bee7' },
  { id: 'peach', label: 'Peach', color: '#ffe0b2' },
];

export default function PublicNavbar() {
  const { isAuthenticated } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems);
  const { mode, isDark, setTheme } = useThemeStore();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  const cartCount = totalItems();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCartClick = () => {
    if (isAuthenticated) {
      navigate('/cart');
    } else {
      navigate('/login');
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'shadow-lg glass-nav'
          : ''
      }`}
      style={{
        backgroundColor: scrolled
          ? (isDark ? 'rgba(15,23,42,0.95)' : 'var(--theme-nav-bg)')
          : (isDark ? 'rgba(15,23,42,0.8)' : 'var(--theme-nav-bg)'),
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-secondary-500 flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <BookOpen size={18} className="text-primary-900" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              Samba Publications
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-white/80 hover:text-white transition-colors duration-200">
              Home
            </Link>
            <Link to="/catalog" className="text-sm font-medium text-white/80 hover:text-white transition-colors duration-200">
              Catalog
            </Link>
            <Link to="/about" className="text-sm font-medium text-white/80 hover:text-white transition-colors duration-200">
              About
            </Link>
            <Link to="/contact" className="text-sm font-medium text-white/80 hover:text-white transition-colors duration-200">
              Contact
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme picker */}
            <div className="relative">
              <button
                onClick={() => setThemeOpen(!themeOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition-colors duration-200 text-white"
                aria-label="Change theme"
              >
                <Palette size={16} />
              </button>
              {themeOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setThemeOpen(false)} />
                  <div className="absolute right-0 top-12 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-3 min-w-[180px] animate-scale-in">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-1">Light Themes</p>
                    <div className="flex gap-2 mb-3 px-1">
                      {pastelThemes.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => { setTheme(t.id); setThemeOpen(false); }}
                          className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                            mode === t.id ? 'border-primary-500 ring-2 ring-primary-300 scale-110' : 'border-gray-200 dark:border-gray-600'
                          }`}
                          style={{ backgroundColor: t.color }}
                          title={t.label}
                        />
                      ))}
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 px-1">
                      <button
                        onClick={() => { setTheme('dark'); setThemeOpen(false); }}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors duration-200 ${
                          isDark ? 'bg-gray-100 dark:bg-gray-700 font-semibold' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Moon size={14} className="text-gray-600 dark:text-gray-300" />
                        <span className="text-gray-700 dark:text-gray-200">Dark Mode</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={handleCartClick}
              className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition-colors duration-200 text-white btn-press"
              aria-label="Cart"
            >
              <ShoppingCart size={16} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-secondary-500 text-primary-900 text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* Auth buttons */}
            {isAuthenticated ? (
              <Link
                to="/app/dashboard"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-secondary-500 text-primary-900 hover:bg-secondary-400 transition-all duration-200 shadow-sm hover:shadow-md btn-press"
              >
                Dashboard
              </Link>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white border border-white/30 hover:bg-white/15 transition-all duration-200 btn-press"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-secondary-500 text-primary-900 hover:bg-secondary-400 transition-all duration-200 shadow-sm hover:shadow-md btn-press"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition-colors duration-200 text-white"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden animate-fade-in" style={{ backgroundColor: 'var(--theme-nav-bg)' }}>
          <div className="px-4 py-4 space-y-2 border-t border-white/10">
            <Link to="/" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-white/90 hover:bg-white/10 text-sm font-medium">Home</Link>
            <Link to="/catalog" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-white/90 hover:bg-white/10 text-sm font-medium">Catalog</Link>
            <Link to="/about" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-white/90 hover:bg-white/10 text-sm font-medium">About</Link>
            <Link to="/contact" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-white/90 hover:bg-white/10 text-sm font-medium">Contact</Link>
            <div className="border-t border-white/10 pt-3 flex gap-2">
              {isAuthenticated ? (
                <Link to="/app/dashboard" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-secondary-500 text-primary-900">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-medium text-white border border-white/30">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-secondary-500 text-primary-900">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

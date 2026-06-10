import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import type { UserRole } from '../../types';

export default function Layout() {
  useThemeStore(); // keep subscription for reactivity
  const { user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Theme is now synced by the themeStore itself

  // Close sidebar when viewport becomes desktop-sized
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setSidebarOpen(false);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const role: UserRole = user?.role ?? 'individual';

  return (
    <div className="flex flex-col min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--theme-bg)' }}>
      {/* Top navbar */}
      <Navbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />

      {/* Body: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — 250 px on desktop, off-canvas on mobile */}
        <div className="md:w-[250px] md:flex-shrink-0">
          <Sidebar
            role={role}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        {/* Main content */}
        <main className="
          flex-1 min-h-[calc(100vh-56px)] overflow-auto
          transition-colors duration-300
        ">
          <div className="p-6 max-w-screen-2xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

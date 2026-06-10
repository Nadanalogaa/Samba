import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

export default function ThemeToggle() {
  const { isDark, toggle } = useThemeStore();

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="
        relative w-9 h-9 rounded-full flex items-center justify-center
        bg-white/10 hover:bg-white/20
        text-white
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-white/50
        overflow-hidden
      "
    >
      <span
        className={`
          absolute inset-0 flex items-center justify-center
          transition-all duration-300 ease-in-out
          ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}
        `}
      >
        <Moon size={16} />
      </span>
      <span
        className={`
          absolute inset-0 flex items-center justify-center
          transition-all duration-300 ease-in-out
          ${isDark ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}
        `}
      >
        <Sun size={16} />
      </span>
    </button>
  );
}

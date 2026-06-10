import { Sun, Moon, Bell, Shield, Globe, Palette, Check } from 'lucide-react';
import { useThemeStore, type PastelTheme } from '../../store/themeStore';

const pastelThemes: { id: PastelTheme; label: string; color: string; preview: string }[] = [
  { id: 'rose', label: 'Rose', color: '#f8bbd0', preview: '#fef2f5' },
  { id: 'ocean', label: 'Ocean', color: '#b2ebf2', preview: '#eef6fb' },
  { id: 'mint', label: 'Mint', color: '#c8e6c9', preview: '#f0faf4' },
  { id: 'lavender', label: 'Lavender', color: '#e1bee7', preview: '#f5f0fa' },
  { id: 'peach', label: 'Peach', color: '#ffe0b2', preview: '#fef8f0' },
];

export default function SettingsPage() {
  const { mode, isDark, setTheme } = useThemeStore();

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--theme-text)' }}>Settings</h1>

      <div className="space-y-6">
        {/* Appearance - Theme Picker */}
        <div className="rounded-2xl shadow-sm border p-6" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
          <div className="flex items-center gap-3 mb-4">
            <Palette className="text-info-500" size={22} />
            <h3 className="text-lg font-semibold" style={{ color: 'var(--theme-text)' }}>Appearance</h3>
          </div>

          <p className="text-sm mb-4" style={{ color: 'var(--theme-text-secondary)' }}>
            Choose a pastel theme or switch to dark mode
          </p>

          {/* Pastel theme grid */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            {pastelThemes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                  mode === t.id
                    ? 'border-primary-500 shadow-md'
                    : 'border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                }`}
                style={{ backgroundColor: t.preview }}
              >
                <div
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: t.color }}
                />
                <span className="text-xs font-medium" style={{ color: '#4a5568' }}>{t.label}</span>
                {mode === t.id && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Dark mode toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--theme-surface-alt)' }}>
            <div className="flex items-center gap-3">
              {isDark ? <Moon className="text-info-400" size={20} /> : <Sun className="text-secondary-500" size={20} />}
              <div>
                <p className="font-medium" style={{ color: 'var(--theme-text)' }}>Dark Mode</p>
                <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Switch to dark theme</p>
              </div>
            </div>
            <button
              onClick={() => setTheme(isDark ? 'ocean' : 'dark')}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                isDark ? 'bg-info-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${
                  isDark ? 'translate-x-7.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl shadow-sm border p-6" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
          <div className="flex items-center gap-3 mb-4">
            <Bell className="text-secondary-500" size={22} />
            <h3 className="text-lg font-semibold" style={{ color: 'var(--theme-text)' }}>Notifications</h3>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Order Updates', desc: 'Get notified when order status changes' },
              { label: 'New Books', desc: 'Be the first to know about new publications' },
              { label: 'Promotions', desc: 'Receive offers and discounts' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--theme-surface-alt)' }}>
                <div>
                  <p className="font-medium" style={{ color: 'var(--theme-text)' }}>{item.label}</p>
                  <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>{item.desc}</p>
                </div>
                <button className="relative w-14 h-7 bg-accent-500 rounded-full">
                  <span className="absolute top-0.5 translate-x-7.5 w-6 h-6 bg-white rounded-full shadow transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="rounded-2xl shadow-sm border p-6" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-accent-500" size={22} />
            <h3 className="text-lg font-semibold" style={{ color: 'var(--theme-text)' }}>Security</h3>
          </div>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 rounded-xl transition-colors" style={{ backgroundColor: 'var(--theme-surface-alt)' }}>
              <div className="text-left">
                <p className="font-medium" style={{ color: 'var(--theme-text)' }}>Change Password</p>
                <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Update your password regularly</p>
              </div>
              <span style={{ color: 'var(--theme-text-secondary)' }}>&rarr;</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 rounded-xl transition-colors" style={{ backgroundColor: 'var(--theme-surface-alt)' }}>
              <div className="text-left">
                <p className="font-medium" style={{ color: 'var(--theme-text)' }}>Two-Factor Authentication</p>
                <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Add an extra layer of security</p>
              </div>
              <span className="text-xs px-2 py-1 bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400 rounded-full font-medium">Coming Soon</span>
            </button>
          </div>
        </div>

        {/* Language */}
        <div className="rounded-2xl shadow-sm border p-6" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
          <div className="flex items-center gap-3 mb-4">
            <Globe className="text-primary-500" size={22} />
            <h3 className="text-lg font-semibold" style={{ color: 'var(--theme-text)' }}>Language & Region</h3>
          </div>

          <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--theme-surface-alt)' }}>
            <label className="text-sm mb-2 block" style={{ color: 'var(--theme-text-secondary)' }}>Language</label>
            <select className="w-full px-3 py-2 border rounded-lg text-sm" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}>
              <option>English</option>
              <option>Tamil</option>
              <option>Hindi</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

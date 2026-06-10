import { BookOpen, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-secondary-500 flex items-center justify-center shadow-md">
                <BookOpen size={18} className="text-primary-900" />
              </div>
              <span className="font-bold text-lg" style={{ color: 'var(--theme-text)' }}>
                Samba Publications
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
              Quality textbooks for classes LKG to 10th. Trusted by schools across Tamil Nadu since 1998.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: 'Home', to: '/' },
                { label: 'Catalog', to: '/catalog' },
                { label: 'About Us', to: '/about' },
                { label: 'Contact', to: '/contact' },
                { label: 'Login', to: '/login' },
                { label: 'Register', to: '/register' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm transition-colors duration-200 hover:underline" style={{ color: 'var(--theme-text-secondary)' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Classes */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>Classes</h4>
            <ul className="space-y-2">
              {['LKG & UKG', '1st - 3rd', '4th - 5th', '6th - 8th', '9th - 10th'].map((cls) => (
                <li key={cls}>
                  <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>{cls}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--theme-text-secondary)' }} />
                <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                  42, Anna Salai, Chennai - 600002, Tamil Nadu
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="flex-shrink-0" style={{ color: 'var(--theme-text-secondary)' }} />
                <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>+91 44-2834 5678</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="flex-shrink-0" style={{ color: 'var(--theme-text-secondary)' }} />
                <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>info@sambapublications.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t text-center" style={{ borderColor: 'var(--theme-border)' }}>
          <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
            &copy; 2026 Samba Publications. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

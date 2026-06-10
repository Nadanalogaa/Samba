import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, User, Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import { cashAuth } from '../../services/cashBillApi';

export default function CashBillLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('cash-bill-token');
    if (token) {
      navigate('/cash-bill');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username is required.');
      return;
    }
    if (!password.trim()) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    try {
      const data = await cashAuth.login(username, password);
      localStorage.setItem('cash-bill-token', data.token);
      localStorage.setItem('cash-bill-user', JSON.stringify(data.user));
      navigate('/cash-bill');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--theme-bg, #f9fafb)' }}
    >
      <div className="w-full max-w-md">
        {/* Back to main site */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 transition-colors duration-200"
          style={{ color: 'var(--theme-text-muted, #6b7280)' }}
        >
          <ArrowLeft size={16} />
          Back to main website
        </Link>

        <div
          className="rounded-2xl shadow-lg border p-8"
          style={{
            backgroundColor: 'var(--theme-surface, #ffffff)',
            borderColor: 'var(--theme-border, #e5e7eb)',
          }}
        >
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center mb-4 shadow-md">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h1
              className="text-xl font-bold text-center"
              style={{ color: 'var(--theme-text, #1f2937)' }}
            >
              Cash Bill Module
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: 'var(--theme-text-muted, #6b7280)' }}
            >
              Samba Publications
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Username */}
            <div>
              <label
                htmlFor="cb-username"
                className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--theme-text, #1f2937)' }}
              >
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <User size={16} />
                </span>
                <input
                  id="cb-username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  style={{
                    backgroundColor: 'var(--theme-surface, #ffffff)',
                    color: 'var(--theme-text, #1f2937)',
                    borderColor: error && !username ? '#ef4444' : 'var(--theme-border, #d1d5db)',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="cb-password"
                className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--theme-text, #1f2937)' }}
              >
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Lock size={16} />
                </span>
                <input
                  id="cb-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  style={{
                    backgroundColor: 'var(--theme-surface, #ffffff)',
                    color: 'var(--theme-text, #1f2937)',
                    borderColor: error && !password ? '#ef4444' : 'var(--theme-border, #d1d5db)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-danger-50 border border-danger-200">
                <AlertCircle size={16} className="text-danger-500 flex-shrink-0" />
                <span className="text-sm text-danger-600">{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 active:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--theme-text-muted, #9ca3af)' }}>
          &copy; {new Date().getFullYear()} Samba Publications. All rights reserved.
        </p>
      </div>
    </div>
  );
}

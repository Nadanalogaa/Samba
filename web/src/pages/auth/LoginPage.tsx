import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Briefcase,
  School,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sun,
  Moon,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import type { UserRole } from '../../types';

interface RoleCard {
  role: UserRole;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const roleCards: RoleCard[] = [
  {
    role: 'admin',
    label: 'Admin',
    icon: <ShieldCheck className="w-5 h-5" />,
    description: 'Full system access',
  },
  {
    role: 'representative',
    label: 'Representative',
    icon: <Briefcase className="w-5 h-5" />,
    description: 'Sales & distribution',
  },
  {
    role: 'school',
    label: 'School',
    icon: <School className="w-5 h-5" />,
    description: 'Bulk book orders',
  },
  {
    role: 'individual',
    label: 'Individual',
    icon: <User className="w-5 h-5" />,
    description: 'Personal orders',
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();
  const { isDark, toggle } = useThemeStore();

  const [selectedRole, setSelectedRole] = useState<UserRole>('individual');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!password.trim()) {
      setError('Password is required.');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      login(email, password, selectedRole);
      navigate('/app/dashboard');
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center p-12 bg-gradient-to-br from-primary-600 via-primary-500 to-info-500">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-info-400/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-700/20 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center gap-8 max-w-md">
          {/* Logo mark */}
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm shadow-2xl border border-white/20">
            <BookOpen className="w-10 h-10 text-white" />
          </div>

          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
              Samba Publications
            </h1>
            <p className="mt-3 text-lg text-white/80 font-medium">
              Quality Education for Every Student
            </p>
          </div>

          {/* Feature highlights */}
          <div className="flex flex-col gap-3 w-full mt-4">
            {[
              'Comprehensive curriculum resources',
              'Trusted by 500+ schools across India',
              'Seamless bulk ordering for institutions',
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10"
              >
                <ChevronRight className="w-4 h-4 text-secondary-300 shrink-0" />
                <span className="text-sm text-white/90">{item}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-white/50 mt-4">
            &copy; {new Date().getFullYear()} Samba Publications. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Samba Publications
            </span>
          </div>
          <div className="hidden lg:block" />

          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 shadow-sm"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Centered form */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Sign in to your account to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* Role selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Sign in as
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {roleCards.map(({ role, label, icon, description }) => {
                    const isSelected = selectedRole === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedRole(role)}
                        className={[
                          'flex flex-col items-start gap-1 p-3 rounded-xl border-2 text-left transition-all duration-200',
                          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                          isSelected
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 dark:border-primary-400 shadow-sm'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800',
                        ].join(' ')}
                      >
                        <span
                          className={[
                            'flex items-center justify-center w-8 h-8 rounded-lg transition-colors',
                            isSelected
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
                          ].join(' ')}
                        >
                          {icon}
                        </span>
                        <span
                          className={[
                            'text-sm font-semibold leading-none mt-1',
                            isSelected
                              ? 'text-primary-700 dark:text-primary-300'
                              : 'text-gray-700 dark:text-gray-200',
                          ].join(' ')}
                        >
                          {label}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 leading-none">
                          {description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Email address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 dark:text-gray-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={[
                      'w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-colors duration-200',
                      'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
                      'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                      error && !email
                        ? 'border-danger-500 dark:border-danger-400'
                        : 'border-gray-300 dark:border-gray-600',
                    ].join(' ')}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 dark:text-gray-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={[
                      'w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm transition-colors duration-200',
                      'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
                      'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                      error && !password
                        ? 'border-danger-500 dark:border-danger-400'
                        : 'border-gray-300 dark:border-gray-600',
                    ].join(' ')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-danger-50 dark:bg-danger-900/30 border border-danger-200 dark:border-danger-700">
                  <span className="text-sm text-danger-600 dark:text-danger-400">{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className={[
                  'w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl',
                  'text-sm font-semibold text-white tracking-wide',
                  'bg-primary-500 hover:bg-primary-600 active:bg-primary-700',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                  'disabled:opacity-60 disabled:cursor-not-allowed',
                  'transition-all duration-200 shadow-sm hover:shadow-md',
                ].join(' ')}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Register link */}
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Don&apos;t have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Create one
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Sun,
  Moon,
  BookOpen,
  School,
  MapPin,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import type { UserRole } from '../../types';

interface FormValues {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  schoolName: string;
  district: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  schoolName?: string;
  district?: string;
}

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'individual', label: 'Individual' },
  { value: 'school', label: 'School' },
  { value: 'representative', label: 'Representative' },
  { value: 'admin', label: 'Admin' },
];

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.fullName.trim()) {
    errors.fullName = 'Full name is required.';
  } else if (values.fullName.trim().length < 2) {
    errors.fullName = 'Name must be at least 2 characters.';
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!values.phone.trim()) {
    errors.phone = 'Phone number is required.';
  } else if (!/^[6-9]\d{9}$/.test(values.phone.replace(/\s/g, ''))) {
    errors.phone = 'Enter a valid 10-digit Indian phone number.';
  }

  if (!values.password) {
    errors.password = 'Password is required.';
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (values.role === 'school') {
    if (!values.schoolName.trim()) {
      errors.schoolName = 'School name is required.';
    }
    if (!values.district.trim()) {
      errors.district = 'District is required.';
    }
  }

  return errors;
}

const INITIAL: FormValues = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: 'individual',
  schoolName: '',
  district: '',
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();
  const { isDark, toggle } = useThemeStore();

  const [values, setValues] = useState<FormValues>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (field: keyof FormValues, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (touched[field]) {
      setErrors(validate(next));
    }
  };

  const handleBlur = (field: keyof FormValues) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(values));
  };

  const hasError = (field: keyof FormValues) => touched[field] && !!(errors as Record<string, string | undefined>)[field];

  const inputClass = (field: keyof FormErrors) =>
    [
      'w-full py-2.5 rounded-xl border text-sm transition-colors duration-200',
      'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
      'placeholder:text-gray-400 dark:placeholder:text-gray-500',
      'focus:outline-none focus:ring-2 focus:border-transparent',
      hasError(field as keyof FormValues)
        ? 'border-danger-500 dark:border-danger-400 focus:ring-danger-400'
        : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500',
    ].join(' ');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    // Mark all fields touched
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Partial<Record<keyof FormValues, boolean>>,
    );
    setTouched(allTouched);

    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      // Mock register — use login to set auth state
      login(values.email, values.password, values.role);
      navigate('/app/dashboard');
    } catch {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col items-center justify-center p-12 bg-gradient-to-br from-primary-600 via-primary-500 to-info-500">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-info-400/20 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary-700/20 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center gap-8 max-w-sm">
          {/* Logo */}
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm shadow-2xl border border-white/20">
            <BookOpen className="w-10 h-10 text-white" />
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
              Samba Publications
            </h1>
            <p className="mt-3 text-base text-white/80 font-medium">
              Quality Education for Every Student
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full mt-2">
            {[
              'Create your account in minutes',
              'Access tailored content for your role',
              'Join thousands of satisfied educators',
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10"
              >
                <ChevronRight className="w-4 h-4 text-secondary-300 shrink-0" />
                <span className="text-sm text-white/90 text-left">{item}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-white/50 mt-4">
            &copy; {new Date().getFullYear()} Samba Publications. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Samba Publications
            </span>
          </div>
          <div className="hidden lg:block" />

          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 shadow-sm"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-start justify-center px-6 py-6">
          <div className="w-full max-w-lg">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create your account
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Fill in the details below to get started
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Role selector */}
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  I am a…
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 dark:text-gray-500">
                    <UserCheck className="w-4 h-4" />
                  </span>
                  <select
                    id="role"
                    value={values.role}
                    onChange={(e) => handleChange('role', e.target.value as UserRole)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none transition-colors duration-200 cursor-pointer"
                  >
                    {roleOptions.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 dark:text-gray-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 dark:text-gray-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    value={values.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    onBlur={() => handleBlur('fullName')}
                    placeholder="John Doe"
                    className={`${inputClass('fullName')} pl-10 pr-4`}
                  />
                </div>
                {hasError('fullName') && (
                  <p className="mt-1 text-xs text-danger-500 dark:text-danger-400">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 dark:text-gray-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder="you@example.com"
                    className={`${inputClass('email')} pl-10 pr-4`}
                  />
                </div>
                {hasError('email') && (
                  <p className="mt-1 text-xs text-danger-500 dark:text-danger-400">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 dark:text-gray-500">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    value={values.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    onBlur={() => handleBlur('phone')}
                    placeholder="9876543210"
                    className={`${inputClass('phone')} pl-10 pr-4`}
                  />
                </div>
                {hasError('phone') && (
                  <p className="mt-1 text-xs text-danger-500 dark:text-danger-400">{errors.phone}</p>
                )}
              </div>

              {/* School-specific fields */}
              {values.role === 'school' && (
                <div className="space-y-5 p-4 rounded-xl bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800">
                  <div className="flex items-center gap-2 mb-1">
                    <School className="w-4 h-4 text-accent-600 dark:text-accent-400" />
                    <span className="text-sm font-semibold text-accent-700 dark:text-accent-300">
                      School Details
                    </span>
                  </div>

                  {/* School Name */}
                  <div>
                    <label
                      htmlFor="schoolName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                    >
                      School Name
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 dark:text-gray-500">
                        <School className="w-4 h-4" />
                      </span>
                      <input
                        id="schoolName"
                        type="text"
                        value={values.schoolName}
                        onChange={(e) => handleChange('schoolName', e.target.value)}
                        onBlur={() => handleBlur('schoolName')}
                        placeholder="St. Mary's Higher Secondary School"
                        className={`${inputClass('schoolName')} pl-10 pr-4`}
                      />
                    </div>
                    {hasError('schoolName') && (
                      <p className="mt-1 text-xs text-danger-500 dark:text-danger-400">
                        {errors.schoolName}
                      </p>
                    )}
                  </div>

                  {/* District */}
                  <div>
                    <label
                      htmlFor="district"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                    >
                      District
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 dark:text-gray-500">
                        <MapPin className="w-4 h-4" />
                      </span>
                      <input
                        id="district"
                        type="text"
                        value={values.district}
                        onChange={(e) => handleChange('district', e.target.value)}
                        onBlur={() => handleBlur('district')}
                        placeholder="Chennai"
                        className={`${inputClass('district')} pl-10 pr-4`}
                      />
                    </div>
                    {hasError('district') && (
                      <p className="mt-1 text-xs text-danger-500 dark:text-danger-400">
                        {errors.district}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 dark:text-gray-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={values.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    placeholder="Minimum 8 characters"
                    className={`${inputClass('password')} pl-10 pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {hasError('password') && (
                  <p className="mt-1 text-xs text-danger-500 dark:text-danger-400">{errors.password}</p>
                )}
                {/* Password strength indicator */}
                {values.password && !hasError('password') && (
                  <div className="mt-2 flex gap-1">
                    {[...Array(4)].map((_, i) => {
                      const strength =
                        values.password.length >= 12 ? 4
                        : values.password.length >= 10 ? 3
                        : values.password.length >= 8 ? 2
                        : 1;
                      return (
                        <div
                          key={i}
                          className={[
                            'h-1 flex-1 rounded-full transition-all duration-300',
                            i < strength
                              ? strength === 4
                                ? 'bg-accent-500'
                                : strength === 3
                                  ? 'bg-secondary-400'
                                  : strength === 2
                                    ? 'bg-secondary-300'
                                    : 'bg-danger-400'
                              : 'bg-gray-200 dark:bg-gray-700',
                          ].join(' ')}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 dark:text-gray-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={values.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    placeholder="Re-enter your password"
                    className={`${inputClass('confirmPassword')} pl-10 pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {hasError('confirmPassword') && (
                  <p className="mt-1 text-xs text-danger-500 dark:text-danger-400">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit error */}
              {submitError && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-danger-50 dark:bg-danger-900/30 border border-danger-200 dark:border-danger-700">
                  <span className="text-sm text-danger-600 dark:text-danger-400">{submitError}</span>
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
                    Creating Account…
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              {/* Login link */}
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 pb-4">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

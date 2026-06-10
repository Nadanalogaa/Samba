import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ArrowRight,
  Package,
  CheckCircle2,
  Truck,
  XCircle,
  Sparkles,
  GraduationCap,
  Star,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { bookService, orderService } from '../../services/api';
import BookCard from '../../components/BookCard';
import { useCartStore } from '../../store/cartStore';
import type { Book, Order } from '../../types';

type OrderStatus = Order['status'];

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  placed: { label: 'Placed', bg: 'bg-info-100 dark:bg-info-900/40', text: 'text-info-700 dark:text-info-300', icon: <Package size={12} /> },
  confirmed: { label: 'Confirmed', bg: 'bg-secondary-100 dark:bg-secondary-900/40', text: 'text-secondary-700 dark:text-secondary-300', icon: <CheckCircle2 size={12} /> },
  shipped: { label: 'Shipped', bg: 'bg-primary-100 dark:bg-primary-900/40', text: 'text-primary-700 dark:text-primary-300', icon: <Truck size={12} /> },
  delivered: { label: 'Delivered', bg: 'bg-accent-100 dark:bg-accent-900/40', text: 'text-accent-700 dark:text-accent-300', icon: <CheckCircle2 size={12} /> },
  cancelled: { label: 'Cancelled', bg: 'bg-danger-100 dark:bg-danger-900/40', text: 'text-danger-700 dark:text-danger-300', icon: <XCircle size={12} /> },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

const CLASS_COLORS = [
  'bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800',
  'bg-secondary-50 text-secondary-700 border-secondary-200 hover:bg-secondary-100 dark:bg-secondary-900/30 dark:text-secondary-300 dark:border-secondary-800',
  'bg-accent-50 text-accent-700 border-accent-200 hover:bg-accent-100 dark:bg-accent-900/30 dark:text-accent-300 dark:border-accent-800',
  'bg-info-50 text-info-700 border-info-200 hover:bg-info-100 dark:bg-info-900/30 dark:text-info-300 dark:border-info-800',
  'bg-danger-50 text-danger-700 border-danger-200 hover:bg-danger-100 dark:bg-danger-900/30 dark:text-danger-300 dark:border-danger-800',
];

const POPULAR_SUBJECTS = [
  { name: 'Mathematics', color: 'bg-primary-500', light: 'bg-primary-50 dark:bg-primary-900/30', text: 'text-primary-700 dark:text-primary-300' },
  { name: 'Science', color: 'bg-accent-500', light: 'bg-accent-50 dark:bg-accent-900/30', text: 'text-accent-700 dark:text-accent-300' },
  { name: 'English', color: 'bg-info-500', light: 'bg-info-50 dark:bg-info-900/30', text: 'text-info-700 dark:text-info-300' },
  { name: 'Tamil', color: 'bg-secondary-500', light: 'bg-secondary-50 dark:bg-secondary-900/30', text: 'text-secondary-700 dark:text-secondary-300' },
  { name: 'Social Science', color: 'bg-danger-500', light: 'bg-danger-50 dark:bg-danger-900/30', text: 'text-danger-700 dark:text-danger-300' },
  { name: 'Hindi', color: 'bg-primary-400', light: 'bg-primary-50 dark:bg-primary-900/30', text: 'text-primary-600 dark:text-primary-300' },
];

export default function IndividualDashboard() {
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      bookService.getAll(),
      user ? orderService.getByUser(user.id) : Promise.resolve([]),
    ]).then(([allBooks, userOrders]) => {
      const shuffled = [...allBooks].sort(() => 0.5 - Math.random());
      setFeaturedBooks(shuffled.slice(0, 4));
      setOrders(userOrders);
      setLoading(false);
    });
  }, [user]);

  const classes = bookService.getClasses();
  const recentOrders = [...orders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6 space-y-8">
      {/* Welcome hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-info-600 dark:from-primary-800 dark:via-primary-700 dark:to-info-800 rounded-2xl p-8 text-white shadow-xl">
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -left-6 w-32 h-32 rounded-full bg-white/10" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-secondary-300" />
            <span className="text-primary-200 text-sm font-medium">Your Learning Hub</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-primary-200 text-sm mb-6 max-w-md">
            Quality textbooks aligned with the Tamil Nadu curriculum. Find books by class, subject, or term.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/app/catalog"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors duration-200 shadow-sm text-sm"
            >
              <BookOpen size={16} />
              Browse Catalog
            </Link>
            <Link
              to="/app/orders"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl transition-colors duration-200 text-sm"
            >
              My Orders
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Books */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star size={18} className="text-secondary-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Featured Books</h2>
          </div>
          <Link
            to="/app/catalog"
            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[5/7] bg-gray-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredBooks.map((book) => (
              <BookCard key={book.id} book={book} onAddToCart={() => addItem(book)} />
            ))}
          </div>
        )}
      </div>

      {/* Browse by Class */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap size={18} className="text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Browse by Class</h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {classes.map((cls, i) => (
            <Link
              key={cls}
              to={`/app/catalog?class=${encodeURIComponent(cls)}`}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border font-semibold text-sm transition-colors duration-150 ${CLASS_COLORS[i % CLASS_COLORS.length]}`}
            >
              <span className="text-xs opacity-60 mb-0.5">Class</span>
              {cls}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders + Popular Subjects side by side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
            <Link to="/app/orders" className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline">
              View all
            </Link>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-400 dark:text-slate-500 text-sm">Loading…</div>
          ) : recentOrders.length === 0 ? (
            <div className="p-10 text-center">
              <Package size={36} className="mx-auto text-gray-300 dark:text-slate-600 mb-3" />
              <p className="text-gray-500 dark:text-slate-400 text-sm">No orders yet. Your order history will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors duration-150"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono font-semibold text-sm text-primary-600 dark:text-primary-400">
                        {order.id}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''} &middot;{' '}
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">
                        ₹{order.totalAmount.toLocaleString('en-IN')}
                      </p>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Popular Subjects */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Popular Subjects</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Tap to explore books by subject</p>
          </div>
          <div className="p-6 grid grid-cols-2 gap-3">
            {POPULAR_SUBJECTS.map((subject) => (
              <Link
                key={subject.name}
                to={`/app/catalog?subject=${encodeURIComponent(subject.name)}`}
                className={`flex items-center gap-3 p-3.5 rounded-xl ${subject.light} border border-transparent hover:border-current transition-all duration-150 group`}
              >
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${subject.color}`} />
                <span className={`text-sm font-semibold ${subject.text}`}>{subject.name}</span>
                <ArrowRight
                  size={14}
                  className={`ml-auto opacity-0 group-hover:opacity-100 transition-opacity ${subject.text}`}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

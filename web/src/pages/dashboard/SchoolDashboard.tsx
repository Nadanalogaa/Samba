import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  IndianRupee,
  BookOpen,
  Clock,
  Package,
  CheckCircle2,
  Truck,
  XCircle,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { orderService } from '../../services/api';
import type { Order } from '../../types';

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

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  borderColor: string;
}

function StatCard({ label, value, icon, iconBg, borderColor }: StatCardProps) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border-l-4 ${borderColor} border border-gray-100 dark:border-slate-700 p-5 hover:shadow-md transition-shadow duration-200`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white ${iconBg} mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 font-medium">{label}</p>
    </div>
  );
}

export default function SchoolDashboard() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getAll().then((all) => {
      // Show orders belonging to this school
      const schoolOrders = all.filter(
        (o) => o.schoolId === user?.id || o.userId === user?.id
      );
      setOrders(schoolOrders);
      setLoading(false);
    });
  }, [user]);

  const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalBooks = orders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
    0
  );
  const activeOrders = orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  ).length;

  const recentOrders = [...orders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  // Quick reorder: unique items from past delivered orders
  const reorderItems = orders
    .filter((o) => o.status === 'delivered')
    .flatMap((o) => o.items)
    .reduce<{ bookId: string; title: string; price: number }[]>((acc, item) => {
      if (!acc.find((i) => i.bookId === item.bookId)) {
        acc.push({ bookId: item.bookId, title: item.title, price: item.price });
      }
      return acc;
    }, [])
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6 space-y-8">
      {/* School header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400 font-medium mb-0.5">School Portal</p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user?.schoolName ?? 'School Dashboard'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Manage your textbook orders and track delivery status.
            </p>
          </div>
          <Link
            to="/app/catalog"
            className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm shadow-sm transition-colors duration-200"
          >
            <BookOpen size={16} />
            Browse Catalog
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Orders"
          value={loading ? '—' : orders.length}
          icon={<ShoppingCart size={20} />}
          iconBg="bg-primary-500"
          borderColor="border-l-primary-500"
        />
        <StatCard
          label="Total Spent"
          value={loading ? '—' : `₹${totalSpent.toLocaleString('en-IN')}`}
          icon={<IndianRupee size={20} />}
          iconBg="bg-accent-500"
          borderColor="border-l-accent-500"
        />
        <StatCard
          label="Books Ordered"
          value={loading ? '—' : totalBooks}
          icon={<BookOpen size={20} />}
          iconBg="bg-info-500"
          borderColor="border-l-info-500"
        />
        <StatCard
          label="Active Orders"
          value={loading ? '—' : activeOrders}
          icon={<Clock size={20} />}
          iconBg="bg-secondary-500"
          borderColor="border-l-secondary-500"
        />
      </div>

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
              <BookOpen size={36} className="mx-auto text-gray-300 dark:text-slate-600 mb-3" />
              <p className="text-gray-500 dark:text-slate-400 text-sm">No orders yet. Start by browsing the catalog.</p>
              <Link
                to="/app/catalog"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
              >
                Browse Catalog
              </Link>
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

        {/* Quick Reorder + Catalog CTA */}
        <div className="space-y-4">
          {/* Quick Reorder */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center gap-2">
              <RefreshCw size={16} className="text-accent-500" />
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Quick Reorder</h2>
            </div>
            {reorderItems.length === 0 ? (
              <p className="px-6 py-5 text-sm text-gray-500 dark:text-slate-400">
                Previous delivered orders will appear here for quick reordering.
              </p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-slate-700">
                {reorderItems.map((item) => (
                  <div
                    key={item.bookId}
                    className="px-6 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors duration-150"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                        ₹{item.price} per copy
                      </p>
                    </div>
                    <Link
                      to={`/app/books/${item.bookId}`}
                      className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                    >
                      Reorder
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Catalog CTA */}
          <div className="bg-gradient-to-br from-primary-500 to-info-600 dark:from-primary-700 dark:to-info-700 rounded-xl p-6 text-white shadow-md">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Explore the Full Catalog</h3>
                <p className="text-primary-100 text-sm mt-1 mb-4">
                  Browse all textbooks by class, subject, and term. Place bulk orders for your school.
                </p>
                <Link
                  to="/app/catalog"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-primary-600 font-semibold text-sm hover:bg-primary-50 transition-colors duration-200 shadow-sm"
                >
                  Browse Now
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

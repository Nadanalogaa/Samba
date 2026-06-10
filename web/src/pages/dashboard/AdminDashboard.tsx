import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  IndianRupee,
  BookOpen,
  Clock,
  Plus,
  UserPlus,
  BarChart3,
  TrendingUp,
  Package,
  CheckCircle2,
  Truck,
  XCircle,
} from 'lucide-react';
import { orderService } from '../../services/api';
import { books } from '../../services/mockData';
import type { Order } from '../../types';

type OrderStatus = Order['status'];

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  placed: {
    label: 'Placed',
    bg: 'bg-info-100 dark:bg-info-900/40',
    text: 'text-info-700 dark:text-info-300',
    icon: <Package size={12} />,
  },
  confirmed: {
    label: 'Confirmed',
    bg: 'bg-secondary-100 dark:bg-secondary-900/40',
    text: 'text-secondary-700 dark:text-secondary-300',
    icon: <CheckCircle2 size={12} />,
  },
  shipped: {
    label: 'Shipped',
    bg: 'bg-primary-100 dark:bg-primary-900/40',
    text: 'text-primary-700 dark:text-primary-300',
    icon: <Truck size={12} />,
  },
  delivered: {
    label: 'Delivered',
    bg: 'bg-accent-100 dark:bg-accent-900/40',
    text: 'text-accent-700 dark:text-accent-300',
    icon: <CheckCircle2 size={12} />,
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-danger-100 dark:bg-danger-900/40',
    text: 'text-danger-700 dark:text-danger-300',
    icon: <XCircle size={12} />,
  },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}
    >
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
  trend?: string;
}

function StatCard({ label, value, icon, iconBg, trend }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 flex items-start gap-4 hover:shadow-md transition-shadow duration-200">
      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
        {trend && (
          <p className="text-xs text-accent-600 dark:text-accent-400 mt-1 flex items-center gap-1">
            <TrendingUp size={11} />
            {trend}
          </p>
        )}
      </div>
    </div>
  );
}

// Compute subject-level sales from books mock (simulate top-selling by price sum)
function getTopClasses() {
  const classMap: Record<string, number> = {};
  books.forEach((b) => {
    classMap[b.class] = (classMap[b.class] || 0) + b.price;
  });
  const entries = Object.entries(classMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const max = entries[0]?.[1] ?? 1;
  return entries.map(([cls, total]) => ({ cls, total, pct: Math.round((total / max) * 100) }));
}

const BAR_COLORS = [
  'bg-primary-500',
  'bg-secondary-500',
  'bg-accent-500',
  'bg-info-500',
  'bg-danger-500',
  'bg-primary-300',
];

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getAll().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrders = orders.filter((o) => o.status === 'placed' || o.status === 'confirmed').length;
  const recentOrders = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const topClasses = getTopClasses();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Welcome back — here's what's happening at Samba Publications.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/app/books/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold shadow-sm transition-colors duration-200"
          >
            <Plus size={16} />
            Add Book
          </Link>
          <Link
            to="/app/reps/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-white text-sm font-semibold shadow-sm transition-colors duration-200"
          >
            <UserPlus size={16} />
            Add Rep
          </Link>
          <Link
            to="/app/reports"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold shadow-sm transition-colors duration-200"
          >
            <BarChart3 size={16} />
            Reports
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Orders"
          value={loading ? '—' : orders.length}
          icon={<ShoppingCart size={22} />}
          iconBg="bg-primary-500"
          trend="+12% this month"
        />
        <StatCard
          label="Total Revenue"
          value={loading ? '—' : `₹${totalRevenue.toLocaleString('en-IN')}`}
          icon={<IndianRupee size={22} />}
          iconBg="bg-secondary-500"
          trend="+8% this month"
        />
        <StatCard
          label="Total Books"
          value={books.length}
          icon={<BookOpen size={22} />}
          iconBg="bg-accent-500"
        />
        <StatCard
          label="Pending Orders"
          value={loading ? '—' : pendingOrders}
          icon={<Clock size={22} />}
          iconBg="bg-danger-500"
          trend="Needs attention"
        />
      </div>

      {/* Main grid: orders + chart */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders table */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
            <Link
              to="/app/orders"
              className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400 dark:text-slate-500 text-sm">Loading orders…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-700/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      School
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors duration-150"
                    >
                      <td className="px-6 py-3.5 font-mono font-semibold text-primary-600 dark:text-primary-400">
                        {order.id}
                      </td>
                      <td className="px-6 py-3.5 text-gray-700 dark:text-slate-300 max-w-[180px] truncate">
                        {order.schoolName ?? '—'}
                      </td>
                      <td className="px-6 py-3.5 text-right font-semibold text-gray-900 dark:text-white">
                        ₹{order.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-3.5 text-gray-500 dark:text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Selling Classes chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Top Selling Classes</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">By catalogue value</p>
          </div>
          <div className="px-6 py-5 space-y-4">
            {topClasses.map(({ cls, total, pct }, i) => (
              <div key={cls} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-gray-700 dark:text-slate-300">Class {cls}</span>
                  <span className="text-gray-500 dark:text-slate-400">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

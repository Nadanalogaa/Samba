import {
  IndianRupee,
  ShoppingCart,
  BookOpen,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  Truck,
  XCircle,
  Clock,
  CalendarDays,
} from 'lucide-react';
import { orders, schools, representatives } from '../../services/mockData';

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

// Compute revenue by district from orders + schools
function getRevenueByDistrict() {
  const districtRevenue: Record<string, number> = {};

  // Map schoolId to district
  const schoolDistrict: Record<string, string> = {};
  schools.forEach((s) => { schoolDistrict[s.id] = s.district; });

  orders.forEach((o) => {
    const district = o.schoolId ? schoolDistrict[o.schoolId] || 'Other' : 'Individual';
    districtRevenue[district] = (districtRevenue[district] || 0) + o.totalAmount;
  });

  // Also add rep revenue for districts not in orders
  representatives.forEach((r) => {
    if (!districtRevenue[r.district]) {
      districtRevenue[r.district] = r.revenue;
    }
  });

  const entries = Object.entries(districtRevenue).sort((a, b) => b[1] - a[1]);
  const max = entries[0]?.[1] ?? 1;
  return entries.map(([district, revenue]) => ({ district, revenue, pct: Math.round((revenue / max) * 100) }));
}

// Top selling books (by total quantity ordered)
function getTopSellingBooks() {
  const bookQty: Record<string, { title: string; qty: number; revenue: number }> = {};

  orders.forEach((o) => {
    o.items.forEach((item) => {
      if (!bookQty[item.bookId]) {
        bookQty[item.bookId] = { title: item.title, qty: 0, revenue: 0 };
      }
      bookQty[item.bookId].qty += item.quantity;
      bookQty[item.bookId].revenue += item.price * item.quantity;
    });
  });

  return Object.entries(bookQty)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);
}

// Order status distribution
function getStatusDistribution() {
  const counts: Record<string, number> = { placed: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 };
  orders.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });
  return counts;
}

// Mock monthly trend
const monthlyTrend = [
  { month: 'Oct 2025', orders: 18, revenue: 145000 },
  { month: 'Nov 2025', orders: 22, revenue: 178000 },
  { month: 'Dec 2025', orders: 15, revenue: 125000 },
  { month: 'Jan 2026', orders: 28, revenue: 215000 },
  { month: 'Feb 2026', orders: 25, revenue: 198000 },
  { month: 'Mar 2026', orders: 32, revenue: 265000 },
];

const BAR_COLORS = [
  'bg-primary-500',
  'bg-secondary-500',
  'bg-accent-500',
  'bg-info-500',
  'bg-danger-500',
  'bg-primary-400',
  'bg-secondary-400',
  'bg-accent-400',
];

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; bg: string; text: string }> = {
  placed: { label: 'Placed', icon: <Clock size={14} />, bg: 'bg-info-100 dark:bg-info-900/40', text: 'text-info-700 dark:text-info-300' },
  confirmed: { label: 'Confirmed', icon: <CheckCircle2 size={14} />, bg: 'bg-secondary-100 dark:bg-secondary-900/40', text: 'text-secondary-700 dark:text-secondary-300' },
  shipped: { label: 'Shipped', icon: <Truck size={14} />, bg: 'bg-primary-100 dark:bg-primary-900/40', text: 'text-primary-700 dark:text-primary-300' },
  delivered: { label: 'Delivered', icon: <CheckCircle2 size={14} />, bg: 'bg-accent-100 dark:bg-accent-900/40', text: 'text-accent-700 dark:text-accent-300' },
  cancelled: { label: 'Cancelled', icon: <XCircle size={14} />, bg: 'bg-danger-100 dark:bg-danger-900/40', text: 'text-danger-700 dark:text-danger-300' },
};

export default function ReportsPage() {
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = orders.length;
  const totalBooksSold = orders.reduce((sum, o) => o.items.reduce((s, i) => s + i.quantity, 0) + sum, 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const districtRevenue = getRevenueByDistrict();
  const topBooks = getTopSellingBooks();
  const statusDist = getStatusDistribution();

  const maxMonthlyRevenue = Math.max(...monthlyTrend.map((m) => m.revenue));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Overview of sales, orders, and business performance.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-gray-600 dark:text-slate-300">
          <CalendarDays size={15} />
          Oct 2025 - Mar 2026
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} icon={<IndianRupee size={22} />} iconBg="bg-secondary-500" trend="+18% vs last period" />
        <StatCard label="Total Orders" value={totalOrders} icon={<ShoppingCart size={22} />} iconBg="bg-primary-500" trend="+12% vs last period" />
        <StatCard label="Books Sold" value={totalBooksSold.toLocaleString('en-IN')} icon={<BookOpen size={22} />} iconBg="bg-accent-500" />
        <StatCard label="Avg Order Value" value={`₹${avgOrderValue.toLocaleString('en-IN')}`} icon={<BarChart3 size={22} />} iconBg="bg-info-500" />
      </div>

      {/* Revenue by District + Order Status */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue by District */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Revenue by District</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Based on order and representative data</p>
          </div>
          <div className="px-6 py-5 space-y-4">
            {districtRevenue.map(({ district, revenue, pct }, i) => (
              <div key={district} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700 dark:text-slate-300">{district}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">₹{revenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-3 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Order Status</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Distribution across all orders</p>
          </div>
          <div className="px-6 py-5 space-y-3">
            {Object.entries(statusDist).map(([status, count]) => {
              const cfg = STATUS_CONFIG[status];
              if (!cfg) return null;
              return (
                <div key={status} className={`flex items-center justify-between p-3 rounded-xl ${cfg.bg}`}>
                  <div className={`flex items-center gap-2.5 ${cfg.text}`}>
                    {cfg.icon}
                    <span className="text-sm font-semibold">{cfg.label}</span>
                  </div>
                  <span className={`text-lg font-bold ${cfg.text}`}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Selling Books */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Top Selling Books</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Ranked by quantity ordered</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-700/50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Book ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Qty Sold</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {topBooks.map((book, idx) => (
                <tr key={book.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors duration-150">
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white ${
                      idx === 0 ? 'bg-secondary-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-amber-700' : 'bg-gray-300 dark:bg-slate-600 text-gray-600 dark:text-slate-300'
                    }`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 font-mono text-primary-600 dark:text-primary-400 text-xs">{book.id}</td>
                  <td className="px-6 py-3.5 font-medium text-gray-900 dark:text-white">{book.title}</td>
                  <td className="px-6 py-3.5 text-right font-semibold text-gray-900 dark:text-white">{book.qty.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-3.5 text-right font-semibold text-gray-900 dark:text-white">₹{book.revenue.toLocaleString('en-IN')}</td>
                </tr>
              ))}
              {topBooks.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500">
                    No order data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Monthly Trend</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Last 6 months performance</p>
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {monthlyTrend.map((m) => {
              const barHeight = Math.round((m.revenue / maxMonthlyRevenue) * 100);
              return (
                <div key={m.month} className="flex flex-col items-center gap-2">
                  {/* Bar */}
                  <div className="w-full h-32 bg-gray-100 dark:bg-slate-700 rounded-xl overflow-hidden flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-xl transition-all duration-700"
                      style={{ height: `${barHeight}%` }}
                    />
                  </div>
                  {/* Label */}
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">{m.month}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{m.orders} orders</p>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">₹{(m.revenue / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

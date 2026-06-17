import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Users,
  BookOpen,
  Plus,
  ShoppingCart,
  AlertCircle,
  TrendingUp,
  IndianRupee,
  Clock,
} from 'lucide-react';
import { reportApi } from '../../services/cashBillApi';

interface DashboardData {
  today_bills: number;
  today_amount: number;
  pending_proformas: number;
  pending_amount: number;
  total_customers: number;
  total_books: number;
  monthly_trend: { month: string; count: number; amount: number }[];
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
    <div
      className="rounded-2xl shadow-sm border p-5 flex items-start gap-4 hover:shadow-md transition-shadow duration-200"
      style={{
        backgroundColor: 'var(--theme-surface, #ffffff)',
        borderColor: 'var(--theme-border, #e5e7eb)',
      }}
    >
      <div
        className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white ${iconBg}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: 'var(--theme-text-muted, #6b7280)' }}>
          {label}
        </p>
        <p className="text-2xl font-bold mt-0.5" style={{ color: 'var(--theme-text, #1f2937)' }}>
          {value}
        </p>
        {trend && (
          <p className="text-xs text-accent-600 mt-1 flex items-center gap-1">
            <TrendingUp size={11} />
            {trend}
          </p>
        )}
      </div>
    </div>
  );
}

export default function CashDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reportApi.dashboard();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm" style={{ color: 'var(--theme-text-muted, #6b7280)' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-danger-50 border border-danger-200">
          <AlertCircle size={18} className="text-danger-500" />
          <span className="text-sm text-danger-600">{error}</span>
          <button
            onClick={loadDashboard}
            className="ml-auto text-sm font-medium text-danger-600 hover:text-danger-700 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--theme-text, #1f2937)' }}>
            Dashboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--theme-text-muted, #6b7280)' }}>
            Cash Bill overview for today
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard
          label="Today's Bills"
          value={data?.today_bills ?? 0}
          icon={<FileText size={22} />}
          iconBg="bg-primary-500"
        />
        <StatCard
          label="Today's Amount"
          value={`\u20B9${(data?.today_amount ?? 0).toLocaleString('en-IN')}`}
          icon={<IndianRupee size={22} />}
          iconBg="bg-secondary-500"
        />
        <StatCard
          label="Pending Proformas"
          value={data?.pending_proformas ?? 0}
          icon={<Clock size={22} />}
          iconBg="bg-danger-500"
        />
        <StatCard
          label="Total Customers"
          value={data?.total_customers ?? 0}
          icon={<Users size={22} />}
          iconBg="bg-accent-500"
        />
        <StatCard
          label="Total Books"
          value={data?.total_books ?? 0}
          icon={<BookOpen size={22} />}
          iconBg="bg-info-500"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Monthly Trend — SVG area chart */}
        <div
          className="xl:col-span-2 rounded-2xl shadow-sm border overflow-hidden"
          style={{ backgroundColor: 'var(--theme-surface, #ffffff)', borderColor: 'var(--theme-border, #e5e7eb)' }}
        >
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--theme-border, #e5e7eb)' }}>
            <div>
              <h2 className="text-base font-semibold" style={{ color: 'var(--theme-text, #1f2937)' }}>Monthly Revenue Trend</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--theme-text-muted, #9ca3af)' }}>Financial year overview</p>
            </div>
            <TrendingUp size={18} className="text-primary-400" />
          </div>
          <div className="px-6 py-5">
            {(() => {
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              const trend = data?.monthly_trend || [];

              // Build 12-month dataset (fill missing months with 0)
              const monthData = monthNames.map((name, i) => {
                const match = trend.find(t => {
                  const d = new Date(t.month);
                  return d.getMonth() === i;
                });
                return { name, amount: match ? Number(match.amount) : 0, count: match ? Number(match.count) : 0 };
              });

              const maxVal = Math.max(...monthData.map(m => m.amount), 1);
              const W = 600, H = 200, padL = 50, padR = 10, padT = 20, padB = 30;
              const chartW = W - padL - padR;
              const chartH = H - padT - padB;

              // Generate points for the line/area
              const points = monthData.map((m, i) => {
                const x = padL + (i / 11) * chartW;
                const y = padT + chartH - (m.amount / maxVal) * chartH;
                return { x, y, ...m };
              });

              const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
              const areaPath = linePath + ` L${points[11].x},${padT + chartH} L${points[0].x},${padT + chartH} Z`;

              // Y-axis grid lines
              const yTicks = 4;
              const gridLines = Array.from({ length: yTicks + 1 }, (_, i) => {
                const val = (maxVal / yTicks) * i;
                const y = padT + chartH - (i / yTicks) * chartH;
                return { val, y };
              });

              const hasData = trend.length > 0;

              return (
                <div className="relative">
                  <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 'auto', maxHeight: '240px' }}>
                    {/* Grid lines */}
                    {gridLines.map((g, i) => (
                      <g key={i}>
                        <line x1={padL} y1={g.y} x2={W - padR} y2={g.y} stroke="var(--theme-border, #e5e7eb)" strokeWidth="0.5" strokeDasharray={i === 0 ? '' : '4,4'} />
                        <text x={padL - 6} y={g.y + 3} textAnchor="end" fontSize="8" fill="var(--theme-text-muted, #9ca3af)" fontFamily="Inter, sans-serif">
                          {g.val >= 1000 ? `₹${(g.val / 1000).toFixed(0)}k` : `₹${g.val.toFixed(0)}`}
                        </text>
                      </g>
                    ))}

                    {/* Area gradient */}
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#1e3a5f" stopOpacity="0.02" />
                      </linearGradient>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#1e3a5f" />
                        <stop offset="50%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>

                    {/* Area fill */}
                    <path d={areaPath} fill="url(#areaGrad)" />

                    {/* Line */}
                    <path d={linePath} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Data dots */}
                    {points.map((p, i) => (
                      <g key={i}>
                        {p.amount > 0 && (
                          <>
                            <circle cx={p.x} cy={p.y} r="5" fill="white" stroke="#1e3a5f" strokeWidth="2" className="transition-all duration-200" />
                            <circle cx={p.x} cy={p.y} r="3" fill="#1e3a5f" />
                          </>
                        )}
                        {/* X-axis label */}
                        <text x={p.x} y={H - 6} textAnchor="middle" fontSize="8" fill={p.amount > 0 ? 'var(--theme-text, #1f2937)' : 'var(--theme-text-muted, #9ca3af)'} fontWeight={p.amount > 0 ? '600' : '400'} fontFamily="Inter, sans-serif">
                          {p.name}
                        </text>
                      </g>
                    ))}

                    {/* Hover tooltip dots — amount labels on top for non-zero */}
                    {points.filter(p => p.amount > 0).map((p, i) => (
                      <text key={i} x={p.x} y={p.y - 10} textAnchor="middle" fontSize="8" fontWeight="700" fill="#1e3a5f" fontFamily="Inter, sans-serif">
                        ₹{p.amount >= 1000 ? `${(p.amount / 1000).toFixed(1)}k` : p.amount.toFixed(0)}
                      </text>
                    ))}
                  </svg>

                  {!hasData && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl" style={{ backgroundColor: 'var(--theme-surface, #ffffff)', opacity: 0.85 }}>
                      <div className="text-center">
                        <TrendingUp size={32} className="mx-auto mb-2 text-primary-200" />
                        <p className="text-sm font-medium" style={{ color: 'var(--theme-text-muted, #6b7280)' }}>No billing data yet</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--theme-text-muted, #9ca3af)' }}>Create your first cash bill to see trends here</p>
                        <Link to="/cash-bill/new-order" className="inline-flex items-center gap-1 mt-3 px-4 py-2 rounded-lg bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-all">
                          <Plus size={12} /> Create First Order
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Legend */}
                  {hasData && (
                    <div className="flex items-center justify-center gap-6 mt-3 text-xs" style={{ color: 'var(--theme-text-muted, #6b7280)' }}>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-primary-500" />
                        <span>Revenue</span>
                      </div>
                      <span>Total: <strong className="text-primary-500">₹{monthData.reduce((s, m) => s + m.amount, 0).toLocaleString('en-IN')}</strong></span>
                      <span>Bills: <strong>{monthData.reduce((s, m) => s + m.count, 0)}</strong></span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className="rounded-2xl shadow-sm border overflow-hidden"
          style={{
            backgroundColor: 'var(--theme-surface, #ffffff)',
            borderColor: 'var(--theme-border, #e5e7eb)',
          }}
        >
          <div
            className="px-6 py-4 border-b"
            style={{ borderColor: 'var(--theme-border, #e5e7eb)' }}
          >
            <h2 className="text-base font-semibold" style={{ color: 'var(--theme-text, #1f2937)' }}>
              Quick Actions
            </h2>
          </div>
          <div className="p-6 space-y-3">
            <Link
              to="/cash-bill/new-order"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold shadow-sm transition-colors duration-200"
            >
              <ShoppingCart size={18} />
              Proforma Entry / Cash Bill
            </Link>
            <Link
              to="/cash-bill/rate-master"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 border-primary-500 text-primary-600 hover:bg-primary-50 text-sm font-semibold transition-colors duration-200"
            >
              <BookOpen size={18} />
              Rate Master
            </Link>
            <Link
              to="/cash-bill/customers"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 border-primary-500 text-primary-600 hover:bg-primary-50 text-sm font-semibold transition-colors duration-200"
            >
              <Users size={18} />
              Customer Master
            </Link>
            <Link
              to="/cash-bill/bills"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 border-accent-500 text-accent-600 hover:bg-accent-50 text-sm font-semibold transition-colors duration-200"
            >
              <Plus size={18} />
              View Bills
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

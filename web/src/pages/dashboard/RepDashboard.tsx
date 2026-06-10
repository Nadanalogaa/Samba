import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  School,
  Clock,
  IndianRupee,
  Plus,
  MapPin,
  Phone,
  User,
  Package,
  CheckCircle2,
  Truck,
  XCircle,
} from 'lucide-react';
import { orderService, schoolService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import type { Order, School as SchoolType } from '../../types';

type OrderStatus = Order['status'];

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  placed: { label: 'Placed', bg: 'bg-info-100 dark:bg-info-900/40', text: 'text-info-700 dark:text-info-300' },
  confirmed: { label: 'Confirmed', bg: 'bg-secondary-100 dark:bg-secondary-900/40', text: 'text-secondary-700 dark:text-secondary-300' },
  shipped: { label: 'Shipped', bg: 'bg-primary-100 dark:bg-primary-900/40', text: 'text-primary-700 dark:text-primary-300' },
  delivered: { label: 'Delivered', bg: 'bg-accent-100 dark:bg-accent-900/40', text: 'text-accent-700 dark:text-accent-300' },
  cancelled: { label: 'Cancelled', bg: 'bg-danger-100 dark:bg-danger-900/40', text: 'text-danger-700 dark:text-danger-300' },
};

const STATUS_ICONS: Record<OrderStatus, React.ReactNode> = {
  placed: <Package size={13} />,
  confirmed: <CheckCircle2 size={13} />,
  shipped: <Truck size={13} />,
  delivered: <CheckCircle2 size={13} />,
  cancelled: <XCircle size={13} />,
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {STATUS_ICONS[status]}
      {cfg.label}
    </span>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
}

function StatCard({ label, value, icon, colorClass, bgClass }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 hover:shadow-md transition-shadow duration-200">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${bgClass} mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className={`text-sm font-medium mt-1 ${colorClass}`}>{label}</p>
    </div>
  );
}

export default function RepDashboard() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [assignedSchools, setAssignedSchools] = useState<SchoolType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([orderService.getAll(), schoolService.getAll()]).then(
      ([allOrders, allSchools]) => {
        const repOrders = allOrders.filter(
          (o) => o.repId === user?.id || o.userId === user?.id
        );
        setOrders(repOrders);
        const repSchoolIds = user?.assignedSchools ?? [];
        setAssignedSchools(allSchools.filter((s) => repSchoolIds.includes(s.id)));
        setLoading(false);
      }
    );
  }, [user]);

  const pendingOrders = orders.filter(
    (o) => o.status === 'placed' || o.status === 'confirmed'
  ).length;

  const currentMonth = new Date().getMonth();
  const thisMonthRevenue = orders
    .filter((o) => new Date(o.createdAt).getMonth() === currentMonth)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const recentOrders = [...orders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6 space-y-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 dark:from-primary-700 dark:to-primary-900 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-primary-200 text-sm font-medium mb-1">Welcome back</p>
            <h1 className="text-2xl font-bold">Hello, {user?.name}!</h1>
            <div className="flex items-center gap-2 mt-2 text-primary-200 text-sm">
              <MapPin size={14} />
              <span>
                District:{' '}
                <span className="text-white font-semibold">{user?.district ?? 'Not assigned'}</span>
              </span>
            </div>
          </div>
          <Link
            to="/app/create-order"
            className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary-500 hover:bg-secondary-400 text-white font-semibold text-sm shadow-md transition-colors duration-200"
          >
            <Plus size={18} />
            Create New Order
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="My Orders"
          value={loading ? '—' : orders.length}
          icon={<ShoppingCart size={20} />}
          bgClass="bg-primary-500"
          colorClass="text-primary-600 dark:text-primary-400"
        />
        <StatCard
          label="Schools Assigned"
          value={loading ? '—' : assignedSchools.length}
          icon={<School size={20} />}
          bgClass="bg-accent-500"
          colorClass="text-accent-600 dark:text-accent-400"
        />
        <StatCard
          label="Pending Orders"
          value={loading ? '—' : pendingOrders}
          icon={<Clock size={20} />}
          bgClass="bg-danger-500"
          colorClass="text-danger-600 dark:text-danger-400"
        />
        <StatCard
          label="This Month Revenue"
          value={loading ? '—' : `₹${thisMonthRevenue.toLocaleString('en-IN')}`}
          icon={<IndianRupee size={20} />}
          bgClass="bg-secondary-500"
          colorClass="text-secondary-600 dark:text-secondary-400"
        />
      </div>

      {/* Schools + Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Assigned Schools */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Assigned Schools</h2>
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
              {assignedSchools.length} school{assignedSchools.length !== 1 ? 's' : ''}
            </span>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-400 dark:text-slate-500 text-sm">Loading…</div>
          ) : assignedSchools.length === 0 ? (
            <div className="p-8 text-center text-gray-400 dark:text-slate-500 text-sm">No schools assigned yet.</div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {assignedSchools.map((school) => (
                <div
                  key={school.id}
                  className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors duration-150"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{school.name}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                          <User size={11} />
                          {school.contactPerson}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                          <Phone size={11} />
                          {school.phone}
                        </span>
                      </div>
                    </div>
                    <span className="flex-shrink-0 text-xs font-medium text-accent-700 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/30 px-2.5 py-1 rounded-full border border-accent-200 dark:border-accent-800">
                      {school.district}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
            <div className="p-8 text-center text-gray-400 dark:text-slate-500 text-sm">No orders yet.</div>
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
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">
                        {order.schoolName ?? 'Direct order'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">
                        ₹{order.totalAmount.toLocaleString('en-IN')}
                      </p>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

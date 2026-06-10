import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  ChevronRight,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
} from 'lucide-react';
import { orderService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import type { Order, OrderStatus } from '../../types';

type TabFilter = 'all' | OrderStatus;

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    badge: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  placed: {
    label: 'Placed',
    badge:
      'bg-info-100 text-info-700 dark:bg-info-900/30 dark:text-info-400',
    icon: Clock,
  },
  confirmed: {
    label: 'Confirmed',
    badge:
      'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400',
    icon: CheckCircle,
  },
  shipped: {
    label: 'Shipped',
    badge:
      'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
    icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    badge:
      'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    badge:
      'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400',
    icon: XCircle,
  },
};

const TABS: { key: TabFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'placed', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function OrdersPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        let data: Order[];
        if (user?.role === 'admin') {
          data = await orderService.getAll();
        } else if (user) {
          data = await orderService.getByUser(user.id);
        } else {
          data = [];
        }
        // Sort newest first
        data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(data);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const filtered =
    activeTab === 'all'
      ? orders
      : orders.filter((o) => o.status === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            My Orders
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} total
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-900 rounded-xl mb-6 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
              {tab.key !== 'all' && (
                <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-600">
                  ({orders.filter((o) => o.status === tab.key).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 rounded-2xl h-28 animate-pulse border border-gray-100 dark:border-gray-800"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="mx-auto mb-5 w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {activeTab === 'all' ? 'No orders yet' : `No ${activeTab} orders`}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {activeTab === 'all'
                ? "You haven't placed any orders yet. Start exploring our catalog!"
                : `You don't have any orders with status "${activeTab}".`}
            </p>
            {activeTab === 'all' && (
              <button
                onClick={() => navigate('/catalog')}
                className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
              >
                Browse Books
              </button>
            )}
          </div>
        )}

        {/* Order Cards */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((order) => {
              const config = STATUS_CONFIG[order.status];
              const StatusIcon = config.icon;
              const totalItems = order.items.reduce(
                (sum, item) => sum + item.quantity,
                0
              );

              return (
                <button
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="w-full text-left bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-md transition-all duration-200 p-5 sm:p-6 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                            {order.id}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.badge}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                          </span>
                        </div>
                        {order.schoolName && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            School: {order.schoolName}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-gray-100">
                          ₹{order.totalAmount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {totalItems} {totalItems === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600 group-hover:text-primary-500 transition-colors" />
                    </div>
                  </div>

                  {/* Item preview */}
                  <div className="mt-3 pl-14">
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {order.items
                        .slice(0, 3)
                        .map((i) => i.title)
                        .join(', ')}
                      {order.items.length > 3 &&
                        ` +${order.items.length - 3} more`}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  School,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Package,
  BookOpen,
} from 'lucide-react';
import { orderService } from '../../services/api';
import type { Order, OrderStatus } from '../../types';

type TimelineStep = {
  status: OrderStatus;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  dotColor: string;
  lineColor: string;
};

const TIMELINE_STEPS: TimelineStep[] = [
  {
    status: 'placed',
    label: 'Order Placed',
    description: 'Your order has been received',
    icon: Clock,
    color: 'text-info-600 dark:text-info-400',
    dotColor: 'bg-info-500',
    lineColor: 'bg-info-300 dark:bg-info-700',
  },
  {
    status: 'confirmed',
    label: 'Order Confirmed',
    description: 'Your order has been confirmed',
    icon: CheckCircle,
    color: 'text-secondary-600 dark:text-secondary-400',
    dotColor: 'bg-secondary-500',
    lineColor: 'bg-secondary-300 dark:bg-secondary-700',
  },
  {
    status: 'shipped',
    label: 'Shipped',
    description: 'Your order is on its way',
    icon: Truck,
    color: 'text-primary-600 dark:text-primary-400',
    dotColor: 'bg-primary-500',
    lineColor: 'bg-primary-300 dark:bg-primary-700',
  },
  {
    status: 'delivered',
    label: 'Delivered',
    description: 'Your order has been delivered',
    icon: CheckCircle,
    color: 'text-accent-600 dark:text-accent-400',
    dotColor: 'bg-accent-500',
    lineColor: 'bg-accent-300 dark:bg-accent-700',
  },
];

const STATUS_ORDER: OrderStatus[] = ['placed', 'confirmed', 'shipped', 'delivered'];

const STATUS_BADGE: Record<OrderStatus, string> = {
  placed: 'bg-info-100 text-info-700 dark:bg-info-900/30 dark:text-info-400',
  confirmed: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400',
  shipped: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
  delivered: 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400',
  cancelled: 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      setLoading(true);
      const data = await orderService.getById(id);
      if (data) {
        setOrder(data);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
          <div className="h-48 bg-white dark:bg-gray-900 rounded-2xl animate-pulse border border-gray-100 dark:border-gray-800" />
          <div className="h-64 bg-white dark:bg-gray-900 rounded-2xl animate-pulse border border-gray-100 dark:border-gray-800" />
        </div>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Package className="mx-auto mb-4 w-12 h-12 text-gray-400 dark:text-gray-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Order not found
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            We couldn't find an order with ID "{id}".
          </p>
          <button
            onClick={() => navigate('/orders')}
            className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const currentStatusIndex = STATUS_ORDER.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/orders')}
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </button>

        {/* Order Header */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {order.id}
                </h1>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_BADGE[order.status]}`}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </p>
              <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
                ₹{order.totalAmount.toFixed(2)}
              </p>
            </div>
          </div>

          {/* School info for rep orders */}
          {order.schoolName && (
            <div className="mt-4 flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
              <School className="w-4 h-4 text-secondary-500 dark:text-secondary-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                School:{' '}
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {order.schoolName}
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Timeline + Address */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status Timeline */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-5">
                Order Status
              </h2>

              {isCancelled ? (
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-9 h-9 rounded-full bg-danger-500 flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-danger-600 dark:text-danger-400">
                      Order Cancelled
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      This order was cancelled
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-0">
                  {TIMELINE_STEPS.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isCompleted = currentStatusIndex >= idx;
                    const isActive = currentStatusIndex === idx;
                    const isLast = idx === TIMELINE_STEPS.length - 1;

                    return (
                      <div key={step.status} className="flex gap-4">
                        {/* Dot + Line */}
                        <div className="flex flex-col items-center shrink-0">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                              isCompleted
                                ? `${step.dotColor} border-transparent`
                                : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <StepIcon
                              className={`w-4 h-4 ${
                                isCompleted ? 'text-white' : 'text-gray-400 dark:text-gray-500'
                              }`}
                            />
                          </div>
                          {!isLast && (
                            <div
                              className={`w-0.5 h-8 mt-1 rounded-full ${
                                isCompleted && currentStatusIndex > idx
                                  ? step.lineColor
                                  : 'bg-gray-200 dark:bg-gray-800'
                              }`}
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div className={`pb-${isLast ? '0' : '2'} pt-1.5`}>
                          <p
                            className={`text-sm font-semibold ${
                              isActive
                                ? step.color
                                : isCompleted
                                ? 'text-gray-700 dark:text-gray-300'
                                : 'text-gray-400 dark:text-gray-600'
                            }`}
                          >
                            {step.label}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Shipping Address */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Shipping Address
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                {order.shippingAddress}
              </p>
            </div>
          </div>

          {/* Right Column: Items Table */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Order Items
                </h2>
              </div>

              {/* Table Header */}
              <div className="hidden sm:grid grid-cols-12 gap-2 px-6 py-3 bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wide">
                <div className="col-span-6">Book</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Subtotal</div>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {order.items.map((item) => (
                  <div
                    key={item.bookId}
                    className="px-6 py-4 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                  >
                    {/* Book Title */}
                    <div className="col-span-6 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-gray-400 dark:text-gray-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-600">
                          ID: {item.bookId}
                        </p>
                      </div>
                    </div>

                    {/* Qty */}
                    <div className="col-span-2 flex sm:justify-center items-center gap-2">
                      <span className="sm:hidden text-xs text-gray-500 dark:text-gray-500">
                        Qty:
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {item.quantity}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="col-span-2 flex sm:justify-end items-center gap-2">
                      <span className="sm:hidden text-xs text-gray-500 dark:text-gray-500">
                        Price:
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        ₹{item.price.toFixed(2)}
                      </span>
                    </div>

                    {/* Subtotal */}
                    <div className="col-span-2 flex sm:justify-end items-center gap-2">
                      <span className="sm:hidden text-xs text-gray-500 dark:text-gray-500">
                        Subtotal:
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Row */}
              <div className="px-6 py-4 bg-primary-50 dark:bg-primary-900/20 border-t border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {totalItems} {totalItems === 1 ? 'item' : 'items'}
                    </p>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Total Amount
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    ₹{order.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Meta */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wide font-semibold mb-1">
                  Order ID
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {order.id}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wide font-semibold mb-1">
                  Last Updated
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {new Date(order.updatedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

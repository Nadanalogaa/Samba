import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Info, MapPin, ClipboardList, Eye, BookOpen } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { orderService } from '../../services/api';

type Step = 1 | 2 | 3;

interface AddressForm {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  state: string;
}

const STEPS = [
  { id: 1 as Step, label: 'Review', icon: ClipboardList },
  { id: 2 as Step, label: 'Address', icon: MapPin },
  { id: 3 as Step, label: 'Confirm', icon: Eye },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalAmount, totalItems, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [step, setStep] = useState<Step>(1);
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string>('');

  const [form, setForm] = useState<AddressForm>({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    address: '',
    city: '',
    pincode: '',
    state: '',
  });
  const [errors, setErrors] = useState<Partial<AddressForm>>({});

  const subtotal = totalAmount();
  const itemCount = totalItems();

  const handleFormChange = (field: keyof AddressForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateAddress = (): boolean => {
    const newErrors: Partial<AddressForm> = {};
    if (!form.name.trim()) newErrors.name = 'Full name is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(form.phone.trim())) newErrors.phone = 'Enter a valid 10-digit phone number';
    if (!form.address.trim()) newErrors.address = 'Address is required';
    if (!form.city.trim()) newErrors.city = 'City is required';
    if (!form.pincode.trim()) newErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(form.pincode.trim())) newErrors.pincode = 'Enter a valid 6-digit pincode';
    if (!form.state.trim()) newErrors.state = 'State is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 2 && !validateAddress()) return;
    setStep((prev) => (prev < 3 ? ((prev + 1) as Step) : prev));
  };

  const handleBack = () => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev));
  };

  const handlePlaceOrder = async () => {
    if (!user) return;
    setPlacing(true);
    try {
      const shippingAddress = `${form.name}, ${form.phone}, ${form.address}, ${form.city}, ${form.state} - ${form.pincode}`;
      const orderItems = items.map((item) => ({
        bookId: item.book.id,
        title: item.book.title,
        price: item.book.price,
        quantity: item.quantity,
      }));
      const newOrder = await orderService.create({
        userId: user.id,
        schoolId: user.schoolName ? user.id : undefined,
        schoolName: user.schoolName,
        repId: user.role === 'representative' ? user.id : undefined,
        items: orderItems,
        totalAmount: subtotal,
        status: 'placed',
        shippingAddress,
      });
      setPlacedOrderId(newOrder.id);
      clearCart();
      setSuccess(true);
    } finally {
      setPlacing(false);
    }
  };

  const handleGoToOrders = () => {
    navigate('/orders');
  };

  if (items.length === 0 && !success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <BookOpen className="mx-auto mb-4 w-12 h-12 text-gray-400 dark:text-gray-600" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Add some books before proceeding to checkout.
          </p>
          <button
            onClick={() => navigate('/catalog')}
            className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
          >
            Browse Books
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Checkout
        </h1>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-10">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isCompleted = step > s.id;
            return (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${
                      isCompleted
                        ? 'bg-accent-500 border-accent-500 text-white'
                        : isActive
                        ? 'bg-primary-500 border-primary-500 text-white'
                        : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`mt-1.5 text-xs font-medium ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : isCompleted
                        ? 'text-accent-600 dark:text-accent-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 transition-colors ${
                      step > s.id
                        ? 'bg-accent-400'
                        : 'bg-gray-200 dark:bg-gray-800'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">

          {/* Step 1: Review */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-5">
                Review Your Order
              </h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.book.id}
                    className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    <div className="w-12 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                      {item.book.coverImage ? (
                        <img
                          src={item.book.coverImage}
                          alt={item.book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {item.book.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Class {item.book.class} &middot; {item.book.subject}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        ₹{(item.book.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800 space-y-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span className="text-accent-600 dark:text-accent-400 font-medium">Free</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 dark:text-gray-100 text-base pt-2 border-t border-gray-100 dark:border-gray-800">
                  <span>Total</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment placeholder */}
              <div className="mt-6 flex gap-3 p-4 bg-info-50 dark:bg-info-900/20 border border-info-200 dark:border-info-800 rounded-xl">
                <Info className="w-5 h-5 text-info-500 dark:text-info-400 shrink-0 mt-0.5" />
                <p className="text-sm text-info-700 dark:text-info-300">
                  Payment gateway will be integrated soon. Orders are currently placed and fulfilled via invoice.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Address */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-5">
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Full Name <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-2.5 rounded-xl border text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors ${
                      errors.name
                        ? 'border-danger-400 dark:border-danger-600'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-danger-500">{errors.name}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Phone Number <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    placeholder="10-digit mobile number"
                    className={`w-full px-4 py-2.5 rounded-xl border text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors ${
                      errors.phone
                        ? 'border-danger-400 dark:border-danger-600'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-danger-500">{errors.phone}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Address <span className="text-danger-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={form.address}
                    onChange={(e) => handleFormChange('address', e.target.value)}
                    placeholder="House / Flat No., Street, Locality"
                    className={`w-full px-4 py-2.5 rounded-xl border text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors resize-none ${
                      errors.address
                        ? 'border-danger-400 dark:border-danger-600'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  />
                  {errors.address && (
                    <p className="mt-1 text-xs text-danger-500">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    City <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => handleFormChange('city', e.target.value)}
                    placeholder="City"
                    className={`w-full px-4 py-2.5 rounded-xl border text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors ${
                      errors.city
                        ? 'border-danger-400 dark:border-danger-600'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  />
                  {errors.city && (
                    <p className="mt-1 text-xs text-danger-500">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Pincode <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.pincode}
                    onChange={(e) => handleFormChange('pincode', e.target.value)}
                    placeholder="6-digit pincode"
                    maxLength={6}
                    className={`w-full px-4 py-2.5 rounded-xl border text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors ${
                      errors.pincode
                        ? 'border-danger-400 dark:border-danger-600'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  />
                  {errors.pincode && (
                    <p className="mt-1 text-xs text-danger-500">{errors.pincode}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    State <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => handleFormChange('state', e.target.value)}
                    placeholder="State"
                    className={`w-full px-4 py-2.5 rounded-xl border text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors ${
                      errors.state
                        ? 'border-danger-400 dark:border-danger-600'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  />
                  {errors.state && (
                    <p className="mt-1 text-xs text-danger-500">{errors.state}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-5">
                Confirm Your Order
              </h2>

              {/* Shipping Address Summary */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Shipping Address
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {form.name} &bull; {form.phone}
                  <br />
                  {form.address}
                  <br />
                  {form.city}, {form.state} &ndash; {form.pincode}
                </p>
              </div>

              {/* Items Summary */}
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div
                    key={item.book.id}
                    className="flex justify-between items-center text-sm py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    <div className="min-w-0 pr-4">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {item.book.title}
                      </p>
                      <p className="text-gray-400 dark:text-gray-500">
                        Qty: {item.quantity} &times; ₹{item.book.price.toFixed(2)}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100 shrink-0">
                      ₹{(item.book.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 flex justify-between items-center mb-6">
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  Total Amount
                </span>
                <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>

              {/* Payment placeholder */}
              <div className="flex gap-3 p-4 bg-info-50 dark:bg-info-900/20 border border-info-200 dark:border-info-800 rounded-xl">
                <Info className="w-5 h-5 text-info-500 dark:text-info-400 shrink-0 mt-0.5" />
                <p className="text-sm text-info-700 dark:text-info-300">
                  Payment gateway will be integrated soon. Orders are placed and fulfilled via invoice.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button
                onClick={handleBack}
                disabled={placing}
                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors disabled:opacity-50"
              >
                Back
              </button>
            ) : (
              <button
                onClick={() => navigate('/cart')}
                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
              >
                Back to Cart
              </button>
            )}

            {step < 3 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="px-6 py-2.5 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {placing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
            <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
              <CheckCircle className="w-9 h-9 text-accent-500 dark:text-accent-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Order Placed!
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
              Your order has been placed successfully.
            </p>
            <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-6">
              Order ID: {placedOrderId}
            </p>
            <button
              onClick={handleGoToOrders}
              className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
            >
              View My Orders
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

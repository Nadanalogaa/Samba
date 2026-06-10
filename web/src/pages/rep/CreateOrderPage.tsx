import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Minus, Trash2, CheckCircle, Building2 } from 'lucide-react';
import { bookService, schoolService, orderService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import type { Book, School } from '../../types';

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [orderItems, setOrderItems] = useState<{ book: Book; quantity: number }[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    schoolService.getAll().then(setSchools);
    bookService.getAll().then(setBooks);
  }, []);

  const filteredBooks = books.filter((b) => {
    if (selectedClass && b.class !== selectedClass) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return b.title.toLowerCase().includes(q) || b.subject.toLowerCase().includes(q);
    }
    return true;
  });

  const addToOrder = (book: Book) => {
    const existing = orderItems.find((item) => item.book.id === book.id);
    if (existing) {
      setOrderItems(orderItems.map((item) =>
        item.book.id === book.id ? { ...item, quantity: item.quantity + 25 } : item
      ));
    } else {
      setOrderItems([...orderItems, { book, quantity: 25 }]);
    }
  };

  const updateQty = (bookId: string, qty: number) => {
    if (qty <= 0) {
      setOrderItems(orderItems.filter((item) => item.book.id !== bookId));
    } else {
      setOrderItems(orderItems.map((item) =>
        item.book.id === bookId ? { ...item, quantity: qty } : item
      ));
    }
  };

  const totalAmount = orderItems.reduce((sum, item) => sum + item.book.price * item.quantity, 0);

  const placeOrder = async () => {
    if (!selectedSchool || !user) return;
    await orderService.create({
      userId: user.id,
      schoolId: selectedSchool.id,
      schoolName: selectedSchool.name,
      repId: user.id,
      items: orderItems.map((item) => ({
        bookId: item.book.id,
        title: item.book.title,
        price: item.book.price,
        quantity: item.quantity,
      })),
      totalAmount,
      status: 'placed',
      shippingAddress: selectedSchool.address,
    });
    setShowSuccess(true);
    setTimeout(() => navigate('/orders'), 2000);
  };

  const steps = ['Select School', 'Add Books', 'Review & Confirm'];

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Order</h1>

      {/* Step Indicator */}
      <div className="flex items-center mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-colors ${
              step > i + 1 ? 'bg-accent-500 text-white' :
              step === i + 1 ? 'bg-primary-500 text-white' :
              'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
            }`}>
              {step > i + 1 ? <CheckCircle size={20} /> : i + 1}
            </div>
            <span className={`ml-2 text-sm font-medium hidden sm:block ${
              step === i + 1 ? 'text-primary-500' : 'text-gray-500 dark:text-gray-400'
            }`}>{s}</span>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${
                step > i + 1 ? 'bg-accent-500' : 'bg-gray-200 dark:bg-slate-700'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select School */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">Select the school for this order</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schools.map((school) => (
              <button
                key={school.id}
                onClick={() => { setSelectedSchool(school); setStep(2); }}
                className={`p-5 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                  selectedSchool?.id === school.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="text-primary-500" size={24} />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{school.name}</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{school.district} - {school.contactPerson}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{school.phone}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Add Books */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white text-sm"
                />
              </div>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white text-sm"
              >
                <option value="">All Classes</option>
                {bookService.getClasses().map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {filteredBooks.slice(0, 30).map((book) => {
                const inOrder = orderItems.find((item) => item.book.id === book.id);
                return (
                  <div key={book.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{book.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Rs. {book.price}</p>
                    </div>
                    {inOrder ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(book.id, inOrder.quantity - 5)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200">
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          value={inOrder.quantity}
                          onChange={(e) => updateQty(book.id, parseInt(e.target.value) || 0)}
                          className="w-16 text-center py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white"
                        />
                        <button onClick={() => updateQty(book.id, inOrder.quantity + 5)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200">
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => addToOrder(book)} className="px-3 py-1.5 text-xs font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors">
                        Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-5 h-fit sticky top-24">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Order for</h3>
            <p className="text-sm text-primary-500 font-medium mb-4">{selectedSchool?.name}</p>

            {orderItems.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No books added yet</p>
            ) : (
              <>
                <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                  {orderItems.map((item) => (
                    <div key={item.book.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300 truncate flex-1 mr-2">{item.book.subject} - {item.book.class}</span>
                      <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">x{item.quantity}</span>
                      <button onClick={() => updateQty(item.book.id, 0)} className="ml-2 text-danger-500 hover:text-danger-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 dark:border-slate-700 pt-3 mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 dark:text-gray-400">Items</span>
                    <span className="text-gray-900 dark:text-white">{orderItems.length} books</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-primary-500">Rs. {totalAmount.toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => setStep(3)}
                  className="w-full py-3 bg-secondary-500 hover:bg-secondary-600 text-white font-semibold rounded-xl transition-colors"
                >
                  Review Order
                </button>
              </>
            )}

            <button onClick={() => setStep(1)} className="w-full mt-2 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700">
              Change School
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Confirm */}
      {step === 3 && (
        <div className="max-w-2xl mx-auto">
          {showSuccess ? (
            <div className="text-center py-16">
              <CheckCircle className="mx-auto text-accent-500 mb-4" size={64} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Order Placed Successfully!</h2>
              <p className="text-gray-500 dark:text-gray-400">Redirecting to orders...</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>

              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">School</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedSchool?.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedSchool?.address}</p>
              </div>

              <table className="w-full mb-4">
                <thead>
                  <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-slate-700">
                    <th className="pb-2">Book</th>
                    <th className="pb-2 text-center">Qty</th>
                    <th className="pb-2 text-right">Price</th>
                    <th className="pb-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item) => (
                    <tr key={item.book.id} className="border-b border-gray-100 dark:border-slate-700/50 text-sm">
                      <td className="py-3 text-gray-900 dark:text-white">{item.book.title}</td>
                      <td className="py-3 text-center text-gray-600 dark:text-gray-400">{item.quantity}</td>
                      <td className="py-3 text-right text-gray-600 dark:text-gray-400">Rs. {item.book.price}</td>
                      <td className="py-3 text-right font-medium text-gray-900 dark:text-white">Rs. {(item.book.price * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between text-xl font-bold p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl mb-6">
                <span className="text-gray-900 dark:text-white">Grand Total</span>
                <span className="text-primary-500">Rs. {totalAmount.toLocaleString()}</span>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  Back
                </button>
                <button onClick={placeOrder} className="flex-1 py-3 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-xl transition-colors">
                  Confirm & Place Order
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

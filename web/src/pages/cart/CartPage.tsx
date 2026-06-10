import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { useCartStore } from '../../store/cartStore';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalAmount, totalItems } =
    useCartStore();
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  const handleRemove = (bookId: string) => {
    setRemovingIds((prev) => new Set(prev).add(bookId));
    setTimeout(() => {
      removeItem(bookId);
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(bookId);
        return next;
      });
    }, 300);
  };

  const handleQuantityChange = (bookId: string, value: string) => {
    const qty = parseInt(value, 10);
    if (!isNaN(qty)) updateQuantity(bookId, qty);
  };

  const subtotal = totalAmount();
  const itemCount = totalItems();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-6 w-24 h-24 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-primary-300 dark:text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Looks like you haven't added any books yet. Start exploring our catalog!
          </p>
          <Link
            to="/app/catalog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Browse Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Shopping Cart
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-sm text-danger-500 hover:text-danger-600 dark:text-danger-400 dark:hover:text-danger-300 font-medium transition-colors"
          >
            Clear Cart
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            {items.map((item) => {
              const isRemoving = removingIds.has(item.book.id);
              const lineTotal = item.book.price * item.quantity;

              return (
                <div
                  key={item.book.id}
                  style={{ transition: 'opacity 0.3s ease, transform 0.3s ease' }}
                  className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 sm:p-6 flex gap-4 ${
                    isRemoving ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                  }`}
                >
                  {/* Book Cover */}
                  <div className="shrink-0 w-16 h-20 sm:w-20 sm:h-26 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {item.book.coverImage ? (
                      <img
                        src={item.book.coverImage}
                        alt={item.book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Book Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {item.book.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          Class {item.book.class} &middot; {item.book.subject} &middot;{' '}
                          {item.book.term}
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                          ISBN: {item.book.isbn}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemove(item.book.id)}
                        aria-label="Remove item"
                        className="shrink-0 p-1.5 text-gray-400 hover:text-danger-500 dark:text-gray-500 dark:hover:text-danger-400 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(item.book.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.book.id, e.target.value)}
                          className="w-10 text-center text-sm font-semibold bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none"
                        />
                        <button
                          onClick={() => updateQuantity(item.book.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-gray-100">
                          ₹{lineTotal.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          ₹{item.book.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-80 xl:w-96 shrink-0">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-5">
                Order Summary
              </h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span className="text-accent-600 dark:text-accent-400 font-medium">Free</span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between font-bold text-gray-900 dark:text-gray-100 text-base">
                  <span>Total</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
              </div>

              <Link
                to="/app/checkout"
                className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/app/catalog"
                className="block text-center text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-medium mt-4 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

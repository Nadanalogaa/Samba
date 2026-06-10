import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShoppingCart,
  Minus,
  Plus,
  ChevronRight,
  BookOpen,
  Hash,
  FileText,
  Globe,
  Tag,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Package,
} from 'lucide-react';
import { bookService } from '../../services/api';
import { useCartStore } from '../../store/cartStore';
import BookCard from '../../components/BookCard';
import type { Book } from '../../types';

// ---------- Skeleton ----------
function DetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        <div className="flex flex-col gap-5">
          <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-md" />
            ))}
          </div>
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl mt-4" />
          <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ---------- Error state ----------
function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-danger-50 dark:bg-danger-900/20 flex items-center justify-center">
        <AlertCircle size={32} className="text-danger-500" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Book not found</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          This book doesn't exist or may have been removed.
        </p>
      </div>
      <Link
        to="/catalog"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors duration-200"
      >
        <ArrowLeft size={14} />
        Back to Catalog
      </Link>
    </div>
  );
}

// ---------- Detail table row ----------
function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-700 last:border-0">
      <td className="py-3 pr-4 w-40">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium">
          <span className="text-gray-400 dark:text-gray-500">{icon}</span>
          {label}
        </div>
      </td>
      <td className="py-3 text-sm text-gray-800 dark:text-gray-200 font-medium">{value}</td>
    </tr>
  );
}

// ---------- Main page ----------
export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const addItem = useCartStore((s) => s.addItem);

  const [book, setBook] = useState<Book | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);
    setQuantity(1);

    bookService.getById(id).then(async (found) => {
      if (!found) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setBook(found);

      // Fetch related books: same class, different subject, limit 4
      const related = await bookService.filter({ class: found.class });
      setRelatedBooks(
        related.filter((b) => b.id !== found.id && b.subject !== found.subject).slice(0, 4)
      );
      setLoading(false);
    });
  }, [id]);

  function handleAddToCart() {
    if (!book) return;
    addItem(book, quantity);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  }

  function changeQty(delta: number) {
    setQuantity((q) => Math.max(1, Math.min(q + delta, book?.stock ?? 999)));
  }

  function handleQtyInput(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v) && v >= 1) setQuantity(Math.min(v, book?.stock ?? 999));
  }

  const discount = book ? Math.round(((book.mrp - book.price) / book.mrp) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-8 flex-wrap">
          <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            Home
          </Link>
          <ChevronRight size={14} className="text-gray-300 dark:text-gray-600" />
          <Link to="/catalog" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            Catalog
          </Link>
          {book && (
            <>
              <ChevronRight size={14} className="text-gray-300 dark:text-gray-600" />
              <Link
                to={`/catalog?class=${encodeURIComponent(book.class)}`}
                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {book.class}
              </Link>
              <ChevronRight size={14} className="text-gray-300 dark:text-gray-600" />
              <span className="text-gray-700 dark:text-gray-300 font-medium line-clamp-1 max-w-xs">
                {book.title}
              </span>
            </>
          )}
        </nav>

        {/* ── Content ── */}
        {loading ? (
          <DetailSkeleton />
        ) : notFound ? (
          <NotFound />
        ) : book ? (
          <>
            {/* ── Main product layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

              {/* Left: Cover image */}
              <div className="flex flex-col gap-4">
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                  {/* Discount ribbon */}
                  {discount > 0 && (
                    <div className="absolute top-4 left-4 z-10 bg-secondary-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl shadow-md">
                      {discount}% OFF
                    </div>
                  )}
                  <div className="aspect-[3/4] w-full max-w-sm mx-auto">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Right: Details */}
              <div className="flex flex-col gap-5">

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 border border-primary-100 dark:border-primary-800">
                    <BookOpen size={12} />
                    Class {book.class}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-info-50 text-info-700 dark:bg-info-900/40 dark:text-info-300 border border-info-100 dark:border-info-800">
                    <Tag size={12} />
                    {book.subject}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-accent-50 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300 border border-accent-100 dark:border-accent-800">
                    {book.term}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                  {book.title}
                </h1>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                  {book.description}
                </p>

                {/* Stock status */}
                <div className="flex items-center gap-2">
                  {book.stock === 0 ? (
                    <>
                      <AlertCircle size={16} className="text-danger-500" />
                      <span className="text-sm font-semibold text-danger-600 dark:text-danger-400">Out of Stock</span>
                    </>
                  ) : book.stock <= 50 ? (
                    <>
                      <Package size={16} className="text-amber-500" />
                      <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                        Low Stock — only {book.stock} left
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} className="text-accent-500" />
                      <span className="text-sm font-semibold text-accent-600 dark:text-accent-400">
                        In Stock ({book.stock} available)
                      </span>
                    </>
                  )}
                </div>

                {/* Price block */}
                <div className="flex items-end gap-3 py-4 border-y border-gray-100 dark:border-gray-700">
                  <span className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">
                    ₹{book.price}
                  </span>
                  <span className="text-lg text-gray-400 dark:text-gray-500 line-through mb-0.5">
                    ₹{book.mrp}
                  </span>
                  {discount > 0 && (
                    <span className="text-sm font-bold text-secondary-600 dark:text-secondary-400 mb-0.5">
                      Save ₹{book.mrp - book.price}
                    </span>
                  )}
                </div>

                {/* Quantity selector + Add to Cart */}
                {book.stock > 0 && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Qty control */}
                    <div className="flex items-center gap-0 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 shadow-sm self-start">
                      <button
                        onClick={() => changeQty(-1)}
                        disabled={quantity <= 1}
                        className="w-10 h-12 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={book.stock}
                        value={quantity}
                        onChange={handleQtyInput}
                        className="w-14 h-12 text-center text-sm font-bold text-gray-800 dark:text-gray-100 bg-transparent border-x border-gray-200 dark:border-gray-700 focus:outline-none appearance-none"
                      />
                      <button
                        onClick={() => changeQty(1)}
                        disabled={quantity >= book.stock}
                        className="w-10 h-12 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Add to Cart button */}
                    <button
                      onClick={handleAddToCart}
                      className={`flex-1 flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-base font-bold shadow-lg transition-all duration-300
                        ${addedFeedback
                          ? 'bg-accent-500 hover:bg-accent-600 shadow-accent-500/25'
                          : 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/25'
                        } text-white focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900
                        ${addedFeedback ? 'focus:ring-accent-500' : 'focus:ring-primary-500'}
                        active:scale-[0.98]`}
                    >
                      {addedFeedback ? (
                        <>
                          <CheckCircle size={18} />
                          Added to Cart!
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={18} />
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                )}

                {book.stock === 0 && (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-base font-bold bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  >
                    <ShoppingCart size={18} />
                    Out of Stock
                  </button>
                )}

                {/* Book details table */}
                <div className="mt-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                  <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Book Details
                    </h3>
                  </div>
                  <div className="px-5">
                    <table className="w-full">
                      <tbody>
                        <DetailRow icon={<Hash size={14} />} label="ISBN" value={book.isbn} />
                        <DetailRow icon={<FileText size={14} />} label="Pages" value={`${book.pages} pages`} />
                        <DetailRow icon={<Globe size={14} />} label="Language" value={book.language} />
                        <DetailRow icon={<BookOpen size={14} />} label="Class" value={book.class} />
                        <DetailRow icon={<Tag size={14} />} label="Subject" value={book.subject} />
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Related Books ── */}
            {relatedBooks.length > 0 && (
              <section className="mt-16">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Related Books
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      More books for Class {book.class}
                    </p>
                  </div>
                  <Link
                    to={`/catalog?class=${encodeURIComponent(book.class)}`}
                    className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors flex items-center gap-1"
                  >
                    View all
                    <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                  {relatedBooks.map((rb) => (
                    <BookCard
                      key={rb.id}
                      book={rb}
                      onAddToCart={() => addItem(rb, 1)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

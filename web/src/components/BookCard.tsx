import { Link } from 'react-router-dom';
import { ShoppingCart, BookOpen } from 'lucide-react';
import type { Book } from '../types';

interface BookCardProps {
  book: Book;
  onAddToCart?: () => void;
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-danger-100 text-danger-700 dark:bg-danger-900/40 dark:text-danger-400">
        Out of Stock
      </span>
    );
  }
  if (stock <= 50) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
        Low Stock
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-400">
      In Stock
    </span>
  );
}

export default function BookCard({ book, onAddToCart }: BookCardProps) {
  const discount = Math.round(((book.mrp - book.price) / book.mrp) * 100);

  return (
    <div className="group relative flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1 hover:border-primary-200 dark:hover:border-primary-700">
      {/* Discount badge */}
      {discount > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-secondary-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
          {discount}% OFF
        </div>
      )}

      {/* Stock badge */}
      <div className="absolute top-3 right-3 z-10">
        <StockBadge stock={book.stock} />
      </div>

      {/* Cover image */}
      <Link to={`/books/${book.id}`} className="block relative overflow-hidden bg-gray-50 dark:bg-gray-900">
        <div className="aspect-[5/7] w-full overflow-hidden">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        </div>
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Class / Subject badges */}
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary-50 text-primary-600 dark:bg-primary-900/50 dark:text-primary-300 border border-primary-100 dark:border-primary-800">
            {book.class}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-info-50 text-info-600 dark:bg-info-900/50 dark:text-info-300 border border-info-100 dark:border-info-800">
            {book.subject}
          </span>
        </div>

        {/* Title */}
        <Link to={`/books/${book.id}`} className="flex-1">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
            {book.title}
          </h3>
        </Link>

        {/* Term */}
        <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
          <BookOpen size={11} />
          {book.term}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
            ₹{book.price}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 line-through">
            ₹{book.mrp}
          </span>
        </div>

        {/* Add to Cart button */}
        <button
          onClick={onAddToCart}
          disabled={book.stock === 0}
          className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
            bg-primary-500 hover:bg-primary-600 active:bg-primary-700
            text-white shadow-sm hover:shadow-md
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary-500 disabled:hover:shadow-sm
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          <ShoppingCart size={15} />
          {book.stock === 0 ? 'Unavailable' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

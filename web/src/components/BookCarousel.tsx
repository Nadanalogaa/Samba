import { useRef } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, BookOpen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import type { Book } from '../types';

interface BookCarouselProps {
  title: string;
  subtitle?: string;
  books: Book[];
}

export default function BookCarousel({ title, subtitle, books }: BookCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);
  const navigate = useNavigate();

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const handleAddToCart = (book: Book) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addItem(book);
  };

  return (
    <section className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--theme-text)' }}>
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm mt-1" style={{ color: 'var(--theme-text-secondary)' }}>{subtitle}</p>
            )}
          </div>
          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 hover:shadow-md btn-press"
              style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 hover:shadow-md btn-press"
              style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div ref={scrollRef} className="carousel-scroll flex gap-5 overflow-x-auto pb-4">
          {books.map((book) => {
            const discount = Math.round(((book.mrp - book.price) / book.mrp) * 100);
            return (
              <div
                key={book.id}
                className="carousel-item flex-shrink-0 w-[220px] sm:w-[240px] group rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  borderColor: 'var(--theme-border)',
                }}
              >
                {/* Cover */}
                <Link to={`/books/${book.id}`} className="block relative overflow-hidden">
                  <div className="aspect-[5/7] w-full overflow-hidden" style={{ backgroundColor: 'var(--theme-surface-alt)' }}>
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  {discount > 0 && (
                    <div className="absolute top-2 left-2 bg-secondary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                      {discount}% OFF
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="p-3 space-y-2">
                  <div className="flex gap-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary-50 text-primary-600 dark:bg-primary-900/50 dark:text-primary-300 border border-primary-100 dark:border-primary-800">
                      {book.class}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-info-50 text-info-600 dark:bg-info-900/50 dark:text-info-300 border border-info-100 dark:border-info-800">
                      {book.subject}
                    </span>
                  </div>
                  <Link to={`/books/${book.id}`}>
                    <h3 className="text-sm font-semibold line-clamp-2 leading-snug transition-colors duration-200" style={{ color: 'var(--theme-text)' }}>
                      {book.title}
                    </h3>
                  </Link>
                  <p className="text-[11px] flex items-center gap-1" style={{ color: 'var(--theme-text-secondary)' }}>
                    <BookOpen size={10} /> {book.term}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold text-primary-600 dark:text-primary-400">₹{book.price}</span>
                    <span className="text-[11px] line-through" style={{ color: 'var(--theme-text-secondary)' }}>₹{book.mrp}</span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(book)}
                    disabled={book.stock === 0}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
                      bg-primary-500 hover:bg-primary-600 text-white shadow-sm hover:shadow-md
                      disabled:opacity-40 disabled:cursor-not-allowed
                      transition-all duration-200 btn-press"
                  >
                    <ShoppingCart size={13} />
                    {book.stock === 0 ? 'Unavailable' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import type { Book } from '../types';

interface HeroBannerProps {
  books: Book[];
}

export default function HeroBanner({ books }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isAnimating, setIsAnimating] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const goTo = useCallback((index: number, dir: 'left' | 'right') => {
    if (isAnimating) return;
    setDirection(dir);
    setIsAnimating(true);
    // Small delay so CSS picks up the "enter-from" position before transitioning
    requestAnimationFrame(() => {
      setCurrent(index);
      setTimeout(() => setIsAnimating(false), 700);
    });
  }, [isAnimating]);

  const next = useCallback(() => {
    goTo((current + 1) % books.length, 'right');
  }, [current, books.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + books.length) % books.length, 'left');
  }, [current, books.length, goTo]);

  // Auto-advance
  useEffect(() => {
    timerRef.current = setInterval(() => {
      goTo((current + 1) % books.length, 'right');
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [current, books.length, goTo]);

  const handleAddToCart = (book: Book) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addItem(book);
  };

  if (books.length === 0) return null;

  return (
    <section className="relative overflow-hidden">
      {/* Background image with low opacity */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-carousel-bg.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, var(--theme-hero-from), var(--theme-hero-to))', opacity: 0.88 }}
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative">
        {/* Slides container */}
        <div className="relative" style={{ minHeight: '360px' }}>
          {books.map((book, i) => {
            const discount = Math.round(((book.mrp - book.price) / book.mrp) * 100);
            const isActive = i === current;

            // Determine transform based on position relative to current
            let translateX = '100%';
            let opacity = 0;
            let pointerEvents: 'auto' | 'none' = 'none';

            if (isActive) {
              translateX = '0%';
              opacity = 1;
              pointerEvents = 'auto';
            } else if (direction === 'right') {
              translateX = i > current || (current === books.length - 1 && i === 0) ? '100%' : '-100%';
            } else {
              translateX = i < current || (current === 0 && i === books.length - 1) ? '-100%' : '100%';
            }

            return (
              <div
                key={book.id}
                className="absolute inset-0 flex flex-col md:flex-row items-center gap-8 md:gap-16"
                style={{
                  transform: `translateX(${translateX})`,
                  opacity,
                  transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                  pointerEvents,
                }}
              >
                {/* Text content */}
                <div className="flex-1 text-center md:text-left space-y-5">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-secondary-500/20 text-secondary-700 dark:text-secondary-400 border border-secondary-300 dark:border-secondary-600">
                    Featured Book
                  </span>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight" style={{ color: 'var(--theme-text)' }}>
                    {book.title}
                  </h1>
                  <p className="text-base sm:text-lg max-w-lg leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
                    {book.description}
                  </p>
                  <div className="flex items-baseline gap-3 justify-center md:justify-start">
                    <span className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">₹{book.price}</span>
                    <span className="text-lg line-through" style={{ color: 'var(--theme-text-secondary)' }}>₹{book.mrp}</span>
                    {discount > 0 && (
                      <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-accent-500 text-white">{discount}% OFF</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <button
                      onClick={() => handleAddToCart(book)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-primary-500 text-white hover:bg-primary-600 shadow-lg hover:shadow-xl transition-all duration-200 btn-press"
                    >
                      <ShoppingCart size={16} />
                      Add to Cart
                    </button>
                    <Link
                      to={`/books/${book.id}`}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border-2 border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all duration-200 btn-press"
                      style={{ color: 'var(--theme-text)' }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>

                {/* Book cover */}
                <div className="flex-shrink-0 relative">
                  <div className="w-56 sm:w-64 md:w-72 aspect-[5/7] rounded-2xl overflow-hidden shadow-2xl animate-float">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full opacity-30 blur-3xl" style={{ backgroundColor: 'var(--theme-accent-bg)' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 btn-press"
        style={{ color: 'var(--theme-text)' }}
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 btn-press"
        style={{ color: 'var(--theme-text)' }}
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {books.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > current ? 'right' : 'left')}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? 'w-8 bg-primary-500' : 'w-2 bg-primary-300/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
}

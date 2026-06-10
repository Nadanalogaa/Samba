import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, X, BookOpen, ChevronDown } from 'lucide-react';
import { bookService } from '../../services/api';
import { useCartStore } from '../../store/cartStore';
import BookCard from '../../components/BookCard';
import type { Book } from '../../types';

// ---------- Skeleton ----------
function BookCardSkeleton() {
  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
      <div className="aspect-[5/7] w-full bg-gray-200 dark:bg-gray-700" />
      <div className="p-4 flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="h-5 w-12 rounded-md bg-gray-200 dark:bg-gray-700" />
          <div className="h-5 w-20 rounded-md bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-5 w-16 rounded bg-gray-200 dark:bg-gray-700 mt-1" />
        <div className="h-10 w-full rounded-xl bg-gray-200 dark:bg-gray-700 mt-2" />
      </div>
    </div>
  );
}

// ---------- Empty state ----------
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <BookOpen size={32} className="text-gray-400 dark:text-gray-500" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No books found</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Try adjusting your filters or search term.
        </p>
      </div>
      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors duration-200"
      >
        <X size={14} />
        Clear all filters
      </button>
    </div>
  );
}

// ---------- Select dropdown ----------
interface SelectProps {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}
function FilterSelect({ value, onChange, options, placeholder }: SelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full pl-3 pr-8 py-2.5 rounded-xl text-sm font-medium
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          text-gray-700 dark:text-gray-200
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          transition-colors duration-200 cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  );
}

// ---------- Main page ----------
const CLASS_LIST = ['LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];

export default function CatalogPage() {
  const addItem = useCartStore((s) => s.addItem);

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [search, setSearch] = useState('');

  const subjects = bookService.getSubjects();
  const terms = bookService.getTerms();

  const hasActiveFilter = selectedClass || selectedSubject || selectedTerm || search;

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params: { class?: string; subject?: string; term?: string; search?: string } = {};
      if (selectedClass) params.class = selectedClass;
      if (selectedSubject) params.subject = selectedSubject;
      if (selectedTerm) params.term = selectedTerm;
      if (search) params.search = search;

      const result = Object.keys(params).length
        ? await bookService.filter(params)
        : await bookService.getAll();
      setBooks(result);
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedSubject, selectedTerm, search]);

  useEffect(() => {
    const timer = setTimeout(fetchBooks, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchBooks, search]);

  function resetFilters() {
    setSelectedClass('');
    setSelectedSubject('');
    setSelectedTerm('');
    setSearch('');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* ── Page header ── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">

            {/* Title row */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Book Catalog
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {loading ? 'Loading...' : `${books.length} book${books.length !== 1 ? 's' : ''} available`}
                </p>
              </div>
              <button
                onClick={() => setFiltersOpen((v) => !v)}
                className={`sm:hidden flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all duration-200
                  ${filtersOpen
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'
                  }`}
              >
                <SlidersHorizontal size={15} />
                Filters
                {hasActiveFilter && (
                  <span className="w-2 h-2 rounded-full bg-secondary-500" />
                )}
              </button>
            </div>

            {/* ── Class quick-select chips (horizontal scroll) ── */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
              {CLASS_LIST.map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(selectedClass === cls ? '' : cls)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-sm font-semibold border transition-all duration-200 whitespace-nowrap
                    ${selectedClass === cls
                      ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/20'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-400'
                    }`}
                >
                  {cls}
                </button>
              ))}
            </div>

            {/* ── Filter bar ── */}
            <div className={`${filtersOpen ? 'flex' : 'hidden sm:flex'} flex-col sm:flex-row gap-3 transition-all duration-200`}>
              {/* Search */}
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by title or subject..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm
                    bg-white dark:bg-gray-800
                    border border-gray-200 dark:border-gray-700
                    text-gray-700 dark:text-gray-200
                    placeholder-gray-400 dark:placeholder-gray-500
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    transition-colors duration-200"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Dropdowns */}
              <div className="flex gap-2 sm:gap-3">
                <div className="flex-1 sm:w-36">
                  <FilterSelect
                    value={selectedSubject}
                    onChange={setSelectedSubject}
                    options={subjects}
                    placeholder="Subject"
                  />
                </div>
                <div className="flex-1 sm:w-32">
                  <FilterSelect
                    value={selectedTerm}
                    onChange={setSelectedTerm}
                    options={terms}
                    placeholder="Term"
                  />
                </div>
                {hasActiveFilter && (
                  <button
                    onClick={resetFilters}
                    title="Clear all filters"
                    className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-danger-50 hover:text-danger-500 hover:border-danger-200 dark:hover:bg-danger-900/20 dark:hover:text-danger-400 transition-all duration-200"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Book grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6
            transition-opacity duration-300"
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <BookCardSkeleton key={i} />)
            : books.length === 0
              ? <EmptyState onReset={resetFilters} />
              : books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onAddToCart={() => addItem(book, 1)}
                />
              ))
          }
        </div>
      </div>
    </div>
  );
}

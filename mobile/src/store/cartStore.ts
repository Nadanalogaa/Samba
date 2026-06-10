import { create } from 'zustand';

export interface Book {
  id: string;
  title: string;
  class: string;
  subject: string;
  term: string;
  price: number;
  mrp: number;
  coverImage: string;
  description: string;
  stock: number;
}

export interface CartItem {
  book: Book;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (book: Book, quantity?: number) => void;
  removeItem: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (book, quantity = 1) => {
    set((state) => {
      const existing = state.items.find((i) => i.book.id === book.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.book.id === book.id ? { ...i, quantity: i.quantity + quantity } : i
          ),
        };
      }
      return { items: [...state.items, { book, quantity }] };
    });
  },
  removeItem: (bookId) => set((state) => ({ items: state.items.filter((i) => i.book.id !== bookId) })),
  updateQuantity: (bookId, quantity) => {
    if (quantity <= 0) return get().removeItem(bookId);
    set((state) => ({
      items: state.items.map((i) => (i.book.id === bookId ? { ...i, quantity } : i)),
    }));
  },
  clearCart: () => set({ items: [] }),
  totalAmount: () => get().items.reduce((sum, i) => sum + i.book.price * i.quantity, 0),
  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));

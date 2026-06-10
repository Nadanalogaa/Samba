import { create } from 'zustand';
import type { Book, CartItem } from '../types';

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
  addItem: (book: Book, quantity = 1) => {
    set((state) => {
      const existing = state.items.find((item) => item.book.id === book.id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.book.id === book.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }
      return { items: [...state.items, { book, quantity }] };
    });
  },
  removeItem: (bookId: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.book.id !== bookId),
    }));
  },
  updateQuantity: (bookId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(bookId);
      return;
    }
    set((state) => ({
      items: state.items.map((item) =>
        item.book.id === bookId ? { ...item, quantity } : item
      ),
    }));
  },
  clearCart: () => set({ items: [] }),
  totalAmount: () =>
    get().items.reduce((sum, item) => sum + item.book.price * item.quantity, 0),
  totalItems: () =>
    get().items.reduce((sum, item) => sum + item.quantity, 0),
}));

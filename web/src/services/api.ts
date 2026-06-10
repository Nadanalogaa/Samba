// API service layer — currently uses mock data
// When backend is ready, replace these functions with actual API calls

import { books, orders, schools, districts } from './mockData';
import type { Book, Order, School } from '../types';

// Simulates network delay
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// Book services
export const bookService = {
  async getAll(): Promise<Book[]> {
    await delay();
    return books;
  },
  async getById(id: string): Promise<Book | undefined> {
    await delay();
    return books.find((b) => b.id === id);
  },
  async filter(params: { class?: string; subject?: string; term?: string; search?: string }): Promise<Book[]> {
    await delay();
    return books.filter((b) => {
      if (params.class && b.class !== params.class) return false;
      if (params.subject && b.subject !== params.subject) return false;
      if (params.term && b.term !== params.term) return false;
      if (params.search) {
        const q = params.search.toLowerCase();
        return b.title.toLowerCase().includes(q) || b.subject.toLowerCase().includes(q);
      }
      return true;
    });
  },
  getClasses: () => ['LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'],
  getSubjects: () => ['Tamil', 'English', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Computer Science'],
  getTerms: () => ['Term 1', 'Term 2', 'Term 3'],
};

// Order services
export const orderService = {
  async getAll(): Promise<Order[]> {
    await delay();
    return orders;
  },
  async getByUser(userId: string): Promise<Order[]> {
    await delay();
    return orders.filter((o) => o.userId === userId);
  },
  async getById(id: string): Promise<Order | undefined> {
    await delay();
    return orders.find((o) => o.id === id);
  },
  async create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    await delay(500);
    const newOrder: Order = {
      ...order,
      id: `ORD${String(orders.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orders.push(newOrder);
    return newOrder;
  },
};

// School services
export const schoolService = {
  async getAll(): Promise<School[]> {
    await delay();
    return schools;
  },
  async getByDistrict(district: string): Promise<School[]> {
    await delay();
    return schools.filter((s) => s.district === district);
  },
  getDistricts: () => districts,
};

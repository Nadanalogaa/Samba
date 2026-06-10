export type UserRole = 'admin' | 'representative' | 'school' | 'individual';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  district?: string;
  assignedSchools?: string[];
  schoolName?: string;
}

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
  isbn: string;
  pages: number;
  language: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export type OrderStatus = 'placed' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  bookId: string;
  title: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  schoolId?: string;
  schoolName?: string;
  repId?: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  shippingAddress: string;
}

export interface School {
  id: string;
  name: string;
  district: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalBooks: number;
  pendingOrders: number;
}

import { create } from 'zustand';

export type UserRole = 'admin' | 'representative' | 'school' | 'individual';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  district?: string;
  schoolName?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => void;
  logout: () => void;
}

const mockUsers: Record<UserRole, User> = {
  admin: { id: '1', name: 'Samba Admin', email: 'admin@samba.com', phone: '9876543210', role: 'admin' },
  representative: { id: '2', name: 'Ravi Kumar', email: 'ravi@samba.com', phone: '9876543211', role: 'representative', district: 'Chennai' },
  school: { id: '3', name: "St. Mary's School", email: 'stmarys@school.com', phone: '9876543212', role: 'school', schoolName: "St. Mary's HSS" },
  individual: { id: '4', name: 'Priya Sharma', email: 'priya@gmail.com', phone: '9876543213', role: 'individual' },
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (_email, _password, role) => set({ user: mockUsers[role], isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));

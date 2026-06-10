import { create } from 'zustand';
import type { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => void;
  logout: () => void;
}

const mockUsers: Record<UserRole, User> = {
  admin: {
    id: '1',
    name: 'Samba Admin',
    email: 'admin@sambapublications.com',
    phone: '9876543210',
    role: 'admin',
  },
  representative: {
    id: '2',
    name: 'Ravi Kumar',
    email: 'ravi@sambapublications.com',
    phone: '9876543211',
    role: 'representative',
    district: 'Chennai',
    assignedSchools: ['SCH001', 'SCH002', 'SCH003'],
  },
  school: {
    id: '3',
    name: 'St. Mary\'s School',
    email: 'stmarys@school.com',
    phone: '9876543212',
    role: 'school',
    schoolName: 'St. Mary\'s Higher Secondary School',
  },
  individual: {
    id: '4',
    name: 'Priya Sharma',
    email: 'priya@gmail.com',
    phone: '9876543213',
    role: 'individual',
  },
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (_email: string, _password: string, role: UserRole) => {
    // Mock login — replace with API call later
    const user = mockUsers[role];
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));

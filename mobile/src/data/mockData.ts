import type { Book } from '../store/cartStore';

const classes = ['LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];
const subjects = ['Tamil', 'English', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Computer Science'];
const terms = ['Term 1', 'Term 2', 'Term 3'];

function generateBooks(): Book[] {
  const books: Book[] = [];
  let id = 1;
  for (const cls of classes) {
    for (const subject of subjects) {
      for (const term of terms) {
        const basePrice = cls === 'LKG' || cls === 'UKG' ? 80 :
          ['1st', '2nd', '3rd'].includes(cls) ? 120 :
          ['4th', '5th'].includes(cls) ? 150 :
          ['6th', '7th', '8th'].includes(cls) ? 180 : 220;
        const price = basePrice + Math.floor(Math.random() * 40);
        books.push({
          id: `BK${String(id).padStart(4, '0')}`,
          title: `${subject} - ${cls} (${term})`,
          class: cls,
          subject,
          term,
          price,
          mrp: price + Math.floor(price * 0.15),
          coverImage: `https://placehold.co/200x280/1e3a5f/white?text=${encodeURIComponent(subject.slice(0, 4))}`,
          description: `Comprehensive ${subject} textbook for ${cls}, ${term}.`,
          stock: Math.floor(Math.random() * 500) + 50,
        });
        id++;
      }
    }
  }
  return books;
}

export const books = generateBooks();

export interface MobileOrder {
  id: string;
  items: { bookId: string; title: string; price: number; quantity: number }[];
  totalAmount: number;
  status: 'placed' | 'confirmed' | 'shipped' | 'delivered';
  createdAt: string;
  schoolName?: string;
}

export const orders: MobileOrder[] = [
  {
    id: 'ORD001',
    items: [
      { bookId: 'BK0001', title: 'Tamil - LKG (Term 1)', price: 95, quantity: 150 },
      { bookId: 'BK0004', title: 'English - LKG (Term 1)', price: 100, quantity: 150 },
    ],
    totalAmount: 29250,
    status: 'delivered',
    createdAt: '2026-01-15',
    schoolName: "St. Mary's HSS",
  },
  {
    id: 'ORD002',
    items: [
      { bookId: 'BK0022', title: 'Mathematics - 1st (Term 1)', price: 130, quantity: 200 },
    ],
    totalAmount: 26000,
    status: 'shipped',
    createdAt: '2026-02-10',
  },
  {
    id: 'ORD003',
    items: [
      { bookId: 'BK0064', title: 'Tamil - 4th (Term 1)', price: 155, quantity: 1 },
      { bookId: 'BK0067', title: 'English - 4th (Term 1)', price: 160, quantity: 1 },
    ],
    totalAmount: 315,
    status: 'placed',
    createdAt: '2026-03-18',
  },
];

export interface School {
  id: string;
  name: string;
  district: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
}

export const schools: School[] = [
  { id: 'SCH001', name: "St. Mary's Higher Secondary School", district: 'Chennai', address: '12 Anna Nagar, Chennai - 600040', contactPerson: 'Sr. Maria Thomas', phone: '044-26161234', email: 'stmarys@school.com' },
  { id: 'SCH002', name: 'Government Boys School', district: 'Chennai', address: '45 T Nagar, Chennai - 600017', contactPerson: 'Mr. Senthil Kumar', phone: '044-24341234', email: 'govboys@school.com' },
  { id: 'SCH003', name: 'DAV Public School', district: 'Chennai', address: '78 Adyar, Chennai - 600020', contactPerson: 'Mrs. Lakshmi Rao', phone: '044-24451234', email: 'dav@school.com' },
  { id: 'SCH004', name: 'Sacred Heart School', district: 'Coimbatore', address: '23 RS Puram, Coimbatore - 641002', contactPerson: 'Fr. Joseph Raj', phone: '0422-2541234', email: 'sacredheart@school.com' },
  { id: 'SCH005', name: 'Kendriya Vidyalaya', district: 'Madurai', address: '56 KK Nagar, Madurai - 625020', contactPerson: 'Mr. Arun Prasad', phone: '0452-2581234', email: 'kv@school.com' },
  { id: 'SCH006', name: 'Velammal Matriculation School', district: 'Trichy', address: '89 Srirangam, Trichy - 620006', contactPerson: 'Mrs. Priya Venkat', phone: '0431-2431234', email: 'velammal@school.com' },
  { id: 'SCH007', name: 'SRM Public School', district: 'Salem', address: '34 Fairlands, Salem - 636016', contactPerson: 'Dr. Karthik Rajan', phone: '0427-2311234', email: 'srm@school.com' },
  { id: 'SCH008', name: 'Chettinad Vidyashram', district: 'Chennai', address: '67 RA Puram, Chennai - 600028', contactPerson: 'Mrs. Meena Sundaram', phone: '044-24671234', email: 'chettinad@school.com' },
];

export interface Representative {
  id: string;
  name: string;
  email: string;
  phone: string;
  district: string;
  assignedSchools: string[];
  totalOrders: number;
  revenue: number;
  status: 'active' | 'inactive';
}

export const representatives: Representative[] = [
  { id: 'REP001', name: 'Ravi Kumar', email: 'ravi@samba.com', phone: '9876543211', district: 'Chennai', assignedSchools: ['SCH001', 'SCH002', 'SCH003', 'SCH008'], totalOrders: 45, revenue: 285000, status: 'active' },
  { id: 'REP002', name: 'Anitha Devi', email: 'anitha@samba.com', phone: '9876543215', district: 'Coimbatore', assignedSchools: ['SCH004'], totalOrders: 28, revenue: 175000, status: 'active' },
  { id: 'REP003', name: 'Murugan S.', email: 'murugan@samba.com', phone: '9876543216', district: 'Madurai', assignedSchools: ['SCH005'], totalOrders: 32, revenue: 198000, status: 'active' },
  { id: 'REP004', name: 'Kavitha R.', email: 'kavitha@samba.com', phone: '9876543217', district: 'Trichy', assignedSchools: ['SCH006'], totalOrders: 19, revenue: 112000, status: 'active' },
  { id: 'REP005', name: 'Suresh P.', email: 'suresh@samba.com', phone: '9876543218', district: 'Salem', assignedSchools: ['SCH007'], totalOrders: 15, revenue: 89000, status: 'inactive' },
];

export const getClasses = () => classes;
export const getSubjects = () => subjects;
export const getTerms = () => terms;
export const getDistricts = () => [...new Set(schools.map(s => s.district))];

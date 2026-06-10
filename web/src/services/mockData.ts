import type { Book, Order, School } from '../types';

const classes = ['LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];
const subjects = ['Tamil', 'English', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Computer Science'];
const terms = ['Term 1', 'Term 2', 'Term 3'];
const coverColors = ['#1e3a5f', '#f59e0b', '#10b981', '#6366f1', '#ef4444', '#8b5cf6', '#ec4899'];

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
        const mrp = price + Math.floor(price * 0.15);
        const colorIdx = (id - 1) % coverColors.length;

        books.push({
          id: `BK${String(id).padStart(4, '0')}`,
          title: `${subject} - ${cls} (${term})`,
          class: cls,
          subject,
          term,
          price,
          mrp,
          coverImage: `https://placehold.co/200x280/${coverColors[colorIdx].slice(1)}/white?text=${encodeURIComponent(subject.slice(0, 4))}`,
          description: `Comprehensive ${subject} textbook for ${cls} students, ${term}. Aligned with the latest curriculum standards. Includes practice exercises, illustrations, and chapter-wise assessments.`,
          stock: Math.floor(Math.random() * 500) + 50,
          isbn: `978-93-${String(8000 + id).padStart(4, '0')}-${String(Math.floor(Math.random() * 99)).padStart(2, '0')}-${id % 10}`,
          pages: 80 + Math.floor(Math.random() * 200),
          language: subject === 'Tamil' ? 'Tamil' : subject === 'Hindi' ? 'Hindi' : 'English',
        });
        id++;
      }
    }
  }
  return books;
}

export const books: Book[] = generateBooks();

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

export const orders: Order[] = [
  {
    id: 'ORD001',
    userId: '2',
    schoolId: 'SCH001',
    schoolName: "St. Mary's Higher Secondary School",
    repId: '2',
    items: [
      { bookId: 'BK0001', title: 'Tamil - LKG (Term 1)', price: 95, quantity: 150 },
      { bookId: 'BK0002', title: 'Tamil - LKG (Term 2)', price: 90, quantity: 150 },
      { bookId: 'BK0004', title: 'English - LKG (Term 1)', price: 100, quantity: 150 },
    ],
    totalAmount: 42750,
    status: 'delivered',
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: '2026-01-25T14:00:00Z',
    shippingAddress: '12 Anna Nagar, Chennai - 600040',
  },
  {
    id: 'ORD002',
    userId: '2',
    schoolId: 'SCH002',
    schoolName: 'Government Boys School',
    repId: '2',
    items: [
      { bookId: 'BK0022', title: 'Mathematics - 1st (Term 1)', price: 130, quantity: 200 },
      { bookId: 'BK0025', title: 'Science - 1st (Term 1)', price: 135, quantity: 200 },
    ],
    totalAmount: 53000,
    status: 'shipped',
    createdAt: '2026-02-10T09:00:00Z',
    updatedAt: '2026-02-18T11:30:00Z',
    shippingAddress: '45 T Nagar, Chennai - 600017',
  },
  {
    id: 'ORD003',
    userId: '3',
    schoolId: 'SCH001',
    schoolName: "St. Mary's Higher Secondary School",
    items: [
      { bookId: 'BK0064', title: 'Tamil - 4th (Term 1)', price: 155, quantity: 120 },
      { bookId: 'BK0067', title: 'English - 4th (Term 1)', price: 160, quantity: 120 },
      { bookId: 'BK0070', title: 'Mathematics - 4th (Term 1)', price: 165, quantity: 120 },
    ],
    totalAmount: 57600,
    status: 'confirmed',
    createdAt: '2026-03-01T08:45:00Z',
    updatedAt: '2026-03-03T10:00:00Z',
    shippingAddress: '12 Anna Nagar, Chennai - 600040',
  },
  {
    id: 'ORD004',
    userId: '4',
    items: [
      { bookId: 'BK0001', title: 'Tamil - LKG (Term 1)', price: 95, quantity: 1 },
      { bookId: 'BK0004', title: 'English - LKG (Term 1)', price: 100, quantity: 1 },
    ],
    totalAmount: 195,
    status: 'placed',
    createdAt: '2026-03-18T15:20:00Z',
    updatedAt: '2026-03-18T15:20:00Z',
    shippingAddress: '23 2nd Street, Besant Nagar, Chennai - 600090',
  },
  {
    id: 'ORD005',
    userId: '2',
    schoolId: 'SCH004',
    schoolName: 'Sacred Heart School',
    repId: '2',
    items: [
      { bookId: 'BK0130', title: 'Tamil - 7th (Term 1)', price: 190, quantity: 80 },
      { bookId: 'BK0133', title: 'English - 7th (Term 1)', price: 195, quantity: 80 },
      { bookId: 'BK0136', title: 'Mathematics - 7th (Term 1)', price: 200, quantity: 80 },
      { bookId: 'BK0139', title: 'Science - 7th (Term 1)', price: 185, quantity: 80 },
    ],
    totalAmount: 61600,
    status: 'placed',
    createdAt: '2026-03-19T11:00:00Z',
    updatedAt: '2026-03-19T11:00:00Z',
    shippingAddress: '23 RS Puram, Coimbatore - 641002',
  },
];

export const districts = ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Tirunelveli', 'Erode', 'Vellore'];

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

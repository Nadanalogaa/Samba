# Samba Publications - Project Context

## What This Project Is
A book ordering platform for **Samba Publications**, a Tamil Nadu-based textbook publisher covering classes LKG, UKG to 10th standard. Books are organized by class, subject, and term.

## Business Model
- **Representatives** are assigned district/school-wise. They visit schools and book bulk orders via the app.
- **Schools** can also directly place bulk orders.
- **Individuals** can purchase single books.
- **Admin** manages books, representatives, schools, and views reports.

## Tech Stack

### Web (`/web`)
- React 19 + Vite + TypeScript
- Tailwind CSS v4 (using @theme custom properties)
- React Router v7 for routing
- Zustand for state management
- Lucide React for icons

### Mobile (`/mobile`)
- Expo SDK 55 + React Native
- Expo Router (file-based routing in `/app` directory)
- Zustand for state management
- @expo/vector-icons (Ionicons)
- StyleSheet for styling (not NativeWind - peer dependency conflicts with Expo 55)

## Theme / Colors (5 brand colors)
1. **Primary** `#1e3a5f` (Deep Navy) - Headers, buttons, brand
2. **Secondary** `#f59e0b` (Amber/Gold) - Highlights, CTAs, badges
3. **Accent** `#10b981` (Emerald Green) - Success, confirmed, in-stock
4. **Danger** `#ef4444` (Red) - Errors, out of stock, cancel
5. **Info** `#6366f1` (Indigo) - Links, info badges, notifications

Light theme: bg `#f9fafb`, surface `#ffffff`, text `#1f2937`
Dark theme: bg `#0f172a`, surface `#1e293b`, text `#f1f5f9`

## 4 User Roles
- `admin` - Manage books, reps, schools, view all orders/reports
- `representative` - Assigned to districts/schools, create orders on behalf of schools
- `school` - Browse catalog, place bulk orders
- `individual` - Browse and buy single books

## Architecture

### Backend
- **Not yet implemented** - currently using mock data in `src/services/mockData.ts`
- Service layer in `src/services/api.ts` - when backend is ready, only change files in `services/`
- All service functions return Promises (simulating async API calls)

### Web Structure (`/web/src`)
- `types/` - TypeScript interfaces (Book, Order, User, School, etc.)
- `store/` - Zustand stores (authStore, cartStore, themeStore)
- `services/` - API layer with mock data (swap for real API later)
- `components/layout/` - Navbar, Sidebar, Layout, ThemeToggle
- `components/` - Reusable components (BookCard)
- `pages/auth/` - Login, Register
- `pages/dashboard/` - Role-based dashboards (Admin, Rep, School, Individual)
- `pages/catalog/` - CatalogPage, BookDetailPage
- `pages/cart/` - CartPage, CheckoutPage
- `pages/orders/` - OrdersPage, OrderDetailPage
- `pages/rep/` - CreateOrderPage, MySchoolsPage
- `pages/profile/` - ProfilePage
- `pages/settings/` - SettingsPage

### Mobile Structure (`/mobile`)
- `app/` - Expo Router screens (file-based routing)
- `app/(tabs)/` - Tab screens (home, catalog, cart, orders, profile)
- `app/book/[id].tsx` - Book detail
- `app/checkout.tsx` - Checkout flow
- `app/login.tsx` - Login screen
- `src/store/` - Zustand stores
- `src/theme/` - Color definitions
- `src/data/` - Mock data

## Running the Project
```bash
# Web
cd web && npm run dev    # http://localhost:5173

# Mobile
cd mobile && npx expo start   # Press 'i' for iOS, 'a' for Android
```

## Login
Mock auth - use any email/password. Select a role (Admin, Representative, School, Individual) to see different dashboards.

## Next Steps (Not Yet Done)
- Backend API (Node.js + Express + PostgreSQL suggested)
- Payment gateway integration (Razorpay/Stripe)
- Push notifications
- Real authentication with JWT
- Image upload for book covers
- Reports and analytics
- Deployment (Vercel for web, App Store / Play Store for mobile)

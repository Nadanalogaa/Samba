import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import CatalogPage from './pages/catalog/CatalogPage';
import BookDetailPage from './pages/catalog/BookDetailPage';
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/cart/CheckoutPage';
import OrdersPage from './pages/orders/OrdersPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import ProfilePage from './pages/profile/ProfilePage';
import SettingsPage from './pages/settings/SettingsPage';
import CreateOrderPage from './pages/rep/CreateOrderPage';
import MySchoolsPage from './pages/rep/MySchoolsPage';
import RepresentativesPage from './pages/admin/RepresentativesPage';
import SchoolsPage from './pages/admin/SchoolsPage';
import ReportsPage from './pages/admin/ReportsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PublicNavbar from './components/PublicNavbar';
import Footer from './components/Footer';

// Cash Bill Module
import CashBillLogin from './pages/cash-bill/CashBillLogin';
import CashBillLayout from './pages/cash-bill/CashBillLayout';
import CashDashboard from './pages/cash-bill/CashDashboard';
import RateMasterPage from './pages/cash-bill/RateMasterPage';
import CustomerMasterPage from './pages/cash-bill/CustomerMasterPage';
import NewOrderPage from './pages/cash-bill/NewOrderPage';
import CashOrdersPage from './pages/cash-bill/CashOrdersPage';
import CashBillsPage from './pages/cash-bill/CashBillsPage';
import CashReportsPage from './pages/cash-bill/CashReportsPage';
import CashSettingsPage from './pages/cash-bill/CashSettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** Wraps public browsable pages (catalog, book detail) with public navbar + footer */
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <PublicNavbar />
      <div className="h-16 sm:h-18" />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Public pages */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Public browsable pages */}
        <Route
          path="/catalog"
          element={
            <PublicLayout>
              <CatalogPage />
            </PublicLayout>
          }
        />
        <Route
          path="/books/:id"
          element={
            <PublicLayout>
              <BookDetailPage />
            </PublicLayout>
          }
        />

        {/* Protected routes with dashboard layout */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="books/:id" element={<BookDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="create-order" element={<CreateOrderPage />} />
          <Route path="my-schools" element={<MySchoolsPage />} />
          <Route path="representatives" element={<RepresentativesPage />} />
          <Route path="schools" element={<SchoolsPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>

        {/* Legacy redirects */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/cart" element={<Navigate to="/app/cart" replace />} />
        <Route path="/orders" element={<Navigate to="/app/orders" replace />} />
        <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
        <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
        <Route path="/checkout" element={<Navigate to="/app/checkout" replace />} />
        <Route path="/create-order" element={<Navigate to="/app/create-order" replace />} />
        <Route path="/my-schools" element={<Navigate to="/app/my-schools" replace />} />

        {/* Cash Bill Module (separate auth) */}
        <Route path="/cash-bill/login" element={<CashBillLogin />} />
        <Route path="/cash-bill" element={<CashBillLayout />}>
          <Route index element={<CashDashboard />} />
          <Route path="rate-master" element={<RateMasterPage />} />
          <Route path="customers" element={<CustomerMasterPage />} />
          <Route path="new-order" element={<NewOrderPage />} />
          <Route path="orders" element={<CashOrdersPage />} />
          <Route path="bills" element={<CashBillsPage />} />
          <Route path="reports" element={<CashReportsPage />} />
          <Route path="settings" element={<CashSettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

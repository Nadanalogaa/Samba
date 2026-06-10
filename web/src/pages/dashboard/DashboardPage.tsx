import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import AdminDashboard from './AdminDashboard';
import RepDashboard from './RepDashboard';
import SchoolDashboard from './SchoolDashboard';
import IndividualDashboard from './IndividualDashboard';

export default function DashboardPage() {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'representative':
      return <RepDashboard />;
    case 'school':
      return <SchoolDashboard />;
    case 'individual':
      return <IndividualDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
}

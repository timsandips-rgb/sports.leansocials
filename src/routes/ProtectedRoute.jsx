import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';
import { ROLES } from '../utils/constants';

export default function ProtectedRoute({ children, requireRole }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner className="py-20" />;
  if (!user) return <Navigate to="/login" replace />;
  if (requireRole === 'admin' && ![ROLES.SUPER_ADMIN, ROLES.COMMUNITY_ADMIN].includes(user.role)) {
    return <Navigate to="/app" replace />;
  }
  return children;
}

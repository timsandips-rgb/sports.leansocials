import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/constants';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '../components/layout/AdminLayout';
import ParticipantLayout from '../components/layout/ParticipantLayout';
import Spinner from '../components/common/Spinner';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Setup from '../pages/auth/Setup';

import AdminDashboard from '../pages/admin/Dashboard';
import Communities from '../pages/admin/Communities';
import Users from '../pages/admin/Users';
import Matches from '../pages/admin/Matches';
import Results from '../pages/admin/Results';
import Deadlines from '../pages/admin/Deadlines';
import Leaderboards from '../pages/admin/Leaderboards';
import Notifications from '../pages/admin/Notifications';
import AuditLogs from '../pages/admin/AuditLogs';
import Settings from '../pages/admin/Settings';

import ParticipantDashboard from '../pages/participant/Dashboard';
import Predictions from '../pages/participant/Predictions';
import Scoreboard from '../pages/participant/Scoreboard';
import Rankings from '../pages/participant/Rankings';
import Messages from '../pages/participant/Messages';
import Profile from '../pages/participant/Profile';

export default function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner className="py-20" />;

  const isAdmin = user && [ROLES.SUPER_ADMIN, ROLES.COMMUNITY_ADMIN].includes(user.role);

  return (
    <Routes>
      <Route path="/setup" element={<Setup />} />
      <Route path="/login" element={user ? <Navigate to={isAdmin ? '/admin' : '/app'} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={isAdmin ? '/admin' : '/app'} /> : <Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/admin" element={<ProtectedRoute requireRole="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="communities" element={<Communities />} />
        <Route path="users" element={<Users />} />
        <Route path="matches" element={<Matches />} />
        <Route path="results" element={<Results />} />
        <Route path="deadlines" element={<Deadlines />} />
        <Route path="leaderboards" element={<Leaderboards />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="audit" element={<AuditLogs />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="/app" element={<ProtectedRoute><ParticipantLayout /></ProtectedRoute>}>
        <Route index element={<ParticipantDashboard />} />
        <Route path="predictions" element={<Predictions />} />
        <Route path="scoreboard" element={<Scoreboard />} />
        <Route path="rankings" element={<Rankings />} />
        <Route path="messages" element={<Messages />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to={user ? (isAdmin ? '/admin' : '/app') : '/login'} replace />} />
    </Routes>
  );
}

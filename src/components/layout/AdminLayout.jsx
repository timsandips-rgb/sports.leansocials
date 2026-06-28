import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/communities', label: 'Communities', icon: '🏢' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/matches', label: 'Matches', icon: '⚽' },
  { to: '/admin/results', label: 'Results', icon: '🎯' },
  { to: '/admin/deadlines', label: 'Deadlines', icon: '⏰' },
  { to: '/admin/leaderboards', label: 'Leaderboards', icon: '🏆' },
  { to: '/admin/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/admin/audit', label: 'Audit Logs', icon: '📝' },
  { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-primary">
      <Sidebar items={adminNav} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

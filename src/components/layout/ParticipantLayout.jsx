import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const participantNav = [
  { to: '/app', label: 'Dashboard', icon: '🏠' },
  { to: '/app/predictions', label: 'Predictions', icon: '🎯' },
  { to: '/app/scoreboard', label: 'Scoreboard', icon: '📊' },
  { to: '/app/rankings', label: 'Rankings', icon: '🏆' },
  { to: '/app/messages', label: 'Messages', icon: '💬' },
  { to: '/app/profile', label: 'Profile', icon: '👤' },
];

export default function ParticipantLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-primary">
      <Sidebar items={participantNav} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { cn } from '../../utils/helpers';

export default function Sidebar({ items }) {
  const { user, community, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-secondary border-r border-surface flex flex-col">
      <div className="p-4 border-b border-surface">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <div>
            <h1 className="font-bold text-sm leading-tight">WC 2026</h1>
            <p className="text-xs text-text-secondary">Predictor</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin' || item.to === '/app'}
            className={({ isActive }) =>
              cn('flex items-center gap-3 px-3 py-2 rounded-btn text-sm transition',
                isActive ? 'bg-accent text-white' : 'text-text-secondary hover:bg-white/5')
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-surface">
        <div className="px-3 py-2 text-xs text-text-secondary">
          {community?.communityName}
        </div>
        <div className="px-3 py-2 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-bold">
            {user?.fullName?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.fullName}</p>
            <p className="text-xs text-text-secondary truncate">@{user?.username}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-btn transition">
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}

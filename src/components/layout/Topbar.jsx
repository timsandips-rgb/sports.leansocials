import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { formatTimeAgo } from '../../utils/formatters';

export default function Topbar() {
  const { user, community } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="bg-secondary border-b border-surface px-6 py-3 flex items-center justify-between">
      <div>
        <h2 className="text-sm text-text-secondary">{community?.communityName || 'Community'}</h2>
        <p className="text-xs text-text-secondary/70">{community?.communityCode}</p>
      </div>
      <div className="relative">
        <button onClick={() => setOpen(!open)} className="relative p-2 rounded-btn hover:bg-white/5">
          <span className="text-xl">🔔</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-80 card p-2 z-50 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-text-secondary text-sm py-4">No notifications</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="p-3 border-b border-surface last:border-0 hover:bg-white/5 rounded">
                  <p className="font-medium text-sm">{n.title}</p>
                  <p className="text-text-secondary text-xs mt-1">{n.body}</p>
                  <p className="text-text-secondary/60 text-xs mt-1">{formatTimeAgo(n.sentAt)}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </header>
  );
}

import { createContext, useState, useEffect, useContext } from 'react';
import { notificationService } from '../services/notificationService';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext({ notifications: [], unreadCount: 0 });

export function NotificationProvider({ children }) {
  const { user, community } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!community?.id || !user) return;
    const unsub = notificationService.subscribe(community.id, (data) => {
      setNotifications(data.slice(0, 30));
    });
    return () => unsub();
  }, [community?.id, user]);

  const unreadCount = notifications.filter((n) => !n.readBy?.includes(user?.userId)).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NotificationContext = createContext();

const NOTIF_KEY = 'ucu_notifications_v1';

// Read all notifications from localStorage (shared across all users in same browser)
function readNotifications() {
  try {
    return JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeNotifications(notifs) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
}

// Called by any action that should broadcast a notification to everyone
export function broadcastNotification(type, message, actorName = '') {
  const all = readNotifications();
  const notif = {
    id: Date.now() + Math.random(),
    type,          // 'group_created' | 'session_created' | 'member_joined' | 'post_created' | 'user_registered'
    message,
    actorName,
    timestamp: new Date().toISOString(),
    readBy: []     // array of user ids who have read it
  };
  all.unshift(notif);
  // Keep max 50 notifications
  writeNotifications(all.slice(0, 50));
  // Dispatch storage event manually for same-tab detection
  window.dispatchEvent(new StorageEvent('storage', { key: NOTIF_KEY }));
  return notif;
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  const refresh = useCallback(() => {
    setNotifications(readNotifications());
  }, []);

  // Poll every 3 seconds for new notifications (simulates real-time for GitHub Pages)
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Also listen to storage events (cross-tab)
  useEffect(() => {
    const handler = (e) => {
      if (e.key === NOTIF_KEY || !e.key) refresh();
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [refresh]);

  const markAllRead = useCallback((userId) => {
    if (!userId) return;
    const all = readNotifications();
    const updated = all.map(n => ({
      ...n,
      readBy: n.readBy.includes(userId) ? n.readBy : [...n.readBy, userId]
    }));
    writeNotifications(updated);
    setNotifications(updated);
  }, []);

  const unreadCount = useCallback((userId) => {
    if (!userId) return 0;
    return notifications.filter(n => !n.readBy.includes(userId)).length;
  }, [notifications]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAllRead,
      refresh
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);

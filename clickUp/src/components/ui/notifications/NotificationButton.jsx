import React, { useState, useEffect } from 'react';
import { notificationService } from '../../../services/notificationService.js';

const NotificationButton = ({ user, onToggle }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
  }, [user]);

  const fetchUnreadCount = async () => {
    setLoading(true);
    setError(false);
    try {
      const notifications = await notificationService.getUnreadNotifications(user?.id);
      const count = notifications.filter(n => !n.is_read).length;
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching unread notifications:', err);
      setError(true);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (event) => {
    event.stopPropagation();
    onToggle();
  };

  return (
    <button className="icon-button notification-button" onClick={handleClick} aria-label="Notificações">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="28"
        height="28"
        fill="currentColor"
        style={{ display: 'block' }}
      >
        <path d="M12 2a5 5 0 0 0-5 5v3.08A7 7 0 0 0 5 17.94L5 18h14l0-.06a7 7 0 0 0-2-7.86V7a5 5 0 0 0-5-5Zm0 20a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3Z" />
      </svg>
      <span className="icon-button-badge" style={error ? { backgroundColor: '#dc3545' } : {}}>
        {loading ? '...' : error ? '!' : unreadCount.toString()}
      </span>
    </button>
  );
};

export default NotificationButton;
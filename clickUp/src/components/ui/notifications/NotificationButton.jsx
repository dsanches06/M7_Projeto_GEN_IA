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
    <button className="icon-button" onClick={handleClick}>
      <span>
        <i className="fa-solid fa-bell fa-2xl fa-shake" style={{ pointerEvents: 'none' }}></i>
      </span>
      <span className="icon-button-badge" style={error ? { backgroundColor: '#dc3545' } : {}}>
        {loading ? '...' : error ? '!' : unreadCount.toString()}
      </span>
    </button>
  );
};

export default NotificationButton;
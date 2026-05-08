import React, { useState, useEffect, useRef } from 'react';
import NotificationItem from './NotificationItem.jsx';
import { notificationService } from '../../../services/notificationService.js';

const NotificationBox = ({ user, isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const boxRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getNotificationsByUser(user.id);
      setNotifications(data);
    } catch (err) {
      setError('Erro ao carregar notificações');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div ref={boxRef} className="notifi-box open">
      <h2>Notificações ({notifications.length})</h2>
      {loading && <p>Carregando...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && notifications.length === 0 && <p>Sem notificações</p>}
      {!loading && !error && notifications.length > 0 && (
        notifications.map((notif) => (
          <NotificationItem key={notif.id} notification={notif} />
        ))
      )}
    </div>
  );
};

export default NotificationBox;
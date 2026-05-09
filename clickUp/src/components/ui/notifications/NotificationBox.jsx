import React, { useState, useEffect, useRef } from 'react';
import NotificationItem from './NotificationItem.jsx';
import { notificationService } from '../../../services/notificationService.js';
import { useTheme } from "../../../context/ThemeContext.jsx";

const NotificationBox = ({ user, isOpen, onClose, onRefreshBadge }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const boxRef = useRef(null);

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) onClose();
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(user?.id);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao carregar notificações");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div ref={boxRef} style={{
      position: 'absolute', top: '50px', right: '0', width: '320px', maxHeight: '450px',
      backgroundColor: theme === "dark" ? "#1a1a1a" : "#fff",
      color: theme === "dark" ? "#fff" : "#333",
      borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      zIndex: 1000, overflow: 'hidden', display: 'flex', flexDirection: 'column',
      border: `1px solid ${theme === "dark" ? "#333" : "#eee"}`
    }}>
      <div style={{ padding: '15px', borderBottom: `1px solid ${theme === "dark" ? "#333" : "#eee"}`, fontWeight: 'bold' }}>
        Notificações ({notifications.length})
      </div>
      <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
        {loading ? <p style={{ textAlign: 'center', padding: '20px' }}>Carregando...</p> : 
         notifications.length === 0 ? <p style={{ textAlign: 'center', padding: '20px', opacity: 0.5 }}>Vazio</p> :
         notifications.map(n => (
           <NotificationItem key={n.id} notification={n} onRefreshBadge={onRefreshBadge} />
         ))
        }
      </div>
    </div>
  );
};

export default NotificationBox;

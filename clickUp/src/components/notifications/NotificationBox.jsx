import React, { useState, useEffect, useRef } from 'react';
import NotificationItem from './NotificationItem.jsx';
import { notificationService } from '../../services/notificationService.js';
import { useTheme } from "../../context/ThemeContext.jsx";

// Painel dropdown com lista de notificações — fecha ao clicar fora
const NotificationBox = ({ user, isOpen, onClose, onRefreshBadge }) => {
  // Lista de notificações carregadas da API
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  // Ref para detectar cliques fora do painel
  const boxRef = useRef(null);

  // Carrega notificações sempre que o painel abre ou o utilizador muda
  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, user]);

  // Fecha o painel ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) onClose();
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Busca notificações do utilizador (ou globais se não houver userId)
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
      {/* Cabeçalho com contagem total */}
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

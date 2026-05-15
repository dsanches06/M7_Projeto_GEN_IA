import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext.jsx";
import { notificationService } from "../../services/notificationService.js";

// Item individual de notificação — clicável para marcar como lida
const NotificationItem = ({ notification, onRefreshBadge }) => {
  const { theme } = useTheme();
  // Estado local de leitura (sincronizado com o valor da API)
  const [isRead, setIsRead] = useState(notification.is_read || notification.isRead || false);

  const title = notification.title || "Notificação";
  const message = notification.message || "";

  // Marca como lida na API e actualiza o badge de notificações
  const handleRead = async () => {
    if (isRead) return;
    try {
      await notificationService.markAsRead(notification.id);
      setIsRead(true);
      onRefreshBadge(); // Actualiza o badge vermelho no botão imediatamente
    } catch (err) {
      console.error("Erro ao marcar como lida");
    }
  };

  return (
    <div onClick={handleRead} style={{
      padding: '12px', borderRadius: '8px', cursor: 'pointer', transition: '0.2s',
      // Opacidade reduzida para notificações já lidas
      opacity: isRead ? 0.6 : 1,
      // Borda vermelha à esquerda para notificações não lidas
      borderLeft: !isRead ? "4px solid #E53535" : "4px solid transparent",
      backgroundColor: "transparent", marginBottom: '4px'
    }}
    onMouseEnter={e => e.currentTarget.style.backgroundColor = theme === "dark" ? "#2a2a2a" : "#f5f5f5"}
    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
    >
      {/* Título em negrito se não lida */}
      <div style={{ fontSize: '14px', fontWeight: isRead ? 'normal' : 'bold' }}>{title}</div>
      <div style={{ fontSize: '13px', opacity: 0.8 }}>{message}</div>
    </div>
  );
};

export default NotificationItem;

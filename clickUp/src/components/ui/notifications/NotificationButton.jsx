import React, { useState, useEffect, useRef, useCallback } from "react";
import { notificationService } from "../../../services/notificationService.js";
import { useTheme } from "../../../context/ThemeContext.jsx";
import NotificationBox from "./NotificationBox.jsx";

const NotificationButton = ({ user }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [animate, setAnimate] = useState(false);
  const { theme } = useTheme();
  const prevCountRef = useRef(0);

  // Cores dinâmicas
  const bellColor = theme === "dark" ? "#FFFFFF" : "#000000";
  const badgeBorder = theme === "dark" ? "#0d0d0d" : "#f8fafc";

  const updateBadgeCount = useCallback(async () => {
    if (!user?.id) return;
    try {
      const list = await notificationService.getUnreadNotifications(user.id);
      const notificationsArray = Array.isArray(list) ? list : [];
      
      // Corrigido: Verifica todas as variações de nomes de campos comuns
      const count = notificationsArray.filter(n => 
        n.isRead === false || n.is_read === false || n.read === false || n.status === 'unread'
      ).length;
      
      if (count > prevCountRef.current) {
        setAnimate(true);
        setTimeout(() => setAnimate(false), 2000);
      }
      
      setUnreadCount(count);
      prevCountRef.current = count;
    } catch (error) {
      console.error("Erro no badge:", error);
    }
  }, [user?.id]);

  useEffect(() => {
    updateBadgeCount();
    const interval = setInterval(updateBadgeCount, 30000);
    return () => clearInterval(interval);
  }, [updateBadgeCount]);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <style>{`
        @keyframes bellShake {
          0% { transform: rotate(0); }
          15% { transform: rotate(12deg); }
          30% { transform: rotate(-12deg); }
          100% { transform: rotate(0); }
        }
        .bell-shake { animation: bellShake 0.6s ease-in-out 3; transform-origin: top center; }
      `}</style>
      
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        style={{ background: "none", border: "none", cursor: "pointer", padding: "8px", outline: "none", position: "relative" }}
      >
        <div className={animate ? "bell-shake" : ""}>
          <svg viewBox="0 0 448 512" width="24" height="24">
            <path fill={bellColor} d="M224 0c-17.7 0-32 14.3-32 32l0 3.2C119 50 64 114.6 64 192l0 21.7c0 48.1-16.4 94.8-46.4 132.4L7.8 358.3C2.7 364.6 0 372.4 0 380.5 0 400.1 15.9 416 35.5 416l376.9 0c19.6 0 35.5-15.9 35.5-35.5 0-8.1-2.7-15.9-7.8-22.2l-9.8-12.2C400.4 308.5 384 261.8 384 213.7l0-21.7c0-77.4-55-142-128-156.8l0-3.2c0-17.7-14.3-32-32-32zM162 464c7.1 27.6 32.2 48 62 48s54.9-20.4 62-48l-124 0z" />
          </svg>
        </div>

        {/* BADGE VERMELHO: Garantia de visibilidade */}
        {unreadCount > 0 && (
          <span style={{ 
            position: "absolute", 
            top: "2px", 
            right: "2px", 
            minWidth: "18px", 
            height: "18px", 
            background: "#FF3B30", // Vermelho vibrante da imagem
            color: "#FFFFFF", 
            borderRadius: "50%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            fontSize: "10px", 
            fontWeight: "bold", 
            border: `2px solid ${badgeBorder}`,
            zIndex: 999, // Força estar à frente de tudo
            pointerEvents: "none"
          }}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <NotificationBox 
        user={user} 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onRefreshBadge={updateBadgeCount} 
      />
    </div>
  );
};
export default NotificationButton;

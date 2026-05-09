import React, { useState, useEffect } from "react";
import { notificationService } from "../../../services/notificationService.js";
import { useTheme } from "../../../context/ThemeContext.jsx";

const NotificationButton = ({ user, onToggle }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  const bellColor = theme === "dark" ? "#29B6F6" : "#039BE5";
  const hoverBg = theme === "dark" ? "rgba(41,182,246,0.15)" : "rgba(3,155,229,0.1)";
  const badgeBorder = theme === "dark" ? "#0d0d0d" : "#f8fafc";

  useEffect(() => { fetchUnreadCount(); }, [user]);

  const fetchUnreadCount = async () => {
    setLoading(true);
    try {
      const list = await notificationService.getUnreadNotifications(user?.id);
      setUnreadCount(Array.isArray(list) ? list.filter(n => !n.isRead && !n.is_read).length : 0);
    } catch { setUnreadCount(0); }
    finally { setLoading(false); }
  };

  return (
    <button
      onClick={e => { e.stopPropagation(); onToggle(); }}
      aria-label="Notificações" title="Notificações"
      style={{ position: "relative", background: "none", border: "none", cursor: "pointer", padding: "6px", display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", transition: "background 0.2s", outline: "none" }}
      onMouseEnter={e => e.currentTarget.style.background = hoverBg}
      onMouseLeave={e => e.currentTarget.style.background = "none"}
    >
      <svg viewBox="0 0 64 72" width="26" height="26" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="32" cy="5" r="5" fill={bellColor} />
        <path d="M32 9 C19 9 11 19 10 30 L7 52 Q6.5 58 12 58 L52 58 Q57.5 58 57 52 L54 30 C53 19 45 9 32 9 Z" fill={bellColor} />
        <rect x="14" y="57" width="36" height="7" rx="3.5" fill={bellColor} />
        <ellipse cx="32" cy="69" rx="10" ry="6.5" fill={bellColor} />
      </svg>
      {!loading && (
        <span style={{ position: "absolute", top: "-1px", right: "-3px", minWidth: "19px", height: "19px", background: "#E53535", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, lineHeight: 1, padding: "0 3px", border: `2px solid ${badgeBorder}`, boxSizing: "border-box" }}>
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationButton;

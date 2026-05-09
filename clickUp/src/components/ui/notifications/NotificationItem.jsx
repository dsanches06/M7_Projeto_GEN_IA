import React from "react";

const NotificationItem = ({ notification }) => {
  const title   = typeof notification.getTitle           === "function" ? notification.getTitle()           : notification.title   || "Notificação";
  const message = typeof notification.getMessage         === "function" ? notification.getMessage()         : notification.message || "";
  const sentAt  = typeof notification.getSentAt          === "function" ? notification.getSentAt()          : notification.sent_at || notification.sentAt || null;
  const isRead  = typeof notification.isNotificationRead === "function" ? notification.isNotificationRead() : notification.is_read || notification.isRead || false;
  return (
    <div className="notifi-item" style={{ opacity: isRead ? 0.6 : 1 }}>
      <div className="text">
        <strong>{title}</strong>
        <p>{message}</p>
        {sentAt && <small style={{ fontSize:"12px", color:"#999" }}>{new Date(sentAt).toLocaleString("pt-PT")}</small>}
      </div>
    </div>
  );
};

export default NotificationItem;

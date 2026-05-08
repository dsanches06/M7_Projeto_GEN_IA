import React from 'react';

const NotificationItem = ({ notification }) => {
  return (
    <div className="notifi-item">
      <div className="text">
        <strong>{notification.getTitle()}</strong>
        <p>{notification.getMessage()}</p>
        <small style={{ fontSize: '12px', color: '#999' }}>
          {new Date(notification.getSentAt()).toLocaleString('pt-PT')}
        </small>
      </div>
    </div>
  );
};

export default NotificationItem;
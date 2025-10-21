import React, { useEffect } from 'react';

export default function Notification({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notification notification-${type} notification-enter`}>
      <div className="notification-content">
        {type === 'success' && <span className="notification-icon">✓</span>}
        {type === 'error' && <span className="notification-icon">✕</span>}
        {message}
      </div>
    </div>
  );
}
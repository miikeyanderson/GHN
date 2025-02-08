import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllNotifications, removeNotification } from '../store/slices/notificationsSlice';
import type { RootState } from '../store';

const Notifications: React.FC = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state: RootState) => selectAllNotifications(state));

  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.autoHideDuration) {
        const timer = setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, notification.autoHideDuration);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, dispatch]);

  if (notifications.length === 0) return null;

  return (
    <div className="notifications-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
          role="alert"
        >
          {notification.title && (
            <div className="notification-title">{notification.title}</div>
          )}
          <div className="notification-message">{notification.message}</div>
          <button
            className="notification-close"
            onClick={() => dispatch(removeNotification(notification.id))}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default Notifications;

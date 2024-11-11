import React, { createContext, useContext, useState } from 'react';
import Notification from '../components/Notification'; // Go into components from the src directory
 // Adjust the path according to your project structure

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    setNotifications((prev) => [...prev, notification]);
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      {notifications.map((notif, index) => (
        <Notification key={index} message={notif.message} type={notif.type} />
      ))}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);

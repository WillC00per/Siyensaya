import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Create Socket Context
const SocketContext = createContext();

// Create a provider component
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { addNotification } = useNotification(); // Use your notification context

  useEffect(() => {
    const socketInstance = io('http://localhost:3000'); // Adjust the URL as needed
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Connected to server');
      // Register the student on connection (make sure to pass the correct student ID)
      socketInstance.emit('registerStudent', studentId); // Replace studentId with actual student ID
    });

    socketInstance.on('badgeAwarded', (data) => {
      addNotification({ message: data.message, type: 'success' }); // Display notification
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

// Create a custom hook for using the socket context
export const useSocket = () => {
  return useContext(SocketContext);
};
    
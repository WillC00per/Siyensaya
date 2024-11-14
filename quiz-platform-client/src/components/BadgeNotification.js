import { useEffect } from 'react';
import { io } from 'socket.io-client';

const BadgeNotification = () => {
    useEffect(() => {
        // Establish a connection to the Socket.IO server
        const socket = io('https://siyensaya.onrender.com'); // Make sure the URL matches your server

        // Listen for the 'badgeAwarded' event
        socket.on('badgeAwarded', (data) => {
            // Display the notification using an alert
            alert(data.message); // You can replace this with a more sophisticated notification method
        });

        // Clean up the socket connection on component unmount
        return () => {
            socket.disconnect();
        };
    }, []);

    return null; // This component doesn't render anything
};

export default BadgeNotification;

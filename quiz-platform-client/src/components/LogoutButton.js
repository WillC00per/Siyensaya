import React from 'react';
import './LogoutButton.css';
import { useNavigate } from 'react-router-dom'; // Use useNavigate instead of useHistory

const LogoutButton = () => {
  const navigate = useNavigate(); // Use useNavigate hook

  const handleLogout = async () => {
    try {
      // Make a POST request to the logout endpoint
      await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // No body needed for this request
      });

      // Clear JWT token from localStorage or sessionStorage
      localStorage.removeItem('token'); // or sessionStorage.removeItem('token');

      // Redirect to login page
      navigate('/login'); // Use navigate for redirection
    } catch (error) {
      console.error('Error during logout:', error);
      alert('An error occurred while logging out. Please try again.');
    }
  };

  return (
    <button onClick={handleLogout} className="btn btn-danger">
      Logout
    </button>
  );
};

export default LogoutButton;

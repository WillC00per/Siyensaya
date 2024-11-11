import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NavigationBar = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check if the user is logged in
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token); // Set isLoggedIn to true if token exists, otherwise false
    }, []);

    const handleLogout = () => {
        // Clear authentication token from local storage
        localStorage.removeItem('token');
        // Redirect to login page
        navigate('/login');
        setIsLoggedIn(false); // Update isLoggedIn state to false after logout
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-custom">
            <a className="navbar-brand" href="/">
                <img src="https://i.imgur.com/MarnSTT.png" alt="Logo" />
            </a>
            <div className="navbar-menu">
                <ul className="navbar-nav ml-auto">
                    <li className="nav-item">
                        <a className="nav-link" href="/">Home</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#">Lessons</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#">Quizzes</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#">Games</a>
                    </li>
                    <li className="nav-item">
                        <input type="text" className="form-control search-input" placeholder="Search" />
                    </li>
                    <li className="nav-item">
                        {isLoggedIn ? (
                            <button className="nav-link login-btn" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> Logout</button>
                        ) : (
                            <a className="nav-link login-btn" href="/login"><i className="fas fa-user"></i> Login</a>
                        )}
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default NavigationBar;

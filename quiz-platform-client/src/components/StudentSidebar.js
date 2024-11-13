import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './StudentSidebar.css'; // Import custom CSS for the student sidebar
import { FaTrophy, FaBookOpen, FaUser, FaSignOutAlt, FaAngleLeft, FaAngleRight, FaPlayCircle } from 'react-icons/fa'; // Updated icons

const StudentSidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(true); // Set initial state to true for default collapse

    // Function to toggle sidebar collapse state
    const toggleSidebar = () => {
        setIsCollapsed(prevState => {
            const newState = !prevState;
            console.log(`Sidebar is now ${newState ? 'collapsed' : 'expanded'}`); // Log the new state
            return newState;
        });
    };

    // Function to handle logout
    const handleLogout = async () => {
        try {
            await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            localStorage.removeItem('token');
            window.location.href = '/login';
        } catch (error) {
            console.error('Error during logout:', error);
            alert('An error occurred while logging out. Please try again.');
        }
    };

    // Effect to handle initial sidebar state based on screen size
    useEffect(() => {
        const handleResize = () => {
            const isMobileOrTablet = window.matchMedia("(max-width: 768px)").matches;
            setIsCollapsed(isMobileOrTablet); // Collapse sidebar on mobile/tablet
        };

        // Initial check
        handleResize();

        // Listen for resize events
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize); // Clean up listener on unmount
        };
    }, []);

    return (
        <nav className={`student-sidebar sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="logo">
                <img src="https://i.imgur.com/YEHdgkb.png" alt="Logo" />
            </div>
            <ul className="nav flex-column">
                <li className="nav-item">
                    <Link className="nav-link" to="/student">
                        <FaUser className="nav-icon" />
                        {!isCollapsed && 'Student Dashboard'}
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/quizzes">
                        <FaTrophy className="nav-icon" />
                        {!isCollapsed && 'Quizzes'}
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/student-lessons">
                        <FaBookOpen className="nav-icon" />
                        {!isCollapsed && 'Lessons'}
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/student-game">
                        <FaPlayCircle className="nav-icon" />
                        {!isCollapsed && 'Games'}
                    </Link>
                </li>
                <li className="nav-item">
                    <a className="nav-link" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                        <FaSignOutAlt className="nav-icon" />
                        {!isCollapsed && 'Logout'}
                    </a>
                </li>
            </ul>
            <button className="toggle-btn" onClick={toggleSidebar}>
                {isCollapsed ? <FaAngleRight /> : <FaAngleLeft />}
            </button>
        </nav>
    );
};

export default StudentSidebar;

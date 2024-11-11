import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import LogoutButton from './LogoutButton';
import './TeacherSidebar.css'; // Ensure to import the new CSS file

const TeacherSidebar = () => {
    // State to manage toggle of Content Management submenu
    const [isContentOpen, setIsContentOpen] = useState(false);

    // Toggle function to open/close Content Management submenu
    const toggleContentMenu = () => {
        setIsContentOpen(!isContentOpen);
    };

    return (
        <nav className="teacher-sidebar sidebar">
            <div className="logo">
                <img src="https://i.imgur.com/em476ya.png" alt="Logo" />
            </div>
            <ul className="nav flex-column">
                <li className="nav-item">
                    <Link className="nav-link" to="/teacherdashboard">
                        Teacher Dashboard
                    </Link>
                </li>
                <li className="nav-item">
                    {/* Toggle Content Management menu */}
                    <div className="nav-link" onClick={toggleContentMenu} style={{ cursor: 'pointer' }}>
                        Content <br /> Management
                    </div>
                    {isContentOpen && (
                        <ul className="nav flex-column ml-3 submenu">
                            <li className="nav-item">
                                <Link className="nav-link small" to="/quiz-form">
                                    Quiz Creation
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link small" to="/lesson-form">
                                    Lesson Creation
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link small" to="/badge-form">
                                    Badge Creation
                                </Link>
                            </li>
                        </ul>
                    )}
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/teacher-lessons">
                        Student Progress
                    </Link>
                </li>
            </ul>
            <div className="bottom-links">
                <LogoutButton />
            </div>
        </nav>
    );
};

export default TeacherSidebar;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AdminSidebar.css';
import LogoutButton from './LogoutButton';

const Sidebar = () => {
    // State to manage toggle of Content Management submenu
    const [isContentOpen, setIsContentOpen] = useState(false);

    // Toggle function to open/close Content Management submenu
    const toggleContentMenu = () => {
        setIsContentOpen(!isContentOpen);
    };

    return (
        <nav className="admin-sidebar sidebar">
            <div className="logo">
                <img src="https://i.imgur.com/em476ya.png" alt="Logo" />
            </div>
            <ul className="nav flex-column">
                <li className="nav-item">
                    <Link className="nav-link" to="/admindashboard">
                        Admin Dashboard
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/user-management">
                        User <br /> Management
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
                                <Link className="nav-link small" to="/quiz-management">
                                    Quiz Management
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link small" to="/upload-avatar">
                                    Avatar Upload
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link small" to="/upload-game">
                                    Game Upload
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link small" to="/lesson-management">
                                    Lesson Management
                                </Link>
                            </li>
                        </ul>
                    )}
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/report">
                      
                    </Link>
                </li>
            </ul>
            <div className="bottom-links">
                <LogoutButton />
            </div>
        </nav>
    );
};

export default Sidebar;

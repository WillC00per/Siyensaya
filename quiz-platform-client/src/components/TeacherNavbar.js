import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './TeacherNavbar.css'; // Import your custom CSS file
import axios from 'axios';

const TeacherNavbar = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await axios.get('https://siyensaya.onrender.com/user', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    if (response.status === 200) {
                        const { firstName, lastName } = response.data;
                        setFirstName(firstName);
                        setLastName(lastName);
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    return (
        <nav className="teacher-navbar navbar navbar-expand-lg">
            <a className="navbar-brand" href="/">
                <img src="https://i.imgur.com/MarnSTT.png" alt="Logo" className="navbar-logo" />
            </a>
            <div className="collapse navbar-collapse">
                <form className="form-inline ml-auto search-form">
                    <input className="form-control search-input" type="search" placeholder="Search" aria-label="Search" />
                    <button className="btn search-btn" type="submit">Search</button>
                </form>
                <div className="navbar-nav ml-auto">
                    <span className="navbar-text user-info">
                        <img 
                            src="profile-picture-url" 
                            className="rounded-circle profile-picture" 
                            alt="Profile" 
                            width="40" 
                            height="40" 
                        /> 
                        {`${firstName} ${lastName}`} <span className="user-role">| Teacher</span>
                    </span>
                </div>
            </div>
        </nav>
    );
};

export default TeacherNavbar;

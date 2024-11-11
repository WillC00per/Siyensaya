import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './StudentNavbar.css'; // Import your custom CSS file
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons'; // Import the icons

const StudentNavbar = () => {
    const [fullName, setFullName] = useState(''); // State to hold the full name
    const [avatarUrl, setAvatarUrl] = useState(''); // State to hold the avatar URL
    const [isNavbarVisible, setIsNavbarVisible] = useState(true); // State to control navbar visibility

    // Function to check the device orientation and visibility
    const checkNavbarVisibility = () => {
        // Check if the screen width is less than 768px (mobile view)
        const isMobileView = window.innerWidth < 768;

        // Hide navbar in mobile view (both portrait and landscape)
        setIsNavbarVisible(!isMobileView);
    };

    useEffect(() => {
        // Check initial visibility
        checkNavbarVisibility();

        // Fetch user data
        const fetchUserData = async () => {
            const studentId = localStorage.getItem('studentId');
            if (!studentId) {
                console.error('Student ID not found in localStorage.');
                return;
            }

            try {
                const response = await axios.get(`http://localhost:3000/api/profile/${studentId}`);

                // Log the entire response to inspect its structure
                console.log('API Response:', response.data);

                if (response.status === 200) {
                    // Set the full name directly from the profile data
                    setFullName(response.data.fullName || ''); // Default to empty if not found
                    setAvatarUrl(response.data.avatarUrl ? `http://localhost:3000${response.data.avatarUrl}` : '/default-avatar.png');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();

        // Add an event listener for resize to check visibility
        window.addEventListener('resize', checkNavbarVisibility);
        
        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('resize', checkNavbarVisibility);
        };
    }, []);

    // Function to toggle navbar visibility
    const toggleNavbar = () => {
        setIsNavbarVisible((prevVisible) => !prevVisible);
    };

    return (
        <>
            <nav className="student-navbar navbar navbar-light bg-light">
                {/* Show the navbar brand and other elements only when the navbar is expanded */}
                {isNavbarVisible && (
                    <>
                        <a className="navbar-brand" href="/">
                            <img className="logo-normal" src="https://i.imgur.com/MarnSTT.png" alt="Logo" />
                        </a>

                        <form className="form-inline my-2 my-lg-0 ml-auto">
                            <input className="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" />
                            <button 
                                className="btn btn-outline-success search-button" // Added specific class here
                                type="submit"
                            >
                                Search
                            </button>
                        </form>
                        <div className="navbar-nav ml-auto">
                            <span className="navbar-text">
                                <img src={avatarUrl} className="rounded-circle" alt="Profile" width="30" height="30" /> 
                                {fullName || 'Guest'} {/* Default to 'Guest' if fullName is empty */}
                            </span>
                        </div>
                    </>
                )}

                {/* Toggle button with specific styling */}
                <button 
                    className="btn btn-warning navbar-toggle-button" // Added specific class here
                    onClick={toggleNavbar} 
                    aria-label="Toggle Navbar"
                >
                    <FontAwesomeIcon icon={isNavbarVisible ? faChevronUp : faChevronDown} />
                    <span style={{ marginLeft: '5px' }}>{isNavbarVisible ? '' : ''}</span>
                </button>
            </nav>
        </>
    );
};

export default StudentNavbar;

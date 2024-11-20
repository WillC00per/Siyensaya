// Home.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css'; // Assuming you have styles in a separate CSS file
import NavigationBar from './NavigationBar'; // Import the NavigationBar component

const Home = () => {
    const [menuActive, setMenuActive] = useState(false);
    const navigate = useNavigate(); // Initialize the useNavigate hook

    const handleMenuToggle = () => {
        setMenuActive(!menuActive);
    };

    const handleLoginClick = () => {
        
        navigate('/login'); // Navigate to the login page
    };

    const handleGetStartedClick = () => {
        navigate('/login'); // Navigate to the registration page
    };

    return (
        <div>
            <NavigationBar
                handleLoginClick={handleLoginClick}
                handleGetStartedClick={handleGetStartedClick}
                menuActive={menuActive}
                handleMenuToggle={handleMenuToggle}
            />

            {/* Hero Section */}
            <div className="hero-section">
            <h1>Mother Theresa <br></br> Academy of Marilao</h1>
                <h2>Where Discovery</h2>
                <h2>Meets Fun!</h2>
                <a href="#" className="btn-get-started" onClick={handleGetStartedClick}>Get Started</a>
                <img src="https://i.imgur.com/sqFQbuU.gif" alt="Illustration" className="illustration" />
            </div>
        </div>
    );
}

export default Home;

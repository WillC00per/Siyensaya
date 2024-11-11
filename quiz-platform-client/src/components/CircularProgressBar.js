import React from 'react';
import './CircularProgressBar.css'; // Create this CSS file for styles

const CircularProgressBar = ({ progress, timeLeft }) => {
    const radius = 50; // Radius of the circle
    const strokeWidth = 10; // Width of the stroke
    const normalizedRadius = radius - strokeWidth * 0.5; // Adjusted radius
    const circumference = normalizedRadius * 2 * Math.PI; // Circumference of the circle
    const strokeDashoffset = circumference - (progress / 100) * circumference; // Calculate offset based on progress

    return (
        <svg height={radius * 2} width={radius * 2} className="circular-progress">
            <circle
                stroke="#d9d9d9" // Background color of the circle
                fill="transparent"
                strokeWidth={strokeWidth}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
            <circle
                stroke="#8A2BE2" // Progress color
                fill="transparent"
                strokeWidth={strokeWidth}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                strokeDasharray={circumference + ' ' + circumference} // Total length of the circle
                strokeDashoffset={strokeDashoffset} // Dynamic offset based on progress
                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} // Smooth transition
            />
            <text x="50%" y="50%" textAnchor="middle" stroke="#51c5cf" strokeWidth="1px" fill="black" dy=".3em">
                {timeLeft}s
            </text>
        </svg>
    );
};

export default CircularProgressBar;

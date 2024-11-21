import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import NavigationBar from './StudentNavbar';
import StudentSidebar from './StudentSidebar';

const GamePlayer = () => {
    const location = useLocation();
    const gameUrl = location.state?.gameUrl;
    const studentId = location.state?.studentId;

    const iframeRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Function to track game completion
    const trackGameCompletion = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/games/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    studentId: studentId,
                    gameId: 'diamond-game',
                }),
            });

            if (response.ok) {
                console.log('Game completion data sent successfully!');
            } else {
                console.error('Error sending game completion data');
            }
        } catch (error) {
            console.error('Error in API call:', error);
        }
    };

    // Trigger fullscreen on button click
    const enterFullscreen = () => {
        const iframe = iframeRef.current;
        if (iframe) {
            if (iframe.requestFullscreen) {
                iframe.requestFullscreen();
            } else if (iframe.mozRequestFullScreen) { // Firefox
                iframe.mozRequestFullScreen();
            } else if (iframe.webkitRequestFullscreen) { // Chrome, Safari, Opera
                iframe.webkitRequestFullscreen();
            } else if (iframe.msRequestFullscreen) { // IE/Edge
                iframe.msRequestFullscreen();
            }
            setIsFullscreen(true);
        }
    };

    useEffect(() => {
        if (!gameUrl || !studentId) return;

        // Simulate game completion tracking
        const gameFinished = true; // Replace with actual game finish detection logic
        if (gameFinished) {
            trackGameCompletion();
        }
    }, [studentId, gameUrl]);

    // Early return if no gameUrl is provided
    if (!gameUrl) {
        return <div>No game URL provided.</div>;
    }

    return (
        <div className="Nav-bar-sg">
            <div className="student-games">
                <div className="d-flex">
                    <StudentSidebar />
                    <div className="games-page gp-main-content">
                        <div className="game-fullscreen-container">
                            <iframe
                                ref={iframeRef} 
                                src={gameUrl}
                                className="game-iframe-fullscreen"
                                allowFullScreen
                                title="Unity Game"
                                style={{ width: '100%', height: '100vh', border: 'none' }}
                            ></iframe>
                            {!isFullscreen && (
                                <button
                                    onClick={enterFullscreen}
                                    style={{
                                        position: 'absolute',
                                        top: '10px',
                                        left: '10px',
                                        zIndex: 1000,
                                        padding: '10px 20px',
                                        backgroundColor: '#007BFF',
                                        color: 'white',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Go Fullscreen
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GamePlayer;

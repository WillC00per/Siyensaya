import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NavigationBar from './StudentNavbar';
import StudentSidebar from './StudentSidebar';

const GamePlayer = () => {
    const location = useLocation();
    const gameUrl = location.state?.gameUrl;
    const studentId = location.state?.studentId;  // Assuming studentId is passed in location.state

    // Function to track game completion
    const trackGameCompletion = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/games/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    studentId: studentId,  // Send student ID
                    gameId: 'diamond-game',  // Game ID
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

    // Track game completion inside useEffect
    useEffect(() => {
        // Only proceed if gameUrl and studentId are available
        if (!gameUrl || !studentId) {
            return;
        }

        // Assuming you have some way to track when the game is finished.
        const gameFinished = true; // Replace with actual game finish detection logic

        if (gameFinished) {
            trackGameCompletion();
        }
    }, [studentId, gameUrl]); // Effect runs when studentId or gameUrl changes

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
                                src={gameUrl}
                                className="game-iframe-fullscreen"
                                allowFullScreen
                                title="Unity Game"
                                style={{ width: '100%', height: '100vh', border: 'none' }}
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GamePlayer;

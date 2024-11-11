import React from 'react';
import { useLocation } from 'react-router-dom';

const GamePlayer = () => {
    const location = useLocation();
    const gameUrl = location.state?.gameUrl;

    if (!gameUrl) {
        return <div>No game URL provided.</div>;
    }

    return (
        <div className="game-fullscreen-container">
            <iframe
                src={gameUrl}
                className="game-iframe-fullscreen"
                allowFullScreen
                title="Unity Game"
                style={{ width: '100%', height: '100vh', border: 'none' }}
            ></iframe>
        </div>
    );
};

export default GamePlayer;

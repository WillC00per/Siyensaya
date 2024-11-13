import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavigationBar from './StudentNavbar';
import StudentSidebar from './StudentSidebar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaPlayCircle } from 'react-icons/fa';
import './StudentGames.css';  // Import custom CSS

const StudentGames = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedGameUrl, setSelectedGameUrl] = useState(null);
    const navigate = useNavigate();
    const iframeRef = useRef(null);
    const serverUrl = 'https://siyensaya.onrender.com'; // Base server URL

    useEffect(() => {
        const studentGrade = localStorage.getItem('grade');
        console.log("Student grade fetched from localStorage:", studentGrade);

        const fetchGames = async () => {
            try {
                if (!studentGrade) throw new Error('Grade not found in localStorage');
                const grade = studentGrade.toString();
                console.log("Requesting games for grade:", grade);

                const gamesResponse = await axios.get(`${serverUrl}/api/games/grade/${grade}`);
                console.log("Games response data:", gamesResponse.data);

                setGames(gamesResponse.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching games:', error);
                setError('Failed to fetch games. Please try again later.');
                setLoading(false);
            }
        };

        if (studentGrade) {
            fetchGames();
        } else {
            console.error('Grade not found in localStorage.');
            setError('Grade not found. Please log in again.');
            setLoading(false);
        }
    }, []);

    const startGame = async (gameUrl, gameId) => {
        const fullGameUrl = `${serverUrl}${gameUrl}`;
        console.log('Starting game with URL:', fullGameUrl);
        
        // Get the student's ID (you can store this in localStorage or state after login)
        const studentId = localStorage.getItem('studentId');  // Adjust according to your app's logic

        // Log the request data
        console.log('Request to add student to completedBy array:', { studentId });

        // Call the API to update the completedBy array
        try {
            const response = await axios.post(`${serverUrl}/api/games/updateCompletedBy/${gameId}`, { studentId });
            
            // Log the response data from the server
            console.log('Response from API:', response.data);
            console.log('Student added to completedBy');
        } catch (error) {
            console.error('Error adding student to completedBy:', error);
        }

        Navigate to the GamePlayer component with the game URL as state
       navigate('/play-game', { state: { gameUrl: fullGameUrl } });
    };
    
    if (loading) {
        return (
            <div className="container mt-4 text-center">
                <p>Loading games...</p>
            </div>
        );
    }

    return (
        <div className="Nav-bar-sg">
            <NavigationBar />
            <div className="student-games">
                <div className="d-flex">
                    <StudentSidebar />
                    <div className="games-page gp-main-content">
                        <div className="container mt-4">
                            <h1 className="text-center mb-4">Available Games</h1>
                            <div className="games-container">
                                {error ? (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                ) : games.length > 0 ? (
                                    <div className="game-list d-flex flex-wrap justify-content-center">
                                        {games.map(game => (
                                            <div key={game._id} className="game-card card m-3 shadow-sm" style={{ backgroundImage: `url(${serverUrl}${game.gameThumbnailUrl})` }}>
                                                <div className="game-card-content">
                                                    <h5 className="card-title">{game.title}</h5>
                                                    <p className="card-text">{game.description}</p>
                                                    <button 
                                                        className="btn btn-play"
                                                        onClick={() => startGame(game.gameUrl, game._id)}  // Pass game._id here
                                                    >
                                                        <FaPlayCircle /> Start Game
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>No games available for your grade.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentGames;

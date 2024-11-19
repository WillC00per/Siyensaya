import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import axios from 'axios';
import NavigationBar from './StudentNavbar';
import StudentSidebar from './StudentSidebar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './QuizzesPage.css'; // Import your custom CSS for styling
import { FaPlayCircle } from 'react-icons/fa';

const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;

const QuizzesPage = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Initialize useNavigate for navigation

    useEffect(() => {
        const studentGrade = localStorage.getItem('grade');

        const fetchQuizzes = async () => {
            try {
                const quizzesResponse = await axios.get(`${BASE_URL}/quizzes/grade/${studentGrade}`);
                setQuizzes(quizzesResponse.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching quizzes:', error);
                setError('Failed to fetch quizzes. Please try again later.');
                setLoading(false);
            }
        };

        if (studentGrade) {
            fetchQuizzes();
        } else {
            console.error('Grade not found in localStorage.');
            setError('Grade not found. Please log in again.');
            setLoading(false);
        }
    }, []);

    // Function to handle quiz start
    const startQuiz = (quizId) => {
        // Navigate to the quiz page
        navigate(`/quiz/${quizId}`);
    };

    if (loading) {
        return (
            <div className="container mt-4">
                <p>Loading quizzes...</p>
            </div>
        );
    }

    return (
        <div>
            
            <div className="d-flex">
                <StudentSidebar />
                <div className="quizzes-page qp-main-content"> {/* Moved quizzes-page class here */}
                    <div className="container mt-4">
                        <h1 className="text-center mb-4">Available Quizzes</h1>
                        {error ? (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        ) : quizzes.length > 0 ? (
                            <div className="quiz-container d-flex flex-wrap justify-content-center">
                                {quizzes.map(quiz => (
                                    <div key={quiz._id} className="quiz-card card m-3">
                                        <div className="card-body text-center">
                                            <h5 className="card-title">{quiz.title}</h5>
                                            <p className="card-text">{quiz.description}</p>
                                            <p><strong>Time Limit:</strong> {quiz.time_limit} minutes</p>
                                            <p><strong>Passing Score:</strong> {quiz.passing_score}%</p>
                                            <button 
                                                className="btn btn-primary"
                                                onClick={() => startQuiz(quiz._id)} // Start quiz on button click
                                            >
                                                <FaPlayCircle /> Start Quiz
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No quizzes available for your grade.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizzesPage;

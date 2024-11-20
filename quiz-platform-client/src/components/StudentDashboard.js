import React, { useEffect, useState } from 'react';

import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavigationBar from './StudentNavbar';
import StudentSidebar from './StudentSidebar';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Modal, Button } from 'react-bootstrap';
import { FaClipboardList } from 'react-icons/fa';
import './StudentDashboard.css';
import { useNavigate } from 'react-router-dom';
const StudentDashboard = () => {
    const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;
    const serverUrl = `${process.env.REACT_APP_API_BASE_URL}`;
 const handleAvatarClick = () => {
        navigate('/profile');
    };
    const [avatarUrl, setAvatarUrl] = useState('');
    const [studentData, setStudentData] = useState(null);
    const [availableQuizzes, setAvailableQuizzes] = useState([]);
    const [latestQuizzes, setLatestQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [achievedBadges, setAchievedBadges] = useState([]);
    const [unachievedBadges, setUnachievedBadges] = useState([]);
    const [fullName, setFullName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        if (!token || role !== 'student') {
            // Redirect to login if not authenticated or not a student
            navigate('/login');
            return;
        }
        const studentId = localStorage.getItem('studentId');
        const fetchStudentData = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/student/${studentId}`);

                return response.data;
            } catch (error) {
                console.error('Error fetching student data:', error);
                throw new Error('Could not fetch student data.');
            }
        };

        const fetchAvailableQuizzes = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/quizzes`);
                return response.data;
            } catch (error) {
                console.error('Error fetching quizzes:', error);
                throw new Error('Could not fetch quizzes.');
            }
        };

        const handleCloseModal = () => {
        setUserToDelete(null);
        setShowModal(false);
    };

        const fetchLatestQuizzes = async (grade) => {
            try {
                const response = await axios.get(`${BASE_URL}/quizzes/grade/${grade}`);
                return response.data;
            } catch (error) {
                console.error('Error fetching latest quizzes:', error);
                throw new Error('Could not fetch latest quizzes.');
            }
        };

        const fetchBadges = async (studentId) => {
            try {
                const badgesResponse = await axios.get(`${BASE_URL}/students/${studentId}/badges`);
                return badgesResponse.data;
            } catch (error) {
                console.error('Error fetching badges:', error);
                throw new Error('Could not fetch badges.');
            }
        };

        const fetchData = async () => {
            if (studentId) {
                try {
                    const student = await fetchStudentData();
                    setStudentData(student);
                    setFullName(student.user.firstName + ' ' + student.user.lastName); // Assuming the user field contains first and last names
                    setAvatarUrl(student.avatarUrl);
                    const [available, { grade }] = await Promise.all([
                        fetchAvailableQuizzes(),
                        fetchStudentData(),
                    ]);

                    const latest = await fetchLatestQuizzes(grade);
                    const badges = await fetchBadges(studentId);

                    setAvailableQuizzes(available);
                    setLatestQuizzes(latest);
                    setAchievedBadges(badges.achievedBadges);
                    setUnachievedBadges(badges.unachievedBadges);
                } catch (error) {
                    setError(error.message);
                } finally {
                    setLoading(false);
                }
            } else {
                setError('Please log in.');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const calculateProgress = () => {
        if (!studentData || !availableQuizzes.length) return 0;
        const quizzesTakenCount = studentData.quizScores.length;
        const quizzesAvailableCount = availableQuizzes.length;
        return quizzesAvailableCount > 0 ? (quizzesTakenCount / quizzesAvailableCount) * 100 : 0;
    };

    const handleModalOpen = () => setShowModal(true);
    const handleModalClose = () => setShowModal(false);

    if (loading) {
        return (
            <div className="container mt-4">
                <p>Loading... 🚀</p>
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    const progress = calculateProgress();

    return (
        <div className="dashboard-container">
            
            <div className="d-flex flex-column flex-md-row">
                <StudentSidebar />
                <div className="student-dashboard-main-content flex-grow-1">
                    <div className="welcome-box mb-4">
                        <h1>Welcome, {fullName || 'Guest'}!</h1>
                        {avatarUrl && (
                           <img 
                           src={`${serverUrl}${avatarUrl}`} 
                           alt="Student Avatar" 
                           className="avatar" 
                           onClick={handleAvatarClick} 
                       />
                        )}
                    </div>


                    {/* Quiz Progress Section */}
                    <div className="quiz-progress-section gamified-box single-box mb-4">
                        <h3><FaClipboardList /> Quiz Progress</h3>
                        <div className="quiz-progress-details">
                            <p>Quizzes Taken: {studentData.quizScores.length}/{availableQuizzes.length}</p>
                            <CircularProgressbar
                                value={progress}
                                text={`${Math.round(progress)}%`}
                                styles={buildStyles({
                                    pathColor: '#ffcc00',
                                    trailColor: '#ddd',
                                    textColor: '#fff',
                                    textSize: '16px',
                                })}
                                strokeWidth={10}
                            />
                        </div>

                        {/* Quiz Scores and Latest Quizzes */}
                        <div className="quiz-progress-content">
                            <div className="results-container">
                                <div className="results-boxes">
                                    {[0, 1, 2].map((index) => (
                                        <div key={index} className="result-box">
                                            {studentData && studentData.quizScores[index] ? (
                                                <>
                                                    <h4>{studentData.quizScores[index].title}</h4>
                                                    <p>Score: {studentData.quizScores[index].score}%</p>
                                                </>
                                            ) : (
                                                <p>No data yet</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Divider */}
                            <hr className="my-3" />

                            {/* Latest Quizzes */}
                            <div className="latest-quizzes-boxes d-flex flex-column flex-md-row justify-content-between">
                                <h5>Available Quizzes</h5>
                                <div className="latest-quizzes-container">
                                    {latestQuizzes.slice(0, 3).map((quiz, index) => (
                                        <div key={index} className="latest-quiz-box">
                                            <h4>{quiz.title}</h4>
                                            <p>Available</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Button Group */}
                        <div className="button-group mt-3 d-flex flex-column flex-md-row">
                            <Button variant="primary" onClick={handleModalOpen} className="mb-2 mb-md-0">
                                All Results
                            </Button>
                            <Button variant="success" href="/quizzes" className="ml-md-2">
                                Quizzes Available
                            </Button>
                        </div>

                        {/* Modal for All Results */}
                        <Modal show={showModal} onHide={handleCloseModal} backdrop={false}>
                            <Modal.Header closeButton>
                                <Modal.Title>All Quiz Results</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                {studentData.quizScores.length > 0 ? (
                                    <ul className="list-group">
                                        {studentData.quizScores.map((quiz, index) => (
                                            <li key={index} className="list-group-item">
                                                {quiz.title}: {quiz.score}% (Taken on: {new Date(quiz.dateTaken).toLocaleDateString()} )
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No results yet.</p>
                                )}
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleModalClose}>
                                    Close
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </div>

                    {/* Achieved and Available Badges Section */}
                    <div className="badges-section mt-5">
                        <h3>Your Badges</h3>
                        <div className="badges-box">
                            <div className="badges-container d-flex flex-column flex-md-row justify-content-between">
                                <div className="achieved-badges flex-fill">
                                    <h4>Achieved Badges</h4>
                                    <div className="badges-box d-flex flex-wrap justify-content-start">
                                        {achievedBadges.length > 0 ? (
                                            achievedBadges.map((badge, index) => (
                                                <div key={index} className="badge-box">
    <img 
        src={`${'https://siyensaya.onrender.com'}${badge.imageUrl}`} 
        alt={`Badge: ${badge.name}`} 
        className="badge-icon" 
    />
    <p>{badge.name}</p>
</div>

                                            ))
                                        ) : (
                                            [0, 1, 2].map((index) => (
                                                <div key={index} className="badge-box placeholder-badge">
                                                    <p>No badge</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                                <div className="unachieved-badges flex-fill">
                                    <h4>Badges You Can Achieve</h4>
                                    <div className="badges-box d-flex flex-wrap justify-content-start">
                                        {unachievedBadges.length > 0 ? (
                                            unachievedBadges.map((badge, index) => (
                                                <div key={index} className="badge-box">
    <img 
        src={`${'https://siyensaya.onrender.com'}${badge.imageUrl}`} 
        alt={`Badge: ${badge.name}`} 
        className="badge-icon" 
    />
    <p>{badge.name}</p>
</div>

                                            ))
                                        ) : (
                                            [0, 1, 2].map((index) => (
                                                <div key={index} className="badge-box placeholder-badge">
                                                    <p>No badge</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;

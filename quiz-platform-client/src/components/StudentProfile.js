import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner'; // Import Spinner for loading state
import NavigationBar from './StudentNavbar'; // Importing NavigationBar
import StudentSidebar from './StudentSidebar'; // Importing StudentSidebar
import './StudentProfile.css'; // Create a custom CSS file for gamified look

const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;

const StudentProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false); // Avatar modal state
    const [avatars, setAvatars] = useState([]); // Available avatars
    const [selectedAvatar, setSelectedAvatar] = useState(''); // Selected avatar
    const [loadingAvatars, setLoadingAvatars] = useState(false); // Loading state for avatars

    useEffect(() => {
        const studentId = localStorage.getItem('studentId');

        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/profile/${studentId}`);
                setProfile(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching profile:', error);
                setError('Uh-oh! We hit a snag while fetching your profile. Please try again later! 🤕');
                setLoading(false);
            }
        };

        if (studentId) {
            fetchProfile();
        } else {
            console.error('Student ID not found in localStorage.');
            setError('Looks like you forgot to log in! 🚪 Please log in again to see your profile.');
            setLoading(false);
        }
    }, []);

    // Fetch available avatars from the server
    const fetchAvatars = async () => {
        setLoadingAvatars(true); // Start loading avatars
        try {
            const response = await axios.get(`${BASE_URL}/avatars`);
            setAvatars(response.data);
        } catch (error) {
            console.error('Error fetching avatars:', error);
            setError('Whoops! We couldn’t load the avatars. Please try again! 😢');
        } finally {
            setLoadingAvatars(false); // End loading avatars
        }
    };

    // Show avatar modal
    const handleShowModal = () => {
        fetchAvatars();
        setShowModal(true);
    };

    // Hide avatar modal
    const handleCloseModal = () => {
        setShowModal(false);
    };

    // Handle avatar selection
    const handleAvatarSelect = async (avatar) => {
        const studentId = localStorage.getItem('studentId');
        try {
            const response = await axios.post(`${BASE_URL}/upload-avatar/${studentId}`, {
    avatarUrl: avatar
});

            setProfile({ ...profile, avatarUrl: response.data.avatarUrl });
            setSelectedAvatar(avatar);
            setShowModal(false);
        } catch (error) {
            console.error('Error updating avatar:', error);
            setError('Oh no! We couldn’t save your new avatar. Please try again! 😩');
        }
    };

    if (loading) {
        return (
            <div className="container mt-4">
                <p>Hang tight! We’re getting your profile ready... 🚀</p>
            </div>
        );
    }

    // Function to create boxes with data or placeholders
    const createDataBoxes = (data, type) => {
        const validData = Array.isArray(data) ? data : []; // Ensure data is an array

        const filledBoxes = validData.slice(0, 3).map((item, index) => {
            return (
                <div key={index} className="data-box">
                    {type === 'quiz' && (
                        <>
                            <h5>{item.title} 🎉</h5>
                            <p>Your Score: {item.score}% 🌟</p>
                        </>
                    )}
                    {type === 'lesson' && (
                        <>
                            <h5>{item.lesson} 📚</h5>
                            <p>{item.watchedVideo ? '🎬 Completed! 🎊' : '🚀 Keep Watching! 🌈'}</p>
                        </>
                    )}
                    {type === 'game' && (
                        <>
                            <h5>{item.game} 🎮</h5>
                            <p>{item.progress ? '🏆 You Did It! 🎉' : '🚧 Not Yet! Keep Going! 💪'}</p>
                        </>
                    )}
                    {type === 'badge' && item.imageUrl && (
                        <>
                            <a href="#">
                                <img 
                                    src={`${BASE_URL.replace('/api', '')}${item.imageUrl}`}
                                    alt={item.badgeName} 
                                    className="badge-image"
                                />
                            </a>
                            <h5>{item.badgeName} 🏅</h5>
                        </>
                    )}
                </div>
            );
        });

        // Fill the remaining empty boxes if less than 3 entries
        const emptyBoxes = Array.from({ length: 3 - filledBoxes.length }, (_, index) => (
            <div key={`empty-${index}`} className="data-box empty">
                <p>No Data Here! 👀</p>
            </div>
        ));

        return [...filledBoxes, ...emptyBoxes];
    };

    return (
        <div className="profile-container">
            <NavigationBar /> {/* Include the Navbar */}
            <div className="d-flex">
                <StudentSidebar /> {/* Include the Sidebar */}
                <div className="student-profile-maincontent"> {/* Updated class name */}
                
                    {error ? (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    ) : profile ? (
                        <div className="profile-card">
                            <div className="profile-header text-light"> {/* Use profile-header class for styling */}
                                {/* Profile Header with Avatar */}
                                <div className="d-flex align-items-center mb-4">
                                    <div className="profile-avatar-container">
                                        <img 
                                            src={profile.avatarUrl ? `${BASE_URL.replace('/api', '')}${profile.avatarUrl}` : '/default-avatar.png'} 
                                            alt="Avatar" 
                                            className="profile-avatar"
                                        />
                                        <button className="change-avatar-btn" onClick={handleShowModal}>
                                            <i className="fas fa-pencil-alt"></i>
                                        </button>
                                    </div>
                                    <div className="profile-info ml-3"> {/* Added profile-info class */}
                                        <h3>{profile.fullName} </h3>
                                        <p className="profile-grade">Grade: {profile.grade} 🌟</p>
                                    </div>
                                </div>
                            </div> {/* Close profile-header div */}

                            {/* Gamification Sections */}
                            <div className="gamified-sections">
                                <h6>📊 Awesome Quiz Scores!</h6>
                                <div className="stats-section">
                                    {createDataBoxes(profile.quizScores || [], 'quiz')}
                                </div>

                                <h6>🎓 Lesson Progress!</h6>
                                <div className="stats-section">
                                    {createDataBoxes(profile.lessonsProgress || [], 'lesson')}
                                </div>

                                <h6>🎮 Game Progress!</h6>
                                <div className="stats-section">
                                    {createDataBoxes(profile.gameProgress || [], 'game')}
                                </div>

                                <h6>🏅 Your Cool Badges!</h6>
                                <div className="stats-section">
                                    {createDataBoxes(profile.badges || [], 'badge')}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p>No profile available. Let’s get you started! 🚀</p>
                    )}

                    {/* Avatar Modal */}
                    <Modal show={showModal} onHide={handleCloseModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Select Your Cool Avatar! 🎨</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="d-flex flex-wrap">
                                {loadingAvatars ? (
                                    <div className="text-center">
                                        <Spinner animation="border" role="status" />
                                        <p>Loading avatars... Hang tight! 🎈</p>
                                    </div>
                                ) : avatars.length > 0 ? avatars.map((avatar, index) => (
                                    <div 
                                        key={index} 
                                        className={`avatar-option ${avatar === selectedAvatar ? 'selected-avatar' : ''}`} 
                                        onClick={() => handleAvatarSelect(avatar)}
                                    >
                                        <img
                                            src={`${BASE_URL.replace('/api', '')}/uploads/avatars/${avatar}`}
                                            alt={`Avatar ${index}`}
                                            className="avatar-image"
                                        />
                                    </div>
                                )) : <p>No avatars available. Check back soon! 🌟</p>}
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;

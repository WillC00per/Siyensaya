import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import NavigationBar from './StudentNavbar'; // Importing the Navbar
import StudentSidebar from './StudentSidebar'; // Importing the Sidebar
import './LessonDetails.css'; // Your existing CSS for LessonDetails
import Modal from 'react-bootstrap/Modal'; // Import Modal from react-bootstrap
import Button from 'react-bootstrap/Button'; // Import Button from react-bootstrap
import { FaFilePdf } from 'react-icons/fa'; // Import an icon for PDF files

const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;

const LessonDetails = () => {
    const { lessonId } = useParams(); // Get the lessonId from the URL parameters
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAchievement, setShowAchievement] = useState(false); // State for achievement popup

    useEffect(() => {
        const fetchLesson = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${BASE_URL}/lessons/${lessonId}`);

                console.log(response.data); // Log the response data
                setLesson(response.data);
                setShowAchievement(true); // Show achievement popup if lesson is successfully fetched
            } catch (err) {
                setError('Error fetching lesson details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchLesson();
    }, [lessonId]);

    if (loading) return <div className="loader">Loading lesson details...</div>;
    if (error) return <p className="error">{error}</p>;
    if (!lesson) return <p>No lesson found</p>;

    return (
        <>
            {/* Independent Navbar outside the lesson details container */}
            <div className="navbar-wrapper">
                <NavigationBar /> {/* Include the Navbar */}
            </div>

            <div className="lesson-details-container"> {/* Main lesson details container */}
                <div className="d-flex">
                    <StudentSidebar /> {/* Include the Sidebar */}
                    <div className="lesson-main-content"> {/* Main content area */}
                        <div className="lesson-container">
                            {/* Title and Description */}
                            <div className="lesson-box lesson-title-box">
                                <h2 style={{ color: '#000' }}>{lesson.title}</h2> {/* Set title color to black */}
                            </div>

                            <div className="lesson-box lesson-description-box">
                                <p>{lesson.description}</p>
                            </div>

                            {/* Video Group Wrapper */}
                            <div className="lesson-video-group-wrapper">
                                {lesson.video && (
                                    <div className="lesson-box lesson-video-box">
                                        <h3>Lesson Video</h3>
                                        <video className="lesson-video" src={lesson.video} controls />
                                    </div>
                                )}

                                {lesson.youtubeLink && (
                                    <div className="lesson-box lesson-youtube-box">
                                        <h3>Watch on YouTube</h3>
                                        <iframe
                                            title={lesson.title}
                                            className="lesson-youtube-video"
                                            src={lesson.youtubeLink.replace('watch?v=', 'embed/')}
                                            frameBorder="0"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                )}
                            </div>

                            {/* Presentations Section */}
                            {lesson.presentation && (
    <div className="lesson-presentations-box">
    <h3>Uploaded Presentation (Click to Download)</h3>
    <div className="presentation-item" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
        <FaFilePdf size={40} color="red" /> {/* PDF icon */}
        <a 
            href={`${BASE_URL}/download/${lesson.presentation.split('/').pop()}`} 
            download 
            style={{ marginLeft: '10px', textDecoration: 'underline', color: 'blue' }}
        >
            Download
        </a>
        {lesson.presentation.split('/').pop()} {/* Display filename */}
    </div>
</div>

)}


                            {/* Achievement Popup */}
                            <Modal show={showAchievement} onHide={() => setShowAchievement(false)}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Congratulations!</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <p>🎉 Congrats! You unlocked the <strong>{lesson.title} Explorer</strong> badge! 🏆</p>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={() => setShowAchievement(false)}>Close</Button>
                                </Modal.Footer>
                            </Modal>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LessonDetails;

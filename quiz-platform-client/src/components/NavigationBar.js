import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // Ensure Bootstrap JavaScript is included

const NavigationBar = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [activeFeature, setActiveFeature] = useState(null);

    const features = {
        Lessons: [
            { imageUrl: 'https://i.imgur.com/C9Ym0YO.png', caption: 'Interactive Lessons' },
            { imageUrl: 'https://i.imgur.com/qQkERFp.png', caption: 'Engaging Content' },
        ],
        Quizzes: [
            { imageUrl: 'https://i.imgur.com/ZzxTcbG.png', caption: 'Challenging Quizzes' },
            { imageUrl: 'https://i.imgur.com/g1fTAF1.png', caption: 'Improve Skills' },
        ],
        Games: [
            { imageUrl: 'https://i.imgur.com/zf2HcgL.png', caption: 'Fun Games' },
            { imageUrl: 'https://i.imgur.com/Ox3JFt0.png', caption: 'Interactive Play' },
        ],
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
        setIsLoggedIn(false);
    };

    const handleFeatureClick = (feature) => {
        setActiveFeature(features[feature]);
        setShowModal(true);
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-custom">
                <a className="navbar-brand" href="/">
                    <img src="https://i.imgur.com/MarnSTT.png" alt="Logo" />
                </a>
                <div className="navbar-menu">
                    <ul className="navbar-nav ml-auto">
                        <li className="nav-item">
                            <button className="nav-link btn" onClick={() => handleFeatureClick('Lessons')}>Lessons</button>
                        </li>
                        <li className="nav-item">
                            <button className="nav-link btn" onClick={() => handleFeatureClick('Quizzes')}>Quizzes</button>
                        </li>
                        <li className="nav-item">
                            <button className="nav-link btn" onClick={() => handleFeatureClick('Games')}>Games</button>
                        </li>
                        <li className="nav-item">
                            {isLoggedIn ? (
                                <button className="nav-link login-btn btn" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> Logout</button>
                            ) : (
                                <a className="nav-link login-btn" href="/login"><i className="fas fa-user"></i> Login</a>
                            )}
                        </li>
                    </ul>
                </div>
            </nav>

            {showModal && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Feature Preview</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                {activeFeature && (
                                    <div id="carouselExampleIndicators" className="carousel slide" data-bs-ride="carousel">
                                        <div className="carousel-inner">
                                            {activeFeature.map((item, index) => (
                                                <div className={`carousel-item ${index === 0 ? 'active' : ''}`} key={index}>
                                                    <img src={item.imageUrl} className="d-block w-100" alt={item.caption} />
                                                    <div className="carousel-caption d-none d-md-block">
                                                        <h5>{item.caption}</h5>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
                                            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                            <span className="visually-hidden">Previous</span>
                                        </button>
                                        <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
                                            <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                            <span className="visually-hidden">Next</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default NavigationBar;

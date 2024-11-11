import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import NavigationBar from './StudentNavbar';
import StudentSidebar from './StudentSidebar';
import './StudentLesson2.css';

const StudentLessons = () => {
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const studentGrade = localStorage.getItem('grade');
    const studentId = localStorage.getItem('studentId'); // Assume studentId is stored after login
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLessons = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:3000/api/lessons/grade/${studentGrade}`);
                setLessons(response.data);
            } catch (err) {
                setError('Error fetching lessons. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (studentGrade) {
            fetchLessons();
        } else {
            setError('No grade found. Please log in again.');
            setLoading(false);
        }
    }, [studentGrade]);

    const onViewLesson = async (lessonId) => {
        try {
            // Mark the lesson as viewed by the student
            await axios.post(`http://localhost:3000/api/lessons/${lessonId}/view`, { studentId });

            // Navigate to the lesson details page
            navigate(`/lessons/${lessonId}`);
        } catch (error) {
            console.error('Error marking lesson as viewed:', error);
            setError('Failed to mark lesson as viewed. Please try again.');
        }
    };

    if (loading) return <p>Loading lessons...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="student-lessons-container d-flex flex-column vh-100">
            <NavigationBar />
            <div className="d-flex flex-grow-1">
                <StudentSidebar />
                <div className="main-content flex-grow-1 d-flex flex-column align-items-center justify-content-center">
                    <h1 className="text-center mb-4">Lessons for Grade {studentGrade}</h1>
                    <div className="lessons-wrapper d-flex flex-wrap justify-content-center">
                        {lessons.map((lesson) => (
                            <div
                                key={lesson._id}
                                className="lesson-card border p-3 m-2"
                                style={{
                                    backgroundImage: `url(${lesson.imageUrl ? `http://localhost:3000${lesson.imageUrl}` : ''})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                }}
                            >
                                <div className="lesson-card-content text-center text-white">
                                    <h3>{lesson.title}</h3>
                                    <p>{lesson.description}</p>
                                    <button
                                        className="btn btn-primary view-lesson-btn"
                                        onClick={() => onViewLesson(lesson._id)}
                                    >
                                        View Lesson
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentLessons;

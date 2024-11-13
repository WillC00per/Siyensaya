import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TeacherSidebar from './TeacherSidebar';
import TeacherNavbar from './TeacherNavbar';
import './LessonForm.css'; // Ensure you have this file for styling

const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;

const LessonForm = () => {
    const { id } = useParams(); // Get the lesson ID from the URL
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [presentationFile, setPresentationFile] = useState(null); // New state for presentation file
    const [youtubeLink, setYoutubeLink] = useState('');
    const [grade, setGrade] = useState('');
    const navigate = useNavigate();

    // Check if the logged-in user is a teacher
    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role !== 'teacher') {
            alert('You do not have permission to access this page.');
            navigate('/'); // Redirect to home or another appropriate page
        }
    }, [navigate]);

    // Fetch lesson details if editing
    useEffect(() => {
    if (id) {
        axios.get(`${BASE_URL}/lessons/${id}`)
            .then(response => {
                const lesson = response.data;
                setTitle(lesson.title);
                setDescription(lesson.description);
                setYoutubeLink(lesson.youtubeLink || '');
                setGrade(lesson.grade || '');
            })
            .catch(error => {
                console.error('Error fetching lesson details:', error.response ? error.response.data : error.message);
                alert('Error fetching lesson details. Please try again later.');
            });
    }
}, [id]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        const lessonData = new FormData();
        lessonData.append('title', title);
        lessonData.append('description', description);
        lessonData.append('grade', grade);
        lessonData.append('youtubeLink', youtubeLink);
        if (videoFile) {
            lessonData.append('video', videoFile);
        }
        if (presentationFile) { // Append presentation file if provided
            lessonData.append('presentation', presentationFile);
        }

        try {
            const request = id 
               ? await axios.put(`${BASE_URL}/lessons/${id}`, lessonData)
               : await axios.post(`${BASE_URL}/lessons`, lessonData);

            await request;
            navigate('/admin'); // Redirect after successful operation
        } catch (error) {
            console.error(id ? 'Error updating lesson:' : 'Error creating lesson:', error.response ? error.response.data : error.message);
            alert(`Error ${id ? 'updating' : 'creating'} lesson. Please try again later.`);
        }
    };

    return (
        <div className="admin-dashboard-component container-fluid">
            <TeacherNavbar />
            <div className="row">
                <TeacherSidebar />
                <div className="lesson-form-container">
                    <h1>{id ? 'Edit Lesson' : 'Create Lesson'}</h1>
                    <form onSubmit={handleSubmit} className="lesson-form">
                        <div className="form-group">
                            <label htmlFor="title">Title</label>
                            <input
                                type="text"
                                id="title"
                                className="form-control"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                className="form-control"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="videoFile">Video File (optional)</label>
                            <input
                                type="file"
                                id="videoFile"
                                className="form-control"
                                accept="video/*"
                                onChange={(e) => setVideoFile(e.target.files[0])}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="presentationFile">Presentation File (optional)</label> {/* New input for presentations */}
                            <input
                                type="file"
                                id="presentationFile"
                                className="form-control"
                                accept=".ppt,.pptx,.pdf" // Accepting PowerPoint and PDF files
                                onChange={(e) => setPresentationFile(e.target.files[0])}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="youtubeLink">YouTube Link (optional)</label>
                            <input
                                type="text"
                                id="youtubeLink"
                                className="form-control"
                                value={youtubeLink}
                                onChange={(e) => setYoutubeLink(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="grade">Grade (1-12)</label>
                            <input
                                type="number"
                                id="grade"
                                className="form-control"
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                min="1"
                                max="12"
                                required
                            />
                        </div>
                        <button type="submit" className="btn lesson-submit-button">
    {id ? 'Update Lesson' : 'Create Lesson'}
</button>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default LessonForm;

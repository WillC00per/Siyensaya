import React, { useState } from 'react';
import axios from 'axios';
import TeacherSidebar from './TeacherSidebar';
import TeacherNavbar from './TeacherNavbar';
import './LessonForm.css'; // Reuse LessonForm.css for consistent styling

const BadgeForm = ({ onSubmitSuccess }) => {
  // State for form fields
  const [name, setName] = useState('');
  const [criteria, setCriteria] = useState('quiz'); // Default criteria is 'quiz'
  const [grade, setGrade] = useState(1);
  const [quizzesCompleted, setQuizzesCompleted] = useState(0);
  const [minimumScore, setMinimumScore] = useState(0);
  const [lessonsCompleted, setLessonsCompleted] = useState(0);
  const [gameProgress, setGameProgress] = useState(0);
  const [image, setImage] = useState(null); // Badge image
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [createdBadge, setCreatedBadge] = useState(null); // New state to store the created badge
  const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !criteria || !grade) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('name', name);
      formData.append('criteria', criteria);
      formData.append('grade', grade);
      formData.append('quizzesCompleted', quizzesCompleted);
      formData.append('minimumScore', minimumScore);
      formData.append('lessonsCompleted', lessonsCompleted);
      formData.append('gameProgress', gameProgress);
      
      if (image) {
        formData.append('image', image);
      }

      const response = await axios.post(`${BASE_URL}/badges`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setError(null);
      setLoading(false);
      setCreatedBadge(response.data);
      
      setName('');
      setCriteria('quiz');
      setGrade(1);
      setQuizzesCompleted(0);
      setMinimumScore(0);
      setLessonsCompleted(0);
      setGameProgress(0);
      setImage(null);

      if (onSubmitSuccess) {
        onSubmitSuccess(response.data);
      }
    } catch (error) {
      console.error('Error creating badge:', error.response || error.message);
      setError('Error creating badge. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard-component container-fluid">
      <TeacherNavbar />
      <div className="row">
        <TeacherSidebar />
        <div className="lesson-form-container">
          <h1>Create Badge</h1>
          <form onSubmit={handleSubmit} className="lesson-form" encType="multipart/form-data">
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Criteria:</label>
              <select
                className="form-control"
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
              >
                <option value="quiz">Quiz</option>
                <option value="lesson">Lesson</option>
                <option value="game">Game</option>
              </select>
            </div>

            <div className="form-group">
              <label>Grade:</label>
              <input
                type="number"
                min="1"
                max="12"
                className="form-control"
                value={grade}
                onChange={(e) => setGrade(parseInt(e.target.value))}
                required
              />
            </div>

            {criteria === 'quiz' && (
              <>
                <div className="form-group">
                  <label>Quizzes Completed:</label>
                  <input
                    type="number"
                    className="form-control"
                    value={quizzesCompleted}
                    onChange={(e) => setQuizzesCompleted(parseInt(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label>Minimum Score:</label>
                  <input
                    type="number"
                    className="form-control"
                    value={minimumScore}
                    onChange={(e) => setMinimumScore(parseInt(e.target.value))}
                  />
                </div>
              </>
            )}

            {criteria === 'lesson' && (
              <div className="form-group">
                <label>Lessons Completed:</label>
                <input
                  type="number"
                  className="form-control"
                  value={lessonsCompleted}
                  onChange={(e) => setLessonsCompleted(parseInt(e.target.value))}
                />
              </div>
            )}

            {criteria === 'game' && (
              <div className="form-group">
                <label>Game Progress (%):</label>
                <input
                  type="number"
                  className="form-control"
                  value={gameProgress}
                  onChange={(e) => setGameProgress(parseInt(e.target.value))}
                />
              </div>
            )}

            <div className="form-group">
              <label>Badge Image:</label>
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </div>

            <button type="submit" className="btn lesson-submit-button" disabled={loading}>
              {loading ? 'Creating Badge...' : 'Create Badge'}
            </button>

            {error && <p style={{ color: 'red' }}>{error}</p>}
          </form>

          {createdBadge && (
            <div className="badge-preview">
              <h3>Newly Created Badge:</h3>
              <p><strong>Name:</strong> {createdBadge.name}</p>
              <p><strong>Criteria:</strong> {createdBadge.criteria}</p>
              <p><strong>Grade:</strong> {createdBadge.grade}</p>
              {createdBadge.imageUrl && (
                <img
                  src={`${BASE_URL.replace('/api', '')}${createdBadge.imageUrl}`}
                  alt={createdBadge.name}
                  style={{ maxWidth: '100px', maxHeight: '100px', marginTop: '10px' }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BadgeForm;

import React, { useState } from 'react';
import axios from 'axios';

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
  // Form submission handler for creating a new badge
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!name || !criteria || !grade) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);

      // Create FormData object
      const formData = new FormData();
      formData.append('name', name);
      formData.append('criteria', criteria);
      formData.append('grade', grade);
      formData.append('quizzesCompleted', quizzesCompleted);
      formData.append('minimumScore', minimumScore);
      formData.append('lessonsCompleted', lessonsCompleted);
      formData.append('gameProgress', gameProgress);
      
      if (image) {
        formData.append('image', image); // Append the image file
      }

      // Send POST request to create a new badge
      const response = await axios.post(`${BASE_URL}/badges`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
});

      console.log('Badge created successfully:', response.data);
      setError(null); // Clear any previous error
      setLoading(false);

      // Set the created badge in state
      setCreatedBadge(response.data);

      // Reset the form after successful submission
      setName('');
      setCriteria('quiz');
      setGrade(1);
      setQuizzesCompleted(0);
      setMinimumScore(0);
      setLessonsCompleted(0);
      setGameProgress(0);
      setImage(null);

      if (onSubmitSuccess) {
        onSubmitSuccess(response.data); // Call the parent component's callback if provided
      }
    } catch (error) {
      console.error('Error creating badge:', error.response || error.message);
      setError('Error creating badge. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Criteria:</label>
          <select value={criteria} onChange={(e) => setCriteria(e.target.value)}>
            <option value="quiz">Quiz</option>
            <option value="lesson">Lesson</option>
            <option value="game">Game</option>
          </select>
        </div>

        <div>
          <label>Grade:</label>
          <input
            type="number"
            min="1"
            max="12"
            value={grade}
            onChange={(e) => setGrade(parseInt(e.target.value))}
            required
          />
        </div>

        {criteria === 'quiz' && (
          <>
            <div>
              <label>Quizzes Completed:</label>
              <input
                type="number"
                value={quizzesCompleted}
                onChange={(e) => setQuizzesCompleted(parseInt(e.target.value))}
              />
            </div>

            <div>
              <label>Minimum Score:</label>
              <input
                type="number"
                value={minimumScore}
                onChange={(e) => setMinimumScore(parseInt(e.target.value))}
              />
            </div>
          </>
        )}

        {criteria === 'lesson' && (
          <div>
            <label>Lessons Completed:</label>
            <input
              type="number"
              value={lessonsCompleted}
              onChange={(e) => setLessonsCompleted(parseInt(e.target.value))}
            />
          </div>
        )}

        {criteria === 'game' && (
          <div>
            <label>Game Progress (%):</label>
            <input
              type="number"
              value={gameProgress}
              onChange={(e) => setGameProgress(parseInt(e.target.value))}
            />
          </div>
        )}

        <div>
          <label>Badge Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating Badge...' : 'Create Badge'}
        </button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>

      {/* Display the newly created badge */}
      {createdBadge && (
        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
          <h3>Newly Created Badge:</h3>
          <p><strong>Name:</strong> {createdBadge.name}</p>
          <p><strong>Criteria:</strong> {createdBadge.criteria}</p>
          <p><strong>Grade:</strong> {createdBadge.grade}</p>
          {createdBadge.imageUrl && (
            <img 
    src={createdBadge.imageUrl ? `${BASE_URL.replace('/api', '')}${createdBadge.imageUrl}` : '/default-badge.png'} 
    alt={createdBadge.name} 
    style={{ maxWidth: '100px', maxHeight: '100px', marginTop: '10px' }} 
/>
        
          )}
        </div>
      )}
    </div>
  );
};

export default BadgeForm;

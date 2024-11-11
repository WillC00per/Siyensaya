import React, { useState } from 'react';
import BadgeForm from './BadgeForm';

const BadgeManager = () => {
  const [newBadge, setNewBadge] = useState(null); // State to store the newly created badge

  const handleSubmitSuccess = (badge) => {
    setNewBadge(badge); // Update the state with the newly created badge
  };

  return (
    <div>
      <h1>Create a New Badge</h1>
      <BadgeForm onSubmitSuccess={handleSubmitSuccess} />

      {newBadge && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <h2>New Badge Created:</h2>
          <p><strong>Name:</strong> {newBadge.name}</p>
          <p><strong>Criteria:</strong> {newBadge.criteria}</p>
          <p><strong>Grade:</strong> {newBadge.grade}</p>
          {newBadge.imageUrl && ( // Ensure imageUrl is available before displaying
            <div>
              <img src={`http://localhost:3000${newBadge.imageUrl}`} alt={newBadge.name} style={{ width: '100px', height: '100px' }} />
            </div>
          )}
          <p><strong>Quizzes Completed:</strong> {newBadge.conditions.quizzesCompleted}</p>
          <p><strong>Minimum Score:</strong> {newBadge.conditions.minimumScore}</p>
          <p><strong>Lessons Completed:</strong> {newBadge.conditions.lessonsCompleted}</p>
          <p><strong>Game Progress:</strong> {newBadge.conditions.gameProgress}</p>
        </div>
      )}
    </div>
  );
};

export default BadgeManager;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const QuizList = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [grade, setGrade] = useState('');

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/quizzes', {
                    params: { grade }
                });
                setQuizzes(response.data);
            } catch (error) {
                console.error('Error fetching quizzes:', error);
            }
        };

        if (grade) {
            fetchQuizzes();
        }
    }, [grade]);

    return (
        <div>
            <h2>Select Grade</h2>
            <input
                type="number"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="Enter grade"
            />
            <h2>Available Quizzes</h2>
            <ul>
                {quizzes.map((quiz) => (
                    <li key={quiz._id}>{quiz.title}</li>
                ))}
            </ul>
        </div>
    );
};

export default QuizList;

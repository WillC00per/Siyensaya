// Quiz.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Quiz = () => {
    const { quizId } = useParams();
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [timeLimit, setTimeLimit] = useState(0); // State for time limit
    const [passingScore, setPassingScore] = useState(0); // State for passing score
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await axios.get(`/api/quizzes/${quizId}`);
                const quizData = response.data;

                setQuestions(quizData.questions);
                setTimeLimit(quizData.time_limit); // Set time limit from response
                setPassingScore(quizData.passing_score); // Set passing score from response
                setTimeLeft(quizData.time_limit * 60); // Convert minutes to seconds
            } catch (error) {
                console.error('Error fetching quiz data:', error);
            }
        };

        fetchQuestions();
    }, [quizId]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearInterval(timer);
        } else {
            handleSubmit();
        }
    }, [timeLeft]);

    const handleAnswerChange = (index, answer) => {
        setAnswers(prevAnswers => ({ ...prevAnswers, [index]: answer }));
    };

    const handleSubmit = async () => {
        const studentId = 'some-student-id'; // Replace with actual student ID from your authentication system
        try {
            const response = await axios.post(`/api/quizzes/${quizId}/submit`, {
                studentId,
                answers
            });

            navigate(`/result/${response.data._id}`);
        } catch (error) {
            console.error('Error submitting quiz:', error);
        }
    };

    return (
        <div>
            <h1>Quiz</h1>
            <div>Time left: {Math.floor(timeLeft / 60)}:{timeLeft % 60}</div>
            <div>Time Limit: {timeLimit} minutes</div> {/* Display time limit */}
            <div>Passing Score: {passingScore}%</div> {/* Display passing score */}
            {questions.map((question, index) => (
                <div key={question._id}>
                    <h3>{question.question_text}</h3>
                    {question.answer_options.map(option => (
                        <div key={option}>
                            <label>
                                <input
                                    type="radio"
                                    name={`question-${index}`}
                                    value={option}
                                    onChange={() => handleAnswerChange(index, option)}
                                />
                                {option}
                            </label>
                        </div>
                    ))}
                </div>
            ))}
            <button onClick={handleSubmit}>Submit</button>
        </div>
    );
};

export default Quiz;

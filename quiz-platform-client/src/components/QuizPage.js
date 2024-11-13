import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './QuizPage.css';
import confetti from 'canvas-confetti';

const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;

const CircularProgressBar = ({ timeLeft, timeLimit }) => {
    const radius = 60;
    const strokeWidth = 8;
    const normalizedRadius = radius - strokeWidth * 0.5;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (timeLeft / timeLimit) * circumference;

    return (
        <svg height={radius * 2} width={radius * 2} className="circular-progress">
            <circle stroke="#e6e6e6" fill="transparent" strokeWidth={strokeWidth} r={normalizedRadius} cx={radius} cy={radius} />
            <circle
                stroke="#4caf50"
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference + ' ' + circumference}
                strokeDashoffset={strokeDashoffset}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
            <text x="50%" y="50%" textAnchor="middle" stroke="#000" strokeWidth="1px" fill="#000" fontSize="20" dy=".3em">
                {timeLeft}s
            </text>
        </svg>
    );
};

const QuizPage = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [score, setScore] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [questionTimeLimit, setQuestionTimeLimit] = useState(30);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [comboCounter, setComboCounter] = useState(0);
    const [levelUpVisible, setLevelUpVisible] = useState(false);
    const [resultPopupVisible, setResultPopupVisible] = useState(false);
    const [resultMessage, setResultMessage] = useState('');
    const [isPass, setIsPass] = useState(false);
    const canvasRef = useRef(null);
    const [startTime, setStartTime] = useState(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/quizzes/${quizId}/questions`);
                const data = response.data;
                if (Array.isArray(data) && data.length > 0) {
                    setQuestions(data);
                } else if (data.questions && Array.isArray(data.questions)) {
                    setQuestions(data.questions);
                } else {
                    console.error('Invalid data format:', data);
                }
                setQuestionTimeLimit(data.time_limit || 30);
                setTimeLeft(data.time_limit || 30);
            } catch (error) {
                console.error('Error fetching questions:', error);
            }
        };
        fetchQuestions();
    }, [quizId]);

    useEffect(() => {
        if (questions.length > 0 && !quizCompleted) {
            setTimeLeft(questionTimeLimit);
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev === 1) {
                        handleTimeOut();
                        clearInterval(timer);
                        return questionTimeLimit;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [questions, questionTimeLimit, quizCompleted, currentQuestionIndex]);

    const handleAnswerSelect = (answer) => {
    const currentQuestion = questions[currentQuestionIndex];
    setSelectedAnswers((prevState) => ({
        ...prevState,
        [currentQuestion.id]: answer, // Store the selected answer for the current question
    }));

    if (answer === currentQuestion.correct_answer) {
        setScore((prevScore) => prevScore + 1); // Update the score
        setComboCounter((prevCombo) => prevCombo + 1);
        setFeedbackMessage('Correct!');
        speak('Correct!');
        triggerConfetti();

        if ((comboCounter + 1) % 3 === 0) {
            setLevelUpVisible(true);
            setTimeout(() => setLevelUpVisible(false), 3000);
        }
    } else {
        setComboCounter(0);
        const correctAnswerMessage = `Wrong! The correct answer is ${currentQuestion.correct_answer}.`;
        setFeedbackMessage(correctAnswerMessage);
        speak(correctAnswerMessage);
    }

    setTimeout(() => {
        setFeedbackMessage(''); // Clear feedback between questions
        setTimeLeft(questionTimeLimit); // Reset timer for the next question

        setCurrentQuestionIndex((prevIndex) => {
            const nextIndex = prevIndex + 1;
            if (nextIndex < questions.length) {
                return nextIndex; // Move to the next question
            } else {
                setQuizCompleted(true);
                handleFinishQuiz();
                return prevIndex; // No more questions; keep the index the same
            }
        });
    }, 2000);
};

    const handleTimeOut = () => {
        const currentQuestion = questions[currentQuestionIndex];
        setComboCounter(0);
        const correctAnswerMessage = `Time's up! The correct answer is ${currentQuestion.correct_answer}.`;
        setFeedbackMessage(correctAnswerMessage);
        speak(correctAnswerMessage);
        setTimeout(() => {
            if (currentQuestionIndex + 1 < questions.length) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setTimeLeft(questionTimeLimit);
            } else {
                setQuizCompleted(true);
                handleFinishQuiz();
            }
        }, 2000);
    };

    const speak = (message) => {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    const triggerConfetti = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const myConfetti = confetti.create(canvas, {
                resize: true,
                useWorker: true,
            });
            myConfetti({
                particleCount: 100,
                spread: 160,
                origin: { y: 0.6 },
            });
        }
    };

    const handleFinishQuiz = async () => {
        // Stop any ongoing speech
        window.speechSynthesis.cancel();

        // Set quiz as completed
        setQuizCompleted(true); 

        try {
            const studentId = localStorage.getItem('studentId'); // Get studentId from localStorage
            const endTime = new Date();
            const timeTaken = Math.round((endTime - startTime) / 1000); // Time taken in seconds
            const passed = score >= (questions.length / 2); // Example passing criteria

            // Set result message and visibility based on the result
            setIsPass(passed);
            setResultMessage(passed ? "Congratulations! You have passed!" : "Sorry, you have failed.");
            setResultPopupVisible(true);
            
            // Voice announcement for the results
            speak(passed ? "Congratulations! You have passed the quiz!" : "Sorry, you have failed the quiz."); // Voice announcement

            // Get answers for each question
            const answers = questions.map((question) => selectedAnswers[question.id] || ''); // Get answers for each question
            const feedback = "Great quiz!"; // Example feedback

            // Calculate percentage score
            const percentageScore = (score / questions.length) * 100;

            await axios.post(`${BASE_URL}/quizzes/${quizId}/submit`, {
                studentId: studentId,
                answers: answers,
                time_taken: timeTaken,
                feedback: feedback,
                attempt: 1,
                passed: passed,
                percentage_score: percentageScore, // Include the percentage score
            });

            // No automatic redirect here; just show the result popup
        } catch (error) {
            console.error('Error submitting quiz:', error);
        }
    };

    return (
        <div className="quiz-page">
            {quizCompleted ? (
                <div className="quiz-completed-screen">
                    <h1>Quiz Completed!</h1>
                    <p className="quiz-score">Your Score: {score} / {questions.length} ({Math.round((score / questions.length) * 100)}%)</p>
                    <button className="quiz-btn btn btn-success" onClick={() => navigate('/quiz-results')}>Finish Quiz</button>
                </div>
            ) : (
                <div className="quiz-content">
                    <div className="question-timer-box">
                        <CircularProgressBar timeLeft={timeLeft} timeLimit={questionTimeLimit} />
                        <h1 className="quiz-title">{questions[currentQuestionIndex]?.question_text}</h1>
                    </div>
                    <div className="quiz-answer-options">
    {questions[currentQuestionIndex]?.answer_options.map((option, index) => (
        <button
            key={index}
            className={`quiz-answer-button quiz-btn m-2 ${selectedAnswers[questions[currentQuestionIndex].id] === option ? 'selected' : ''}`}
            onClick={() => handleAnswerSelect(option)}
            disabled={selectedAnswers[questions[currentQuestionIndex]?.id] !== undefined && currentQuestionIndex === questions.indexOf(questions[currentQuestionIndex])}
        >
            {option}
        </button>
    ))}
</div>

                    <div className="feedback-message">{feedbackMessage}</div>
                    {levelUpVisible && <div className="level-up-message">Level Up!</div>}
                </div>
            )}
            {resultPopupVisible && (
                <div className="result-popup">
                    <p>{resultMessage}</p>
                </div>
            )}
            <canvas ref={canvasRef} className="confetti-canvas" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}></canvas>
        </div>
    );
};

export default QuizPage;

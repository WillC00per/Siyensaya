import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './QuizPage.css'; // Ensure you have this file for styling
import confetti from 'canvas-confetti'; // Import confetti for celebrations

const CircularProgressBar = ({ timeLeft, timeLimit }) => {
    const radius = 60; // Radius of the circle
    const strokeWidth = 8; // Width of the progress stroke
    const normalizedRadius = radius - strokeWidth * 0.5; // Adjust radius for stroke width
    const circumference = normalizedRadius * 2 * Math.PI; // Circumference of the circle
    const strokeDashoffset = circumference - (timeLeft / timeLimit) * circumference; // Offset for stroke dash

    return (
        <svg height={radius * 2} width={radius * 2} className="circular-progress">
            <circle
                stroke="#e6e6e6"
                fill="transparent"
                strokeWidth={strokeWidth}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
            <circle
                stroke="#4caf50" // Color of the progress
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference + ' ' + circumference}
                strokeDashoffset={strokeDashoffset}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
            <text
                x="50%"
                y="50%"
                textAnchor="middle"
                stroke="#000"
                strokeWidth="1px"
                fill="#000"
                fontSize="20"
                dy=".3em"
            >
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
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [score, setScore] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30); // Default time left
    const [intervalId, setIntervalId] = useState(null);
    const [startTime, setStartTime] = useState(null); // Track quiz start time
    const [questionTimeLimit, setQuestionTimeLimit] = useState(30); // Time limit for each question
    const [feedbackMessage, setFeedbackMessage] = useState(''); // State for feedback message
    const [isSpeaking, setIsSpeaking] = useState(false); // Track if speech is in progress
    const [comboCounter, setComboCounter] = useState(0); // Combo counter for consecutive correct answers
    const [levelUpVisible, setLevelUpVisible] = useState(false); // Control level up visibility
    const [resultPopupVisible, setResultPopupVisible] = useState(false); // Control result popup visibility
    const [resultMessage, setResultMessage] = useState(''); // Result message
    const [isPass, setIsPass] = useState(false); // State to determine if the student passed
    const canvasRef = useRef(null); // Ref for the canvas element

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/quizzes/${quizId}/questions`);
                const data = response.data;

                console.log('API Response:', data);
                
                if (Array.isArray(data) && data.length > 0) {
                    setQuestions(data);
                } else if (data.questions && Array.isArray(data.questions)) {
                    setQuestions(data.questions);
                } else {
                    console.error('Invalid data format:', data);
                }

                const timeLimit = data.time_limit || 30; // Fallback to 30 if time_limit is not present
                setQuestionTimeLimit(timeLimit);
                setTimeLeft(timeLimit); // Initialize timeLeft with time_limit
            } catch (error) {
                console.error('Error fetching questions:', error);
            }
        };

        fetchQuestions();

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [quizId]);

    useEffect(() => {
        if (questions.length > 0 && !quizCompleted) {
            startTimer(questionTimeLimit);
            setStartTime(new Date()); // Set start time when questions are loaded
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [questions, questionTimeLimit, quizCompleted]);

    const startTimer = (initialTime) => {
        setTimeLeft(initialTime);
        const id = setInterval(() => {
            setTimeLeft(prev => {
                if (prev === 1) {
                    clearInterval(id);
                    handleTimeOut(); // Automatically mark as incorrect and move to the next question
                    return questionTimeLimit; // Reset timer for next question
                }
                // Change background based on time left
                if (prev <= 10) {
                    document.querySelector('.quiz-page').classList.add('danger');
                } else if (prev <= 15) {
                    document.querySelector('.quiz-page').classList.add('warning');
                }
                return prev - 1;
            });
        }, 1000);
        setIntervalId(id);
    };

    const handleAnswerSelect = (answer) => {
        setSelectedAnswer(answer);
    };

    const handleTimeOut = () => {
        const currentQuestion = questions[currentQuestionIndex];

        setComboCounter(0); // Reset combo counter on time out
        const correctAnswerMessage = `Time's up! The correct answer is ${currentQuestion.correct_answer}.`;
        setFeedbackMessage(correctAnswerMessage); // Set feedback message for time out
        speak(correctAnswerMessage); // Voice feedback for time out

        // Move to the next question after a brief delay
        setTimeout(() => {
            if (currentQuestionIndex + 1 < questions.length) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setSelectedAnswer(''); // Reset selected answer
                startTimer(questionTimeLimit); // Restart timer with question time limit
                // Reset background classes
                document.querySelector('.quiz-page').classList.remove('warning', 'danger');
            } else {
                setQuizCompleted(true);
                handleFinishQuiz(); // Call to handle finishing quiz when last question is answered
            }
        }, 2000); // Wait for 2 seconds to allow feedback to be heard
    };

    const handleNextQuestion = () => {
        if (isSpeaking) {
            // Prevent moving to next question if speech is in progress
            return;
        }

        const currentQuestion = questions[currentQuestionIndex];

        // Provide feedback based on answer correctness
        if (selectedAnswer === currentQuestion.correct_answer) {
            setScore(score + 1);
            setComboCounter(comboCounter + 1); // Increment combo counter for correct answer
            setFeedbackMessage('Correct!'); // Set feedback message for correct answer
            speak('Correct!'); // Voice feedback for correct answer
            
            // Trigger confetti effect for correct answer
            triggerConfetti();

            // Level Up Notification
            if (comboCounter % 3 === 0) {
                setLevelUpVisible(true);
                setTimeout(() => setLevelUpVisible(false), 3000); // Hide after 3 seconds
            }
        } else {
            setComboCounter(0); // Reset combo counter on wrong answer
            const correctAnswerMessage = `Wrong! The correct answer is ${currentQuestion.correct_answer}.`;
            setFeedbackMessage(correctAnswerMessage); // Set feedback message for wrong answer
            speak(correctAnswerMessage); // Voice feedback for wrong answer
        }

        // Wait a moment before moving to the next question
        setTimeout(() => {
            if (currentQuestionIndex + 1 < questions.length) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setSelectedAnswer(''); // Reset selected answer
                startTimer(questionTimeLimit); // Restart timer with question time limit
                // Reset background classes
                document.querySelector('.quiz-page').classList.remove('warning', 'danger');
            } else {
                setQuizCompleted(true);
                handleFinishQuiz(); // Call to handle finishing quiz when last question is answered
            }
        }, 2000); // Wait for 2 seconds before going to the next question to allow feedback to be heard
    };

    const speak = (message) => {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.onstart = () => setIsSpeaking(true); // Set speaking state to true when speech starts
        utterance.onend = () => setIsSpeaking(false); // Set speaking state to false when speech ends
        window.speechSynthesis.speak(utterance);
    };

    const triggerConfetti = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const myConfetti = confetti.create(canvas, {
                resize: true,
                useWorker: true
            });
            myConfetti({
                particleCount: 100,
                spread: 160,
                origin: { y: 0.6 },
            });
        } else {
            console.error('Canvas reference is null.'); // Log error if canvas ref is not set
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

            const answers = questions.map(() => selectedAnswer); // Placeholder, adjust if needed
            const feedback = "Great quiz!"; // Example feedback

            await axios.post(`http://localhost:3000/api/quizzes/${quizId}/submit`, {
                studentId: studentId,
                answers: answers,
                time_taken: timeTaken,
                feedback: feedback,
                attempt: 1,
                passed: passed
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
                    <p className="quiz-score">Your Score: {score} / {questions.length}</p>
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
                                className={`quiz-answer-button quiz-btn m-2 ${selectedAnswer === option ? 'selected' : 'btn-secondary'}`} 
                                onClick={() => handleAnswerSelect(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                    <p className="quiz-feedback">{feedbackMessage}</p>
                    <div className="mt-3">
                        <button className="quiz-btn btn btn-primary" onClick={handleNextQuestion} disabled={isSpeaking}>
                            {currentQuestionIndex + 1 < questions.length ? 'Next Question' : 'Complete Quiz'}
                        </button>
                    </div>
                    {levelUpVisible && <div className="level-up animate__animated animate__fadeIn">Level Up!</div>} 
                </div>
            )}
            {resultPopupVisible && (
                <div className={`result-popup ${isPass ? 'pass' : 'fail'}`}>
                    <p>{resultMessage}</p>
                    <button onClick={() => setResultPopupVisible(false)}>Close</button>
                </div>
            )}
            <canvas ref={canvasRef} className="confetti-canvas" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
        </div>
    );
};

export default QuizPage;

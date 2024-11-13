import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TeacherSidebar from './TeacherSidebar';
import TeacherNavbar from './TeacherNavbar';
import { useLocation, useNavigate } from 'react-router-dom';
import './QuizForm.css'; // Ensure you have this file for styling
import ProtectedTeacherRoute from './ProtectedTeacherRoute';

const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;

const QuizForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        timeLimit: '', // Ensure this is correctly handled
        passingScore: '', // Ensure this is correctly handled
        grade: [], // Changed to array for grades
        questions: []
    });
    const [quizId, setQuizId] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    // UseEffect to initialize form data based on URL parameters
    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const title = query.get('title') || '';
        const description = query.get('description') || '';
        const timeLimit = query.get('timeLimit') || '';
        const passingScore = query.get('passingScore') || '';
        const gradeLevel = query.get('gradeLevel') || ''; // Handle grade level input
        const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;

        let grades = [];
        if (gradeLevel === 'primary') {
            grades = [1, 2, 3];
        } else if (gradeLevel === 'secondary') {
            grades = [4, 5, 6];
        }

        setFormData({
            title,
            description,
            timeLimit,
            passingScore,
            grade: grades, // Set initial grade values based on grade level
            questions: []
        });
    }, [location]);

    // Handle input changes for form fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle changes for grade level dropdown
    const handleGradeLevelChange = (e) => {
        const value = e.target.value;
        let grades = [];
        if (value === 'primary') {
            grades = [1, 2, 3];
        } else if (value === 'secondary') {
            grades = [4, 5, 6];
        }
        setFormData(prevData => ({
            ...prevData,
            grade: grades
        }));
    };

    // Handle changes for question inputs
    const handleQuestionChange = (e, index) => {
        const { name, value } = e.target;
        const updatedQuestions = [...formData.questions];
        updatedQuestions[index][name] = value;
        setFormData({ ...formData, questions: updatedQuestions });
    };

    // Handle changes for answer option inputs
    const handleOptionChange = (e, index, optionIndex) => {
        const { value } = e.target;
        const updatedQuestions = [...formData.questions];
        updatedQuestions[index].answer_options[optionIndex] = value;
        setFormData({ ...formData, questions: updatedQuestions });
    };

    // Add a new question(s) to the form
    const addQuestion = () => {
        const numberOfQuestions = parseInt(prompt("How many questions would you like to add?"), 10);
        if (isNaN(numberOfQuestions) || numberOfQuestions <= 0) {
            alert("Please enter a valid number of questions.");
            return;
        }
        const newQuestions = Array.from({ length: numberOfQuestions }, () => ({
            question_text: '',
            answer_options: [''],
            correct_answer: ''
        }));
        setFormData({
            ...formData,
            questions: [...formData.questions, ...newQuestions]
        });
    };

    // Add a new option to a specific question
    const addOption = (index) => {
        const updatedQuestions = [...formData.questions];
        updatedQuestions[index].answer_options.push('');
        setFormData({ ...formData, questions: updatedQuestions });
    };

    // Remove a specific question from the form
    const removeQuestion = (index) => {
        const updatedQuestions = [...formData.questions];
        updatedQuestions.splice(index, 1); // Remove the question at the given index
        setFormData({ ...formData, questions: updatedQuestions });
    };

    // Remove a specific option from a question
    const removeOption = (questionIndex, optionIndex) => {
        const updatedQuestions = [...formData.questions];
        updatedQuestions[questionIndex].answer_options.splice(optionIndex, 1); // Remove the option at the given index
        setFormData({ ...formData, questions: updatedQuestions });
    };

    // Clear the form data
    const clearForm = () => {
        setFormData({
            title: '',
            description: '',
            timeLimit: '',
            passingScore: '',
            grade: [],
            questions: []
        });
        setSubmitted(false);
    };

    // Create a new quiz
   const createQuiz = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post(`${BASE_URL}/quizzes`, {
            title: formData.title,
            description: formData.description,
            time_limit: formData.timeLimit,
            passing_score: formData.passingScore,
            grades: formData.grade
        });
        setQuizId(response.data._id);
        alert('Quiz created successfully!');
        setSubmitted(true);
    } catch (error) {
        alert('Failed to create quiz');
    }
};

// Add questions to the created quiz
const addQuestionsToQuiz = async (e) => {
    e.preventDefault();
    try {
        console.log('Adding questions to quiz:', formData.questions); // Log questions data for debugging
        await axios.post(`${BASE_URL}/quizzes/${quizId}/questions`, {
            questions: formData.questions.map(q => ({
                question_text: q.question_text,
                answer_options: q.answer_options,
                correct_answer: q.correct_answer,
            }))
        });
        alert('Questions added successfully!');
        clearForm(); // Clear form after successful submission
        navigate(`/quizzes/${quizId}`); // Redirect to the quiz details page
    } catch (error) {
        console.error('Add Questions Error:', error.response ? error.response.data : error.message); // Log detailed error
        alert('Failed to add questions to quiz');
    }
};


    return ( 
        <ProtectedTeacherRoute>
    <div className="admin-dashboard-component container-fluid">
        <TeacherNavbar />
         <div className="row">
         <TeacherSidebar />
        <div className="quiz-form-container">
            <h2>Create Quiz</h2>
            <form className="quiz-form" onSubmit={createQuiz}>
                <label>Title:</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} />
                <label>Description:</label>
                <textarea name="description" value={formData.description} onChange={handleChange} />
                <label>Time Limit (minutes):</label>
                <input
                    type="number"
                    name="timeLimit"
                    value={formData.timeLimit}
                    onChange={handleChange}
                    min="1" // Ensure positive time limit
                />
                <label>Passing Score (%):</label>
                <input
                    type="number"
                    name="passingScore"
                    value={formData.passingScore}
                    onChange={handleChange}
                    min="0" // Ensure non-negative passing score
                    max="100" // Ensure score is within percentage range
                />
                <label>Grade Level:</label>
                <select name="gradeLevel" onChange={handleGradeLevelChange}>
                    <option value="">Select Grade Level</option>
                    <option value="primary">Primary (Grades 1-3)</option>
                    <option value="secondary">Secondary (Grades 4-6)</option>
                </select>
                <button type="submit" className="quiz-create-button">Create Quiz</button>
            </form>
            {submitted && (
                <div className="questions-section">
                    <h2>Add Questions</h2>
                    <button onClick={addQuestion} className="quiz-add-question-button">Add Question</button>
                    <form onSubmit={addQuestionsToQuiz}>
                        {formData.questions.map((question, index) => (
                            <div key={index} className="question-container">
                                <h3>Question {index + 1}</h3>
                                <label>Question:</label>
                                <input
                                    type="text"
                                    name="question_text"
                                    value={question.question_text}
                                    onChange={(e) => handleQuestionChange(e, index)}
                                />
                                <button type="button" onClick={() => removeQuestion(index)} className="quiz-remove-question-button">
                                    Remove Question (X)
                                </button>
                                <label>Answer Options:</label>
                                {question.answer_options.map((option, optionIndex) => (
                                    <div key={optionIndex} className="option-container">
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => handleOptionChange(e, index, optionIndex)}
                                        />
                                        <button type="button" onClick={() => removeOption(index, optionIndex)} className="quiz-remove-option-button">
                                            Remove Option (X)
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addOption(index)} className="quiz-add-option-button">
                                    Add Option
                                </button>
                                <label>Correct Answer:</label>
                                <input
                                    type="text"
                                    name="correct_answer"
                                    value={question.correct_answer}
                                    onChange={(e) => handleQuestionChange(e, index)}
                                />
                            </div>
                        ))}
                        <button type="submit" className="quiz-submit-questions-button">
                            Add Questions to Quiz
                        </button>
                    </form>
                </div>
            )}
        </div>
        </div>
        </div>
        </ProtectedTeacherRoute>
    );
};

export default QuizForm;

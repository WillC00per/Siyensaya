import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Modal, Form } from 'react-bootstrap';
import AdminNavbar from './AdminNavbar';
import Sidebar from './Sidebar';

const QuizManagement = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [selectedGrade, setSelectedGrade] = useState('all');
    const [message, setMessage] = useState('');
    const [showMessage, setShowMessage] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [questions, setQuestions] = useState([]); // Add questions state

    const navigate = useNavigate();

   

   useEffect(() => {
    fetchQuizzes(); 
}, []);

const fetchQuizzes = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/quizzes/`);
        setQuizzes(response.data);
        setMessage('');
    } catch (error) {
        setMessage(error.response ? error.response.data : 'Error fetching quizzes');
        setShowMessage(true);
        setQuizzes([]);
    }
};

const fetchQuestions = async (quizId) => {
    try {
        const response = await axios.get(`${BASE_URL}/quizzes/${quizId}/questions`);
        console.log('Fetched questions:', response.data); // Debugging line
        setQuestions(response.data);
    } catch (error) {
        setMessage('Error fetching questions');
        setShowMessage(true);
    }
};

const fetchQuizzesByGrade = async (grade) => {
    if (grade === 'all') {
        fetchQuizzes();
        return;
    }
    try {
        const response = await axios.get(`${BASE_URL}/quizzes/grade/${grade}`);
        setQuizzes(response.data);
        setMessage('');
    } catch (error) {
        setMessage(error.response ? error.response.data : 'Error fetching quizzes');
        setShowMessage(true);
        setQuizzes([]);
    }
};

    const handleShowModal = (quiz) => {
        setSelectedQuiz(quiz);
        fetchQuestions(quiz._id); // Fetch questions for the selected quiz
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setSelectedQuiz(null);
        setQuestions([]); // Reset questions on modal close
        setShowModal(false);
    };

   const handleEditQuiz = async (event) => {
    event.preventDefault();
    try {
        const updatedQuiz = {
            ...selectedQuiz,
            title: event.target.title.value,
            description: event.target.description.value,
            time_limit: event.target.time_limit.value,
            passing_score: event.target.passing_score.value,
            grades: event.target.grades.value.split(',').map(Number),
            questions // Include questions in the payload
        };

        await axios.put(`${BASE_URL}/quizzes/${selectedQuiz._id}`, updatedQuiz);
        setQuizzes(quizzes.map(quiz => (quiz._id === selectedQuiz._id ? updatedQuiz : quiz)));
        setMessage('Quiz updated successfully');
        setShowMessage(true);
        handleCloseModal();
    } catch (error) {
        setMessage(`Error updating quiz: ${error.response ? error.response.data : error.message}`);
        setShowMessage(true);
    }
};

    const handleQuestionChange = (index, field, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index][field] = value;
        setQuestions(updatedQuestions);
    };

    return (
        <div className="quiz-management-page d-flex">
            <Sidebar />
            <div className="flex-grow-1">
                <AdminNavbar />
                <div className="container mt-4">
                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            <div className="card shadow">
                                <h1 className="card-header text-center">QUIZ MANAGEMENT</h1>
                                <div className="card-body">
                                    {showMessage && (
                                        <Alert variant="info" onClose={() => setShowMessage(false)} dismissible>
                                            {message}
                                        </Alert>
                                    )}
                                    <div className="mb-3">
                                        <label htmlFor="gradeSelect" className="form-label">Select Grade:</label>
                                        <select
                                            id="gradeSelect"
                                            value={selectedGrade}
                                            onChange={(e) => {
                                                const grade = e.target.value;
                                                setSelectedGrade(grade);
                                                fetchQuizzesByGrade(grade);
                                            }}
                                            className="form-select"
                                        >
                                            <option value="all">All Grades</option>
                                            {[1, 2, 3, 4, 5, 6].map(grade => (
                                                <option key={grade} value={grade}>Grade {grade}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <table className="table quiz-table">
                                        <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>Description</th>
                                                <th>Time Limit</th>
                                                <th>Passing Score</th>
                                                <th>Grades</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {quizzes.map((quiz) => (
                                                <tr key={quiz._id}>
                                                    <td>{quiz.title}</td>
                                                    <td>{quiz.description}</td>
                                                    <td>{quiz.time_limit}</td>
                                                    <td>{quiz.passing_score}</td>
                                                    <td>{quiz.grades.join(', ')}</td>
                                                    <td>
                                                        <Button variant="primary" onClick={() => handleShowModal(quiz)}>EDIT</Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Quiz</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedQuiz && (
                        <Form onSubmit={handleEditQuiz}>
                            <Form.Group controlId="formQuizTitle">
                                <Form.Label>Title</Form.Label>
                                <Form.Control type="text" defaultValue={selectedQuiz.title} name="title" required />
                            </Form.Group>
                            <Form.Group controlId="formQuizDescription">
                                <Form.Label>Description</Form.Label>
                                <Form.Control type="text" defaultValue={selectedQuiz.description} name="description" required />
                            </Form.Group>
                            <Form.Group controlId="formQuizTimeLimit">
                                <Form.Label>Time Limit (in minutes)</Form.Label>
                                <Form.Control type="number" defaultValue={selectedQuiz.time_limit} name="time_limit" required />
                            </Form.Group>
                            <Form.Group controlId="formQuizPassingScore">
                                <Form.Label>Passing Score</Form.Label>
                                <Form.Control type="number" defaultValue={selectedQuiz.passing_score} name="passing_score" required />
                            </Form.Group>
                            <Form.Group controlId="formQuizGrades">
                                <Form.Label>Grades (comma-separated)</Form.Label>
                                <Form.Control type="text" defaultValue={selectedQuiz.grades.join(', ')} name="grades" required />
                            </Form.Group>

                            {/* Render each question for editing */}
                            <h5>Questions</h5>
                            {questions.map((question, index) => (
                                <div key={question._id || index}>
                                    <Form.Group controlId={`formQuestionText${index}`}>
                                        <Form.Label>Question Text</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={question.question_text}
                                            onChange={(e) => handleQuestionChange(index, 'question_text', e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                    <Form.Group controlId={`formAnswerOptions${index}`}>
                                        <Form.Label>Answer Options (comma-separated)</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={question.answer_options.join(', ')}
                                            onChange={(e) => handleQuestionChange(index, 'answer_options', e.target.value.split(', '))}
                                            required
                                        />
                                    </Form.Group>
                                    <Form.Group controlId={`formCorrectAnswer${index}`}>
                                        <Form.Label>Correct Answer</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={question.correct_answer}
                                            onChange={(e) => handleQuestionChange(index, 'correct_answer', e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                    <hr />
                                </div>
                            ))}

                            <Button variant="primary" type="submit">Save Changes</Button>
                        </Form>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default QuizManagement;

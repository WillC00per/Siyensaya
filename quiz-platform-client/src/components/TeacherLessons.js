import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './TeacherLessons.css';
import TeacherSidebar from './TeacherSidebar';
import TeacherNavbar from './TeacherNavbar';

const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;

const TeacherLessons = () => {
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State for badge completion report
    const [report, setReport] = useState([]);
    const [loadingReport, setLoadingReport] = useState(true);
    const [errorReport, setErrorReport] = useState(null);

    // State for quiz completion report
    const [quizReport, setQuizReport] = useState([]);
    const [loadingQuizReport, setLoadingQuizReport] = useState(true);
    const [errorQuizReport, setErrorQuizReport] = useState(null);

    // State for modals
    const [modalOpen, setModalOpen] = useState(false);
    const [viewedStudentsModalOpen, setViewedStudentsModalOpen] = useState(false);
    const [selectedBadgeReport, setSelectedBadgeReport] = useState(null);
    const [viewedStudents, setViewedStudents] = useState([]);
    const [quizModalOpen, setQuizModalOpen] = useState(false); // New state for quiz modal
    const [selectedQuizData, setSelectedQuizData] = useState(null); // New state for selected quiz data

   useEffect(() => {
    const fetchLessons = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/lessons/teacher-lessons`);
            setLessons(response.data);
        } catch (err) {
            setError('Error fetching lessons. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const fetchBadgeCompletionReport = async () => {
        setLoadingReport(true);
        try {
            const response = await axios.get(`${BASE_URL}/badges/completion-report`);
            setReport(response.data);
        } catch (err) {
            setErrorReport('Error fetching badge completion report. Please try again later.');
        } finally {
            setLoadingReport(false);
        }
    };

    const fetchQuizCompletionReport = async () => {
        setLoadingQuizReport(true);
        try {
            const response = await axios.get(`${BASE_URL}/quizzes/completion-report`);
            setQuizReport(response.data);
        } catch (err) {
            setErrorQuizReport('Error fetching quiz completion report. Please try again later.');
        } finally {
            setLoadingQuizReport(false);
        }
    };

    fetchLessons();
    fetchBadgeCompletionReport();
    fetchQuizCompletionReport();
}, []);

    const openViewedStudentsModal = (students) => {
        setViewedStudents(students);
        setViewedStudentsModalOpen(true);
    };

    const openBadgeModal = (badgeReport) => {
        setSelectedBadgeReport(badgeReport);
        setModalOpen(true);
    };

    const openQuizModal = (quizData) => { // New function to open the quiz modal
        setSelectedQuizData(quizData);
        setQuizModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedBadgeReport(null);
    };

    const closeViewedStudentsModal = () => {
        setViewedStudentsModalOpen(false);
        setViewedStudents([]);
    };

    const closeQuizModal = () => { // New function to close the quiz modal
        setQuizModalOpen(false);
        setSelectedQuizData(null);
    };

    if (loading) return <p className="loading-text">Loading lessons...</p>;
    if (error) return <p className="error-text">{error}</p>;

    // Filter lessons by grade groups
    const grade1to3Lessons = lessons.filter(lesson => lesson.grade >= 1 && lesson.grade <= 3);
    const grade4to6Lessons = lessons.filter(lesson => lesson.grade >= 4 && lesson.grade <= 6);

    return (
        <div className="container-fluid" style={{ paddingLeft: '500px', paddingTop: '110px' }}>
        <TeacherNavbar />
         <div className="row">
         <TeacherSidebar />
        <div className="teacher-lessons-container">
            <h2 className="lessons-title">STUDENT PROGRESS</h2>
            
            <h3 className="grade-title">Grade 1-3 Lessons</h3>
            <ul className="lesson-list">
                {grade1to3Lessons.map((lesson) => (
                    <li key={lesson._id} className="lesson-item">
                        <h3 className="lesson-name">{lesson.title}</h3>
                        <p className="lesson-description">{lesson.description}</p>
                        <button className="viewed-button" onClick={() => openViewedStudentsModal(lesson.studentsViewed)}>
                            Viewed by {lesson.studentCount} student{lesson.studentCount === 1 ? '' : 's'}
                        </button>
                    </li>
                ))}
            </ul>

            <h3 className="grade-title">Grade 4-6 Lessons</h3>
            <ul className="lesson-list">
                {grade4to6Lessons.map((lesson) => (
                    <li key={lesson._id} className="lesson-item">
                        <h3 className="lesson-name">{lesson.title}</h3>
                        <p className="lesson-description">{lesson.description}</p>
                        <button className="viewed-button" onClick={() => openViewedStudentsModal(lesson.studentsViewed)}>
                            Viewed by {lesson.studentCount} student{lesson.studentCount === 1 ? '' : 's'}
                        </button>
                    </li>
                ))}
            </ul>

            <h2 className="report-title">Badge Completion Report</h2>
            {loadingReport ? (
                <p className="loading-text">Loading badge completion report...</p>
            ) : errorReport ? (
                <p className="error-text">{errorReport}</p>
            ) : (
                <table className="badge-report-table">
                    <thead>
                        <tr>
                            <th>Grade</th>
                            <th>Badge Name</th>
                            <th>Total Students</th>
                            <th>Students with Badge</th>
                            <th>Students without Badge</th>
                            <th>Completion Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.map((data, index) => (
                            <tr key={index} onClick={() => openBadgeModal(data)} style={{ cursor: 'pointer' }}>
                                <td>{data.grade}</td>
                                <td>{data.badgeName}</td>
                                <td>{data.totalStudents}</td>
                                <td>{data.studentsWithBadge}</td>
                                <td>{data.studentsWithoutBadge}</td>
                                <td>{data.completionPercentage}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Modal for badge students */}
            {modalOpen && selectedBadgeReport && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        <h2 className="modal-title">Badge Report Details</h2>
                        <p><strong>Grade:</strong> {selectedBadgeReport.grade}</p>
                        <p><strong>Badge Name:</strong> {selectedBadgeReport.badgeName}</p>
                        <p><strong>Total Students:</strong> {selectedBadgeReport.totalStudents}</p>
                        <p><strong>Completion Percentage:</strong> {selectedBadgeReport.completionPercentage}%</p>

                        <h3>Students with Badge:</h3>
                        <ul className="modal-student-list">
                            {selectedBadgeReport.studentsWithBadgeNames.length > 0 ? (
                                selectedBadgeReport.studentsWithBadgeNames.map((studentName, index) => (
                                    <li key={index} className="modal-student-item">
                                        {studentName}
                                    </li>
                                ))
                            ) : (
                                <li className="modal-student-item">No students have this badge.</li>
                            )}
                        </ul>

                        <h3>Students without Badge:</h3>
                        <ul className="modal-student-list">
                            {selectedBadgeReport.studentsWithoutBadgeNames.length > 0 ? (
                                selectedBadgeReport.studentsWithoutBadgeNames.map((studentName, index) => (
                                    <li key={index} className="modal-student-item">
                                        {studentName}
                                    </li>
                                ))
                            ) : (
                                <li className="modal-student-item">All students have this badge.</li>
                            )}
                        </ul>
                    </div>
                </div>
            )}

            {/* New Section for Quiz Completion Report */}
            <h2 className="report-title">Quiz Completion Report</h2>
            {loadingQuizReport ? (
                <p className="loading-text">Loading quiz completion report...</p>
            ) : errorQuizReport ? (
                <p className="error-text">{errorQuizReport}</p>
            ) : (
                <table className="quiz-report-table">
                    <thead>
                        <tr>
                            <th>Quiz Title</th>
                            <th>Total Students</th>
                            <th>Students Completed</th>
                            <th>Average Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quizReport.map((quizData, index) => (
                            <tr key={index} onClick={() => openQuizModal(quizData)} style={{ cursor: 'pointer' }}>
                                <td>{quizData.title}</td>
                                <td>{quizData.totalStudents}</td>
                                <td>{quizData.studentsCompleted}</td>
                                <td>{quizData.averageScore}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* New Modal for Quiz Students */}
            {quizModalOpen && selectedQuizData && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeQuizModal}>&times;</span>
                        <h2 className="modal-title">Quiz Completion Details</h2>
                        <p><strong>Quiz Title:</strong> {selectedQuizData.title}</p>
                        <p><strong>Total Students:</strong> {selectedQuizData.totalStudents}</p>
                        <p><strong>Students Completed:</strong> {selectedQuizData.studentsCompleted}</p>
                        <p><strong>Students Not Completed:</strong> {selectedQuizData.studentsNotCompleted}</p>

                        <h3>Students Completed the Quiz:</h3>
                        <ul className="modal-student-list">
                            {selectedQuizData.studentsCompletedNames.length > 0 ? (
                                selectedQuizData.studentsCompletedNames.map((studentName, index) => (
                                    <li key={index} className="modal-student-item">
                                        {studentName}
                                    </li>
                                ))
                            ) : (
                                <li className="modal-student-item">No students have completed this quiz.</li>
                            )}
                        </ul>

                        <h3>Students Not Completed the Quiz:</h3>
                        <ul className="modal-student-list">
                            {selectedQuizData.studentsNotCompletedNames.length > 0 ? (
                                selectedQuizData.studentsNotCompletedNames.map((studentName, index) => (
                                    <li key={index} className="modal-student-item">
                                        {studentName}
                                    </li>
                                ))
                            ) : (
                                <li className="modal-student-item">All students have completed this quiz.</li>
                            )}
                        </ul>
                    </div>
                </div>
            )}
        </div>
        </div>
        </div>
    );
};

export default TeacherLessons;

import React, { useEffect, useState } from 'react';
import TeacherSidebar from './TeacherSidebar';
import TeacherNavbar from './TeacherNavbar';
import axios from 'axios';
import 'react-circular-progressbar/dist/styles.css';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import './AdminDashboard.css';

const TeacherDashboard = () => {
    const [studentsByGrade, setStudentsByGrade] = useState({});
    const [recentTeachers, setRecentTeachers] = useState([]);
    const [allTeachers, setAllTeachers] = useState([]);
    const [selectedGrade, setSelectedGrade] = useState(null);
    
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [studentsInSelectedGrade, setStudentsInSelectedGrade] = useState([]);
    const [studentDetails, setStudentDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quizAverages, setQuizAverages] = useState([]);
    const [averageBadges, setAverageBadges] = useState([]);

    const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;
    const token = localStorage.getItem('token');

    const axiosConfig = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setLoading(true);
                const responses = await Promise.all(
                    [1, 2, 3, 4, 5, 6].map(grade => axios.get(`${BASE_URL}/all-students/${grade}`, axiosConfig))
                );
                const groupedStudents = {};
                responses.forEach((response, index) => {
                    const grade = index + 1;
                    groupedStudents[grade] = response.data;
                });
                setStudentsByGrade(groupedStudents);
            } catch (error) {
                console.error('Error fetching students:', error);
                setError('Could not fetch student data.');
            } finally {
                setLoading(false);
            }
        };

        

        const fetchQuizAverages = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/quiz-averages`, axiosConfig);
                setQuizAverages(response.data);
            } catch (error) {
                console.error('Error fetching quiz averages:', error);
                setError('Could not fetch quiz averages.');
            }
        };

        const fetchAverageBadges = async () => { // New function to fetch average badges
            try {
                const response = await axios.get(`${BASE_URL}/average-badges`, axiosConfig);
                setAverageBadges(response.data);
            } catch (error) {
                console.error('Error fetching average badges:', error);
                setError('Could not fetch average badges.');
            }
        };

        fetchStudents();
        
        fetchQuizAverages();
        fetchAverageBadges()
    }, [token]);

    

    const handleShowStudentsByGrade = (grade) => {
        setStudentsInSelectedGrade(studentsByGrade[grade] || []);
        setSelectedGrade(grade);
        setShowStudentModal(true);
    };

    const handleStudentClick = async (studentId) => {
        try {
            const response = await axios.get(`${BASE_URL}/student/${studentId}`, axiosConfig);
            setStudentDetails(response.data);
            setShowStudentModal(true);
        } catch (error) {
            console.error('Error fetching student details:', error);
            setError('Could not fetch student details.');
        }
    };

    const closeModal = () => {
        
        setShowStudentModal(false);
        setStudentDetails(null);
    };

    const chartData = Object.keys(studentsByGrade).map(grade => ({
        name: `Grade ${grade}`,
        value: studentsByGrade[grade] ? studentsByGrade[grade].length : 0,
    }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#D42F47', '#8B60ED'];

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }
return (
    <div className="container-fluid" style={{ paddingLeft: '500px', paddingTop: '110px' }}>
        <div className="row">
            <TeacherSidebar />
            <main className="admin-dashboard-component__main col-9 d-flex flex-column">
                <div className="admin-dashboard-component__section mb-5 d-flex flex-column align-items-center">
                    <div className="dashboard-box">
                        {/* Teacher Dashboard Header */}
                        <div 
    className="admin-dashboard-header" 
    style={{ backgroundColor: '#007BFF', padding: '10px 20px', color: 'white', borderRadius: '5px' }}
>
    <h1>Teacher Dashboard</h1>
</div>

                        <h2 className="admin-dashboard-component__title">Students by Grade</h2>
                        {Array.from({ length: 6 }, (_, i) => i + 1).map((grade) => (
                            <div key={grade} className="admin-dashboard-component__grade-section mb-3">
                                <h3 className="admin-dashboard-component__grade-title">Grade {grade}</h3>
                                <div className="admin-dashboard-component__students d-flex flex-wrap justify-content-center">
                                    {(studentsByGrade[grade] || []).slice(0, 4).map((student, index) => (
                                        <div 
                                            key={student._id} 
                                            className={`admin-dashboard-component__student-card card m-2 p-3 text-center`}
                                            onClick={() => handleStudentClick(student._id)} 
                                            style={{ width: '100px' }}
                                        >
                                             <img 
                                                    src={student.avatarUrl ? `${process.env.REACT_APP_API_BASE_URL}${student.avatarUrl}` : 'https://i.imgur.com/MmK2JOi.png'}
                                                    alt={student.fullName || 'Student Avatar'} 
                                                    className="admin-dashboard-component__student-avatar card-img-top rounded-circle mb-2" 
                                                    style={{ width: '50px', height: '50px' }}
                                                />
                                            <div className="card-body p-0">
                                                <h6 className="admin-dashboard-component__student-name card-title">
                                                    {student.fullName || `${student.firstName} ${student.lastName}`}
                                                </h6>
                                            </div>
                                        </div>
                                    ))}
                                    {(!studentsByGrade[grade] || studentsByGrade[grade].length === 0) && (
                                        <p className="admin-dashboard-component__no-students text-muted">No students found in this grade.</p>
                                    )}
                                </div>
                                <button className="btn btn-primary mt-3" onClick={() => handleShowStudentsByGrade(grade)}>View All Students in Grade {grade}</button>
                            </div>
                        ))}
                    </div>
               


                        <div className="dashboard-box">
                            <h2 className="admin-dashboard-component__title">Students by Grade Chart</h2>
                            <div className="admin-dashboard-component__chart-container d-flex justify-content-center mb-4">
                                <PieChart width={400} height={400}>
                                    <Pie 
                                        data={chartData} 
                                        cx="50%" 
                                        cy="50%" 
                                        outerRadius={120} 
                                        fill="#82ca9d" 
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </div>
                        </div>
                    </div>

                    {/* Quiz Averages Section */}
                    <div className="dashboard-box">
                        <h2 className="admin-dashboard-component__title">Quiz Averages by Grade</h2>
                        <ul className="list-group">
                            {quizAverages.length > 0 ? quizAverages.map(({ grade, averageScore }) => (
                                <li key={grade} className="list-group-item">
                                    Grade {grade}: Average Score: {averageScore.toFixed(2)} 
                                </li>
                            )) : (
                                <li className="list-group-item">No quiz averages available.</li>
                            )}
                        </ul>
                    </div>


                    {/* Average Badges Section */}
                    <div className="dashboard-badges-container">
    <h2 className="dashboard-badges-title">Average Badges by Grade</h2>
    <ul className="dashboard-badges-list">
        {averageBadges.length > 0 ? (
            averageBadges.map(({ grade, averageBadges, totalAvailableBadges, completionPercentage }) => (
                <li key={grade} className="dashboard-badges-list-item">
                    <span className="dashboard-badges-grade-label">Grade {grade}:</span>
                    <span className="dashboard-badges-info">
                        Average Badges: <strong>{averageBadges.toFixed(2)}</strong> / 
                        Total Available Badges: <strong>{totalAvailableBadges}</strong> / 
                        Completion Percentage: <strong>{completionPercentage.toFixed(2)}%</strong>
                    </span>
                </li>
            ))
        ) : (
            <li className="dashboard-badges-list-item">No average badges available.</li>
        )}
    </ul>
</div>






                    {showStudentModal && (
                        <div className="modal show d-block" tabIndex="-1" role="dialog">
                            <div className="modal-dialog" role="document">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Students in Grade {selectedGrade}</h5>
                                       
                                    </div>
                                    <div className="modal-body">
                                        <ul className="list-group">
                                            {studentsInSelectedGrade.length > 0 ? studentsInSelectedGrade.map((student) => (
                                                <li key={student._id} className="list-group-item" onClick={() => handleStudentClick(student._id)}>
                                                    {student.fullName || `${student.firstName} ${student.lastName}`}
                                                </li>
                                            )) : (
                                                <li className="list-group-item">No students in this grade.</li>
                                            )}
                                        </ul>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {showStudentModal && studentDetails && (
                        <div className="modal show d-block" tabIndex="-1" role="dialog">
                            <div className="modal-dialog" role="document">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Details for {studentDetails.fullName}</h5>
                                       
                                    </div>
                                    <div className="modal-body">
                                        <p><strong>Student Number:</strong> {studentDetails.studentNumber}</p>
                        <p><strong>Student Name:</strong> {studentDetails.fullName}</p>
                                        <p><strong>Grade:</strong> {studentDetails.grade}</p>

                                        <h5 className="mt-4">Quiz Scores</h5>
                                        <ul>
                                            {studentDetails.quizScores.length > 0 ? studentDetails.quizScores.map((quiz) => (
                                                <li key={quiz.quizId}>{`Quiz: ${quiz.title || 'No title'}, Score: ${quiz.score}, Date Taken: ${new Date(quiz.dateTaken).toLocaleDateString()}`}</li>
                                            )) : <li>No quiz scores available.</li>}
                                        </ul>

                                        <h5 className="mt-4">Badges</h5>
                                        <ul>
                                            {studentDetails.badges.length > 0 ? studentDetails.badges.map((badge) => (
                                                <li key={badge.badge}>{badge.badgeName} (Earned on: {new Date(badge.dateEarned).toLocaleDateString()})</li>
                                            )) : <li>No badges earned.</li>}
                                        </ul>

                                        <h5 className="mt-4">Lessons Progress</h5>
                                        <ul>
                                            {studentDetails.lessonsProgress.length > 0 ? studentDetails.lessonsProgress.map((lesson) => (
                                                <li key={lesson.lesson}>{`Lesson ID: ${lesson.lesson}, Watched Video: ${lesson.watchedVideo ? 'Yes' : 'No'}, Opened Presentation: ${lesson.openedPresentation ? 'Yes' : 'No'}, Last Accessed: ${new Date(lesson.lastAccessed).toLocaleDateString()}`}</li>
                                            )) : <li>No lessons progress available.</li>}
                                        </ul>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default TeacherDashboard;

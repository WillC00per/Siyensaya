import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home'; 
import EditUser from './components/EditUser'; 
import UserManagement from './components/UserManagement';
import QuizManagement from './components/QuizManagement';
import QuizForm from './components/QuizForm';
import QuizzesPage from './components/QuizzesPage'; 
import QuizPage from './components/QuizPage'; 
import StudentLessons from './components/StudentLesson'; 
import TeacherLessons from './components/TeacherLessons'; 
import LessonDetails from './components/LessonDetails';
import BadgeForm from './components/badgeForm';
import StudentProfile from './components/StudentProfile';
import AvatarUpload from './components/AvatarUpload';
import GameUpload from './components/GameUpload'; 
import StudentGames from './components/StudentGames';
import GamePlayer from './components/GamePlayer';
import LessonForm from './components/LessonForm';
import 'bootstrap/dist/css/bootstrap.min.css';
import { NotificationProvider } from './context/NotificationContext';
import Notification from './components/Notification';
import BadgeNotification from './components/BadgeNotification';
import ProtectedRoute from './components/ProtectedRoutes';
import ProtectedTeacherRoute from './components/ProtectedTeacherRoute'; // Import the ProtectedTeacherRoute
import ProtectedAdminRoute from './components/ProtectedAdminRoutes'; // Import the ProtectedAdminRoute

function App() {
    return (
        <NotificationProvider>
            <Router>
                <Notification />
                <BadgeNotification />
                <Routes>
                    {/* Admin Protected Routes */}
                    <Route path="/edit-user/:username" element={<ProtectedAdminRoute><EditUser /></ProtectedAdminRoute>} />
                    <Route path="/user-management" element={<ProtectedAdminRoute><UserManagement /></ProtectedAdminRoute>} />
                    <Route path="/quiz-form" element={<ProtectedAdminRoute><QuizForm /></ProtectedAdminRoute>} />
                    <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
                    <Route path="/register" element={<ProtectedAdminRoute><Register /></ProtectedAdminRoute>} />
                    <Route path="/admindashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
                    <Route path="/edituser" element={<ProtectedAdminRoute><EditUser /></ProtectedAdminRoute>} />
                    <Route path="/quiz-management" element={<ProtectedAdminRoute><QuizManagement /></ProtectedAdminRoute>} />
                    <Route path="/upload-avatar" element={<ProtectedAdminRoute><AvatarUpload /></ProtectedAdminRoute>} />
                    <Route path="/upload-game" element={<ProtectedAdminRoute><GameUpload /></ProtectedAdminRoute>} />

                    {/* Login and Home Routes */}
                    <Route path="/" element={<Home />} /> 
                    <Route path="/home" element={<Home />} /> 
                    <Route path="/login" element={<Login />} />
                    
                    {/* Protected Student Routes */}
                    <Route 
                        path="/student" 
                        element={
                            <ProtectedRoute>
                                <StudentDashboard />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/quizzes" 
                        element={
                            <ProtectedRoute>
                                <QuizzesPage />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/quiz/:quizId" 
                        element={
                            <ProtectedRoute>
                                <QuizPage />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/student-lessons" 
                        element={
                            <ProtectedRoute>
                                <StudentLessons />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/lessons/:lessonId" 
                        element={
                            <ProtectedRoute>
                                <LessonDetails />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/student-game" 
                        element={
                            <ProtectedRoute>
                                <StudentGames />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/play-game" 
                        element={
                            <ProtectedRoute>
                                <GamePlayer />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/profile" 
                        element={
                            <ProtectedRoute>
                                <StudentProfile />
                            </ProtectedRoute>
                        } 
                    />

                    {/* Protected Teacher Routes */}
                    <Route path="/teacherdashboard" element={<ProtectedTeacherRoute><TeacherDashboard /></ProtectedTeacherRoute>} /> 
                    <Route 
                        path="/quiz-form" 
                        element={
                            <ProtectedTeacherRoute>
                                <QuizForm />
                            </ProtectedTeacherRoute>
                        } 
                    />
                    <Route 
                        path="/lesson-form" 
                        element={
                            <ProtectedTeacherRoute>
                                <LessonForm />
                            </ProtectedTeacherRoute>
                        } 
                    />
                    <Route 
                        path="/teacher-lessons" 
                        element={
                            <ProtectedTeacherRoute>
                                <TeacherLessons />
                            </ProtectedTeacherRoute>
                        } 
                    />
                    <Route 
                        path="/badge-form" 
                        element={
                            <ProtectedTeacherRoute>
                                <BadgeForm />
                            </ProtectedTeacherRoute>
                        } 
                    />
                    
                </Routes>
            </Router>
        </NotificationProvider>
    );
}

export default App;

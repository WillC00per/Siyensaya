import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; 
import NavigationBar from './NavigationBar'; // Import the NavigationBar component

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Send login request to the backend
             const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/login`, { username, password });

            if (response.status === 200) {
                // Extract token, role, studentId, and grade from the response
                const { token, role, studentId, grade } = response.data;

                // Store the token and role in localStorage
                localStorage.setItem('token', token);
                
                // Store data based on the role
                if (role === 'admin' || role === 'teacher') {
                    // Store role and employee ID (if applicable)
                    localStorage.setItem('role', role);
                    localStorage.setItem('employeeId', response.data.employeeId || ''); // Assuming employeeId is returned
                } else if (role === 'student') {
                    // Store studentId and grade
                    localStorage.setItem('studentId', studentId); // Store studentId for later use
                    localStorage.setItem('grade', grade); // Store grade for later use
                    localStorage.setItem('role', role); // Store the role
                }

                // Log the stored values to verify
                console.log('Token stored:', localStorage.getItem('token'));
                if (role === 'student') {
                    console.log('Student ID stored:', localStorage.getItem('studentId'));
                    console.log('Grade stored:', localStorage.getItem('grade'));
                } else {
                    console.log('Role stored:', localStorage.getItem('role'));
                }

                // Redirect based on the role
                if (role === 'admin') {
                    navigate('/admindashboard');
                } else if (role === 'student') {
                    navigate('/student');
                } else if (role === 'teacher') {
                    navigate('/lessonform'); // Redirect to lesson form for teachers
                }
            }
        } catch (error) {
            console.error('Login failed:', error);
            alert('Login failed. Please check your username and password.');
        }
    };

    return (
        <div>
            <NavigationBar 
                handleLoginClick={() => navigate('/login')}
                handleGetStartedClick={() => navigate('/register')}
                menuActive={false}
                handleMenuToggle={() => {}} // No need for menu toggle in login page
            />
            <div className="login-container">
                <div className="login-form">
                    <img src="https://i.imgur.com/sTQlI67.png" alt="Logo" />
                    <div className="userPass">
                        <form onSubmit={handleLogin}>
                            <div className="form-group">
                                <label htmlFor="username">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    className="form-control"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    className="form-control"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn login-btn2 btn-primary">LOGIN</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

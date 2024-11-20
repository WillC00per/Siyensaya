import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Register.css';
import AdminNavbar from './AdminNavbar';
import Sidebar from './Sidebar';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('student');
    const [studentNumber, setStudentNumber] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [birthday, setBirthday] = useState('');
    const [address, setAddress] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [grade, setGrade] = useState('');
    const [employeeNumber, setEmployeeNumber] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}`;

    useEffect(() => {
        // Temporarily disable the admin-only restriction by commenting out the code below
        // const checkUserRole = async () => {
        //     try {
        //         const token = localStorage.getItem('token');
        //         if (!token) {
        //             navigate('/');
        //             return;
        //         }
        //         const response = await axios.get('http://localhost:3000/user', {
        //             headers: {
        //                 'Authorization': `Bearer ${token}`
        //             }
        //         });
        //         if (response.data.role !== 'admin') {
        //             navigate('/');
        //         }
        //     } catch (error) {
        //         navigate('/');
        //     }
        // };
        // checkUserRole();
    }, [navigate]);

   const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        try {
            await axios.post(`${BASE_URL}/register`, { 
                username, 
                password, 
                role,
                studentNumber: role === 'student' ? studentNumber : undefined,
                email,
                firstName,
                middleName,
                lastName,
                birthday,
                address,
                contactNumber,
                grade: role === 'student' ? grade : undefined,
                employeeNumber: role !== 'student' ? employeeNumber : undefined
            });
            setMessage('User registered successfully');
        } catch (error) {
            setMessage(`Error during registration: ${error.response ? error.response.data : error.message}`);
        }
    };

    const validateForm = () => {
        let formIsValid = true;

        // Password confirmation
        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            formIsValid = false;
        }

        // Email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setMessage('Invalid email format');
            formIsValid = false;
        }

        // Age validation
        const age = getAge(birthday);
        if (age < 6) {
            setMessage('Age must be 6 or older');
            formIsValid = false;
        }

        // Contact number validation
        const contactRegex = /^\+63 9\d{9}$/;
        if (!contactRegex.test(contactNumber)) {
            setMessage('Invalid contact number format. It should be +63 9*********');
            formIsValid = false;
        }

        // Address validation (basic)
        if (address.length < 10) {
            setMessage('Address should be more precise and at least 10 characters long');
            formIsValid = false;
        }

        // Role-specific validations
        if (role === 'student') {
            if (!studentNumber) {
                setMessage('Student number is required for students');
                formIsValid = false;
            }
            if (!grade) {
                setMessage('Grade is required for students');
                formIsValid = false;
            }
        } else if (!employeeNumber) {
            setMessage('Employee number is required for teachers and admins');
            formIsValid = false;
        }

        return formIsValid;
    };

    const getAge = (dateString) => {
        const today = new Date();
        const birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleRoleChange = (e) => {
        setRole(e.target.value);
    };

    return (
        <div className="register-page d-flex vh-100">
            <Sidebar />
            <div className="flex-grow-1">
                
                <div className="container mt-5">
                    <div className="card shadow">
                        <h1 className="card-header text-center">USER MANAGEMENT</h1>
                        <h4>ADD ACCOUNT</h4>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label htmlFor="username">Username</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="username"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                placeholder="Enter username"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="password">Password</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter password"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="confirmPassword">Confirm Password</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="confirmPassword"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Confirm password"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="role">Role</label>
                                            <select
                                                className="form-control"
                                                id="role"
                                                value={role}
                                                onChange={handleRoleChange}
                                            >
                                                <option value="student">Student</option>
                                                <option value="teacher">Teacher</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                        {role === 'student' && (
                                            <>
                                                <div className="form-group">
                                                    <label htmlFor="studentNumber">Student Number</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="studentNumber"
                                                        value={studentNumber}
                                                        onChange={(e) => setStudentNumber(e.target.value)}
                                                        placeholder="Enter student number"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="grade">Grade</label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        id="grade"
                                                        value={grade}
                                                        onChange={(e) => setGrade(e.target.value)}
                                                        placeholder="Enter grade"
                                                    />
                                                </div>
                                            </>
                                        )}
                                        {role !== 'student' && (
                                            <div className="form-group">
                                                <label htmlFor="employeeNumber">Employee Number</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="employeeNumber"
                                                    value={employeeNumber}
                                                    onChange={(e) => setEmployeeNumber(e.target.value)}
                                                    placeholder="Enter employee number"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label htmlFor="email">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                id="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Enter email"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="firstName">First Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="firstName"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                placeholder="Enter first name"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="middleName">Middle Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="middleName"
                                                value={middleName}
                                                onChange={(e) => setMiddleName(e.target.value)}
                                                placeholder="Enter middle name"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="lastName">Last Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="lastName"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                placeholder="Enter last name"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="birthday">Birthday</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                id="birthday"
                                                value={birthday}
                                                onChange={(e) => setBirthday(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label htmlFor="address">Address</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="address"
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                placeholder="Enter address"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="contactNumber">Contact Number</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="contactNumber"
                                                value={contactNumber}
                                                onChange={(e) => setContactNumber(e.target.value)}
                                                placeholder="Enter contact number"
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary btn-block">Register</button>
                                        {message && <div className="alert alert-info mt-3">{message}</div>}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;

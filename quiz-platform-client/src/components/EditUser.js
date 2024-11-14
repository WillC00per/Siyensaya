import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom'; // Import useParams
import 'bootstrap/dist/css/bootstrap.min.css';
import './Register.css';
import AdminNavbar from './AdminNavbar';
import Sidebar from './Sidebar';

const EditUser = () => {
    const { username } = useParams(); // Get the username from URL parameters
    const [usernames, setUsernames] = useState([]);
    const [selectedUsername, setSelectedUsername] = useState(username || ''); // Initialize with URL parameter
    const [userData, setUserData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        studentNumber: '',
        email: '',
        firstName: '',
        middleName: '',
        lastName: '',
        birthday: '',
        address: '',
        contactNumber: ''
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}';

    

    useEffect(() => {
        const fetchUsernames = async () => {
            try {
                const response = await axios.get('https://siyensaya.onrender.com//usernames');
                if (Array.isArray(response.data)) {
                    setUsernames(response.data);
                } else {
                    setMessage('Unexpected response format');
                }
            } catch (error) {
                setMessage(`Error fetching usernames: ${error.response ? error.response.data : error.message}`);
            }
        };
        fetchUsernames();
    }, []);

    useEffect(() => {
        if (selectedUsername) {
            const fetchUserData = async () => {
                try {
                    const response = await axios.get(`https://siyensaya.onrender.com/users/${selectedUsername}`);
                    setUserData({
                        ...response.data,
                        confirmPassword: response.data.password // Pre-fill confirmPassword for validation
                    });
                } catch (error) {
                    setMessage(`Error fetching user data: ${error.response ? error.response.data : error.message}`);
                }
            };
            fetchUserData();
        }
    }, [selectedUsername]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        try {
            await axios.put(`https://siyensaya.onrender.com/users/${selectedUsername}`, userData);
            setMessage('User updated successfully');
        } catch (error) {
            setMessage(`Error during update: ${error.response ? error.response.data : error.message}`);
        }
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

    const validateForm = () => {
        let formIsValid = true;

        if (userData.password !== userData.confirmPassword) {
            setMessage('Passwords do not match');
            formIsValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            setMessage('Invalid email format');
            formIsValid = false;
        }

        const age = getAge(userData.birthday);
        if (age < 6) {
            setMessage('Age must be 6 or older');
            formIsValid = false;
        }

        const contactRegex = /^\+63 9\d{9}$/;
        if (!contactRegex.test(userData.contactNumber)) {
            setMessage('Invalid contact number format. It should be +63 9*********');
            formIsValid = false;
        }

        if (userData.address.length < 10) {
            setMessage('Address should be more precise and at least 10 characters long');
            formIsValid = false;
        }

        return formIsValid;
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setUserData((prevData) => ({ ...prevData, [id]: value }));
    };

    return (
        <div className="register-page d-flex vh-100">
            <Sidebar />
            <div className="flex-grow-1">
                <AdminNavbar />
                <div className="container mt-5">
                    <div className="card shadow">
                        <h1 className="card-header text-center">USER MANAGEMENT</h1>
                        <h4>EDIT ACCOUNT</h4>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="selectedUsername">Select Username</label>
                                    <select
                                        className="form-control"
                                        id="selectedUsername"
                                        value={selectedUsername}
                                        onChange={(e) => setSelectedUsername(e.target.value)}
                                    >
                                        <option value="">Select a username</option>
                                        {usernames.map((username) => (
                                            <option key={username} value={username}>
                                                {username}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {selectedUsername && (
                                    <>
                                        <div className="row">
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="username">Username</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="username"
                                                        value={userData.username}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter username"
                                                        disabled
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="password">Password</label>
                                                    <input
                                                        type="password"
                                                        className="form-control"
                                                        id="password"
                                                        value={userData.password}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter password"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                                    <input
                                                        type="password"
                                                        className="form-control"
                                                        id="confirmPassword"
                                                        value={userData.confirmPassword}
                                                        onChange={handleInputChange}
                                                        placeholder="Confirm password"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="role">Role</label>
                                                    <select
                                                        className="form-control"
                                                        id="role"
                                                        value={userData.role}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="student">Student</option>
                                                        <option value="teacher">Teacher</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="studentNumber">Student Number</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="studentNumber"
                                                        value={userData.studentNumber}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter student number"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="email">Email</label>
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        id="email"
                                                        value={userData.email}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter email"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="firstName">First Name</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="firstName"
                                                        value={userData.firstName}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter first name"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="middleName">Middle Name</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="middleName"
                                                        value={userData.middleName}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter middle name"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="lastName">Last Name</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="lastName"
                                                        value={userData.lastName}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter last name"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="birthday">Birthday</label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        id="birthday"
                                                        value={userData.birthday}
                                                        onChange={handleInputChange}
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
                                                        value={userData.address}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter address"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="contactNumber">Contact Number</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="contactNumber"
                                                        value={userData.contactNumber}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter contact number"
                                                    />
                                                </div>
                                                <button type="submit" className="btn btn-primary btn-block">Update</button>
                                                {message && <div className="alert alert-info mt-3">{message}</div>}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditUser;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Modal } from 'react-bootstrap';
import AdminNavbar from './AdminNavbar';
import Sidebar from './Sidebar';
import './UserManagement.css'; // Import CSS file for styling

const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}`;

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [message, setMessage] = useState('');
    const [showMessage, setShowMessage] = useState(false); // State to manage alert visibility
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10); // Change this value as needed
    const [showModal, setShowModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isBulkDelete, setIsBulkDelete] = useState(false);
    const navigate = useNavigate();

    

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/users`);

                setUsers(response.data); // Assuming response.data is an array of users
            } catch (error) {
                setMessage(`Error fetching users: ${error.response ? error.response.data.message : error.message}`);
                setShowMessage(true); // Show the alert message
            }
        };
        fetchUsers();
    }, []);

 // Inside UserManagement.js
const handleEdit = (username) => {
    navigate(`/edit-user/${username}`);
};


    const handleShowModal = (user, bulk = false) => {
        setIsBulkDelete(bulk);
        setUserToDelete(user);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setUserToDelete(null);
        setShowModal(false);
    };

    const handleConfirmDelete = async () => {
        if (isBulkDelete && selectedUsers.length > 0) {
            try {
               await Promise.all(selectedUsers.map(username => axios.delete(`${BASE_URL}/users/${username}`)));

                setUsers(users.filter(user => !selectedUsers.includes(user.username)));
                setSelectedUsers([]);
                setMessage('Selected users removed successfully');
                setShowMessage(true); // Show the alert message
            } catch (error) {
                setMessage(`Error during bulk removal: ${error.response ? error.response.data : error.message}`);
                setShowMessage(true); // Show the alert message
            } finally {
                handleCloseModal();
            }
        } else if (userToDelete) {
            try {
                await axios.delete(`${BASE_URL}/users/${userToDelete.username}`);

                setUsers(users.filter(user => user.username !== userToDelete.username));
                setMessage('User removed successfully');
                setShowMessage(true); // Show the alert message
            } catch (error) {
                setMessage(`Error during removal: ${error.response ? error.response.data : error.message}`);
                setShowMessage(true); // Show the alert message
            } finally {
                handleCloseModal();
            }
        }
    };

    const handleBulkRemove = () => {
        handleShowModal(null, true);
    };

    const handleCreate = () => {
        navigate('/register');
    };

    const handleCheckboxChange = (username) => {
        setSelectedUsers(prevSelected =>
            prevSelected.includes(username)
                ? prevSelected.filter(user => user !== username)
                : [...prevSelected, username]
        );
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedUsers(users.map(user => user.username));
        } else {
            setSelectedUsers([]);
        }
    };

    // Calculate current users to display based on pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Generate page numbers
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(users.length / usersPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="user-management-page d-flex">
            <Sidebar />
            <div className="flex-grow-1">
                
                <div className="container mt-4">
                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            <div className="card shadow">
                                <h1 className="card-header text-center">USER MANAGEMENT</h1>
                                <div className="card-body">
                                    {showMessage && (
                                        <Alert variant="info" onClose={() => setShowMessage(false)} dismissible>
                                            {message}
                                        </Alert>
                                    )}
                                    <div className="d-flex justify-content-between mb-3">
                                        <div className="action-buttons">
                                            <Button variant="success" className="mr-2 custom-button" onClick={handleCreate}>
  Create New Account
</Button>

                                            {selectedUsers.length > 0 && (
                                                <Button variant="danger" className="ml-2" onClick={handleBulkRemove}>Delete Selected</Button>
                                            )}
                                        </div>
                                        <div className="pagination justify-content-center">
                                            <ul className="pagination">
                                                {pageNumbers.map(number => (
                                                    <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                                                        <Button variant="link" className="page-link" onClick={() => paginate(number)}>
                                                            {number}
                                                        </Button>
                                                    </li>
                                                ))}
                                            </ul>
                                            <ul className="pagination">
                                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                    <Button variant="link" className="page-link" onClick={() => paginate(1)}>First</Button>
                                                </li>
                                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                    <Button variant="link" className="page-link" onClick={() => paginate(currentPage - 1)}>Previous</Button>
                                                </li>
                                                <li className={`page-item ${currentPage === Math.ceil(users.length / usersPerPage) ? 'disabled' : ''}`}>
                                                    <Button variant="link" className="page-link" onClick={() => paginate(currentPage + 1)}>Next</Button>
                                                </li>
                                                <li className={`page-item ${currentPage === Math.ceil(users.length / usersPerPage) ? 'disabled' : ''}`}>
                                                    <Button variant="link" className="page-link" onClick={() => paginate(Math.ceil(users.length / usersPerPage))}>Last</Button>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <table className="table user-table">
                                        <thead>
                                            <tr>
                                                <th>
                                                    <input
                                                        type="checkbox"
                                                        onChange={handleSelectAll}
                                                        checked={selectedUsers.length === users.length && users.length > 0}
                                                    />
                                                </th>
                                                <th>Name</th>
                                                <th>Role</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentUsers.map((user) => (
                                                <tr key={user.username}>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedUsers.includes(user.username)}
                                                            onChange={() => handleCheckboxChange(user.username)}
                                                        />
                                                    </td>
                                                    <td>{`${user.firstName} ${user.middleName} ${user.lastName}`}</td>
                                                    <td className="role-cell">
                                                        <div className={`role-box ${user.role}`}>
                                                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <Button variant="primary" onClick={() => handleEdit(user.username)}>EDIT</Button>
                                                      <Button
    variant="primary"
    className="ml-2"
    style={{ 
        borderRadius: '15px', 
        backgroundColor: 'blue', 
        borderColor: 'blue', 
        marginTop: '3px' 
    }}
    onClick={() => handleShowModal(user)}
>
    Archive
</Button>



                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="pagination justify-content-center mt-3">
                                        <ul className="pagination">
                                            {pageNumbers.map(number => (
                                                <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                                                    <Button variant="link" className="page-link" onClick={() => paginate(number)}>
                                                        {number}
                                                    </Button>
                                                </li>
                                            ))}
                                        </ul>
                                        <ul className="pagination">
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <Button variant="link" className="page-link" onClick={() => paginate(1)}>First</Button>
                                            </li>
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <Button variant="link" className="page-link" onClick={() => paginate(currentPage - 1)}>Previous</Button>
                                            </li>
                                            <li className={`page-item ${currentPage === Math.ceil(users.length / usersPerPage) ? 'disabled' : ''}`}>
                                                <Button variant="link" className="page-link" onClick={() => paginate(currentPage + 1)}>Next</Button>
                                            </li>
                                            <li className={`page-item ${currentPage === Math.ceil(users.length / usersPerPage) ? 'disabled' : ''}`}>
                                                <Button variant="link" className="page-link" onClick={() => paginate(Math.ceil(users.length / usersPerPage))}>Last</Button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal show={showModal} onHide={handleCloseModal} backdrop={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {isBulkDelete ? (
                        <div>
                            <p>Are you sure you want to delete the following users?</p>
                            <ul>
                                {selectedUsers.map(username => {
                                    const user = users.find(u => u.username === username);
                                    return user ? (
                                        <li key={username}>{`${user.firstName} ${user.middleName} ${user.lastName} (${username})`}</li>
                                    ) : null;
                                })}
                            </ul>
                        </div>
                    ) : (
                        userToDelete && (
                            <div>
                                <p>Are you sure you want to delete the following user?</p>
                                <p><strong>Username:</strong> {userToDelete.username}</p>
                                <p><strong>Name:</strong> {`${userToDelete.firstName} ${userToDelete.middleName} ${userToDelete.lastName}`}</p>
                                <p><strong>Email:</strong> {userToDelete.email}</p>
                                <p><strong>Role:</strong> {userToDelete.role}</p>
                            </div>
                        )
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                    <Button variant="danger" onClick={handleConfirmDelete}>Archive</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UserManagement;

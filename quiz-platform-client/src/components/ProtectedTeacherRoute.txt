import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedTeacherRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'teacher') {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedTeacherRoute;

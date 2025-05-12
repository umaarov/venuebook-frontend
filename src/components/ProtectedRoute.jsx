import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, status } = useSelector((state) => state.auth);
    const location = useLocation();

    // If still checking auth status (e.g., initial profile fetch), show loading or null
    // This prevents redirecting to login too early if a token exists and profile is being fetched
    if (status === 'loading' && !isAuthenticated) {
        // You could return a loading spinner here if preferred
        return <p>Loading authentication status...</p>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
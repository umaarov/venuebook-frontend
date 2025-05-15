import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { selectIsAuthenticated, selectUserRole } from '../features/auth/authSlice';
import { useGetAuthUserQuery } from '../features/auth/authApi'; // To ensure user data is fresh
import LoadingSpinner from './LoadingSpinner';


const PrivateRoute = ({ allowedRoles }) => {
    const location = useLocation();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const userRole = useAppSelector(selectUserRole);

    // Trigger user fetch if not already loaded or to validate token
    // skip fetching if already authenticated and user role is present, unless you always want to validate
    const { isLoading: isLoadingUser, data: authUserData, error: authUserError } = useGetAuthUserQuery(undefined, {
        skip: !!(isAuthenticated && userRole), // Skip if we think we are good
    });


    if (isLoadingUser && !isAuthenticated) { // Show loading only if initial auth check is happening
        return <LoadingSpinner message="Authenticating..." />;
    }

    // If after loading, still not authenticated (e.g. token expired and logout dispatched by getAuthUser)
    if (!isAuthenticated && !isLoadingUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If authenticated but role check is needed
    if (isAuthenticated) {
        if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
            // User is authenticated but does not have the required role
            // Redirect to a 'Forbidden' page or home page
            alert("You do not have permission to access this page."); // Basic feedback
            return <Navigate to="/" state={{ from: location }} replace />;
        }
        // If role check passes or no specific roles required beyond authentication
        return <Outlet />;
    }

    // Default fallback if none of the above hit (should ideally be covered)
    // This might happen if isAuthenticated is false but isLoadingUser is also false (e.g. initial state before any check)
    return <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;
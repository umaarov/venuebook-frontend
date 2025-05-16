import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { selectIsAuthenticated, selectUserRole } from '../features/auth/authSlice';
import { useGetAuthUserProfileQuery } from '../features/auth/authApi'; // Updated hook
import LoadingSpinner from './LoadingSpinner';


const PrivateRoute = ({ allowedRoles }) => {
    const location = useLocation();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const userRole = useAppSelector(selectUserRole); // Role from Redux state

    // Use the renamed hook for fetching profile to validate token/session
    const { isLoading: isLoadingUser, isError: isAuthError } = useGetAuthUserProfileQuery(undefined, {
        skip: isAuthenticated && !!userRole, // Skip if already authenticated and role is known
                                             // Consider not skipping if strict session validation on every private route access is desired
    });


    if (isLoadingUser && !isAuthenticated) {
        return <LoadingSpinner message="Authenticating..." />;
    }

    // After loading, if still not authenticated (e.g., token expired and logout dispatched by getAuthUserProfileQuery)
    // or if there was an auth error (isAuthError is true)
    if ((!isAuthenticated && !isLoadingUser) || (isAuthError && !isLoadingUser)) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If authenticated but role check is needed
    if (isAuthenticated && userRole) { // Ensure userRole is available
        if (allowedRoles && !allowedRoles.includes(userRole)) {
            alert("You do not have permission to access this page.");
            return <Navigate to="/" state={{ from: location }} replace />;
        }
        return <Outlet />;
    }

    // Fallback if isAuthenticated is true but userRole is somehow not yet populated,
    // or if still loading user profile to determine role.
    // This state should ideally resolve quickly.
    if (isAuthenticated && isLoadingUser) {
        return <LoadingSpinner message="Verifying access..." />;
    }

    // Default fallback if none of the above conditions are met (e.g. initial load, not yet authenticated)
    return <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;
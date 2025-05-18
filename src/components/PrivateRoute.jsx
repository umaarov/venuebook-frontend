import React from 'react';
import {Link, Navigate, Outlet, useLocation} from 'react-router-dom';
import {useAppSelector} from '../app/hooks';
import {selectIsAuthenticated, selectUserRole} from '../features/auth/authSlice';
import {useGetAuthUserProfileQuery} from '../features/auth/authApi';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const PrivateRoute = ({allowedRoles}) => {
    const location = useLocation();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const userRole = useAppSelector(selectUserRole);

    const {
        isLoading: isLoadingUser,
        isError: isAuthError,
        error: authErrorData
    } = useGetAuthUserProfileQuery(undefined, {
        skip: isAuthenticated && !!userRole,
    });

    if (isLoadingUser) {
        return <LoadingSpinner message="Authenticating..."/>;
    }

    if (!isAuthenticated || isAuthError) {
        // dispatch(logoutUser());
        return <Navigate to="/login" state={{from: location}} replace/>;
    }

    if (!userRole) {
        return <LoadingSpinner message="Verifying access..."/>;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        console.warn(`Access denied for role "${userRole}" to route requiring roles: ${allowedRoles.join(', ')}`);
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <ErrorMessage message="Access Denied"
                              details={{permission: "You do not have permission to access this page."}}/>
                <Link to="/"
                      className="mt-4 inline-block bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded">
                    Go to Homepage
                </Link>
            </div>
        );
        // return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }

    return <Outlet/>;
};

export default PrivateRoute;
import React from 'react';
import {Navigate, Outlet, useLocation} from 'react-router-dom';
import {useAppSelector} from '../app/hooks';
import {selectIsAuthenticated, selectUserRole} from '../features/auth/authSlice';
import {useGetAuthUserProfileQuery} from '../features/auth/authApi';
import LoadingSpinner from './LoadingSpinner';


const PrivateRoute = ({allowedRoles}) => {
    const location = useLocation();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const userRole = useAppSelector(selectUserRole);

    const {isLoading: isLoadingUser, isError: isAuthError} = useGetAuthUserProfileQuery(undefined, {
        skip: isAuthenticated && !!userRole,
    });


    if (isLoadingUser && !isAuthenticated) {
        return <LoadingSpinner message="Authenticating..."/>;
    }

    if ((!isAuthenticated && !isLoadingUser) || (isAuthError && !isLoadingUser)) {
        return <Navigate to="/login" state={{from: location}} replace/>;
    }

    if (isAuthenticated && userRole) {
        if (allowedRoles && !allowedRoles.includes(userRole)) {
            alert("You do not have permission to access this page.");
            return <Navigate to="/" state={{from: location}} replace/>;
        }
        return <Outlet/>;
    }

    if (isAuthenticated && isLoadingUser) {
        return <LoadingSpinner message="Verifying access..."/>;
    }

    return <Navigate to="/login" state={{from: location}} replace/>;
};

export default PrivateRoute;
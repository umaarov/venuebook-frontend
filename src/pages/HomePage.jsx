import React from 'react';
import { useSelector } from 'react-redux';

const HomePage = () => {
    const { user, isAuthenticated } = useSelector(state => state.auth);
    return (
        <div>
            <h1>Wedding Hall Reservation System</h1>
            {isAuthenticated && user ? (
                <p>Welcome back, {user.name}!</p>
            ) : (
                <p>Please login or register to manage reservations.</p>
            )}
        </div>
    );
};
export default HomePage;
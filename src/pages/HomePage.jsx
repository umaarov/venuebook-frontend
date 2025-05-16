import React from 'react';
import { Link }from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { selectCurrentUser } from '../features/auth/authSlice';

const HomePage = () => {
    const user = useAppSelector(selectCurrentUser);
    return (
        <div className="container">
            <h1>Welcome to the Wedding Hall Booking System</h1>
            <p>
                Find and book the perfect venue for your special day.
            </p>
            {user ? (
                <p>Hello, {user.name}! What would you like to do today?</p>
            ) : (
                <p>Please <Link to="/login">login</Link> or <Link to="/register">register</Link> to make a booking or manage your halls.</p>
            )}
            <div>
                <Link to="/wedding-halls"><button>Browse Wedding Halls</button></Link>
            </div>
        </div>
    );
};

export default HomePage;

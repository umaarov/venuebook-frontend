// File: src/pages/RegisterPage.jsx
// Description: Registration page component.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../features/auth/authApi';
import { useAppSelector } from '../app/hooks';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState(''); // Added username state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const navigate = useNavigate();
    const [register, { isLoading, error, isSuccess }] = useRegisterMutation();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/profile'); // Redirect if already logged in
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== passwordConfirmation) {
            alert("Passwords don't match!"); // Replace with better UI feedback
            return;
        }
        try {
            // Include username in the registration payload
            await register({ name, username, email, password, password_confirmation: passwordConfirmation }).unwrap();
            // Navigation is handled by useEffect or onQueryStarted in authApi
        } catch (err) {
            console.error('Failed to register:', err);
        }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="container">
            <h2>Register</h2>
            {error && <ErrorMessage message={error.data?.message || 'Registration failed. Please check your input.'} details={error.data?.errors} />}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div> {/* Added username field */}
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength="8"
                    />
                </div>
                <div>
                    <label htmlFor="passwordConfirmation">Confirm Password:</label>
                    <input
                        type="password"
                        id="passwordConfirmation"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Registering...' : 'Register'}
                </button>
            </form>
        </div>
    );
};

export default RegisterPage;
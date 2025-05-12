import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginUser, resetAuthStatus } from '../../features/auth/authSlice';

const LoginForm = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { status, error, isAuthenticated } = useSelector((state) => state.auth);

    const from = location.state?.from?.pathname || "/profile";

    useEffect(() => {
        dispatch(resetAuthStatus()); // Clear previous errors on mount
    }, [dispatch]);

    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(loginUser(formData));
    };

    const getErrorMessage = (field) => {
        if (error && typeof error === 'object' && error[field]) {
            return error[field].join(', ');
        }
        return null;
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
            {(status === 'failed' && typeof error === 'string') && <p style={{ color: 'red' }}>Error: {error}</p>}

            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            {getErrorMessage('email') && <small style={{color: 'red'}}>{getErrorMessage('email')}</small>}

            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            {getErrorMessage('password') && <small style={{color: 'red'}}>{getErrorMessage('password')}</small>}

            <button type="submit" disabled={status === 'loading'}>
                {status === 'loading' ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
};
export default LoginForm;
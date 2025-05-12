import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { registerUser, resetAuthStatus, resetRegistrationStatus } from '../../features/auth/authSlice';

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        name: '', surname: '', username: '', email: '', phone: '', password: '', password_confirmation: '',
    });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { registrationStatus, error } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(resetAuthStatus()); // Clear general auth errors
        dispatch(resetRegistrationStatus()); // Clear previous registration status
    }, [dispatch]);

    useEffect(() => {
        if (registrationStatus === 'succeeded') {
            alert('Registration successful! Please log in.');
            dispatch(resetRegistrationStatus()); // Reset for next time
            navigate('/login');
        }
    }, [registrationStatus, navigate, dispatch]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.password_confirmation) {
            alert("Passwords do not match!");
            return;
        }
        dispatch(registerUser(formData));
    };

    // Function to extract specific error messages
    const getErrorMessage = (field) => {
        if (error && typeof error === 'object' && error[field]) {
            return error[field].join(', ');
        }
        return null;
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
            {(registrationStatus === 'failed' && typeof error === 'string') && <p style={{ color: 'red' }}>Error: {error}</p>}

            <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
            {getErrorMessage('name') && <small style={{color: 'red'}}>{getErrorMessage('name')}</small>}

            <input type="text" name="surname" placeholder="Surname" value={formData.surname} onChange={handleChange} required />
            {getErrorMessage('surname') && <small style={{color: 'red'}}>{getErrorMessage('surname')}</small>}

            <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
            {getErrorMessage('username') && <small style={{color: 'red'}}>{getErrorMessage('username')}</small>}

            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            {getErrorMessage('email') && <small style={{color: 'red'}}>{getErrorMessage('email')}</small>}

            <input type="tel" name="phone" placeholder="Phone (e.g., +1234567890)" value={formData.phone} onChange={handleChange} required />
            {getErrorMessage('phone') && <small style={{color: 'red'}}>{getErrorMessage('phone')}</small>}

            <input type="password" name="password" placeholder="Password (min 8 chars)" value={formData.password} onChange={handleChange} required minLength="8" />
            {getErrorMessage('password') && <small style={{color: 'red'}}>{getErrorMessage('password')}</small>}

            <input type="password" name="password_confirmation" placeholder="Confirm Password" value={formData.password_confirmation} onChange={handleChange} required minLength="8" />

            <button type="submit" disabled={registrationStatus === 'loading'}>
                {registrationStatus === 'loading' ? 'Registering...' : 'Register'}
            </button>
        </form>
    );
};
export default RegisterForm;
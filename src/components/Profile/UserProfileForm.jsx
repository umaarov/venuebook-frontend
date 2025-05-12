import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserProfile, updateUserProfile, deleteUserProfile, resetAuthStatus } from '../../features/auth/authSlice';

const UserProfileForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, status, error } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        name: '', surname: '', username: '', email: '', phone: '',
        password: '', password_confirmation: '',
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        dispatch(resetAuthStatus()); // Clear errors on mount
        if (!user && status !== 'loading') {
            dispatch(fetchUserProfile());
        }
    }, [dispatch, user, status]);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                surname: user.surname || '',
                username: user.username || '',
                email: user.email || '',
                phone: user.phone || '',
                password: '',
                password_confirmation: '',
            });
        }
    }, [user]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        const { password, password_confirmation, ...updateData } = formData;
        let payload = { ...updateData };

        if (password) {
            if (password !== password_confirmation) {
                alert("New passwords do not match!");
                return;
            }
            payload.password = password;
            payload.password_confirmation = password_confirmation;
        }

        try {
            await dispatch(updateUserProfile(payload)).unwrap();
            alert('Profile updated successfully!');
            setIsEditing(false);
            dispatch(fetchUserProfile()); // Re-fetch to ensure data is fresh
        } catch (updateError) {
            // Error is handled by the slice and displayed via 'error' state
            console.error("Update failed:", updateError);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                await dispatch(deleteUserProfile()).unwrap();
                alert('Account deleted successfully.');
                navigate('/login');
            } catch (deleteError) {
                console.error("Deletion failed:", deleteError);
            }
        }
    };

    const getErrorMessage = (field) => {
        if (error && typeof error === 'object' && error[field]) {
            return error[field].join(', ');
        }
        return null;
    };

    if (status === 'loading' && !user) return <p>Loading profile...</p>;
    if (!user) return <p>Could not load profile. Please try logging in again.</p>;

    return (
        <div style={{ maxWidth: '500px' }}>
            {(status === 'failed' && typeof error === 'string') && <p style={{ color: 'red' }}>Error: {error}</p>}
            {!isEditing ? (
                <div>
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Surname:</strong> {user.surname}</p>
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
                    <p><strong>Role:</strong> {user.role}</p>
                    <button onClick={() => setIsEditing(true)}>Edit Profile</button>
                </div>
            ) : (
                <form onSubmit={handleUpdateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label>Name: <input type="text" name="name" value={formData.name} onChange={handleChange} required /></label>
                    {getErrorMessage('name') && <small style={{color: 'red'}}>{getErrorMessage('name')}</small>}

                    <label>Surname: <input type="text" name="surname" value={formData.surname} onChange={handleChange} required /></label>
                    {getErrorMessage('surname') && <small style={{color: 'red'}}>{getErrorMessage('surname')}</small>}

                    <label>Username: <input type="text" name="username" value={formData.username} onChange={handleChange} required /></label>
                    {getErrorMessage('username') && <small style={{color: 'red'}}>{getErrorMessage('username')}</small>}

                    <label>Email: <input type="email" name="email" value={formData.email} onChange={handleChange} required /></label>
                    {getErrorMessage('email') && <small style={{color: 'red'}}>{getErrorMessage('email')}</small>}

                    <label>Phone: <input type="tel" name="phone" value={formData.phone} onChange={handleChange} /></label>
                    {getErrorMessage('phone') && <small style={{color: 'red'}}>{getErrorMessage('phone')}</small>}

                    <p><i>Leave password fields blank if you don't want to change it.</i></p>
                    <label>New Password: <input type="password" name="password" placeholder="New Password (min 8 chars)" value={formData.password} onChange={handleChange} minLength={formData.password ? 8 : undefined} /></label>
                    {getErrorMessage('password') && <small style={{color: 'red'}}>{getErrorMessage('password')}</small>}

                    <label>Confirm New Password: <input type="password" name="password_confirmation" placeholder="Confirm New Password" value={formData.password_confirmation} onChange={handleChange} /></label>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Saving...' : 'Save Changes'}</button>
                        <button type="button" onClick={() => setIsEditing(false)} disabled={status === 'loading'}>Cancel</button>
                    </div>
                </form>
            )}
            {user.role === 'user' && ( // As per Swagger: Delete only for 'user' role
                <button onClick={handleDelete} disabled={status === 'loading'} style={{ marginTop: '20px', backgroundColor: 'darkred', color: 'white' }}>
                    {status === 'loading' ? 'Deleting...' : 'Delete My Account'}
                </button>
            )}
        </div>
    );
};
export default UserProfileForm;
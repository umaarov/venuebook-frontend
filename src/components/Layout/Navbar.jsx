import React from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';
import {logoutUser} from '../../features/auth/authSlice';

const Navbar = () => {
    const {isAuthenticated, user, status} = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            // Client state is cleared by the thunk even on API error, so navigation is fine
            navigate('/login');
        }
    };

    return (
        <nav style={{background: '#f0f0f0', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center'}}>
            <Link to="/">Home</Link>
            {isAuthenticated && user ? (
                <>
                    <Link to="/profile">Profile ({user.name})</Link>
                    <button onClick={handleLogout} disabled={status === 'loading'}>
                        {status === 'loading' ? 'Logging out...' : 'Logout'}
                    </button>
                </>
            ) : (
                <>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                </>
            )}
        </nav>
    );
};

export default Navbar;
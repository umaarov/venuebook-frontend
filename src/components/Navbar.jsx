import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { selectIsAuthenticated, selectCurrentUser, logoutUser } from '../features/auth/authSlice';
import { useLogoutMutation } from '../features/auth/authApi';

const Navbar = () => {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const currentUser = useAppSelector(selectCurrentUser);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [logoutApiCall] = useLogoutMutation();

    const handleLogout = async () => {
        try {
            await logoutApiCall().unwrap();
        } catch (error) {
            console.error('Logout failed on API call:', error);
            dispatch(logoutUser());
        }
        navigate('/login');
    };

    return (
        <nav>
            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/wedding-halls">Wedding Halls</Link></li>
                <li><Link to="/districts">Districts</Link></li>
                {isAuthenticated ? (
                    <>
                        <li><Link to="/profile">Profile ({currentUser?.name})</Link></li>
                        <li><Link to="/my-reservations">My Reservations</Link></li>

                        {currentUser?.role === 'owner' && (
                            <li><Link to="/owner/dashboard">Owner Dashboard</Link></li>
                        )}
                        {currentUser?.role === 'admin' && (
                            <li><Link to="/admin/dashboard">Admin Dashboard</Link></li>
                        )}
                        <li>
                            <button onClick={handleLogout} style={{background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '14px 16px', fontSize: 'inherit', fontFamily: 'inherit'}}>Logout</button>
                        </li>
                    </>
                ) : (
                    <>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/register">Register</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;

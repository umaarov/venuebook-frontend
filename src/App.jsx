import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile, forceLogout } from './features/auth/authSlice';
import Cookies from 'js-cookie';

import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Layout/Navbar';

function App() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user, token, status } = useSelector((state) => state.auth);

    useEffect(() => {
        const authToken = Cookies.get('authToken');
        if (authToken && !user && status !== 'loading') { // If token exists, but no user in state and not already loading
            dispatch(fetchUserProfile())
                .unwrap()
                .catch(() => {
                    // This catch is for unwrap. Actual error handling for 401 is in the thunk.
                    // If fetchUserProfile itself determines the token is invalid, it dispatches forceLogout.
                });
        } else if (!authToken && isAuthenticated) {
            // If Redux state says authenticated but no cookie, force logout to sync state
            dispatch(forceLogout());
            if (location.pathname !== '/login' && location.pathname !== '/register') {
                navigate('/login');
            }
        }
    }, [dispatch, token, user, isAuthenticated, status, navigate, location.pathname]);


    return (
        <>
            <Navbar />
            <div style={{ padding: '20px' }}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/register" element={isAuthenticated ? <HomePage /> : <RegisterPage />} />
                    <Route path="/login" element={isAuthenticated ? <HomePage /> : <LoginPage />} />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        }
                    />
                    {/* Add other routes here */}
                </Routes>
            </div>
        </>
    );
}

export default App;
import { createSlice } from '@reduxjs/toolkit';
import { setToken as setCookieToken, removeToken as removeCookieToken, setUserData as setCookieUser, removeUserData as removeCookieUser, getToken, getUserData } from '../../services/cookieService';

const initialState = {
    user: getUserData() || null, // User object { id, name, email, role, etc. }
    token: getToken() || null,
    isAuthenticated: !!getToken(),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            setCookieToken(action.payload.token);
            setCookieUser(action.payload.user);
        },
        logoutUser: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            removeCookieToken();
            removeCookieUser();
        },
        updateUserInState: (state, action) => {
            state.user = { ...state.user, ...action.payload }; // Merges new data with existing user data
            setCookieUser(state.user); // Update cookie with the new complete user object
        }
    },
});

export const { setUser, logoutUser, updateUserInState } = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserRole = (state) => state.auth.user?.role;
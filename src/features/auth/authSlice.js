import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import {
    registerUserApi,
    loginUserApi,
    logoutUserApi,
    getUserProfileApi,
    updateUserProfileApi,
    deleteUserProfileApi,
} from '../../services/api';

const initialState = {
    user: null,
    token: Cookies.get('authToken') || null,
    isAuthenticated: !!Cookies.get('authToken'), // True if token exists
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    registrationStatus: 'idle', // For specific feedback on registration
};

// Helper to handle API responses for setting user and token
const handleAuthSuccess = (state, action) => {
    const { user, token } = action.payload.data;
    state.user = user;
    state.token = token;
    state.isAuthenticated = true;
    state.status = 'succeeded';
    state.error = null;
    Cookies.set('authToken', token, { expires: 7, secure: import.meta.env.PROD, path: '/' }); // expires in 7 days
};

const handleAuthFailure = (state, action) => {
    state.status = 'failed';
    state.error = action.payload || 'An unknown error occurred';
    state.isAuthenticated = false;
    state.user = null;
    state.token = null;
    Cookies.remove('authToken', { path: '/' });
};

// Async Thunks
export const registerUser = createAsyncThunk('auth/registerUser', async (userData, { rejectWithValue }) => {
    try {
        const response = await registerUserApi(userData);
        if (response.data.success) {
            return response.data; // Contains { success: true, data: { user, token }, message }
        }
        return rejectWithValue(response.data.errors || response.data.message);
    } catch (error) {
        return rejectWithValue(error.response?.data?.errors || error.response?.data?.message || error.message);
    }
});

export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, { rejectWithValue }) => {
    try {
        const response = await loginUserApi(credentials);
        if (response.data.success) {
            return response.data;
        }
        return rejectWithValue(response.data.errors || response.data.message);
    } catch (error) {
        return rejectWithValue(error.response?.data?.errors || error.response?.data?.message || error.message);
    }
});

export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
    try {
        await logoutUserApi();
        Cookies.remove('authToken', { path: '/' });
        return null;
    } catch (error) {
        Cookies.remove('authToken', { path: '/' }); // Ensure client-side logout even if API fails
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const fetchUserProfile = createAsyncThunk('auth/fetchUserProfile', async (_, { rejectWithValue, dispatch }) => {
    try {
        const response = await getUserProfileApi();
        if (response.data.success) {
            return response.data.data; // The user object
        }
        return rejectWithValue(response.data.message);
    } catch (error) {
        if (error.response && error.response.status === 401) {
            dispatch(forceLogout()); // If unauthenticated, clear session
        }
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const updateUserProfile = createAsyncThunk('auth/updateUserProfile', async (userData, { rejectWithValue }) => {
    try {
        const response = await updateUserProfileApi(userData);
        if (response.data.success) {
            return response.data.data; // The updated user object
        }
        return rejectWithValue(response.data.errors || response.data.message);
    } catch (error) {
        return rejectWithValue(error.response?.data?.errors || error.response?.data?.message || error.message);
    }
});

export const deleteUserProfile = createAsyncThunk('auth/deleteUserProfile', async (_, { rejectWithValue }) => {
    try {
        const response = await deleteUserProfileApi();
        if (response.data.success) {
            Cookies.remove('authToken', { path: '/' });
            return null;
        }
        return rejectWithValue(response.data.message);
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        resetAuthStatus: (state) => {
            state.status = 'idle';
            state.error = null;
        },
        resetRegistrationStatus: (state) => {
            state.registrationStatus = 'idle';
        },
        forceLogout: (state) => { // Action to manually clear auth state
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.status = 'idle';
            state.error = null;
            Cookies.remove('authToken', { path: '/' });
        }
    },
    extraReducers: (builder) => {
        builder
            // Register
            .addCase(registerUser.pending, (state) => {
                state.registrationStatus = 'loading';
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                // Don't auto-login on register based on Swagger, user gets token and can login
                state.registrationStatus = 'succeeded';
                state.error = null;
                // action.payload.data.user and action.payload.data.token are available if needed
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.registrationStatus = 'failed';
                state.error = action.payload;
            })
            // Login
            .addCase(loginUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(loginUser.fulfilled, handleAuthSuccess)
            .addCase(loginUser.rejected, handleAuthFailure)
            // Logout
            .addCase(logoutUser.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.status = 'idle';
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state, action) => { // Still ensure logout on client
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.status = 'failed';
                state.error = action.payload || 'Logout failed';
            })
            // Fetch User Profile
            .addCase(fetchUserProfile.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.user = action.payload; // payload is the user object
                state.isAuthenticated = true; // Re-affirm
                state.status = 'succeeded';
                state.error = null;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                // Don't necessarily log out here unless it's a 401, handled in thunk
                state.status = 'failed';
                state.error = action.payload;
                // If token was invalid and forceLogout was dispatched, isAuthenticated will be false
            })
            // Update User Profile
            .addCase(updateUserProfile.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.user = action.payload; // payload is the updated user object
                state.status = 'succeeded';
                state.error = null;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Delete User Profile
            .addCase(deleteUserProfile.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteUserProfile.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.status = 'idle';
                state.error = null;
            })
            .addCase(deleteUserProfile.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { resetAuthStatus, resetRegistrationStatus, forceLogout } = authSlice.actions;
export default authSlice.reducer;
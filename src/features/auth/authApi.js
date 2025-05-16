import { api } from '../../services/apiCore';
import { setUser, logoutUser, updateUserInState } from './authSlice';

export const authApi = api.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: '/login',
                method: 'POST',
                body: credentials,
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data: responseData } = await queryFulfilled;
                    // Assuming backend returns { data: { user: {}, token: "..." }, message: "...", status: "..." }
                    if (responseData.data && responseData.data.user && responseData.data.token) {
                        dispatch(setUser({ user: responseData.data.user, token: responseData.data.token }));
                    } else {
                        console.error('Login response missing user or token in data field:', responseData);
                    }
                } catch (error) {
                    console.error('Login failed:', error);
                }
            },
            invalidatesTags: ['AuthUser'],
        }),
        register: builder.mutation({
            query: (userData) => ({
                url: '/register',
                method: 'POST',
                body: userData, // Should include name, username, email, password, password_confirmation
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data: responseData } = await queryFulfilled;
                    if (responseData.data && responseData.data.user && responseData.data.token) {
                        dispatch(setUser({ user: responseData.data.user, token: responseData.data.token }));
                    } else {
                        console.error('Register response missing user or token in data field:', responseData);
                    }
                } catch (error) {
                    console.error('Registration failed:', error);
                }
            },
            invalidatesTags: ['AuthUser'],
        }),
        logout: builder.mutation({
            query: () => ({
                url: '/logout',
                method: 'POST',
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(logoutUser());
                } catch (error) {
                    console.error('Logout failed:', error);
                    dispatch(logoutUser()); // Force logout on client
                }
            },
        }),
        getAuthUserProfile: builder.query({ // Renamed from getAuthUser to be more specific to /profile
            query: () => '/profile', // Route for fetching authenticated user's profile
            providesTags: ['AuthUser'],
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data: responseData } = await queryFulfilled;
                    // Backend returns { data: USER_OBJECT, message: ..., status: ... } for /profile
                    const tokenFromCookie = getToken();
                    if (responseData.data && tokenFromCookie) {
                        // If user is in responseData.data and token exists, update auth state
                        // This ensures user object in Redux is fresh
                        dispatch(setUser({ user: responseData.data, token: tokenFromCookie }));
                    } else if (!responseData.data && tokenFromCookie) {
                        // Token exists but no user data, implies token might be valid but profile fetch failed for other reasons
                        // Or, if the /profile endpoint itself is what sets the user after a page refresh with a valid cookie
                        console.warn('Auth user profile fetched, but no user data in response. Token still present.');
                    }
                } catch (error) {
                    console.error('Failed to fetch auth user profile, possibly invalid token:', error);
                    if (error.status === 401 || error.status === 403) {
                        dispatch(logoutUser());
                    }
                }
            },
        }),
        updateAuthUserProfile: builder.mutation({ // Renamed from updateAuthUser
            query: (userData) => ({
                url: '/profile', // Route for updating user's own profile
                method: 'PUT',
                body: userData,
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data: responseData } = await queryFulfilled;
                    // Expects backend to return the updated user object in responseData.data
                    if (responseData.data) {
                        dispatch(updateUserInState(responseData.data));
                    }
                } catch (error) {
                    console.error('Update user profile failed:', error);
                }
            },
            invalidatesTags: ['AuthUser'],
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useGetAuthUserProfileQuery, // Updated name
    useUpdateAuthUserProfileMutation, // Updated name
} = authApi;
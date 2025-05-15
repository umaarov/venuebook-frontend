import { api } from '../../services/apiCore';
import { setUser, logoutUser, updateUserInState } from './authSlice';
import {getToken} from "../../services/cookieService.js"; // Import actions

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
                    const { data } = await queryFulfilled;
                    // data should contain { user, token }
                    dispatch(setUser({ user: data.data.user, token: data.data.token }));
                } catch (error) {
                    console.error('Login failed:', error);
                    // Handle error display in component
                }
            },
            invalidatesTags: ['AuthUser'],
        }),
        register: builder.mutation({
            query: (userData) => ({
                url: '/register',
                method: 'POST',
                body: userData,
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // data should contain { user, token }
                    dispatch(setUser({ user: data.data.user, token: data.data.token }));
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
                    // Optionally, dispatch an action to clear other cached data
                    // dispatch(api.util.resetApiState()); // This resets all RTK Query state
                } catch (error) {
                    console.error('Logout failed:', error);
                    // Fallback: still log out on client if server fails but token is invalid
                    dispatch(logoutUser());
                }
            },
        }),
        getAuthUser: builder.query({
            query: () => '/profile',
            providesTags: ['AuthUser'],
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // If token is valid but user isn't in store (e.g. page refresh)
                    // We need to get the token from cookie and user from this call
                    // This part is tricky if token is already handled by setUser on login/register
                    // This is more for validating token and refreshing user data
                    const tokenFromCookie = getToken(); // from cookieService
                    if (data.data && tokenFromCookie) {
                        dispatch(setUser({ user: data.data, token: tokenFromCookie }));
                    }
                } catch (error) {
                    console.error('Failed to fetch auth user, possibly invalid token:', error);
                    if (error.status === 401 || error.status === 403) {
                        dispatch(logoutUser()); // Token is invalid or expired
                    }
                }
            },
        }),
        updateAuthUser: builder.mutation({
            query: (userData) => ({
                url: '/profile',
                method: 'PUT', // Laravel often uses PUT for full updates, PATCH for partial
                body: userData,
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(updateUserInState(data.data)); // Update user in authSlice
                } catch (error) {
                    console.error('Update user failed:', error);
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
    useGetAuthUserQuery,
    useUpdateAuthUserMutation,
} = authApi;
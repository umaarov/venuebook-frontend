import {api} from '../../services/apiCore';
import {setUser, logoutUser, updateUserInState} from './authSlice';
import {getToken} from "../../services/cookieService.js";

export const authApi = api.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: '/login',
                method: 'POST',
                body: credentials,
            }),
            async onQueryStarted(arg, {dispatch, queryFulfilled}) {
                try {
                    const {data: responseData} = await queryFulfilled;
                    if (responseData.data && responseData.data.user && responseData.data.token) {
                        dispatch(setUser({user: responseData.data.user, token: responseData.data.token}));
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
                body: userData,
            }),
            async onQueryStarted(arg, {dispatch, queryFulfilled}) {
                try {
                    const {data: responseData} = await queryFulfilled;
                    if (responseData.data && responseData.data.user && responseData.data.token) {
                        dispatch(setUser({user: responseData.data.user, token: responseData.data.token}));
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
            async onQueryStarted(arg, {dispatch, queryFulfilled}) {
                try {
                    await queryFulfilled;
                    dispatch(logoutUser());
                } catch (error) {
                    console.error('Logout failed:', error);
                    dispatch(logoutUser());
                }
            },
        }),
        getAuthUserProfile: builder.query({
            query: () => '/profile',
            providesTags: ['AuthUser'],
            async onQueryStarted(arg, {dispatch, queryFulfilled}) {
                try {
                    const {data: responseData} = await queryFulfilled;
                    const tokenFromCookie = getToken();
                    if (responseData.data && tokenFromCookie) {
                        dispatch(setUser({user: responseData.data, token: tokenFromCookie}));
                    } else if (!responseData.data && tokenFromCookie) {
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
        updateAuthUserProfile: builder.mutation({
            query: (userData) => ({
                url: '/profile',
                method: 'PUT',
                body: userData,
            }),
            async onQueryStarted(arg, {dispatch, queryFulfilled}) {
                try {
                    const {data: responseData} = await queryFulfilled;
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
    useGetAuthUserProfileQuery,
    useUpdateAuthUserProfileMutation,
} = authApi;
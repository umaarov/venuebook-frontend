import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getToken } from './cookieService';

// Define a base query function that injects the Authorization header
const baseQuery = fetchBaseQuery({
    baseUrl: '/api', // Vite proxy will handle this, or use full URL: 'http://localhost:8000/api'
    prepareHeaders: (headers, { getState }) => {
        const token = getToken(); // Or from Redux state: getState().auth.token
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        headers.set('Accept', 'application/json');
        return headers;
    },
});

// Define the main API slice
export const api = createApi({
    reducerPath: 'api',
    baseQuery: baseQuery,
    tagTypes: [
        'User', 'AuthUser', 'WeddingHall', 'District', 'Reservation',
        'OwnerWeddingHall', 'OwnerReservation', 'AdminUser',
        'AdminWeddingHall', 'AdminReservation'
    ], // Define tags for caching and invalidation
    endpoints: (builder) => ({
        // Endpoints will be injected here by other feature API slices
    }),
});

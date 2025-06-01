import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {getToken} from './cookieService';

const baseQuery = fetchBaseQuery({
    baseUrl: 'http://44.212.56.160/api',
    prepareHeaders: (headers, {getState}) => {
        const token = getToken();
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        // headers.set('Accept', 'application/json');
        return headers;
    },
});

export const api = createApi({
    reducerPath: 'api',
    baseQuery: baseQuery,
    tagTypes: [
        'User', 'AuthUser', 'WeddingHall', 'District', 'Reservation',
        'OwnerWeddingHall', 'OwnerReservation', 'AdminUser', 'AdminOwner',
        'AdminWeddingHall', 'AdminReservation'
    ],
    endpoints: (builder) => ({}),
});
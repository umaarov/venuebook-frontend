import { api as coreApiReservation } from '../../services/apiCore';

export const reservationApi = coreApiReservation.injectEndpoints({
    endpoints: (builder) => ({
        getMyReservations: builder.query({ // Corresponds to /my-reservations
            query: () => '/my-reservations',
            providesTags: (result) =>
                (result && result.data && Array.isArray(result.data))
                    ? [
                        ...result.data.map(({ id }) => ({ type: 'Reservation', id })),
                        { type: 'Reservation', id: 'LIST' },
                    ]
                    : [{ type: 'Reservation', id: 'LIST' }],
        }),
        getReservationById: builder.query({ // Corresponds to /reservations/{id}
            query: (id) => `/reservations/${id}`,
            providesTags: (result, error, id) => [{ type: 'Reservation', id }],
        }),
        createReservation: builder.mutation({ // Corresponds to POST /reservations
            query: (reservationData) => ({
                url: '/reservations',
                method: 'POST',
                body: reservationData,
            }),
            invalidatesTags: [
                { type: 'Reservation', id: 'LIST' }, // User's reservations
                { type: 'OwnerReservation', id: 'LIST' } // Potentially owner's reservations if they view all
                // No AdminReservation LIST tag as admin list endpoint is not defined in provided routes
            ],
        }),
        cancelReservation: builder.mutation({ // Corresponds to POST /reservations/{id}/cancel
            query: (id) => ({
                url: `/reservations/${id}/cancel`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Reservation', id: 'LIST' },
                { type: 'Reservation', id },
                { type: 'OwnerReservation', id: 'LIST' }
            ],
        }),
        // Removed updateReservation as there's no general PUT /reservations/{id}
        // Removed deleteReservation as there's no DELETE /reservations/{id}
    }),
});

export const {
    useGetMyReservationsQuery,
    useGetReservationByIdQuery,
    useCreateReservationMutation,
    useCancelReservationMutation, // Changed from useDeleteReservationMutation
} = reservationApi;

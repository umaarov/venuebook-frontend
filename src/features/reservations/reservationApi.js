import {api as coreApiReservation} from '../../services/apiCore';

export const reservationApi = coreApiReservation.injectEndpoints({
    endpoints: (builder) => ({
        getMyReservations: builder.query({
            query: () => '/my-reservations',
            providesTags: (result) =>
                (result && result.data && Array.isArray(result.data))
                    ? [
                        ...result.data.map(({id}) => ({type: 'Reservation', id})),
                        {type: 'Reservation', id: 'LIST'},
                    ]
                    : [{type: 'Reservation', id: 'LIST'}],
        }),
        getReservationById: builder.query({
            query: (id) => `/reservations/${id}`,
            providesTags: (result, error, id) => [{type: 'Reservation', id}],
        }),
        createReservation: builder.mutation({
            query: (reservationData) => ({
                url: '/reservations',
                method: 'POST',
                body: reservationData,
            }),
            invalidatesTags: [
                {type: 'Reservation', id: 'LIST'},
                {type: 'OwnerReservation', id: 'LIST'}
            ],
        }),
        cancelReservation: builder.mutation({
            query: (id) => ({
                url: `/reservations/${id}/cancel`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [
                {type: 'Reservation', id: 'LIST'},
                {type: 'Reservation', id},
                {type: 'OwnerReservation', id: 'LIST'}
            ],
        }),
    }),
});

export const {
    useGetMyReservationsQuery,
    useCreateReservationMutation,
    useCancelReservationMutation,
} = reservationApi;

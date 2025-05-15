import {api} from '../../services/apiCore';

export const reservationApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getMyReservations: builder.query({
            query: () => '/my-reservations',
            providesTags: (result) =>
                result?.data
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
            invalidatesTags: [{type: 'Reservation', id: 'LIST'}, {type: 'OwnerReservation', id: 'LIST'}], // Invalidate user's and potentially owner's list
        }),
        updateReservation: builder.mutation({
            query: ({id, ...reservationData}) => ({
                url: `/reservations/${id}`,
                method: 'PUT',
                body: reservationData,
            }),
            invalidatesTags: (result, error, {id}) => [{type: 'Reservation', id}, {
                type: 'Reservation',
                id: 'LIST'
            }, {type: 'OwnerReservation', id: 'LIST'}],
        }),
        deleteReservation: builder.mutation({
            query: (id) => ({
                url: `/reservations/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [{type: 'Reservation', id: 'LIST'}, {
                type: 'OwnerReservation',
                id: 'LIST'
            }],
        }),
    }),
});

export const {
    useGetMyReservationsQuery,
    useGetReservationByIdQuery,
    useCreateReservationMutation,
    useUpdateReservationMutation,
    useDeleteReservationMutation,
} = reservationApi;
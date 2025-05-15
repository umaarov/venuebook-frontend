import {api} from '../../services/apiCore';

export const adminApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // User Management
        adminGetAllUsers: builder.query({
            query: () => '/admin/users',
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({id}) => ({type: 'AdminUser', id})),
                        {type: 'AdminUser', id: 'LIST'},
                    ]
                    : [{type: 'AdminUser', id: 'LIST'}],
        }),
        adminGetUserById: builder.query({
            query: (id) => `/admin/users/${id}`,
            providesTags: (result, error, id) => [{type: 'AdminUser', id}],
        }),
        adminUpdateUser: builder.mutation({
            query: ({id, ...userData}) => ({
                url: `/admin/users/${id}`,
                method: 'PUT',
                body: userData,
            }),
            invalidatesTags: (result, error, {id}) => [{type: 'AdminUser', id}, {
                type: 'AdminUser',
                id: 'LIST'
            }, {type: 'AuthUser', id}], // Also AuthUser if admin edits self
        }),
        adminDeleteUser: builder.mutation({
            query: (id) => ({
                url: `/admin/users/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{type: 'AdminUser', id: 'LIST'}],
        }),
        adminAssignOwnerRole: builder.mutation({
            query: (userId) => ({
                url: `/admin/users/${userId}/assign-owner`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, userId) => [{type: 'AdminUser', id: userId}, {
                type: 'AdminUser',
                id: 'LIST'
            }],
        }),
        adminRevokeOwnerRole: builder.mutation({
            query: (userId) => ({
                url: `/admin/users/${userId}/revoke-owner`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, userId) => [{type: 'AdminUser', id: userId}, {
                type: 'AdminUser',
                id: 'LIST'
            }],
        }),

        // Wedding Hall Management (Admin)
        adminGetAllWeddingHalls: builder.query({
            query: () => '/admin/wedding-halls',
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({id}) => ({type: 'AdminWeddingHall', id})),
                        {type: 'AdminWeddingHall', id: 'LIST'},
                    ]
                    : [{type: 'AdminWeddingHall', id: 'LIST'}],
        }),
        adminGetWeddingHallById: builder.query({
            query: (id) => `/admin/wedding-halls/${id}`,
            providesTags: (result, error, id) => [{type: 'AdminWeddingHall', id}],
        }),
        adminDeleteWeddingHall: builder.mutation({
            query: (id) => ({
                url: `/admin/wedding-halls/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [
                {type: 'AdminWeddingHall', id: 'LIST'},
                {type: 'WeddingHall', id: 'LIST'}, // Invalidate public list
                {type: 'OwnerWeddingHall', id: 'LIST'} // Invalidate owner list
            ],
        }),

        // Reservation Management (Admin)
        adminGetAllReservations: builder.query({
            query: () => '/admin/reservations',
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({id}) => ({type: 'AdminReservation', id})),
                        {type: 'AdminReservation', id: 'LIST'},
                    ]
                    : [{type: 'AdminReservation', id: 'LIST'}],
        }),
        adminGetReservationById: builder.query({
            query: (id) => `/admin/reservations/${id}`,
            providesTags: (result, error, id) => [{type: 'AdminReservation', id}],
        }),
        adminDeleteReservation: builder.mutation({
            query: (id) => ({
                url: `/admin/reservations/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [
                {type: 'AdminReservation', id: 'LIST'},
                {type: 'Reservation', id: 'LIST'}, // Invalidate user's list
                {type: 'OwnerReservation', id: 'LIST'} // Invalidate owner's list
            ],
        }),
    }),
});

export const {
    useAdminGetAllUsersQuery,
    useAdminGetUserByIdQuery,
    useAdminUpdateUserMutation,
    useAdminDeleteUserMutation,
    useAdminAssignOwnerRoleMutation,
    useAdminRevokeOwnerRoleMutation,
    useAdminGetAllWeddingHallsQuery,
    useAdminGetWeddingHallByIdQuery,
    useAdminDeleteWeddingHallMutation,
    useAdminGetAllReservationsQuery,
    useAdminGetReservationByIdQuery,
    useAdminDeleteReservationMutation,
} = adminApi;
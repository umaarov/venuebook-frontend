import {api as coreApiAdmin} from '../../services/apiCore';

export const adminApi = coreApiAdmin.injectEndpoints({
    endpoints: (builder) => ({
        // User/Owner Management (Admin)
        adminListOwners: builder.query({ // GET /admin/owners
            query: () => '/admin/owners',
            providesTags: (result) =>
                (result && result.data && Array.isArray(result.data))
                    ? [
                        ...result.data.map(({id}) => ({type: 'AdminOwner', id})),
                        {type: 'AdminOwner', id: 'LIST'},
                    ]
                    : [{type: 'AdminOwner', id: 'LIST'}],
        }),
        adminAddOwner: builder.mutation({ // POST /admin/owners
            query: (userData) => ({
                url: '/admin/owners',
                method: 'POST',
                body: userData,
            }),
            invalidatesTags: [{type: 'AdminOwner', id: 'LIST'}, {
                type: 'AdminUser',
                id: 'LIST'
            }],
        }),
        adminAssociateOwnerWithHall: builder.mutation({ // POST /admin/associate-owner
            query: (associationData) => ({
                url: '/admin/associate-owner',
                method: 'POST',
                body: associationData,
            }),
            invalidatesTags: [{type: 'AdminOwner', id: 'LIST'}, {type: 'OwnerWeddingHall', id: 'LIST'}],
        }),

        // Wedding Hall Management (Admin)
        adminCreateWeddingHall: builder.mutation({ // POST /admin/wedding-halls
            query: (hallData) => {
                const formData = new FormData();
                Object.keys(hallData).forEach(key => {
                    if (key === 'images' && hallData[key]) {
                        Array.from(hallData[key]).forEach(file => {
                            formData.append('images[]', file);
                        });
                    } else if (hallData[key] !== null && hallData[key] !== undefined) {
                        formData.append(key, hallData[key]);
                    }
                });
                return {url: '/admin/wedding-halls', method: 'POST', body: formData};
            },
            invalidatesTags: [{type: 'AdminWeddingHall', id: 'LIST'}, {type: 'WeddingHall', id: 'LIST'}],
        }),
        adminUpdateWeddingHall: builder.mutation({ // PUT /admin/wedding-halls/{id}
            query: ({id, ...hallData}) => {
                const formData = new FormData();
                // Append standard fields
                for (const key in hallData) {
                    if (key !== 'new_images' && key !== 'images' && hallData[key] !== null && hallData[key] !== undefined) {
                        formData.append(key, hallData[key]);
                    }
                }
                if (hallData.new_images && hallData.new_images.length > 0) {
                    Array.from(hallData.new_images).forEach(file => {
                        formData.append('new_images[]', file);
                    });
                }
                formData.append('_method', 'PUT');
                return {url: `/admin/wedding-halls/${id}`, method: 'POST', body: formData};
            },
            invalidatesTags: (r, e, {id}) => [{type: 'AdminWeddingHall', id}, {
                type: 'AdminWeddingHall',
                id: 'LIST'
            }, {type: 'WeddingHall', id}, {type: 'WeddingHall', id: 'LIST'}],
        }),
        adminDeleteWeddingHall: builder.mutation({ // DELETE /admin/wedding-halls/{id}
            query: (id) => ({
                url: `/admin/wedding-halls/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [
                {type: 'AdminWeddingHall', id: 'LIST'},
                {type: 'WeddingHall', id: 'LIST'},
                {type: 'OwnerWeddingHall', id: 'LIST'}
            ],
        }),
        adminApproveWeddingHall: builder.mutation({ // POST /admin/wedding-halls/{id}/approve
            query: (id) => ({
                url: `/admin/wedding-halls/${id}/approve`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [{type: 'AdminWeddingHall', id}, {
                type: 'WeddingHall',
                id
            }, {type: 'AdminWeddingHall', id: 'LIST'}, {type: 'WeddingHall', id: 'LIST'}],
        }),
        adminRejectWeddingHall: builder.mutation({ // POST /admin/wedding-halls/{id}/reject
            query: (id) => ({
                url: `/admin/wedding-halls/${id}/reject`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [{type: 'AdminWeddingHall', id}, {
                type: 'WeddingHall',
                id
            }, {type: 'AdminWeddingHall', id: 'LIST'}, {type: 'WeddingHall', id: 'LIST'}],
        }),

        adminListAllReservations: builder.query({
            query: (params) => ({
                url: '/admin/reservations',
                params: params,
            }),
            providesTags: (result) => {
                if (result && result.data && result.data.data && Array.isArray(result.data.data)) {
                    return [
                        ...result.data.data.map(({id}) => ({type: 'AdminReservation', id})),
                        {type: 'AdminReservation', id: 'LIST'},
                    ];
                }
                return [{type: 'AdminReservation', id: 'LIST'}];
            },
        }),
        adminCancelReservation: builder.mutation({
            query: ({id, reason}) => ({
                url: `/admin/reservations/${id}/cancel`,
                method: 'POST',
                body: {reason},
            }),
            invalidatesTags: (result, error, {id}) => [
                {type: 'AdminReservation', id: 'LIST'},
                {type: 'AdminReservation', id},
                {type: 'Reservation', id: 'LIST'},
                {type: 'OwnerReservation', id: 'LIST'}
            ],
        }),
    }),
});

export const {
    useAdminListOwnersQuery,
    useAdminAddOwnerMutation,
    useAdminCreateWeddingHallMutation,
    useAdminUpdateWeddingHallMutation,
    useAdminDeleteWeddingHallMutation,
    useAdminApproveWeddingHallMutation,
    useAdminRejectWeddingHallMutation,
    useAdminListAllReservationsQuery,
    useAdminCancelReservationMutation,
} = adminApi;
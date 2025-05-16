import {api as coreApiAdmin} from '../../services/apiCore';

export const adminApi = coreApiAdmin.injectEndpoints({
    endpoints: (builder) => ({
        // User/Owner Management (Admin)
        adminListOwners: builder.query({ // GET /admin/owners
            query: () => '/admin/owners',
            providesTags: (result) =>
                (result && result.data && Array.isArray(result.data))
                    ? [
                        ...result.data.map(({id}) => ({type: 'AdminOwner', id})), // Assuming result.data is array of owner users
                        {type: 'AdminOwner', id: 'LIST'},
                    ]
                    : [{type: 'AdminOwner', id: 'LIST'}],
        }),
        adminAddOwner: builder.mutation({ // POST /admin/owners - Body should contain user_id to make them an owner
            query: (userData) => ({ // Expects { user_id: X } or similar based on AdminController@addOwner
                url: '/admin/owners',
                method: 'POST',
                body: userData,
            }),
            invalidatesTags: [{type: 'AdminOwner', id: 'LIST'}, {
                type: 'AdminUser',
                id: 'LIST'
            } /* if you have a general user list */],
        }),
        adminAssociateOwnerWithHall: builder.mutation({ // POST /admin/associate-owner
            query: (associationData) => ({ // Expects { owner_id: X, wedding_hall_id: Y }
                url: '/admin/associate-owner',
                method: 'POST',
                body: associationData,
            }),
            invalidatesTags: [{type: 'AdminOwner', id: 'LIST'}, {type: 'OwnerWeddingHall', id: 'LIST'}], // Or more specific tags
        }),

        // Wedding Hall Management (Admin)
        // Admin uses public GET /wedding-halls to list all. No specific /admin/wedding-halls for GET.
        // Admin can create halls via POST /admin/wedding-halls (same as owner's POST /wedding-halls but with admin privileges)
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
        // Admin can update halls via PUT /admin/wedding-halls/{id}
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

        // Removed endpoints that don't have direct routes in api.php:
        // adminGetAllUsers, adminGetUserById, adminUpdateUser, adminDeleteUser
        // adminAssignOwnerRole, adminRevokeOwnerRole (replaced by adminAddOwner, specific revoke might be manual DB or new endpoint)
        // adminGetAllReservations, adminGetReservationById, adminDeleteReservation
    }),
});

export const {
    useAdminListOwnersQuery,
    useAdminAddOwnerMutation,
    useAdminAssociateOwnerWithHallMutation,
    useAdminCreateWeddingHallMutation,
    useAdminUpdateWeddingHallMutation,
    useAdminDeleteWeddingHallMutation,
    useAdminApproveWeddingHallMutation,
    useAdminRejectWeddingHallMutation,
} = adminApi;
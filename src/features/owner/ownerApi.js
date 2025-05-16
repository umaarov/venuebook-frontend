import {api as coreApiOwner} from '../../services/apiCore';

export const ownerApi = coreApiOwner.injectEndpoints({
    endpoints: (builder) => ({
        // GET /owner/wedding-halls - Fetches halls owned by the authenticated user
        getOwnerWeddingHalls: builder.query({
            // query: () => '/owner/wedding-halls',
            query: (params) => ({
                url: '/owner/wedding-halls',
                params: params,
            }),
            providesTags: (result) => {
                if (result && result.data && result.data.data && Array.isArray(result.data.data)) { // Paginated
                    return [...result.data.data.map(({id}) => ({
                        type: 'OwnerWeddingHall',
                        id
                    })), {type: 'OwnerWeddingHall', id: 'LIST'}];
                } else if (result && result.data && Array.isArray(result.data)) { // Non-paginated
                    return [...result.data.map(({id}) => ({type: 'OwnerWeddingHall', id})), {
                        type: 'OwnerWeddingHall',
                        id: 'LIST'
                    }];
                }
                return [{type: 'OwnerWeddingHall', id: 'LIST'}];
            },
        }),
        // POST /wedding-halls - Owner creates a new wedding hall (handled by WeddingHallController)
        createOwnerWeddingHall: builder.mutation({
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
                return {
                    url: '/wedding-halls', // Corrected URL
                    method: 'POST',
                    body: formData,
                };
            },
            invalidatesTags: [
                {type: 'OwnerWeddingHall', id: 'LIST'}, // Refresh owner's list
                {type: 'WeddingHall', id: 'LIST'} // Refresh public list
            ],
        }),
        // PUT /wedding-halls/{id} - Owner updates their wedding hall (handled by WeddingHallController)
        updateOwnerWeddingHall: builder.mutation({
            query: ({id, ...hallData}) => {
                const formData = new FormData();
                // Append standard fields
                for (const key in hallData) {
                    if (key !== 'new_images' && key !== 'images' && hallData[key] !== null && hallData[key] !== undefined) {
                        formData.append(key, hallData[key]);
                    }
                }
                // Append new images if any
                if (hallData.new_images && hallData.new_images.length > 0) {
                    Array.from(hallData.new_images).forEach(file => {
                        formData.append('new_images[]', file); // Backend should expect 'new_images[]'
                    });
                }
                formData.append('_method', 'PUT'); // Laravel needs this for FormData with PUT
                return {
                    url: `/wedding-halls/${id}`, // Corrected URL
                    method: 'POST', // Using POST because of _method with FormData
                    body: formData,
                };
            },
            invalidatesTags: (result, error, {id}) => [
                {type: 'OwnerWeddingHall', id: 'LIST'}, {type: 'OwnerWeddingHall', id},
                {type: 'WeddingHall', id: 'LIST'}, {type: 'WeddingHall', id}
            ],
        }),
        // POST /wedding-halls/{id}/images - Owner uploads images for their hall
        uploadWeddingHallImages: builder.mutation({
            query: ({weddingHallId, images}) => {
                const formData = new FormData();
                Array.from(images).forEach(file => {
                    formData.append('images[]', file);
                });
                return {
                    url: `/wedding-halls/${weddingHallId}/images`, // Corrected URL
                    method: 'POST',
                    body: formData,
                };
            },
            invalidatesTags: (result, error, {weddingHallId}) => [
                {type: 'OwnerWeddingHall', id: weddingHallId}, {type: 'OwnerWeddingHall', id: 'LIST'},
                {type: 'WeddingHall', id: weddingHallId}, {type: 'WeddingHall', id: 'LIST'}
            ],
        }),
        // DELETE /wedding-halls/images/{imageId} - Owner deletes an image from their hall
        deleteWeddingHallImage: builder.mutation({
            query: (imageId) => ({
                url: `/wedding-halls/images/${imageId}`, // Corrected URL
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, imageId) => [ // Need to be more specific if possible
                {type: 'OwnerWeddingHall', id: 'LIST'},
                {type: 'WeddingHall', id: 'LIST'}
            ],
        }),
        // GET /owner/reservations - Fetches reservations for halls owned by the authenticated user
        getOwnerReservations: builder.query({
            query: (params) => ({ // params could include wedding_hall_id for filtering if backend supports
                url: '/owner/reservations',
                params, // e.g. /owner/reservations?wedding_hall_id=X
            }),
            providesTags: (result) =>
                (result && result.data && Array.isArray(result.data))
                    ? [
                        ...result.data.map(({id}) => ({type: 'OwnerReservation', id})),
                        {type: 'OwnerReservation', id: 'LIST'},
                    ]
                    : [{type: 'OwnerReservation', id: 'LIST'}],
        }),
        // POST /owner/reservations/{id}/cancel - Owner cancels a reservation for one of their halls
        cancelOwnerReservation: builder.mutation({
            query: (id) => ({
                url: `/owner/reservations/${id}/cancel`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [
                {type: 'OwnerReservation', id: 'LIST'}, {type: 'OwnerReservation', id},
                {type: 'Reservation', id: 'LIST'} // Also invalidate general user's reservation list
            ],
        }),
        // Removed getOwnerWeddingHallById as it's not a distinct owner route; use public /wedding-halls/{id}
        // Removed deleteOwnerWeddingHall as owners don't have this route; it's admin-only
    }),
});

export const {
    useGetOwnerWeddingHallsQuery,
    useCreateOwnerWeddingHallMutation,
    useUpdateOwnerWeddingHallMutation,
    useUploadWeddingHallImagesMutation,
    useDeleteWeddingHallImageMutation,
    useGetOwnerReservationsQuery,
    useCancelOwnerReservationMutation,
} = ownerApi;
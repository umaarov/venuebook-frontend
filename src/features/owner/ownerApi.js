import {api as coreApiOwner} from '../../services/apiCore';

export const ownerApi = coreApiOwner.injectEndpoints({
    endpoints: (builder) => ({
        // GET /owner/wedding-halls
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
        // POST /wedding-halls
        createOwnerWeddingHall: builder.mutation({
            query: ({data}) => ({
                url: '/wedding-halls',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [
                {type: 'OwnerWeddingHall', id: 'LIST'},
                {type: 'WeddingHall', id: 'LIST'}
            ],
        }),
        // PUT /wedding-halls/{id}
        updateOwnerWeddingHall: builder.mutation({
            query: ({id, data}) => ({
                url: `/wedding-halls/${id}`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (result, error, {id}) => [
                {type: 'OwnerWeddingHall', id: 'LIST'}, {type: 'OwnerWeddingHall', id},
                {type: 'WeddingHall', id: 'LIST'}, {type: 'WeddingHall', id}
            ],
        }),
        // POST /wedding-halls/{id}/images
        uploadWeddingHallImages: builder.mutation({
            query: ({weddingHallId, images}) => {
                const formData = new FormData();
                Array.from(images).forEach(file => {
                    formData.append('images[]', file);
                });
                return {
                    url: `/wedding-halls/${weddingHallId}/images`,
                    method: 'POST',
                    body: formData,
                };
            },
            invalidatesTags: (result, error, {weddingHallId}) => [
                {type: 'OwnerWeddingHall', id: weddingHallId}, {type: 'OwnerWeddingHall', id: 'LIST'},
                {type: 'WeddingHall', id: weddingHallId}, {type: 'WeddingHall', id: 'LIST'}
            ],
        }),
        // DELETE /wedding-halls/images/{imageId}
        deleteWeddingHallImage: builder.mutation({
            query: (imageId) => ({
                url: `/wedding-halls/images/${imageId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, imageId) => [ // Need to be more specific if possible
                {type: 'OwnerWeddingHall', id: 'LIST'},
                {type: 'WeddingHall', id: 'LIST'}
            ],
        }),
        // GET /owner/reservations
        getOwnerReservations: builder.query({
            query: (params) => ({
                url: '/owner/reservations',
                params,
            }),
            providesTags: (result) =>
                (result && result.data && Array.isArray(result.data))
                    ? [
                        ...result.data.map(({id}) => ({type: 'OwnerReservation', id})),
                        {type: 'OwnerReservation', id: 'LIST'},
                    ]
                    : [{type: 'OwnerReservation', id: 'LIST'}],
        }),
        // POST /owner/reservations/{id}/cancel
        cancelOwnerReservation: builder.mutation({
            query: (id) => ({
                url: `/owner/reservations/${id}/cancel`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [
                {type: 'OwnerReservation', id: 'LIST'}, {type: 'OwnerReservation', id},
                {type: 'Reservation', id: 'LIST'}
            ],
        }),
    }),
});

export const {
    useGetOwnerWeddingHallsQuery,
    useCreateOwnerWeddingHallMutation,
    useUpdateOwnerWeddingHallMutation,
    useDeleteWeddingHallImageMutation,
    useGetOwnerReservationsQuery,
    useCancelOwnerReservationMutation,
} = ownerApi;
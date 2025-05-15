import {api} from '../../services/apiCore';

export const ownerApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getOwnerWeddingHalls: builder.query({
            query: () => '/owner/wedding-halls',
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({id}) => ({type: 'OwnerWeddingHall', id})),
                        {type: 'OwnerWeddingHall', id: 'LIST'},
                    ]
                    : [{type: 'OwnerWeddingHall', id: 'LIST'}],
        }),
        getOwnerWeddingHallById: builder.query({
            query: (id) => `/owner/wedding-halls/${id}`,
            providesTags: (result, error, id) => [{type: 'OwnerWeddingHall', id}],
        }),
        createOwnerWeddingHall: builder.mutation({
            query: (hallData) => {
                // FormData is needed for file uploads (images)
                const formData = new FormData();
                Object.keys(hallData).forEach(key => {
                    if (key === 'images' && hallData[key]) { // 'images' should be an array of File objects
                        Array.from(hallData[key]).forEach(file => {
                            formData.append('images[]', file);
                        });
                    } else if (hallData[key] !== null && hallData[key] !== undefined) {
                        formData.append(key, hallData[key]);
                    }
                });
                return {
                    url: '/owner/wedding-halls',
                    method: 'POST',
                    body: formData, // Send as FormData
                    // headers: { 'Content-Type': 'multipart/form-data' } // fetchBaseQuery handles this with FormData
                };
            },
            invalidatesTags: [{type: 'OwnerWeddingHall', id: 'LIST'}, {type: 'WeddingHall', id: 'LIST'}],
        }),
        updateOwnerWeddingHall: builder.mutation({
            query: ({id, ...hallData}) => {
                // For PUT with FormData, Laravel might need a _method field if it doesn't support PUT with multipart/form-data directly
                // Or send as POST and add _method: 'PUT' to formData
                const formData = new FormData();
                Object.keys(hallData).forEach(key => {
                    if (key === 'new_images' && hallData[key]) { // Handle new images separately
                        Array.from(hallData[key]).forEach(file => {
                            formData.append('new_images[]', file);
                        });
                    } else if (hallData[key] !== null && hallData[key] !== undefined) {
                        formData.append(key, hallData[key]);
                    }
                });
                // If your backend expects PUT for updates but you are sending FormData (which typically goes with POST)
                // you might need to send it as POST and include a _method field.
                // formData.append('_method', 'PUT'); // If using POST to simulate PUT for FormData
                // url: `/owner/wedding-halls/${id}`, method: 'POST', body: formData
                return {
                    url: `/owner/wedding-halls/${id}`,
                    method: 'PUT', // Or 'POST' with _method: 'PUT' if backend needs it for FormData
                    body: hallData, // If not using FormData for update, or if backend handles PUT with JSON and separate image uploads
                    // If sending JSON and images are handled by a separate endpoint:
                    // body: hallData (ensure it's an object, not FormData)
                };
            },
            invalidatesTags: (result, error, {id}) => [
                {type: 'OwnerWeddingHall', id},
                {type: 'OwnerWeddingHall', id: 'LIST'},
                {type: 'WeddingHall', id},
                {type: 'WeddingHall', id: 'LIST'},
            ],
        }),
        deleteOwnerWeddingHall: builder.mutation({
            query: (id) => ({
                url: `/owner/wedding-halls/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                {type: 'OwnerWeddingHall', id: 'LIST'},
                {type: 'WeddingHall', id: 'LIST'}, // Also invalidate general list
            ],
        }),
        uploadWeddingHallImages: builder.mutation({ // This assumes a separate endpoint for adding more images
            query: ({weddingHallId, images}) => {
                const formData = new FormData();
                Array.from(images).forEach(file => {
                    formData.append('images[]', file);
                });
                return {
                    url: `/owner/wedding-halls/${weddingHallId}/images`,
                    method: 'POST',
                    body: formData,
                };
            },
            invalidatesTags: (result, error, {weddingHallId}) => [
                {type: 'OwnerWeddingHall', id: weddingHallId},
                {type: 'WeddingHall', id: weddingHallId}
            ],
        }),
        deleteWeddingHallImage: builder.mutation({
            query: (imageId) => ({
                url: `/owner/wedding-hall-images/${imageId}`,
                method: 'DELETE',
            }),
            // Invalidate the specific hall it belonged to. This requires knowing the hallId or refetching.
            // A more robust approach might be to refetch the specific hall after image deletion.
            invalidatesTags: (result, error, imageId) => [
                // Need to determine which WeddingHall/OwnerWeddingHall to invalidate
                // This might require returning the parent hall ID from the backend on delete
                // Or, more simply, refetch all owner halls or the specific hall if its ID is known
                {type: 'OwnerWeddingHall', id: 'LIST'}, // Broad invalidation
                {type: 'WeddingHall', id: 'LIST'}, // Broad invalidation
            ],
        }),
        getOwnerReservations: builder.query({
            query: (weddingHallId) => ({ // weddingHallId is optional
                url: weddingHallId ? `/owner/reservations/${weddingHallId}` : '/owner/reservations',
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({id}) => ({type: 'OwnerReservation', id})),
                        {type: 'OwnerReservation', id: 'LIST'},
                    ]
                    : [{type: 'OwnerReservation', id: 'LIST'}],
        }),
    }),
});

export const {
    useGetOwnerWeddingHallsQuery,
    useGetOwnerWeddingHallByIdQuery,
    useCreateOwnerWeddingHallMutation,
    useUpdateOwnerWeddingHallMutation,
    useDeleteOwnerWeddingHallMutation,
    useUploadWeddingHallImagesMutation,
    useDeleteWeddingHallImageMutation,
    useGetOwnerReservationsQuery,
} = ownerApi;
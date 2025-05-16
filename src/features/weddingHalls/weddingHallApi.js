import { api as coreApiWedding } from '../../services/apiCore'; // Use alias

export const weddingHallApi = coreApiWedding.injectEndpoints({
    endpoints: (builder) => ({
        getWeddingHalls: builder.query({
            query: (params) => ({
                url: '/wedding-halls',
                params, // e.g., /wedding-halls?district_id=1&page=1
            }),
            providesTags: (result, error, arg) => {
                // Paginated: items are in result.data.data (Laravel pagination)
                // The overall response is { data: { current_page: ..., data: [ITEMS], ... }, message: ..., status: ... }
                if (result && result.data && result.data.data && Array.isArray(result.data.data)) {
                    return [
                        ...result.data.data.map(({ id }) => ({ type: 'WeddingHall', id })),
                        { type: 'WeddingHall', id: 'LIST' },
                    ];
                }
                return [{ type: 'WeddingHall', id: 'LIST' }];
            },
        }),
        getWeddingHallById: builder.query({
            query: (id) => `/wedding-halls/${id}`,
            // Single item: result.data is the item
            // The overall response is { data: ITEM, message: ..., status: ... }
            providesTags: (result, error, id) => [{ type: 'WeddingHall', id }],
        }),
        getDistricts: builder.query({
            query: () => '/districts',
            providesTags: (result) =>
                // Non-paginated array: items are in result.data
                // The overall response is { data: [ITEMS], message: ..., status: ... }
                (result && result.data && Array.isArray(result.data))
                    ? [
                        ...result.data.map(({ id }) => ({ type: 'District', id })),
                        { type: 'District', id: 'LIST' },
                    ]
                    : [{ type: 'District', id: 'LIST' }],
        }),
        getWeddingHallsByDistrict: builder.query({ // This endpoint is not in api.php, but kept for now if it's a client-side filter target
            query: (districtId) => `/wedding-halls?district_id=${districtId}`, // Assumes backend filters by district_id query param on main /wedding-halls endpoint
            providesTags: (result, error, districtId) => {
                // Assuming this also returns paginated structure if it hits /wedding-halls
                if (result && result.data && result.data.data && Array.isArray(result.data.data)) {
                    return [
                        ...result.data.data.map(({ id }) => ({ type: 'WeddingHall', id })),
                        { type: 'WeddingHall', id: 'LIST' }, // General list
                        { type: 'District', id: districtId } // For this specific district's list
                    ];
                }
                return [{ type: 'WeddingHall', id: 'LIST' }, { type: 'District', id: districtId }];
            }
        }),
    }),
});

export const {
    useGetWeddingHallsQuery,
    useGetWeddingHallByIdQuery,
    useGetDistrictsQuery,
    useGetWeddingHallsByDistrictQuery,
} = weddingHallApi;
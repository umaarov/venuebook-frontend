// File: src/features/weddingHalls/weddingHallApi.js
import { api } from '../../services/apiCore';

export const weddingHallApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getWeddingHalls: builder.query({
            query: (params) => ({
                url: '/wedding-halls',
                params,
            }),
            providesTags: (result, error, arg) => {
                // result.data is the server response: { status, message, data: { current_page, data: [...] } }
                // The actual items are in result.data.data.data
                if (result && result.data && result.data.data && Array.isArray(result.data.data.data)) {
                    return [
                        ...result.data.data.data.map(({ id }) => ({ type: 'WeddingHall', id })),
                        { type: 'WeddingHall', id: 'LIST' },
                    ];
                }
                return [{ type: 'WeddingHall', id: 'LIST' }];
            },
        }),
        getWeddingHallById: builder.query({
            query: (id) => `/wedding-halls/${id}`,
            providesTags: (result, error, id) => [{ type: 'WeddingHall', id }], // Assumes result.data is the single hall object, or this tag refers to the item itself
        }),
        getDistricts: builder.query({
            query: () => '/districts',
            providesTags: (result) => {
                // result.data is the server response: { status, message, data: [...] }
                // The actual items are in result.data.data
                if (result && result.data && Array.isArray(result.data.data)) {
                    return [
                        ...result.data.data.map(({ id }) => ({ type: 'District', id })),
                        { type: 'District', id: 'LIST' },
                    ];
                }
                return [{ type: 'District', id: 'LIST' }];
            },
        }),
        getWeddingHallsByDistrict: builder.query({
            query: (districtId) => `/districts/${districtId}/wedding-halls`,
            providesTags: (result, error, districtId) => {
                // result.data is the server response: { status, message, data: [...] }
                // The actual items are in result.data.data
                if (result && result.data && Array.isArray(result.data.data)) {
                    return [
                        ...result.data.data.map(({ id }) => ({ type: 'WeddingHall', id })),
                        { type: 'WeddingHall', id: 'LIST' }, // General list invalidation
                        { type: 'District', id: districtId } // Specific district related data
                    ];
                }
                return [{ type: 'WeddingHall', id: 'LIST' }, { type: 'District', id: districtId }];
            },
        }),
    }),
});

export const {
    useGetWeddingHallsQuery,
    useGetWeddingHallByIdQuery,
    useGetDistrictsQuery,
    useGetWeddingHallsByDistrictQuery,
} = weddingHallApi;
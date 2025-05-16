import {api as coreApiWedding} from '../../services/apiCore'; // Use alias

export const weddingHallApi = coreApiWedding.injectEndpoints({
    endpoints: (builder) => ({
        getWeddingHalls: builder.query({
            query: (params) => ({
                url: '/wedding-halls',
                params,
            }),
            providesTags: (result, error, arg) => {
                if (result && result.data && result.data.data && Array.isArray(result.data.data)) {
                    return [
                        ...result.data.data.map(({id}) => ({type: 'WeddingHall', id})),
                        {type: 'WeddingHall', id: 'LIST'},
                    ];
                }
                return [{type: 'WeddingHall', id: 'LIST'}];
            },
        }),
        getWeddingHallById: builder.query({
            query: (id) => `/wedding-halls/${id}`,
            providesTags: (result, error, id) => [{type: 'WeddingHall', id}],
        }),
        getDistricts: builder.query({
            query: () => '/districts',
            providesTags: (result) =>
                (result && result.data && Array.isArray(result.data))
                    ? [
                        ...result.data.map(({id}) => ({type: 'District', id})),
                        {type: 'District', id: 'LIST'},
                    ]
                    : [{type: 'District', id: 'LIST'}],
        }),
        getWeddingHallsByDistrict: builder.query({
            query: (districtId) => `/wedding-halls?district_id=${districtId}`,
            providesTags: (result, error, districtId) => {
                if (result && result.data && result.data.data && Array.isArray(result.data.data)) {
                    return [
                        ...result.data.data.map(({id}) => ({type: 'WeddingHall', id})),
                        {type: 'WeddingHall', id: 'LIST'},
                        {type: 'District', id: districtId}
                    ];
                }
                return [{type: 'WeddingHall', id: 'LIST'}, {type: 'District', id: districtId}];
            }
        }),
    }),
});

export const {
    useGetWeddingHallsQuery,
    useGetWeddingHallByIdQuery,
    useGetDistrictsQuery,
} = weddingHallApi;
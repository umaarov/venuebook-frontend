import React, {useEffect, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {useGetDistrictsQuery, useGetWeddingHallsQuery} from '../features/weddingHalls/weddingHallApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
    BuildingOfficeIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    EyeIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    MapPinIcon,
    PhotoIcon
} from '@heroicons/react/24/solid';

const WeddingHallsPage = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const preSelectedDistrictId = queryParams.get('district_id');
    const preSelectedDistrictName = queryParams.get('district_name');

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    const [selectedDistrict, setSelectedDistrict] = useState(preSelectedDistrictId || '');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');

    // --- DEBUG LOG 1 ---
    // This will show us if the input field is updating the state.
    console.log('Current search term:', searchTerm);

    const {data: districtsData, isLoading: isLoadingDistricts, error: districtsError} = useGetDistrictsQuery();

    const apiQueryParams = {
        page: currentPage,
        per_page: 9,
        sort_by: sortBy,
        sort_direction: sortDirection,
        status: 'approved',
    };
    if (selectedDistrict) {
        apiQueryParams.district_id = selectedDistrict;
    }
    if (debouncedSearchTerm) {
        apiQueryParams.search = debouncedSearchTerm;
    }

    // --- DEBUG LOG 3 ---
    // This shows the exact parameters being sent to the API query. This is very important.
    console.log('API Query Params:', apiQueryParams);

    const {data: weddingHallsResponse, isLoading: isLoadingHalls, error: hallsError} =
        useGetWeddingHallsQuery(apiQueryParams);

    useEffect(() => {
        const handler = setTimeout(() => {
            // --- DEBUG LOG 2 ---
            // This will tell us if the debounce logic is working correctly.
            console.log(`Debouncing... Setting debounced term to: "${searchTerm}"`);
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    useEffect(() => {
        if (preSelectedDistrictId) {
            setSelectedDistrict(preSelectedDistrictId);
        }
    }, [preSelectedDistrictId]);


    const handlePageChange = (newPage) => {
        const meta = weddingHallsResponse?.data?.meta || weddingHallsResponse?.data;
        if (meta && newPage >= 1 && newPage <= meta.last_page) {
            setCurrentPage(newPage);
        }
    };

    const handleSortChange = (e) => {
        const value = e.target.value;
        const [field, direction] = value.split('_');
        setSortBy(field);
        setSortDirection(direction);
        setCurrentPage(1);
    };

    const handleDistrictChange = (e) => {
        setSelectedDistrict(e.target.value);
        setCurrentPage(1);
    }

    // --- The rest of the component remains the same ---
    const labelClass = "block text-sm font-medium text-gray-700";
    const inputClass = "mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";
    const pageIsLoading = isLoadingDistricts || (!weddingHallsResponse && isLoadingHalls);
    const combinedError = districtsError || hallsError;
    if (pageIsLoading) return <LoadingSpinner message="Loading wedding halls..."/>;
    if (combinedError) return <ErrorMessage
        message={combinedError.data?.message || "Could not load data."} details={combinedError.data?.errors}/>;
    const weddingHalls = weddingHallsResponse?.data?.data || [];
    const paginationInfo = weddingHallsResponse?.data?.meta || weddingHallsResponse?.data || {};
    const districts = districtsData?.data || [];
    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                    Find Your Dream Wedding Hall
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                    Browse our curated selection of beautiful
                    venues. {preSelectedDistrictName ? `Currently viewing halls in ${preSelectedDistrictName}.` : "Search by name or filter by district to find the perfect match."}
                </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-xl max-w-4xl mx-auto">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                    <FunnelIcon className="h-6 w-6 mr-2 text-primary"/> Refine Your Search
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <label htmlFor="search" className={labelClass}>Search by Name:</label>
                        <div className="relative mt-1">
                            <input
                                id="search"
                                type="text"
                                className={`${inputClass} pl-10`}
                                placeholder="e.g., 'Grand Ballroom'"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="district-filter" className={labelClass}>Filter by District:</label>
                        <select id="district-filter" className={inputClass} value={selectedDistrict} onChange={handleDistrictChange}>
                            <option value="">All Districts</option>
                            {districts.map(district => (
                                <option key={district.id} value={district.id}>{district.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="sort-by" className={labelClass}>Sort by:</label>
                        <select id="sort-by" className={inputClass} value={`${sortBy}_${sortDirection}`}
                                onChange={handleSortChange}>
                            <option value="created_at_desc">Most Recent</option>
                            <option value="price_per_seat_asc">Price: Low to High</option>
                            <option value="price_per_seat_desc">Price: High to Low</option>
                            <option value="capacity_desc">Capacity: High to Low</option>
                            <option value="capacity_asc">Capacity: Low to High</option>
                            <option value="name_asc">Name: A-Z</option>
                        </select>
                    </div>
                </div>
            </div>
            {isLoadingHalls && <LoadingSpinner message="Searching for halls..."/>}
            {!isLoadingHalls && weddingHalls.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <BuildingOfficeIcon className="h-20 w-20 mx-auto text-gray-400 mb-4"/>
                    <p className="text-xl text-gray-500">No wedding halls found matching your criteria.</p>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters.</p>
                </div>
            ) : !isLoadingHalls && weddingHalls.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {weddingHalls.map((hall) => {
                        const primaryImage = hall.images?.find(img => img.is_primary) || hall.images?.[0];
                        return (
                            <div key={hall.id}
                                 className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl group">
                                <Link to={`/wedding-halls/${hall.id}`} className="block">
                                    {primaryImage ? (
                                        <img
                                            src={primaryImage.image_path.startsWith('http') ? primaryImage.image_path : `http://localhost:8000/storage/${primaryImage.image_path}`}
                                            alt={hall.name}
                                            className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://placehold.co/600x400?text=Venue";
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
                                            <PhotoIcon className="h-16 w-16 text-gray-400"/>
                                        </div>
                                    )}
                                </Link>
                                <div className="p-6 flex flex-col flex-grow">
                                    <Link to={`/wedding-halls/${hall.id}`} className="block mb-2">
                                        <h3 className="text-xl font-semibold text-primary-dark group-hover:text-primary transition-colors">{hall.name}</h3>
                                    </Link>
                                    {hall.district && (
                                        <p className="text-xs text-gray-500 uppercase font-medium tracking-wider flex items-center mb-1">
                                            <MapPinIcon
                                                className="h-4 w-4 mr-1 text-gray-400"/> {hall.district.name}
                                        </p>
                                    )}
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-1"
                                       title={hall.address}>{hall.address}</p>
                                    <div className="mt-2 text-sm text-gray-700 space-y-1">
                                        <p>Capacity: <span className="font-medium">{hall.capacity} guests</span></p>
                                        <p>Price: <span className="font-medium">${hall.price_per_seat} / seat</span></p>
                                    </div>
                                    <div className="mt-auto pt-4">
                                        <Link
                                            to={`/wedding-halls/${hall.id}`}
                                            className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-colors"
                                        >
                                            <EyeIcon className="h-5 w-5 mr-2"/> View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {!isLoadingHalls && weddingHalls.length > 0 && paginationInfo.last_page > 1 && (
                <div className="mt-12 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-700">
                    <div className="mb-2 sm:mb-0">
                        Showing <span className="font-medium">{paginationInfo.from || 0}</span> to <span
                        className="font-medium">{paginationInfo.to || 0}</span> of <span
                        className="font-medium">{paginationInfo.total || 0}</span> results
                    </div>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => handlePageChange(paginationInfo.current_page - 1)}
                                disabled={paginationInfo.current_page <= 1 || isLoadingHalls}
                                className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                aria-label="Previous Page"><ChevronLeftIcon className="h-5 w-5"/></button>
                        {Array.from({length: paginationInfo.last_page}, (_, i) => i + 1)
                            .filter(pageNumber => pageNumber === 1 || pageNumber === paginationInfo.last_page || (pageNumber >= paginationInfo.current_page - 1 && pageNumber <= paginationInfo.current_page + 1)) // Show limited pages
                            .map((pageNumber, index, arr) => (
                                <React.Fragment key={pageNumber}>
                                    {index > 0 && pageNumber - arr[index - 1] > 1 && <span className="px-2">...</span>}
                                    <button onClick={() => handlePageChange(pageNumber)}
                                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${pageNumber === paginationInfo.current_page ? 'bg-primary text-white shadow-sm' : 'hover:bg-gray-100'}`}> {pageNumber} </button>
                                </React.Fragment>
                            ))}
                        <button onClick={() => handlePageChange(paginationInfo.current_page + 1)}
                                disabled={paginationInfo.current_page >= paginationInfo.last_page || isLoadingHalls}
                                className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                aria-label="Next Page"><ChevronRightIcon className="h-5 w-5"/></button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default WeddingHallsPage;
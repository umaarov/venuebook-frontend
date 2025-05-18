import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useGetOwnerWeddingHallsQuery } from '../../features/owner/ownerApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { PlusCircleIcon, EyeIcon, PencilIcon, BuildingOfficeIcon, ChevronLeftIcon, ChevronRightIcon, FunnelIcon } from '@heroicons/react/24/solid';

const OwnerWeddingHallsPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');
    const [statusFilter, setStatusFilter] = useState('');

    const queryParams = { page: currentPage, per_page: 6, sort_by: sortBy, sort_direction: sortDirection };
    if (statusFilter) queryParams.status = statusFilter;

    const { data: hallsResponse, isLoading, error, refetch } = useGetOwnerWeddingHallsQuery(queryParams);

    const debouncedRefetch = useCallback(() => refetch(), [refetch]);
    useEffect(() => {
        debouncedRefetch();
    }, [sortBy, sortDirection, statusFilter, currentPage, debouncedRefetch]);

    const handleSortChange = (e) => {
        const value = e.target.value;
        const [field, direction] = value.split('_');
        setSortBy(field); setSortDirection(direction); setCurrentPage(1);
    };
    const handlePageChange = (newPage) => {
        const meta = hallsResponse?.data?.meta || hallsResponse?.data;
        if (meta && newPage >= 1 && newPage <= meta.last_page) setCurrentPage(newPage);
    };

    const getStatusBadgeClass = (status) => {
        status = status?.toLowerCase();
        if (status === 'approved') return 'bg-green-100 text-green-700';
        if (status === 'pending') return 'bg-yellow-100 text-yellow-700';
        if (status === 'rejected') return 'bg-red-100 text-red-700';
        return 'bg-gray-100 text-gray-700';
    };

    const labelClass = "block text-sm font-medium text-gray-700";
    const inputClass = "mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";

    if (isLoading && !hallsResponse) return <LoadingSpinner message="Loading your halls..." />;
    if (error && !isLoading) return <ErrorMessage message={error.data?.message || "Could not load your wedding halls."} details={error.data?.errors} />;

    const halls = hallsResponse?.data?.data || hallsResponse?.data || [];
    const paginationInfo = hallsResponse?.data?.meta || hallsResponse?.data || {};


    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800">My Wedding Halls</h1>
                <Link
                    to="/owner/wedding-halls/new"
                    className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-colors"
                >
                    <PlusCircleIcon className="h-6 w-6 mr-2" /> Add New Hall
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                    <FunnelIcon className="h-6 w-6 mr-2 text-primary" /> Filters
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="owner-status-filter" className={labelClass}>Filter by Status:</label>
                        <select id="owner-status-filter" className={inputClass} value={statusFilter} onChange={e => {setStatusFilter(e.target.value); setCurrentPage(1);}}>
                            <option value="">All My Halls</option>
                            <option value="pending">Pending Approval</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="owner-sort-by" className={labelClass}>Sort by:</label>
                        <select id="owner-sort-by" className={inputClass} value={`${sortBy}_${sortDirection}`} onChange={handleSortChange}>
                            <option value="created_at_desc">Date Added (Newest)</option>
                            <option value="created_at_asc">Date Added (Oldest)</option>
                            <option value="price_per_seat_asc">Price: Low to High</option>
                            <option value="price_per_seat_desc">Price: High to Low</option>
                            <option value="capacity_asc">Capacity: Low to High</option>
                            <option value="capacity_desc">Capacity: High to Low</option>
                            <option value="name_asc">Name: A-Z</option>
                            <option value="name_desc">Name: Z-A</option>
                        </select>
                    </div>
                </div>
            </div>


            {isLoading && <LoadingSpinner message="Fetching halls..." />}
            {!isLoading && halls.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <BuildingOfficeIcon className="h-20 w-20 mx-auto text-gray-400 mb-4" />
                    <p className="text-xl text-gray-500">You haven't added any wedding halls yet, or none match the current filter.</p>
                    <Link to="/owner/wedding-halls/new" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark">
                        <PlusCircleIcon className="h-5 w-5 mr-2"/> Add Your First Hall
                    </Link>
                </div>
            ) : !isLoading && halls.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {halls.map((hall) => (
                        <div key={hall.id} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1">
                            {hall.images && hall.images.find(img => img.is_primary) ? (
                                <img src={hall.images.find(img => img.is_primary).image_path.startsWith('http') ? hall.images.find(img => img.is_primary).image_path : `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${hall.images.find(img => img.is_primary).image_path}`} alt={hall.name} className="w-full h-56 object-cover"/>
                            ) : hall.images && hall.images.length > 0 ? (
                                <img src={hall.images[0].image_path.startsWith('http') ? hall.images[0].image_path : `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${hall.images[0].image_path}`} alt={hall.name} className="w-full h-56 object-cover"/>
                            ) : (
                                <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
                                    <PhotographIcon className="h-16 w-16 text-gray-400"/>
                                </div>
                            )}
                            <div className="p-6 flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-semibold text-primary-dark leading-tight">{hall.name}</h3>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(hall.status)}`}>
                                        {hall.status || 'N/A'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-1 truncate" title={hall.address || hall.location}>Address: {hall.address || hall.location || 'N/A'}</p>
                                <p className="text-sm text-gray-600 mb-1">District: {hall.district?.name || 'N/A'}</p>
                                <div className="flex justify-between text-sm text-gray-700 mt-3 pt-3 border-t border-gray-100">
                                    <span>Price/Seat: <span className="font-semibold">${hall.price_per_seat}</span></span>
                                    <span>Capacity: <span className="font-semibold">{hall.capacity}</span></span>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 border-t border-gray-200 grid grid-cols-2 gap-3">
                                <Link to={`/owner/wedding-halls/edit/${hall.id}`} className="flex items-center justify-center text-sm font-medium py-2 px-3 rounded-md shadow-sm transition-colors bg-yellow-500 hover:bg-yellow-600 text-white"> <PencilIcon className="h-4 w-4 mr-1.5"/> Edit </Link>
                                <Link to={`/wedding-halls/${hall.id}`} className="flex items-center justify-center text-sm font-medium py-2 px-3 rounded-md shadow-sm transition-colors bg-sky-500 hover:bg-sky-600 text-white"> <EyeIcon className="h-4 w-4 mr-1.5"/> View Public </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!isLoading && halls.length > 0 && paginationInfo.last_page > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-700">
                    <div className="mb-2 sm:mb-0">
                        Showing <span className="font-medium">{paginationInfo.from || 0}</span> to <span className="font-medium">{paginationInfo.to || 0}</span> of <span className="font-medium">{paginationInfo.total || 0}</span> results
                    </div>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => handlePageChange(paginationInfo.current_page - 1)} disabled={paginationInfo.current_page <= 1 || isLoading} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label="Previous Page"> <ChevronLeftIcon className="h-5 w-5" /> </button>
                        {Array.from({ length: paginationInfo.last_page }, (_, i) => i + 1)
                            .filter(pageNumber => pageNumber === 1 || pageNumber === paginationInfo.last_page || (pageNumber >= paginationInfo.current_page - 1 && pageNumber <= paginationInfo.current_page + 1))
                            .map((pageNumber, index, arr) => (
                                <React.Fragment key={pageNumber}>
                                    {index > 0 && pageNumber - arr[index-1] > 1 && <span className="px-2">...</span>}
                                    <button onClick={() => handlePageChange(pageNumber)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${pageNumber === paginationInfo.current_page ? 'bg-primary text-white shadow-sm' : 'hover:bg-gray-100'}`}> {pageNumber} </button>
                                </React.Fragment>
                            ))}
                        <button onClick={() => handlePageChange(paginationInfo.current_page + 1)} disabled={paginationInfo.current_page >= paginationInfo.last_page || isLoading} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label="Next Page"> <ChevronRightIcon className="h-5 w-5" /> </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerWeddingHallsPage;
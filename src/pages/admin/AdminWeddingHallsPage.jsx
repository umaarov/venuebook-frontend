import React, {useCallback, useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {useGetDistrictsQuery, useGetWeddingHallsQuery} from '../../features/weddingHalls/weddingHallApi';
import {
    useAdminApproveWeddingHallMutation,
    useAdminDeleteWeddingHallMutation,
    useAdminRejectWeddingHallMutation
} from '../../features/admin/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import {
    CheckCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    EyeIcon,
    FunnelIcon,
    BuildingOfficeIcon,
    PencilIcon,
    PlusCircleIcon,
    TrashIcon,
    XCircleIcon
} from '@heroicons/react/24/solid';

const AdminWeddingHallsPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');
    const [statusFilter, setStatusFilter] = useState('');
    const [districtFilter, setDistrictFilter] = useState('');

    const {data: districtsData, isLoading: isLoadingDistricts} = useGetDistrictsQuery();

    const queryParams = {
        page: currentPage,
        per_page: 9,
        sort_by: sortBy,
        sort_direction: sortDirection,
    };
    if (statusFilter) queryParams.status = statusFilter;
    if (districtFilter) queryParams.district_id = districtFilter;

    const {
        data: hallsResponse,
        isLoading: isLoadingHalls,
        error: hallsError,
        refetch
    } = useGetWeddingHallsQuery(queryParams);

    const [deleteHall, {isLoading: isDeleting}] = useAdminDeleteWeddingHallMutation();
    const [approveHall, {isLoading: isApproving}] = useAdminApproveWeddingHallMutation();
    const [rejectHall, {isLoading: isRejecting}] = useAdminRejectWeddingHallMutation();

    const debouncedRefetch = useCallback(() => refetch(), [refetch]);

    useEffect(() => {
        debouncedRefetch();
    }, [sortBy, sortDirection, statusFilter, districtFilter, currentPage, debouncedRefetch]);

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            try {
                await deleteHall(id).unwrap();
                alert('Wedding hall deleted by admin.');
                refetch();
            } catch (err) {
                alert(err.data?.message || 'Failed to delete wedding hall.');
            }
        }
    };

    const handleApprove = async (id) => {
        try {
            await approveHall(id).unwrap();
            alert('Wedding hall approved.');
            refetch();
        } catch (err) {
            alert(err.data?.message || 'Failed to approve wedding hall.');
        }
    };

    const handleReject = async (id) => {
        if (window.confirm('Are you sure you want to reject this wedding hall?')) {
            try {
                await rejectHall(id).unwrap();
                alert('Wedding hall rejected.');
                refetch();
            } catch (err) {
                alert(err.data?.message || 'Failed to reject wedding hall.');
            }
        }
    };

    const handleSortChange = (e) => {
        const value = e.target.value;
        const [field, direction] = value.split('_');
        setSortBy(field);
        setSortDirection(direction);
        setCurrentPage(1);
    };
    const handlePageChange = (newPage) => {
        const meta = hallsResponse?.data?.meta || hallsResponse?.data;
        if (meta && newPage >= 1 && newPage <= meta.last_page) setCurrentPage(newPage);
    };

    const inputClass = "mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";
    const labelClass = "block text-sm font-medium text-gray-700";

    const getStatusBadgeClass = (status) => {
        status = status?.toLowerCase();
        if (status === 'approved') return 'bg-green-100 text-green-700';
        if (status === 'pending') return 'bg-yellow-100 text-yellow-700';
        if (status === 'rejected') return 'bg-red-100 text-red-700';
        return 'bg-gray-100 text-gray-700';
    };

    const isLoading = isLoadingHalls || isLoadingDistricts;
    const error = hallsError;

    if (isLoading && !hallsResponse) return <LoadingSpinner message="Loading wedding halls..."/>;
    if (error) return <ErrorMessage message={error.data?.message || "Could not load wedding halls."}
                                    details={error.data?.errors}/>;

    const halls = hallsResponse?.data?.data || [];
    const paginationInfo = hallsResponse?.data?.meta || hallsResponse?.data || {};
    const districts = districtsData?.data || [];

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Manage All Wedding Halls</h1>
                <Link
                    to="/admin/wedding-halls/new"
                    className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                    <PlusCircleIcon className="h-6 w-6 mr-2"/> Add New Hall
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                    <FunnelIcon className="h-6 w-6 mr-2 text-primary"/> Filters
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="admin-district-filter" className={labelClass}>District:</label>
                        <select id="admin-district-filter" className={inputClass} value={districtFilter}
                                onChange={e => {
                                    setDistrictFilter(e.target.value);
                                    setCurrentPage(1);
                                }} disabled={isLoadingDistricts}>
                            <option value="">All Districts</option>
                            {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="admin-status-filter" className={labelClass}>Status:</label>
                        <select id="admin-status-filter" className={inputClass} value={statusFilter} onChange={e => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}>
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="admin-sort-by" className={labelClass}>Sort by:</label>
                        <select id="admin-sort-by" className={inputClass} value={`${sortBy}_${sortDirection}`}
                                onChange={handleSortChange}>
                            <option value="created_at_desc">Newest First</option>
                            <option value="price_per_seat_asc">Price: Low to High</option>
                            <option value="price_per_seat_desc">Price: High to Low</option>
                            <option value="capacity_asc">Capacity: Low to High</option>
                            <option value="capacity_desc">Capacity: High to Low</option>
                            <option value="name_asc">Name: A-Z</option>
                            <option value="name_desc">Name: Z-A</option>
                            <option value="status_asc">Status: A-Z</option>
                        </select>
                    </div>
                </div>
            </div>

            {isLoadingHalls && <LoadingSpinner message="Fetching halls..."/>}
            {!isLoadingHalls && halls.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <BuildingOfficeIcon className="h-20 w-20 mx-auto text-gray-400 mb-4"/>
                    <p className="text-xl text-gray-500">No wedding halls found for the selected criteria.</p>
                </div>
            ) : !isLoadingHalls && halls.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {halls.map((hall) => (
                        <div key={hall.id}
                             className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1">
                            {/* Optional: Add an image here if available: <img src={hall.image_url || "/placeholder-hall.jpg"} alt={hall.name} className="w-full h-48 object-cover"/> */}
                            <div className="p-6 flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-semibold text-primary-dark leading-tight">{hall.name}</h3>
                                    <span
                                        className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(hall.status)}`}>
                                        {hall.status || 'N/A'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mb-1">ID: {hall.id}</p>
                                <p className="text-sm text-gray-600 mb-1">Owner: {hall.owner?.name || 'N/A'} (ID: {hall.owner_id})</p>
                                <p className="text-sm text-gray-600 mb-1 truncate"
                                   title={hall.address || hall.location}>Address: {hall.address || hall.location || 'N/A'}</p>
                                <p className="text-sm text-gray-600 mb-1">District: {hall.district?.name || 'N/A'}</p>
                                <div
                                    className="flex justify-between text-sm text-gray-700 mt-3 pt-3 border-t border-gray-100">
                                    <span>Price/Seat: <span
                                        className="font-semibold">${hall.price_per_seat}</span></span>
                                    <span>Capacity: <span className="font-semibold">{hall.capacity}</span></span>
                                </div>
                            </div>
                            <div
                                className="p-4 bg-gray-50 border-t border-gray-200 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                <Link to={`/wedding-halls/${hall.id}`}
                                      className="action-button bg-sky-500 hover:bg-sky-600 text-white"> <EyeIcon
                                    className="h-4 w-4 mr-1.5"/> View </Link>
                                <Link to={`/admin/wedding-halls/edit/${hall.id}`}
                                      className="action-button bg-yellow-500 hover:bg-yellow-600 text-white">
                                    <PencilIcon className="h-4 w-4 mr-1.5"/> Edit </Link>

                                {hall.status === 'pending' && (
                                    <>
                                        <button onClick={() => handleApprove(hall.id)} disabled={isApproving}
                                                className="action-button bg-green-500 hover:bg-green-600 text-white">
                                            {isApproving ? '...' : <><CheckCircleIcon
                                                className="h-4 w-4 mr-1.5"/> Approve</>}
                                        </button>
                                        <button onClick={() => handleReject(hall.id)} disabled={isRejecting}
                                                className="action-button bg-orange-500 hover:bg-orange-600 text-white">
                                            {isRejecting ? '...' : <><XCircleIcon
                                                className="h-4 w-4 mr-1.5"/> Reject</>}
                                        </button>
                                    </>
                                )}
                                <button onClick={() => handleDelete(hall.id, hall.name)} disabled={isDeleting}
                                        className={`action-button bg-red-600 hover:bg-red-700 text-white ${hall.status === 'pending' ? 'col-span-2 sm:col-span-1' : 'col-span-full sm:col-span-1'}`}>
                                    {isDeleting ? '...' : <><TrashIcon className="h-4 w-4 mr-1.5"/> Delete</>}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {!isLoadingHalls && halls.length > 0 && paginationInfo.last_page > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-700">
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
                            .filter(pageNumber => pageNumber === 1 || pageNumber === paginationInfo.last_page || (pageNumber >= paginationInfo.current_page - 1 && pageNumber <= paginationInfo.current_page + 1))
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

export default AdminWeddingHallsPage;
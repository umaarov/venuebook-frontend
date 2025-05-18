import React, {useCallback, useEffect, useState} from 'react';
import {useAdminCancelReservationMutation, useAdminListAllReservationsQuery} from '../../features/admin/adminApi';
import {useGetDistrictsQuery, useGetWeddingHallsQuery} from '../../features/weddingHalls/weddingHallApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import {format, parseISO} from 'date-fns';
import {ChevronLeftIcon, ChevronRightIcon, FunnelIcon, NoSymbolIcon, XCircleIcon} from '@heroicons/react/24/solid';

const AdminAllReservationsPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('reservation_date');
    const [sortDirection, setSortDirection] = useState('desc');
    const [statusFilter, setStatusFilter] = useState('');
    const [districtFilter, setDistrictFilter] = useState('');
    const [hallFilter, setHallFilter] = useState('');
    const [dateFromFilter, setDateFromFilter] = useState('');
    const [dateToFilter, setDateToFilter] = useState('');

    const queryParams = {
        page: currentPage,
        sort_by: sortBy,
        sort_direction: sortDirection,
        per_page: 15,
    };
    if (statusFilter) queryParams.status = statusFilter;
    if (districtFilter) queryParams.district_id = districtFilter;
    if (hallFilter) queryParams.wedding_hall_id = hallFilter;
    if (dateFromFilter) queryParams.date_from = dateFromFilter;
    if (dateToFilter) queryParams.date_to = dateToFilter;

    const {data: reservationsResponse, isLoading, error, refetch} = useAdminListAllReservationsQuery(queryParams);
    const [cancelReservation, {isLoading: isCancelling}] = useAdminCancelReservationMutation();

    const {data: districtsData} = useGetDistrictsQuery();
    const {data: weddingHallsData} = useGetWeddingHallsQuery({per_page: 1000});

    const debouncedRefetch = useCallback(() => {
        refetch();
    }, [refetch]);

    useEffect(() => {
        debouncedRefetch();
    }, [sortBy, sortDirection, statusFilter, districtFilter, hallFilter, dateFromFilter, dateToFilter, currentPage, debouncedRefetch]);

    const handleCancelReservation = async (id) => {
        if (window.confirm('Are you sure you want to cancel this reservation?')) {
            try {
                await cancelReservation({id}).unwrap();
                alert('Reservation cancelled by admin.'); // Consider a toast notification system
                refetch();
            } catch (err) {
                alert(err.data?.message || 'Failed to cancel reservation.');
            }
        }
    };

    const handleSortChange = (e) => {
        const value = e.target.value;
        if (value) {
            const [field, direction] = value.split('_');
            setSortBy(field);
            setSortDirection(direction);
        } else {
            setSortBy('reservation_date');
            setSortDirection('desc');
        }
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        const meta = reservationsResponse?.data?.meta || reservationsResponse?.data;
        if (meta && newPage >= 1 && newPage <= meta.last_page) {
            setCurrentPage(newPage);
        }
    };

    const clearFilters = () => {
        setDistrictFilter('');
        setHallFilter('');
        setStatusFilter('');
        setDateFromFilter('');
        setDateToFilter('');
        setSortBy('reservation_date');
        setSortDirection('desc');
        setCurrentPage(1);
    };

    const inputClass = "mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";
    const labelClass = "block text-sm font-medium text-gray-700";

    if (isLoading && !reservationsResponse) return <LoadingSpinner message="Loading reservations..."/>;
    if (error) return <ErrorMessage message={error.data?.message || "Could not load reservations."}
                                    details={error.data?.errors}/>;

    const reservations = reservationsResponse?.data?.data || [];
    const paginationInfo = reservationsResponse?.data?.meta || reservationsResponse?.data || {}; // Adapt based on your API response structure
    const districts = districtsData?.data || [];
    const allHalls = weddingHallsData?.data?.data || [];

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
                return 'bg-green-100 text-green-700';
            case 'booked':
                return 'bg-blue-100 text-blue-700';
            case 'cancelled':
                return 'bg-red-100 text-red-700';
            case 'completed':
                return 'bg-indigo-100 text-indigo-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };


    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">All Reservations (Admin)</h1>

            {/* Filters */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                    <FunnelIcon className="h-6 w-6 mr-2 text-primary"/> Filters
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <div>
                        <label htmlFor="admin-res-district-filter" className={labelClass}>District:</label>
                        <select id="admin-res-district-filter" className={inputClass} value={districtFilter}
                                onChange={e => {
                                    setDistrictFilter(e.target.value);
                                    setCurrentPage(1);
                                }}>
                            <option value="">All Districts</option>
                            {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="admin-res-hall-filter" className={labelClass}>Venue:</label>
                        <select id="admin-res-hall-filter" className={inputClass} value={hallFilter} onChange={e => {
                            setHallFilter(e.target.value);
                            setCurrentPage(1);
                        }}>
                            <option value="">All Venues</option>
                            {allHalls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="admin-res-status-filter" className={labelClass}>Status:</label>
                        <select id="admin-res-status-filter" className={inputClass} value={statusFilter}
                                onChange={e => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}>
                            <option value="">All Statuses</option>
                            <option value="booked">Booked</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="admin-res-date-from" className={labelClass}>Date From:</label>
                        <input type="date" id="admin-res-date-from" className={inputClass} value={dateFromFilter}
                               onChange={e => {
                                   setDateFromFilter(e.target.value);
                                   setCurrentPage(1);
                               }}/>
                    </div>
                    <div>
                        <label htmlFor="admin-res-date-to" className={labelClass}>Date To:</label>
                        <input type="date" id="admin-res-date-to" className={inputClass} value={dateToFilter}
                               onChange={e => {
                                   setDateToFilter(e.target.value);
                                   setCurrentPage(1);
                               }}/>
                    </div>
                    <div>
                        <label htmlFor="admin-res-sort-by" className={labelClass}>Sort by:</label>
                        <select id="admin-res-sort-by" className={inputClass} value={`${sortBy}_${sortDirection}`}
                                onChange={handleSortChange}>
                            <option value="reservation_date_desc">Date (Newest First)</option>
                            <option value="reservation_date_asc">Date (Oldest First)</option>
                            <option value="wedding_hall.name_asc">Venue (A-Z)</option>
                            {/* Adjusted for potential nested sorting if API supports */}
                            <option value="wedding_hall.name_desc">Venue (Z-A)</option>
                            <option value="status_asc">Status (A-Z)</option>
                            <option value="status_desc">Status (Z-A)</option>
                            <option value="number_of_guests_desc">Guests (High-Low)</option>
                            <option value="number_of_guests_asc">Guests (Low-High)</option>
                        </select>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2 flex items-end">
                        <button
                            onClick={clearFilters}
                            className="w-full sm:w-auto flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors"
                        >
                            <XCircleIcon className="h-5 w-5 mr-2"/> Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {isLoading && <LoadingSpinner message="Fetching reservations..."/>}
            {!isLoading && reservations.length === 0 ? (
                <div className="text-center py-12">
                    <img src="/no_data.svg" alt="No reservations" className="mx-auto h-40 mb-4"/> {/* Example SVG */}
                    <p className="text-xl text-gray-500">No reservations found for the selected criteria.</p>
                </div>
            ) : !isLoading && reservations.length > 0 && (
                <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue
                                / District
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guests</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booked
                                By User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {reservations.map((res) => (
                            <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{res.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                    <div>{res.wedding_hall?.name || 'N/A'}</div>
                                    <div
                                        className="text-xs text-gray-500">{res.wedding_hall?.district?.name || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{format(parseISO(res.reservation_date), 'MMM d, yyyy')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{res.number_of_guests}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                    <div>{res.customer_name} {res.customer_surname}</div>
                                    <div className="text-xs text-gray-500">{res.customer_phone}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                    <div>{res.user?.username || 'N/A'}</div>
                                    <div className="text-xs text-gray-500">(ID: {res.user_id})</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(res.status)}`}>
                                            {res.status || 'N/A'}
                                        </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {res.status !== 'cancelled' && res.status !== 'completed' && (
                                        <button
                                            onClick={() => handleCancelReservation(res.id)}
                                            disabled={isCancelling}
                                            className="flex items-center text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            title="Cancel Reservation"
                                        >
                                            <NoSymbolIcon
                                                className="h-5 w-5 mr-1"/> {isCancelling ? 'Cancelling...' : 'Cancel'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {!isLoading && reservations.length > 0 && paginationInfo.last_page > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-700">
                    <div className="mb-2 sm:mb-0">
                        Showing <span className="font-medium">{paginationInfo.from || 0}</span> to <span
                        className="font-medium">{paginationInfo.to || 0}</span> of <span
                        className="font-medium">{paginationInfo.total || 0}</span> results
                    </div>
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={() => handlePageChange(paginationInfo.current_page - 1)}
                            disabled={paginationInfo.current_page <= 1 || isLoading}
                            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Previous Page"
                        >
                            <ChevronLeftIcon className="h-5 w-5"/>
                        </button>
                        {Array.from({length: paginationInfo.last_page}, (_, i) => i + 1)
                            .filter(pageNumber =>
                                pageNumber === 1 ||
                                pageNumber === paginationInfo.last_page ||
                                (pageNumber >= paginationInfo.current_page - 2 && pageNumber <= paginationInfo.current_page + 2)
                            )
                            .map((pageNumber, index, arr) => (
                                <React.Fragment key={pageNumber}>
                                    {index > 0 && pageNumber - arr[index - 1] > 1 && <span className="px-2">...</span>}
                                    <button
                                        onClick={() => handlePageChange(pageNumber)}
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                                            ${pageNumber === paginationInfo.current_page
                                            ? 'bg-primary text-white shadow-sm'
                                            : 'hover:bg-gray-100'
                                        }`}
                                    >
                                        {pageNumber}
                                    </button>
                                </React.Fragment>
                            ))}
                        <button
                            onClick={() => handlePageChange(paginationInfo.current_page + 1)}
                            disabled={paginationInfo.current_page >= paginationInfo.last_page || isLoading}
                            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Next Page"
                        >
                            <ChevronRightIcon className="h-5 w-5"/>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAllReservationsPage;
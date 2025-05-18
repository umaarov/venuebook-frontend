import React, {useEffect, useState} from 'react';
import {
    useCancelOwnerReservationMutation,
    useGetOwnerReservationsQuery,
    useGetOwnerWeddingHallsQuery
} from '../../features/owner/ownerApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import {format, parseISO} from 'date-fns';
import {
    BuildingOfficeIcon,
    CalendarIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    FunnelIcon,
    NoSymbolIcon,
    UserCircleIcon
} from '@heroicons/react/24/solid';

const OwnerReservationsPage = () => {
    const [selectedHallIdFilter, setSelectedHallIdFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    // const [statusFilter, setStatusFilter] = useState(''); // Example for status filter

    const {data: ownerHallsResponse, isLoading: isLoadingOwnerHalls} = useGetOwnerWeddingHallsQuery({per_page: 1000});

    const queryParams = {page: currentPage, per_page: 10};
    if (selectedHallIdFilter) queryParams.wedding_hall_id = selectedHallIdFilter;
    // if (statusFilter) queryParams.status = statusFilter;

    const {data: reservationsResponse, isLoading: isLoadingReservations, error, refetch} =
        useGetOwnerReservationsQuery(queryParams);

    const [cancelOwnerReservation, {isLoading: isCancelling}] = useCancelOwnerReservationMutation();

    useEffect(() => {
        refetch();
    }, [selectedHallIdFilter, currentPage, refetch]);


    const handleCancel = async (id) => {
        if (window.confirm('Are you sure you want to cancel this reservation? This may notify the customer.')) {
            try {
                await cancelOwnerReservation(id).unwrap();
                alert('Reservation cancelled successfully.'); // Consider using a toast notification
                refetch();
            } catch (err) {
                alert(err.data?.message || 'Failed to cancel reservation.');
            }
        }
    };

    const handlePageChange = (newPage) => {
        const meta = reservationsResponse?.data?.meta || reservationsResponse?.data;
        if (meta && newPage >= 1 && newPage <= meta.last_page) {
            setCurrentPage(newPage);
        }
    };

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
                return 'bg-green-100 text-green-700';
            case 'booked':
                return 'bg-blue-100 text-blue-700';
            case 'cancelled_by_user':
            case 'cancelled_by_owner':
            case 'cancelled_by_admin':
            case 'cancelled':
                return 'bg-red-100 text-red-700';
            case 'completed':
                return 'bg-indigo-100 text-indigo-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };


    const pageIsLoading = isLoadingOwnerHalls || (isLoadingReservations && !reservationsResponse);

    if (pageIsLoading) return <LoadingSpinner message="Loading reservations..."/>;
    if (error && !isLoadingReservations) return <ErrorMessage
        message={error.data?.message || "Could not load reservations."} details={error.data?.errors}/>;

    const reservations = reservationsResponse?.data?.data || [];
    const paginationInfo = reservationsResponse?.data?.meta || reservationsResponse?.data || {};
    const ownerHalls = ownerHallsResponse?.data?.data || ownerHallsResponse?.data || [];


    const labelClass = "block text-sm font-medium text-gray-700";
    const inputClass = "mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";


    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Reservations for My Halls</h1>

            {/* Filters */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                    <FunnelIcon className="h-6 w-6 mr-2 text-primary"/> Filters
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="owner-hall-filter" className={labelClass}>Filter by My Wedding Hall:</label>
                        <select
                            id="owner-hall-filter"
                            className={inputClass}
                            value={selectedHallIdFilter}
                            onChange={(e) => {
                                setSelectedHallIdFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            disabled={isLoadingOwnerHalls || ownerHalls.length === 0}
                        >
                            <option value="">All My Halls</option>
                            {ownerHalls.map(hall => (
                                <option key={hall.id} value={hall.id}>{hall.name}</option>
                            ))}
                        </select>
                    </div>
                    {/*
                    <div>
                        <label htmlFor="owner-status-filter" className={labelClass}>Filter by Status:</label>
                        <select id="owner-status-filter" className={inputClass} value={statusFilter} onChange={(e) => {setStatusFilter(e.target.value); setCurrentPage(1);}}>
                            <option value="">All Statuses</option>
                            <option value="booked">Booked</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled_by_owner">Cancelled by Me</option>
                            <option value="cancelled_by_user">Cancelled by User</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    */}
                </div>
            </div>

            {isLoadingReservations && <LoadingSpinner message="Fetching reservations..."/>}
            {!isLoadingReservations && reservations.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <CalendarIcon className="h-20 w-20 mx-auto text-gray-400 mb-4"/>
                    <p className="text-xl text-gray-500">No reservations found for the selected criteria.</p>
                    {ownerHalls.length === 0 && !selectedHallIdFilter &&
                        <p className="text-sm text-gray-400 mt-2">You don't have any halls listed yet.</p>}
                </div>
            ) : !isLoadingReservations && reservations.length > 0 && (
                <div className="space-y-6">
                    {reservations.map((res) => (
                        <div key={res.id}
                             className="bg-white rounded-xl shadow-lg overflow-hidden transition-shadow hover:shadow-2xl">
                            <div className="p-6 space-y-3">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                                    <h3 className="text-xl font-semibold text-primary-dark flex items-center">
                                        <BuildingOfficeIcon className="h-6 w-6 mr-2 opacity-70"/>
                                        {res.wedding_hall?.name || 'N/A'}
                                    </h3>
                                    <span
                                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(res.status)}`}>
                                        {res.status?.replace(/_/g, ' ') || 'N/A'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                    <p className="text-gray-700"><strong className="font-medium text-gray-500">Booked
                                        On:</strong> {format(parseISO(res.created_at), 'MMM d, yyyy')}</p>
                                    <p className="text-gray-700"><strong className="font-medium text-gray-500">Reservation
                                        Date:</strong> {format(parseISO(res.reservation_date), 'EEEE, MMM d, yyyy')}</p>
                                    <p className="text-gray-700"><strong
                                        className="font-medium text-gray-500">Guests:</strong> {res.number_of_guests}
                                    </p>
                                    <p className="text-gray-700"><strong className="font-medium text-gray-500">Total
                                        Price:</strong> ${res.total_price?.toLocaleString() || 'N/A'}</p>
                                    <div className="md:col-span-2 pt-2 mt-2 border-t border-gray-100">
                                        <p className="text-gray-700 font-semibold mb-1 flex items-center">
                                            <UserCircleIcon className="h-5 w-5 mr-1.5 text-gray-400"/>Customer Details:
                                        </p>
                                        <p className="text-gray-600 ml-1">Name: {res.customer_name} {res.customer_surname}</p>
                                        <p className="text-gray-600 ml-1">Phone: {res.customer_phone}</p>
                                        {res.user &&
                                            <p className="text-gray-600 ml-1">Booker Email: {res.user.email}</p>}
                                    </div>
                                </div>
                            </div>
                            {(res.status !== 'cancelled' && res.status !== 'completed' && !res.status?.startsWith('cancelled')) && (
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                                    <button
                                        onClick={() => handleCancel(res.id)}
                                        disabled={isCancelling}
                                        className="flex items-center text-sm bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-colors disabled:opacity-60"
                                    >
                                        <NoSymbolIcon className="h-5 w-5 mr-1.5"/>
                                        {isCancelling ? 'Cancelling...' : 'Cancel This Reservation'}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!isLoadingReservations && reservations.length > 0 && paginationInfo.last_page > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-700">
                    <div className="mb-2 sm:mb-0">
                        Showing <span className="font-medium">{paginationInfo.from || 0}</span> to <span
                        className="font-medium">{paginationInfo.to || 0}</span> of <span
                        className="font-medium">{paginationInfo.total || 0}</span> results
                    </div>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => handlePageChange(paginationInfo.current_page - 1)}
                                disabled={paginationInfo.current_page <= 1 || isLoadingReservations}
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
                                disabled={paginationInfo.current_page >= paginationInfo.last_page || isLoadingReservations}
                                className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                aria-label="Next Page"><ChevronRightIcon className="h-5 w-5"/></button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerReservationsPage;
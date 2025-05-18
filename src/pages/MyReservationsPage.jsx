import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {useCancelReservationMutation, useGetMyReservationsQuery} from '../features/reservations/reservationApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {format, parseISO} from 'date-fns';
import {
    BanknotesIcon,
    BuildingOfficeIcon,
    CalendarIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ClockIcon,
    NoSymbolIcon,
    UsersIcon
} from '@heroicons/react/24/solid';

const MyReservationsPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const {data: reservationsResponse, isLoading, error, refetch} = useGetMyReservationsQuery({
        page: currentPage,
        per_page: 5
    });
    const [cancelReservation, {isLoading: isCancelling}] = useCancelReservationMutation();

    useEffect(() => {
        refetch();
    }, [currentPage, refetch]);

    const handleCancel = async (id) => {
        if (window.confirm('Are you sure you want to cancel this reservation?')) {
            try {
                await cancelReservation(id).unwrap();
                alert('Reservation cancelled successfully.');
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


    if (isLoading && !reservationsResponse) return <LoadingSpinner message="Loading your reservations..."/>;
    if (error && !isLoading) return <ErrorMessage message={error.data?.message || "Could not load your reservations."}
                                                  details={error.data?.errors}/>;

    const reservations = reservationsResponse?.data?.data || [];
    const paginationInfo = reservationsResponse?.data?.meta || reservationsResponse?.data || {};

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center sm:text-left">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">My Reservations</h1>
                <p className="mt-2 text-lg text-gray-500">
                    Here are all the bookings you've made. You can view details or cancel upcoming reservations.
                </p>
            </div>

            {isLoading && <LoadingSpinner message="Fetching reservations..."/>}
            {!isLoading && reservations.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <CalendarIcon className="h-20 w-20 mx-auto text-gray-400 mb-4"/>
                    <p className="text-xl text-gray-500">You have no reservations yet.</p>
                    <Link to="/wedding-halls"
                          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark">
                        Find a Venue
                    </Link>
                </div>
            ) : !isLoading && reservations.length > 0 && (
                <div className="space-y-6">
                    {reservations.map((res) => (
                        <div key={res.id}
                             className="bg-white rounded-xl shadow-lg overflow-hidden transition-shadow hover:shadow-xl">
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                    <p className="text-gray-700 flex items-center"><CalendarIcon
                                        className="h-4 w-4 mr-1.5 text-gray-400"/><strong>Date:</strong> <span
                                        className="ml-1">{format(parseISO(res.reservation_date), 'EEEE, MMM d, yyyy')}</span>
                                    </p>
                                    <p className="text-gray-700 flex items-center"><UsersIcon
                                        className="h-4 w-4 mr-1.5 text-gray-400"/><strong>Guests:</strong> <span
                                        className="ml-1">{res.number_of_guests}</span></p>
                                    {(res.start_time || res.end_time) &&
                                        <p className="text-gray-700 sm:col-span-2 flex items-center"><ClockIcon
                                            className="h-4 w-4 mr-1.5 text-gray-400"/><strong>Time:</strong> <span
                                            className="ml-1">{res.start_time ? format(parseISO(`2000-01-01T${res.start_time}`), 'p') : 'N/A'} - {res.end_time ? format(parseISO(`2000-01-01T${res.end_time}`), 'p') : 'N/A'}</span>
                                        </p>
                                    }
                                    <p className="text-gray-700 sm:col-span-2 flex items-center"><BanknotesIcon
                                        className="h-4 w-4 mr-1.5 text-gray-400"/><strong>Total Price:</strong> <span
                                        className="ml-1">${res.total_price?.toLocaleString() || 'N/A'}</span></p>
                                </div>
                            </div>
                            {/* Action Button */}
                            {res.status !== 'cancelled' && res.status !== 'completed' && !res.status?.startsWith('cancelled') && (
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                                    <button
                                        onClick={() => handleCancel(res.id)}
                                        disabled={isCancelling}
                                        className="flex items-center text-sm bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-colors disabled:opacity-60"
                                    >
                                        <NoSymbolIcon className="h-5 w-5 mr-1.5"/>
                                        {isCancelling ? 'Cancelling...' : 'Cancel Reservation'}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
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
                        <button onClick={() => handlePageChange(paginationInfo.current_page - 1)}
                                disabled={paginationInfo.current_page <= 1 || isLoading}
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
                                disabled={paginationInfo.current_page >= paginationInfo.last_page || isLoading}
                                className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                aria-label="Next Page"><ChevronRightIcon className="h-5 w-5"/></button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyReservationsPage;
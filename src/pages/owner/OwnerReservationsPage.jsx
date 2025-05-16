import React, {useState} from 'react';
import {
    useGetOwnerReservationsQuery,
    useCancelOwnerReservationMutation,
    useGetOwnerWeddingHallsQuery
} from '../../features/owner/ownerApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const OwnerReservationsPage = () => {
    const [selectedHallIdFilter, setSelectedHallIdFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const {data: ownerHallsResponse, isLoading: isLoadingOwnerHalls} = useGetOwnerWeddingHallsQuery();

    const queryParams = {page: currentPage};
    if (selectedHallIdFilter) {
        queryParams.wedding_hall_id = selectedHallIdFilter;
    }
    // if (selectedStatusFilter) queryParams.status = selectedStatusFilter;

    const {data: reservationsResponse, isLoading: isLoadingReservations, error, refetch} =
        useGetOwnerReservationsQuery(queryParams);

    const [cancelOwnerReservation, {isLoading: isCancelling}] = useCancelOwnerReservationMutation();

    const handleCancel = async (id) => {
        if (window.confirm('Are you sure you want to cancel this reservation?')) {
            try {
                await cancelOwnerReservation(id).unwrap();
                alert('Reservation cancelled by owner.');
                refetch();
            } catch (err) {
                alert(err.data?.message || 'Failed to cancel reservation.');
                console.error(err);
            }
        }
    };

    const handlePageChange = (newPage) => {
        if (reservationsResponse?.data?.meta) {
            const {last_page} = reservationsResponse.data.meta;
            if (newPage >= 1 && newPage <= last_page) {
                setCurrentPage(newPage);
            }
        } else if (reservationsResponse?.data?.last_page) {
            if (newPage >= 1 && newPage <= reservationsResponse.data.last_page) {
                setCurrentPage(newPage);
            }
        }
    };


    const isLoading = isLoadingOwnerHalls || isLoadingReservations;

    if (isLoading) return <LoadingSpinner/>;
    if (error) return <ErrorMessage message={error.data?.message || "Could not load reservations."}/>;

    const reservations = reservationsResponse?.data?.data || [];
    const paginationInfo = reservationsResponse?.data || {};
    const ownerHalls = ownerHallsResponse?.data || [];

    return (
        <div className="container">
            <h2>Reservations for My Halls</h2>

            <div>
                <label htmlFor="owner-hall-filter">Filter by My Wedding Hall: </label>
                <select
                    id="owner-hall-filter"
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

            {reservations.length === 0 && !isLoadingReservations ? (
                <p>No reservations found for the selected criteria.</p>
            ) : (
                <>
                    <ul className="item-list">
                        {reservations.map((reservation) => (
                            <li key={reservation.id}>
                                <p><strong>Hall:</strong> {reservation.wedding_hall?.name || 'N/A'}</p>
                                <p>
                                    <strong>User:</strong> {reservation.user?.name || 'N/A'} ({reservation.user?.email || 'N/A'})
                                </p>
                                <p><strong>Booked On:</strong> {new Date(reservation.created_at).toLocaleDateString()}
                                </p>
                                <p><strong>Reservation
                                    Date:</strong> {new Date(reservation.reservation_date).toLocaleDateString()}</p>
                                {/* <p><strong>Time:</strong> {reservation.start_time || 'N/A'} - {reservation.end_time || 'N/A'}</p> */}
                                <p><strong>Guests:</strong> {reservation.number_of_guests}</p>
                                <p>
                                    <strong>Customer:</strong> {reservation.customer_name} {reservation.customer_surname} ({reservation.customer_phone})
                                </p>
                                <p><strong>Total Price:</strong> ${reservation.total_price}</p>
                                <p><strong>Status:</strong> {reservation.status}</p>
                                {reservation.status !== 'cancelled' && reservation.status !== 'completed' && ( // Example condition
                                    <button onClick={() => handleCancel(reservation.id)} disabled={isCancelling}
                                            className="danger">
                                        {isCancelling ? 'Cancelling...' : 'Cancel This Reservation'}
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                    {reservations.length > 0 && paginationInfo.last_page > 1 && (
                        <div style={{marginTop: '20px', textAlign: 'center'}}>
                            <button onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={!paginationInfo.prev_page_url || isLoadingReservations}>
                                Previous
                            </button>
                            <span style={{margin: '0 10px'}}>
                Page {paginationInfo.current_page || 1} of {paginationInfo.last_page || 1}
              </span>
                            <button onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={!paginationInfo.next_page_url || isLoadingReservations}>
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default OwnerReservationsPage;
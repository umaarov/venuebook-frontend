import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {useGetMyReservationsQuery, useCancelReservationMutation} from '../features/reservations/reservationApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const MyReservationsPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const {data: reservationsResponse, isLoading, error, refetch} = useGetMyReservationsQuery();
    const [cancelReservation, {isLoading: isCancelling}] = useCancelReservationMutation(); // Updated hook

    const handleCancel = async (id) => {
        if (window.confirm('Are you sure you want to cancel this reservation?')) {
            try {
                await cancelReservation(id).unwrap();
                alert('Reservation cancelled successfully.');
                refetch();
            } catch (err) {
                alert(err.data?.message || 'Failed to cancel reservation.');
                console.error(err);
            }
        }
    };

    if (isLoading) return <LoadingSpinner/>;
    if (error) return <ErrorMessage message={error.data?.message || "Could not load your reservations."}/>;

    const reservations = reservationsResponse?.data?.data || [];
    const paginationInfo = reservationsResponse?.data || {};

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= (paginationInfo.last_page || 1)) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="container">
            <h2>My Reservations</h2>
            {reservations.length === 0 && !isLoading ? (
                <p>You have no reservations.</p>
            ) : (
                <>
                    <ul className="item-list">
                        {reservations.map((reservation) => (
                            <li key={reservation.id}>
                                <p><strong>Hall:</strong> {reservation.wedding_hall?.name || 'N/A'}</p>
                                <p><strong>Date:</strong> {new Date(reservation.reservation_date).toLocaleDateString()}
                                </p>
                                <p><strong>Start Time:</strong> {reservation.start_time || 'N/A'}</p>
                                <p><strong>End Time:</strong> {reservation.end_time || 'N/A'}</p>
                                <p><strong>Guests:</strong> {reservation.number_of_guests}</p>
                                <p><strong>Total Price:</strong> ${reservation.total_price}</p>
                                <p><strong>Status:</strong> {reservation.status}</p>
                                {reservation.status !== 'cancelled' && reservation.status !== 'completed' && ( // Example condition
                                    <button onClick={() => handleCancel(reservation.id)} disabled={isCancelling}
                                            className="danger">
                                        {isCancelling ? 'Cancelling...' : 'Cancel Reservation'}
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                    {/* Pagination Controls */}
                    {reservations.length > 0 && paginationInfo.last_page > 1 && (
                        <div style={{marginTop: '20px', textAlign: 'center'}}>
                            <button onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={!paginationInfo.prev_page_url || isLoading}>
                                Previous
                            </button>
                            <span style={{margin: '0 10px'}}>
                Page {paginationInfo.current_page || 1} of {paginationInfo.last_page || 1}
              </span>
                            <button onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={!paginationInfo.next_page_url || isLoading}>
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MyReservationsPage;
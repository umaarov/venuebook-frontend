import React from 'react';
import { Link } from 'react-router-dom';
import { useGetMyReservationsQuery, useCancelReservationMutation } from '../features/reservations/reservationApi'; // Updated hook
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const MyReservationsPage = () => {
    const { data: reservationsResponse, isLoading, error, refetch } = useGetMyReservationsQuery();
    const [cancelReservation, { isLoading: isCancelling }] = useCancelReservationMutation(); // Updated hook

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

    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error.data?.message || "Could not load your reservations."} />;

    const reservations = reservationsResponse?.data || []; // Actual array is in .data

    return (
        <div className="container">
            <h2>My Reservations</h2>
            {reservations.length === 0 ? (
                <p>You have no reservations.</p>
            ) : (
                <ul className="item-list">
                    {reservations.map((reservation) => (
                        <li key={reservation.id}>
                            <p><strong>Hall:</strong> {reservation.wedding_hall?.name || 'N/A'}</p>
                            <p><strong>Date:</strong> {new Date(reservation.reservation_date).toLocaleDateString()}</p>
                            <p><strong>Start Time:</strong> {reservation.start_time}</p>
                            <p><strong>End Time:</strong> {reservation.end_time}</p>
                            <p><strong>Total Price:</strong> ${reservation.total_price}</p>
                            <p><strong>Status:</strong> {reservation.status}</p>
                            {reservation.status !== 'cancelled' && reservation.status !== 'completed' && ( // Example condition
                                <button onClick={() => handleCancel(reservation.id)} disabled={isCancelling} className="danger">
                                    {isCancelling ? 'Cancelling...' : 'Cancel Reservation'}
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MyReservationsPage;
import React from 'react';
import {Link} from 'react-router-dom';
import {useGetMyReservationsQuery, useDeleteReservationMutation} from '../features/reservations/reservationApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const MyReservationsPage = () => {
    const {data: reservationsData, isLoading, error, refetch} = useGetMyReservationsQuery();
    const [deleteReservation, {isLoading: isDeleting}] = useDeleteReservationMutation();

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to cancel this reservation?')) {
            try {
                await deleteReservation(id).unwrap();
                alert('Reservation cancelled.');
                refetch(); // Or rely on tag invalidation
            } catch (err) {
                alert('Failed to cancel reservation.');
                console.error(err);
            }
        }
    };

    if (isLoading) return <LoadingSpinner/>;
    if (error) return <ErrorMessage message="Could not load your reservations."/>;

    const reservations = reservationsData?.data || [];

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
                            {/* Add link to update reservation if feature exists */}
                            {/* <Link to={`/reservations/edit/${reservation.id}`}>Edit</Link> */}
                            <button onClick={() => handleDelete(reservation.id)} disabled={isDeleting}
                                    className="danger">
                                {isDeleting ? 'Cancelling...' : 'Cancel Reservation'}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MyReservationsPage;
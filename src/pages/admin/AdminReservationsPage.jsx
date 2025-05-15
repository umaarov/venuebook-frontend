import React from 'react';
import {useAdminGetAllReservationsQuery, useAdminDeleteReservationMutation} from '../../features/admin/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AdminReservationsPage = () => {
    const {data: reservationsData, isLoading, error, refetch} = useAdminGetAllReservationsQuery();
    const [deleteReservation, {isLoading: isDeleting}] = useAdminDeleteReservationMutation();

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this reservation?')) {
            try {
                await deleteReservation(id).unwrap();
                alert('Reservation deleted.');
                // refetch(); // Tag invalidation
            } catch (err) {
                alert('Failed to delete reservation.');
            }
        }
    };

    if (isLoading) return <LoadingSpinner/>;
    if (error) return <ErrorMessage message="Could not load reservations."/>;

    const reservations = reservationsData?.data || [];

    return (
        <div className="container">
            <h2>Manage All Reservations (Admin)</h2>
            {reservations.length === 0 ? (
                <p>No reservations found in the system.</p>
            ) : (
                <ul className="item-list">
                    {reservations.map((res) => (
                        <li key={res.id}>
                            <p><strong>Reservation ID:</strong> {res.id}</p>
                            <p><strong>Hall:</strong> {res.wedding_hall?.name || 'N/A'} (ID: {res.wedding_hall_id})</p>
                            <p><strong>User:</strong> {res.user?.name || 'N/A'} (ID: {res.user_id})</p>
                            <p><strong>Date:</strong> {new Date(res.reservation_date).toLocaleDateString()}</p>
                            <p><strong>Time:</strong> {res.start_time} - {res.end_time}</p>
                            <p><strong>Status:</strong> {res.status}</p>
                            <button onClick={() => handleDelete(res.id)} disabled={isDeleting} className="danger">
                                {isDeleting ? 'Deleting...' : 'Delete Reservation'}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AdminReservationsPage;
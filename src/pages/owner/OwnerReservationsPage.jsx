import React, { useState } from 'react';
import { useGetOwnerReservationsQuery, useCancelOwnerReservationMutation, useGetOwnerWeddingHallsQuery } from '../../features/owner/ownerApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const OwnerReservationsPage = () => {
    const [selectedHallIdFilter, setSelectedHallIdFilter] = useState('');

    const { data: ownerHallsResponse, isLoading: isLoadingOwnerHalls } = useGetOwnerWeddingHallsQuery();
    const { data: reservationsResponse, isLoading: isLoadingReservations, error, refetch } =
        useGetOwnerReservationsQuery(selectedHallIdFilter ? { wedding_hall_id: selectedHallIdFilter } : undefined);

    const [cancelOwnerReservation, { isLoading: isCancelling }] = useCancelOwnerReservationMutation();

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

    const isLoading = isLoadingOwnerHalls || isLoadingReservations;

    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error.data?.message || "Could not load reservations."} />;

    const reservations = reservationsResponse?.data || []; // Actual array is in .data
    const ownerHalls = ownerHallsResponse?.data || [];

    return (
        <div className="container">
            <h2>Reservations for My Halls</h2>

            <div>
                <label htmlFor="owner-hall-filter">Filter by My Wedding Hall: </label>
                <select
                    id="owner-hall-filter"
                    value={selectedHallIdFilter}
                    onChange={(e) => setSelectedHallIdFilter(e.target.value)}
                >
                    <option value="">All My Halls</option>
                    {ownerHalls.map(hall => (
                        <option key={hall.id} value={hall.id}>{hall.name}</option>
                    ))}
                </select>
            </div>

            {reservations.length === 0 ? (
                <p>No reservations found for the selected criteria.</p>
            ) : (
                <ul className="item-list">
                    {reservations.map((reservation) => (
                        <li key={reservation.id}>
                            <p><strong>Hall:</strong> {reservation.wedding_hall?.name || 'N/A'}</p>
                            <p><strong>User:</strong> {reservation.user?.name || 'N/A'} ({reservation.user?.email || 'N/A'})</p>
                            <p><strong>Date:</strong> {new Date(reservation.reservation_date).toLocaleDateString()}</p>
                            <p><strong>Time:</strong> {reservation.start_time} - {reservation.end_time}</p>
                            <p><strong>Total Price:</strong> ${reservation.total_price}</p>
                            <p><strong>Status:</strong> {reservation.status}</p>
                            {reservation.status !== 'cancelled' && reservation.status !== 'completed' && (
                                <button onClick={() => handleCancel(reservation.id)} disabled={isCancelling} className="danger">
                                    {isCancelling ? 'Cancelling...' : 'Cancel This Reservation'}
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default OwnerReservationsPage;
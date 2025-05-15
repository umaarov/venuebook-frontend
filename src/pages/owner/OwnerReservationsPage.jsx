import React, {useState} from 'react';
import {useGetOwnerReservationsQuery} from '../../features/owner/ownerApi';
import {useGetOwnerWeddingHallsQuery} from '../../features/owner/ownerApi'; // To filter by hall
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const OwnerReservationsPage = () => {
    const [selectedHallId, setSelectedHallId] = useState(''); // For filtering

    const {data: hallsData, isLoading: isLoadingHalls} = useGetOwnerWeddingHallsQuery();
    const {
        data: reservationsData,
        isLoading: isLoadingReservations,
        error
    } = useGetOwnerReservationsQuery(selectedHallId || undefined); // Pass hallId if selected

    const isLoading = isLoadingHalls || isLoadingReservations;

    if (isLoading) return <LoadingSpinner/>;
    if (error) return <ErrorMessage message="Could not load reservations."/>;

    const reservations = reservationsData?.data || [];
    const ownerHalls = hallsData?.data || [];

    return (
        <div className="container">
            <h2>Reservations for My Halls</h2>

            <div>
                <label htmlFor="hall-filter">Filter by Wedding Hall: </label>
                <select
                    id="hall-filter"
                    value={selectedHallId}
                    onChange={(e) => setSelectedHallId(e.target.value)}
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
                            <p>
                                <strong>User:</strong> {reservation.user?.name || 'N/A'} ({reservation.user?.email || 'N/A'})
                            </p>
                            <p><strong>Date:</strong> {new Date(reservation.reservation_date).toLocaleDateString()}</p>
                            <p><strong>Time:</strong> {reservation.start_time} - {reservation.end_time}</p>
                            <p><strong>Total Price:</strong> ${reservation.total_price}</p>
                            <p><strong>Status:</strong> {reservation.status}</p>
                            {/* Owners might need to confirm/cancel reservations - add buttons/logic if backend supports */}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default OwnerReservationsPage;

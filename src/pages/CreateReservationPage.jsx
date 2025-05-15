import React, {useState, useEffect} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import {useCreateReservationMutation} from '../features/reservations/reservationApi';
import {useGetWeddingHallsQuery} from '../features/weddingHalls/weddingHallApi'; // To select a hall if not pre-selected
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const CreateReservationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const preSelectedHallId = queryParams.get('hall_id');
    const preSelectedHallName = queryParams.get('hall_name');

    const [weddingHallId, setWeddingHallId] = useState(preSelectedHallId || '');
    const [reservationDate, setReservationDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    // total_price is usually calculated by backend based on hall's price_per_hour and duration

    const [createReservation, {isLoading, error}] = useCreateReservationMutation();
    const {data: hallsData, isLoading: isLoadingHalls, error: hallsError} = useGetWeddingHallsQuery(undefined, {
        skip: !!preSelectedHallId, // Skip if a hall is pre-selected via query param
    });

    useEffect(() => {
        if (preSelectedHallId) {
            setWeddingHallId(preSelectedHallId);
        }
    }, [preSelectedHallId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!weddingHallId || !reservationDate || !startTime || !endTime) {
            alert("Please fill all required fields.");
            return;
        }
        try {
            await createReservation({
                wedding_hall_id: weddingHallId,
                reservation_date: reservationDate,
                start_time: startTime,
                end_time: endTime,
            }).unwrap();
            alert('Reservation created successfully!');
            navigate('/my-reservations');
        } catch (err) {
            console.error('Failed to create reservation:', err);
            // Error message will be shown by ErrorMessage component
        }
    };

    if (isLoading || isLoadingHalls) return <LoadingSpinner/>;

    const weddingHalls = hallsData?.data || [];

    return (
        <div className="container">
            <h2>Create Reservation {preSelectedHallName ? `for ${preSelectedHallName}` : ''}</h2>
            {error && <ErrorMessage message={error.data?.message || 'Failed to create reservation.'}
                                    details={error.data?.errors}/>}
            {hallsError && !preSelectedHallId && <ErrorMessage message="Could not load wedding halls list."/>}

            <form onSubmit={handleSubmit}>
                {!preSelectedHallId && (
                    <div>
                        <label htmlFor="weddingHallId">Wedding Hall:</label>
                        <select
                            id="weddingHallId"
                            value={weddingHallId}
                            onChange={(e) => setWeddingHallId(e.target.value)}
                            required
                        >
                            <option value="">Select a Hall</option>
                            {weddingHalls.map(hall => (
                                <option key={hall.id} value={hall.id}>{hall.name} (${hall.price_per_hour}/hr)</option>
                            ))}
                        </select>
                    </div>
                )}
                {preSelectedHallId && (
                    <div>
                        <p><strong>Selected Hall:</strong> {preSelectedHallName}</p>
                        <input type="hidden" value={weddingHallId}/>
                    </div>
                )}
                <div>
                    <label htmlFor="reservationDate">Reservation Date:</label>
                    <input
                        type="date"
                        id="reservationDate"
                        value={reservationDate}
                        onChange={(e) => setReservationDate(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="startTime">Start Time (e.g., 14:00):</label>
                    <input
                        type="time" // HH:MM format
                        id="startTime"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="endTime">End Time (e.g., 18:00):</label>
                    <input
                        type="time" // HH:MM format
                        id="endTime"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Reservation'}
                </button>
            </form>
        </div>
    );
};

export default CreateReservationPage;
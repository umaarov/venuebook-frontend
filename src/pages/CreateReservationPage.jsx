// File: src/pages/CreateReservationPage.jsx
// Description: Page for creating a new reservation. (CORRECTED with all required fields)
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCreateReservationMutation } from '../features/reservations/reservationApi';
import { useGetWeddingHallsQuery } from '../features/weddingHalls/weddingHallApi';
import { useAppSelector } from '../app/hooks'; // To get current user details
import { selectCurrentUser } from '../features/auth/authSlice'; // To get current user details
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const CreateReservationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const preSelectedHallId = queryParams.get('hall_id');
    const preSelectedHallName = queryParams.get('hall_name');
    const currentUser = useAppSelector(selectCurrentUser); // Get current user

    const [weddingHallId, setWeddingHallId] = useState(preSelectedHallId || '');
    const [reservationDate, setReservationDate] = useState('');
    const [startTime, setStartTime] = useState(''); // Not in ReservationRequest, but likely used by backend service
    const [endTime, setEndTime] = useState('');   // Not in ReservationRequest, but likely used by backend service

    // Fields from ReservationRequest.php
    const [numberOfGuests, setNumberOfGuests] = useState('');
    const [customerName, setCustomerName] = useState(currentUser?.name || ''); // Pre-fill if available
    const [customerSurname, setCustomerSurname] = useState(currentUser?.surname || ''); // Pre-fill if available (assuming surname exists on user model)
    const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || ''); // Pre-fill if available

    const [createReservation, { isLoading, error }] = useCreateReservationMutation();
    const { data: hallsResponse, isLoading: isLoadingHalls, error: hallsError } = useGetWeddingHallsQuery(
        { page: 1, per_page: 100, status: 'approved' }, // Fetch approved halls for selection
        { skip: !!preSelectedHallId }
    );

    useEffect(() => {
        if (preSelectedHallId) {
            setWeddingHallId(preSelectedHallId);
        }
    }, [preSelectedHallId]);

    useEffect(() => { // Pre-fill customer details if user changes
        if (currentUser) {
            if (!customerName) setCustomerName(currentUser.name || '');
            // Assuming 'surname' might not be on your User model directly, adjust if needed
            if (!customerSurname) setCustomerSurname(currentUser.surname || (currentUser.name ? currentUser.name.split(' ').slice(1).join(' ') : '') ); // Basic attempt for surname
            if (!customerPhone) setCustomerPhone(currentUser.phone || '');
        }
    }, [currentUser, customerName, customerSurname, customerPhone ]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        // Ensure all fields required by ReservationRequest.php are included
        if (!weddingHallId || !reservationDate || !numberOfGuests || !customerName || !customerSurname || !customerPhone /* || !startTime || !endTime */ ) {
            // Note: startTime and endTime are not in your ReservationRequest.php rules but might be needed by your ReservationService.
            // If they are not needed by the backend for validation, remove them from this check.
            // For now, assuming your backend service might still use them implicitly.
            alert("Please fill all required fields.");
            return;
        }
        try {
            const payload = {
                wedding_hall_id: weddingHallId,
                reservation_date: reservationDate,
                number_of_guests: parseInt(numberOfGuests, 10),
                customer_name: customerName,
                customer_surname: customerSurname,
                customer_phone: customerPhone,
                // Include start_time and end_time if your backend service uses them,
                // even if not in ReservationRequest's validation rules directly.
                // start_time: startTime,
                // end_time: endTime,
            };
            // Your ReservationRequest.php does not list start_time and end_time as rules.
            // If your backend service *does* need them, they should be added to ReservationRequest.php or handled carefully.
            // For now, I'll assume they are not strictly validated but might be used by the service.
            // If ReservationService DOES NOT use start/end time, you can remove them from the payload.
            // Let's assume your service *does* need them for now:
            if (startTime) payload.start_time = startTime;
            if (endTime) payload.end_time = endTime;


            await createReservation(payload).unwrap();
            alert('Reservation created successfully!');
            navigate('/my-reservations');
        } catch (err) {
            // ErrorMessage component will display details from err.data.errors
            console.error('Failed to create reservation:', err);
        }
    };

    if (isLoading || (isLoadingHalls && !preSelectedHallId)) return <LoadingSpinner />;

    const weddingHallsForDropdown = hallsResponse?.data?.data || [];

    return (
        <div className="container">
            <h2>Create Reservation {preSelectedHallName ? `for ${preSelectedHallName}` : ''}</h2>
            {error && <ErrorMessage message={error.data?.message || 'Failed to create reservation.'} details={error.data?.errors} />}
            {hallsError && !preSelectedHallId && <ErrorMessage message={hallsError.data?.message || "Could not load wedding halls list."} />}

            <form onSubmit={handleSubmit}>
                {!preSelectedHallId && (
                    <div>
                        <label htmlFor="cr-weddingHallId">Wedding Hall:</label>
                        <select
                            id="cr-weddingHallId"
                            value={weddingHallId}
                            onChange={(e) => setWeddingHallId(e.target.value)}
                            required
                        >
                            <option value="">Select an approved Hall</option>
                            {weddingHallsForDropdown.map(hall => (
                                <option key={hall.id} value={hall.id}>{hall.name} (${hall.price_per_seat}/seat)</option>
                            ))}
                        </select>
                    </div>
                )}
                {preSelectedHallId && (
                    <div>
                        <p><strong>Selected Hall:</strong> {preSelectedHallName}</p>
                        <input type="hidden" value={weddingHallId} readOnly/>
                    </div>
                )}
                <div>
                    <label htmlFor="cr-reservationDate">Reservation Date:</label>
                    <input
                        type="date"
                        id="cr-reservationDate"
                        value={reservationDate}
                        min={new Date().toISOString().split("T")[0]} // Prevent past dates
                        onChange={(e) => setReservationDate(e.target.value)}
                        required
                    />
                </div>
                {/* start_time and end_time are not in your ReservationRequest.php rules.
            If your backend ReservationService doesn't actually use them, you can remove these fields.
            If it does, they should ideally be part of the ReservationRequest validation.
            For now, keeping them as optional inputs if your service expects them.
        */}
                <div>
                    <label htmlFor="cr-startTime">Start Time (optional, if applicable):</label>
                    <input
                        type="time"
                        id="cr-startTime"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        // required // Not in ReservationRequest
                    />
                </div>
                <div>
                    <label htmlFor="cr-endTime">End Time (optional, if applicable):</label>
                    <input
                        type="time"
                        id="cr-endTime"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        // required // Not in ReservationRequest
                    />
                </div>
                <div>
                    <label htmlFor="cr-numberOfGuests">Number of Guests:</label>
                    <input
                        type="number"
                        id="cr-numberOfGuests"
                        value={numberOfGuests}
                        onChange={(e) => setNumberOfGuests(e.target.value)}
                        required
                        min="1"
                    />
                </div>
                <div>
                    <label htmlFor="cr-customerName">Your Name (for reservation):</label>
                    <input
                        type="text"
                        id="cr-customerName"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="cr-customerSurname">Your Surname (for reservation):</label>
                    <input
                        type="text"
                        id="cr-customerSurname"
                        value={customerSurname}
                        onChange={(e) => setCustomerSurname(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="cr-customerPhone">Your Phone (for reservation):</label>
                    <input
                        type="tel"
                        id="cr-customerPhone"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
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
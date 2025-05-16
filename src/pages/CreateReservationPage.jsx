import React, {useState, useEffect} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import {useCreateReservationMutation} from '../features/reservations/reservationApi';
import {useGetWeddingHallsQuery} from '../features/weddingHalls/weddingHallApi';
import {useAppSelector} from '../app/hooks';
import {selectCurrentUser} from '../features/auth/authSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const CreateReservationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const preSelectedHallId = queryParams.get('hall_id');
    const preSelectedHallName = queryParams.get('hall_name');
    const currentUser = useAppSelector(selectCurrentUser);

    const [weddingHallId, setWeddingHallId] = useState(preSelectedHallId || '');
    const [reservationDate, setReservationDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const [numberOfGuests, setNumberOfGuests] = useState('');
    const [customerName, setCustomerName] = useState(currentUser?.name || '');
    const [customerSurname, setCustomerSurname] = useState(currentUser?.surname || '');
    const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');

    const [createReservation, {isLoading, error}] = useCreateReservationMutation();
    const {data: hallsResponse, isLoading: isLoadingHalls, error: hallsError} = useGetWeddingHallsQuery(
        {page: 1, per_page: 100, status: 'approved'},
        {skip: !!preSelectedHallId}
    );

    useEffect(() => {
        if (preSelectedHallId) {
            setWeddingHallId(preSelectedHallId);
        }
    }, [preSelectedHallId]);

    useEffect(() => {
        if (currentUser) {
            if (!customerName) setCustomerName(currentUser.name || '');
            if (!customerSurname) setCustomerSurname(currentUser.surname || (currentUser.name ? currentUser.name.split(' ').slice(1).join(' ') : ''));
            if (!customerPhone) setCustomerPhone(currentUser.phone || '');
        }
    }, [currentUser, customerName, customerSurname, customerPhone]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!weddingHallId || !reservationDate || !numberOfGuests || !customerName || !customerSurname || !customerPhone /* || !startTime || !endTime */) {
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
                // start_time: startTime,
                // end_time: endTime,
            };
            if (startTime) payload.start_time = startTime;
            if (endTime) payload.end_time = endTime;


            await createReservation(payload).unwrap();
            alert('Reservation created successfully!');
            navigate('/my-reservations');
        } catch (err) {
            console.error('Failed to create reservation:', err);
        }
    };

    if (isLoading || (isLoadingHalls && !preSelectedHallId)) return <LoadingSpinner/>;

    const weddingHallsForDropdown = hallsResponse?.data?.data || [];

    return (
        <div className="container">
            <h2>Create Reservation {preSelectedHallName ? `for ${preSelectedHallName}` : ''}</h2>
            {error && <ErrorMessage message={error.data?.message || 'Failed to create reservation.'}
                                    details={error.data?.errors}/>}
            {hallsError && !preSelectedHallId &&
                <ErrorMessage message={hallsError.data?.message || "Could not load wedding halls list."}/>}

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
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setReservationDate(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="cr-startTime">Start Time (optional, if applicable):</label>
                    <input
                        type="time"
                        id="cr-startTime"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="cr-endTime">End Time (optional, if applicable):</label>
                    <input
                        type="time"
                        id="cr-endTime"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
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
import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useCreateReservationMutation} from '../features/reservations/reservationApi';
import {useGetWeddingHallsQuery} from '../features/weddingHalls/weddingHallApi';
import {useAppSelector} from '../app/hooks';
import {selectCurrentUser} from '../features/auth/authSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {BuildingOfficeIcon, CalendarIcon, CheckCircleIcon, UserIcon} from '@heroicons/react/24/solid';

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
    const [customerName, setCustomerName] = useState('');
    const [customerSurname, setCustomerSurname] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');

    const [createReservation, {isLoading, error: createReservationError}] = useCreateReservationMutation();
    const {data: hallsResponse, isLoading: isLoadingHalls, error: hallsError} = useGetWeddingHallsQuery(
        {page: 1, per_page: 1000, status: 'approved'},
        {skip: !!preSelectedHallId}
    );

    useEffect(() => {
        if (preSelectedHallId) {
            setWeddingHallId(preSelectedHallId);
        }
    }, [preSelectedHallId]);

    useEffect(() => {
        if (currentUser) {
            setCustomerName(prev => prev || currentUser.name || '');
            setCustomerSurname(prev => prev || currentUser.surname || (currentUser.name ? currentUser.name.split(' ').slice(1).join(' ') : ''));
            setCustomerPhone(prev => prev || currentUser.phone || '');
        }
    }, [currentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!weddingHallId || !reservationDate || !numberOfGuests || !customerName || !customerSurname || !customerPhone) {
            alert("Please fill all required fields.");
            return;
        }
        try {
            const payload = {
                wedding_hall_id: parseInt(weddingHallId, 10),
                reservation_date: reservationDate,
                number_of_guests: parseInt(numberOfGuests, 10),
                customer_name: customerName,
                customer_surname: customerSurname,
                customer_phone: customerPhone,
            };
            if (startTime) payload.start_time = startTime;
            if (endTime) payload.end_time = endTime;

            await createReservation(payload).unwrap();
            alert('Reservation created successfully! You can view it in "My Reservations".');
            navigate('/my-reservations');
        } catch (err) {
            console.error('Failed to create reservation:', err);
        }
    };

    const inputClass = "mt-1 block w-full py-2.5 px-3.5 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary sm:text-sm transition-colors";
    const labelClass = "block text-sm font-medium text-gray-700";
    const today = new Date().toISOString().split("T")[0];

    if (isLoadingHalls && !preSelectedHallId && !hallsResponse) return <LoadingSpinner
        message="Loading available halls..."/>;

    const weddingHallsForDropdown = hallsResponse?.data?.data || [];

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl">
                <div className="text-center mb-8">
                    <CalendarIcon className="mx-auto h-12 w-12 text-primary opacity-80"/>
                    <h1 className="text-3xl font-bold text-gray-800 mt-2">
                        Book Your Venue
                    </h1>
                    {preSelectedHallName && (
                        <p className="text-lg text-gray-600">
                            for <span className="font-semibold text-primary-dark">{preSelectedHallName}</span>
                        </p>
                    )}
                </div>

                {createReservationError &&
                    <ErrorMessage message={createReservationError.data?.message || 'Failed to create reservation.'}
                                  details={createReservationError.data?.errors}/>}
                {hallsError && !preSelectedHallId &&
                    <ErrorMessage message={hallsError.data?.message || "Could not load wedding halls list."}/>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {preSelectedHallId ? (
                        <div className="p-4 bg-primary-light/20 border border-primary-light rounded-lg">
                            <p className="text-sm font-medium text-primary-dark flex items-center">
                                <BuildingOfficeIcon className="h-5 w-5 mr-2"/> Selected Hall: {preSelectedHallName}
                            </p>
                            <input type="hidden" value={weddingHallId} readOnly/>
                        </div>
                    ) : (
                        <div>
                            <label htmlFor="cr-weddingHallId" className={labelClass}>Select Wedding Hall:</label>
                            <select id="cr-weddingHallId" className={inputClass} value={weddingHallId}
                                    onChange={(e) => setWeddingHallId(e.target.value)} required>
                                <option value="">-- Choose an Approved Hall --</option>
                                {weddingHallsForDropdown.map(hall => (
                                    <option key={hall.id} value={hall.id}>{hall.name} (Capacity: {hall.capacity},
                                        ${hall.price_per_seat}/seat)</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                        <div>
                            <label htmlFor="cr-reservationDate" className={labelClass}>Reservation Date:</label>
                            <input type="date" id="cr-reservationDate" className={inputClass} value={reservationDate}
                                   min={today} onChange={(e) => setReservationDate(e.target.value)} required/>
                        </div>
                        <div>
                            <label htmlFor="cr-numberOfGuests" className={labelClass}>Number of Guests:</label>
                            <input type="number" id="cr-numberOfGuests" className={inputClass} value={numberOfGuests}
                                   onChange={(e) => setNumberOfGuests(e.target.value)} required min="1"
                                   placeholder="e.g., 150"/>
                        </div>
                        <div>
                            <label htmlFor="cr-startTime" className={labelClass}>Start Time <span
                                className="text-xs text-gray-500"></span>:</label>
                            <input type="time" id="cr-startTime" className={inputClass} value={startTime}
                                   onChange={(e) => setStartTime(e.target.value)}/>
                        </div>
                        <div>
                            <label htmlFor="cr-endTime" className={labelClass}>End Time <span
                                className="text-xs text-gray-500"></span>:</label>
                            <input type="time" id="cr-endTime" className={inputClass} value={endTime}
                                   onChange={(e) => setEndTime(e.target.value)}/>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <UserIcon className="h-6 w-6 mr-2 text-gray-500"/> Contact Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                            <div>
                                <label htmlFor="cr-customerName" className={labelClass}>Your Name:</label>
                                <input type="text" id="cr-customerName" className={inputClass} value={customerName}
                                       onChange={(e) => setCustomerName(e.target.value)} required
                                       placeholder="Enter your first name"/>
                            </div>
                            <div>
                                <label htmlFor="cr-customerSurname" className={labelClass}>Your Surname:</label>
                                <input type="text" id="cr-customerSurname" className={inputClass}
                                       value={customerSurname} onChange={(e) => setCustomerSurname(e.target.value)}
                                       required placeholder="Enter your last name"/>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="cr-customerPhone" className={labelClass}>Your Phone:</label>
                                <input type="tel" id="cr-customerPhone" className={inputClass} value={customerPhone}
                                       onChange={(e) => setCustomerPhone(e.target.value)} required
                                       placeholder="e.g., +1234567890"/>
                            </div>
                        </div>
                    </div>

                    <div className="pt-5">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark disabled:opacity-70 transition-colors"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                         xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor"
                                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...</>
                            ) : (<><CheckCircleIcon className="h-5 w-5 mr-2"/> Confirm Reservation</>)}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateReservationPage;
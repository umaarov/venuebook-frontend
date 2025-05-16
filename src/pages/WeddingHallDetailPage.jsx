import React, {useEffect, useState} from 'react';
import {useParams, Link} from 'react-router-dom';
import {useGetWeddingHallByIdQuery} from '../features/weddingHalls/weddingHallApi';
import {useAppSelector} from '../app/hooks';
import {selectCurrentUser} from '../features/auth/authSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {format, parseISO, isBefore, startOfDay, getDaysInMonth, getDay, startOfMonth} from 'date-fns';

const Modal = ({isOpen, onClose, title, children}) => {
    if (!isOpen) return null;
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '8px',
                minWidth: '300px',
                maxWidth: '500px'
            }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h3>{title}</h3>
                    <button onClick={onClose} style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5em',
                        cursor: 'pointer'
                    }}>&times;</button>
                </div>
                <div style={{marginTop: '15px'}}>{children}</div>
            </div>
        </div>
    );
};


const WeddingHallDetailPage = () => {
    const {id: hallId} = useParams();
    const currentUser = useAppSelector(selectCurrentUser);
    const {data: hallResponse, isLoading, error: hallError, refetch} = useGetWeddingHallByIdQuery(hallId);

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedBookedDateInfo, setSelectedBookedDateInfo] = useState(null);

    useEffect(() => {
        if (hallResponse?.data?.calendar_booked_dates) {
            console.log("Calendar Booked Dates from API:", hallResponse.data.calendar_booked_dates);
        }
    }, [hallResponse]);

    if (isLoading) return <LoadingSpinner message="Loading hall details..."/>;
    if (hallError) return <ErrorMessage
        message={hallError.data?.message || `Could not load details for hall ID ${hallId}.`}/>;

    const hall = hallResponse?.data?.wedding_hall;
    const bookedDatesData = hallResponse?.data?.calendar_booked_dates || [];

    if (!hall) return <p>Wedding hall not found.</p>;

    const isOwner = currentUser && hall.owner_id === currentUser.id;
    const isAdmin = currentUser && currentUser.role === 'admin';
    const canBook = !isAdmin && !isOwner && hall.status === 'approved';

    const today = startOfDay(new Date());
    const monthStart = startOfMonth(currentMonth);
    const daysInCurrentMonth = getDaysInMonth(currentMonth);
    const startingDayOfWeek = getDay(monthStart);

    const calendarDays = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(<div key={`empty-${i}`}
                               style={{border: '1px solid #eee', padding: '10px', minHeight: '60px'}}></div>);
    }
    for (let day = 1; day <= daysInCurrentMonth; day++) {
        const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dateString = format(currentDate, 'yyyy-MM-dd');
        const isPastDate = isBefore(currentDate, today);
        const bookedInfo = bookedDatesData.find(b => b.date === dateString);

        let dayStyle = {
            border: '1px solid #eee', padding: '10px', minHeight: '60px', textAlign: 'center',
            backgroundColor: 'white', cursor: 'default'
        };

        if (isPastDate) {
            dayStyle.backgroundColor = '#e0e0e0';
            dayStyle.color = '#757575';
        } else if (bookedInfo) {
            dayStyle.backgroundColor = '#ffcdd2';
            dayStyle.color = '#b71c1c';
            dayStyle.cursor = 'pointer';
        } else if (hall.status === 'approved') {
            dayStyle.backgroundColor = '#c8e6c9';
            dayStyle.color = '#1b5e20';
        }

        calendarDays.push(
            <div
                key={dateString}
                style={dayStyle}
                onClick={() => bookedInfo && setSelectedBookedDateInfo(bookedInfo)}
            >
                <div>{day}</div>
                {bookedInfo && <small style={{fontSize: '0.7em'}}>Booked</small>}
                {!isPastDate && !bookedInfo && hall.status === 'approved' &&
                    <small style={{fontSize: '0.7em'}}>Free</small>}
            </div>
        );
    }

    const changeMonth = (offset) => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    return (
        <div className="container">
            <h2>{hall.name}</h2>
            <p><strong>Address:</strong> {hall.address}</p>
            <p><strong>Capacity:</strong> {hall.capacity} guests</p>
            <p><strong>Price per seat:</strong> ${hall.price_per_seat}</p>
            <p><strong>Phone:</strong> {hall.phone}</p>
            {hall.district && <p><strong>District:</strong> {hall.district.name}</p>}
            {hall.owner && <p><strong>Owner:</strong> {hall.owner.name}</p>}
            <p><strong>Status:</strong> <span style={{fontWeight: 'bold'}}>{hall.status}</span></p>

            <h3>Images</h3>
            {hall.images && hall.images.length > 0 ? (
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px'}}>
                    {hall.images.map(image => (
                        <img key={image.id}
                             src={image.image_path.startsWith('http') ? image.image_path : `http://localhost:8000${image.image_path}`}
                             alt={`${hall.name} image`}
                             style={{width: '150px', height: 'auto', border: '1px solid #ccc', borderRadius: '4px'}}
                             onError={(e) => {
                                 e.target.onerror = null;
                                 e.target.src = "https://placehold.co/150x100?text=Img";
                             }}/>
                    ))}
                </div>
            ) : (<p>No images available.</p>)}


            <h3>Availability Calendar</h3>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                <button onClick={() => changeMonth(-1)}>&lt; Prev Month</button>
                <h4>{format(currentMonth, 'MMMM yyyy')}</h4>
                <button onClick={() => changeMonth(1)}>Next Month &gt;</button>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', border: '1px solid #ccc'}}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
                    <div key={dayName} style={{
                        background: '#f5f5f5',
                        padding: '5px',
                        textAlign: 'center',
                        fontWeight: 'bold'
                    }}>{dayName}</div>
                ))}
                {calendarDays}
            </div>

            <Modal isOpen={!!selectedBookedDateInfo} onClose={() => setSelectedBookedDateInfo(null)}
                   title="Reservation Details">
                {selectedBookedDateInfo && (
                    <>
                        <p><strong>Date:</strong> {format(parseISO(selectedBookedDateInfo.date), 'PPP')}</p>
                        <p><strong>Booked
                            by:</strong> {selectedBookedDateInfo.customer_name} {selectedBookedDateInfo.customer_surname} (User: {selectedBookedDateInfo.booked_by_username})
                        </p>
                        <p><strong>Number of Guests:</strong> {selectedBookedDateInfo.number_of_guests}</p>
                    </>
                )}
            </Modal>

            <br/>
            {canBook ? (
                <Link to={`/reservations/new?hall_id=${hall.id}&hall_name=${encodeURIComponent(hall.name)}`}>
                    <button style={{marginTop: '20px'}}>Book this Hall</button>
                </Link>
            ) : (
                <p style={{marginTop: '20px', color: 'grey'}}>
                    {hall.status !== 'approved' ? "This hall is not currently approved for booking." :
                        (isAdmin ? "Admins cannot make reservations." :
                            (isOwner ? "Owners cannot book their own halls." : ""))}
                </p>
            )}
            <br/>
            <Link to="/wedding-halls" style={{display: 'inline-block', marginTop: '10px'}}>Back to list</Link>
        </div>
    );
};

export default WeddingHallDetailPage;
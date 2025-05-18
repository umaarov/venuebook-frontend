import React, {useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {useGetWeddingHallByIdQuery} from '../features/weddingHalls/weddingHallApi';
import {useAppSelector} from '../app/hooks';
import {selectCurrentUser} from '../features/auth/authSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
    addMonths,
    format,
    getDay,
    getDaysInMonth,
    isBefore,
    parseISO,
    startOfDay,
    startOfMonth,
    subMonths
} from 'date-fns';
import {
    CalendarIcon,
    CheckCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CurrencyDollarIcon,
    InformationCircleIcon,
    MapIcon,
    MapPinIcon,
    PhoneIcon,
    PhotoIcon,
    UserCircleIcon,
    UsersIcon,
    XCircleIcon
} from '@heroicons/react/24/solid';


const Modal = ({isOpen, onClose, title, children}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4 z-[1000] transition-opacity duration-300 ease-in-out"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg transform transition-all duration-300 ease-in-out scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                        aria-label="Close modal"
                    >
                        <XCircleIcon className="h-6 w-6"/>
                    </button>
                </div>
                <div className="text-sm text-gray-700 space-y-3">
                    {children}
                </div>
            </div>
        </div>
    );
};


const WeddingHallDetailPage = () => {
    const {id: hallId} = useParams();
    const currentUser = useAppSelector(selectCurrentUser);
    const {data: hallResponse, isLoading, error: hallError} = useGetWeddingHallByIdQuery(hallId);

    const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
    const [selectedBookedDateInfo, setSelectedBookedDateInfo] = useState(null);
    const [showFullDescription, setShowFullDescription] = useState(false);


    if (isLoading && !hallResponse) return <LoadingSpinner message="Loading hall details..."/>;
    if (hallError) return <ErrorMessage
        message={hallError.data?.message || `Could not load details for hall ID ${hallId}.`}
        details={hallError.data?.errors}/>;

    const hall = hallResponse?.data?.wedding_hall;
    const bookedDatesData = hallResponse?.data?.calendar_booked_dates || [];

    if (!hall) return (
        <div className="text-center py-20">
            <InformationCircleIcon className="mx-auto h-16 w-16 text-gray-400 mb-4"/>
            <p className="text-xl text-gray-500">Wedding hall not found.</p>
            <Link to="/wedding-halls"
                  className="mt-6 inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark transition-colors">
                Back to Halls
            </Link>
        </div>
    );

    const isOwner = currentUser && hall.owner_id === currentUser.id;
    const isAdmin = currentUser && currentUser.role === 'admin';
    const canBook = currentUser && !isAdmin && !isOwner && hall.status === 'approved';

    const today = startOfDay(new Date());
    const monthStart = startOfMonth(currentMonthDate);
    const daysInCurrentMonth = getDaysInMonth(currentMonthDate);
    const startingDayOfWeek = getDay(monthStart);

    const calendarDays = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(<div key={`empty-${i}`}
                               className="border border-gray-200 bg-gray-50 min-h-[60px] sm:min-h-[80px]"></div>);
    }

    for (let day = 1; day <= daysInCurrentMonth; day++) {
        const currentDate = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), day);
        const dateString = format(currentDate, 'yyyy-MM-dd');
        const isPastDate = isBefore(currentDate, today);
        const bookedInfo = bookedDatesData.find(b => b.date === dateString);

        let dayClasses = "border border-gray-200 p-2 min-h-[60px] sm:min-h-[80px] text-center transition-colors duration-150 ease-in-out flex flex-col items-center justify-center";
        let dayContent;

        if (isPastDate) {
            dayClasses += " bg-gray-200 text-gray-500 cursor-not-allowed";
            dayContent = <span className="text-sm font-medium">{day}</span>;
        } else if (bookedInfo) {
            dayClasses += " bg-red-200 text-red-800 hover:bg-red-300 cursor-pointer";
            dayContent = (
                <>
                    <span className="text-sm font-semibold">{day}</span>
                    <span className="text-xs mt-1 block">Booked</span>
                </>
            );
        } else if (hall.status === 'approved') {
            dayClasses += " bg-green-100 text-green-800 hover:bg-green-200 cursor-default";
            dayContent = (
                <>
                    <span className="text-sm font-medium">{day}</span>
                    <span className="text-xs mt-1 block">Available</span>
                </>
            );
        } else {
            dayClasses += " bg-yellow-100 text-yellow-700 cursor-not-allowed";
            dayContent = (
                <>
                    <span className="text-sm font-medium">{day}</span>
                    <span className="text-xs mt-1 block">Pending</span>
                </>
            );
        }

        calendarDays.push(
            <div key={dateString} className={dayClasses}
                 onClick={() => bookedInfo && setSelectedBookedDateInfo(bookedInfo)}>
                {dayContent}
            </div>
        );
    }

    const changeMonth = (offset) => {
        setCurrentMonthDate(prev => offset > 0 ? addMonths(prev, 1) : subMonths(prev, 1));
    };

    const primaryImage = hall.images?.find(img => img.is_primary) || hall.images?.[0];
    const otherImages = hall.images?.filter(img => img.id !== primaryImage?.id) || [];


    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-12">
            {/* Main Hall Info & Images */}
            <div className="lg:grid lg:grid-cols-3 lg:gap-x-10">
                <div className="lg:col-span-2 space-y-6">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">{hall.name}</h1>
                    {primaryImage ? (
                        <div className="aspect-w-16 aspect-h-9 rounded-xl shadow-lg overflow-hidden">
                            <img
                                src={primaryImage.image_path.startsWith('http') ? primaryImage.image_path : `http://localhost:8000${primaryImage.image_path}`}
                                alt={hall.name} className="w-full h-full object-cover" onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/800x450?text=Venue+Image";
                            }}/>
                        </div>
                    ) : (
                        <div
                            className="aspect-w-16 aspect-h-9 rounded-xl shadow-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                            <PhotoIcon className="h-24 w-24 text-gray-400"/>
                        </div>
                    )}

                    {otherImages.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
                            {otherImages.slice(0, 5).map(image => ( // Show up to 5 other images
                                <div key={image.id}
                                     className="aspect-w-1 aspect-h-1 rounded-lg shadow-md overflow-hidden">
                                    <img
                                        src={image.image_path.startsWith('http') ? image.image_path : `http://localhost:8000${image.image_path}`}
                                        alt={`${hall.name} additional image`}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://placehold.co/150x150?text=Img";
                                        }}/>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-10 lg:mt-0 lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-xl space-y-4">
                        <DetailItem icon={<MapIcon className="h-5 w-5 text-primary"/>} label="Address"
                                    value={hall.address}/>
                        <DetailItem icon={<UsersIcon className="h-5 w-5 text-primary"/>} label="Capacity"
                                    value={`${hall.capacity} guests`}/>
                        <DetailItem icon={<CurrencyDollarIcon className="h-5 w-5 text-primary"/>} label="Price per seat"
                                    value={`$${hall.price_per_seat}`}/>
                        <DetailItem icon={<PhoneIcon className="h-5 w-5 text-primary"/>} label="Contact"
                                    value={hall.phone}/>
                        {hall.district &&
                            <DetailItem icon={<MapPinIcon className="h-5 w-5 text-primary"/>} label="District"
                                        value={hall.district.name}/>}
                        <DetailItem icon={<CheckCircleIcon
                            className={`h-5 w-5 ${hall.status === 'approved' ? 'text-green-500' : 'text-yellow-500'}`}/>}
                                    label="Status" value={<span
                            className={`font-semibold ${hall.status === 'approved' ? 'text-green-600' : 'text-yellow-600'}`}>{hall.status}</span>}/>
                        {hall.owner &&
                            <DetailItem icon={<UserCircleIcon className="h-5 w-5 text-primary"/>} label="Listed by"
                                        value={hall.owner.name}/>}
                    </div>
                    {canBook ? (
                        <Link to={`/reservations/new?hall_id=${hall.id}&hall_name=${encodeURIComponent(hall.name)}`}
                              className="w-full mt-6 flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-transform transform hover:scale-105">
                            <CalendarIcon className="h-5 w-5 mr-2"/> Book this Hall
                        </Link>
                    ) : (
                        <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <InformationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true"/>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm">
                                        {hall.status !== 'approved' ? "This hall is not currently approved for booking." :
                                            (!currentUser ? "Please login to book this hall." :
                                                (isAdmin ? "Administrators cannot make reservations." :
                                                    (isOwner ? "You cannot book your own hall." : "Booking not available for this hall right now.")))
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Description */}
            {hall.description && (
                <div className="bg-white p-6 rounded-xl shadow-xl">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-3">About {hall.name}</h3>
                    <div
                        className={`prose prose-sm sm:prose-base max-w-none text-gray-600 leading-relaxed ${!showFullDescription && hall.description.length > 300 ? 'max-h-28 overflow-hidden relative' : ''}`}>
                        <p>{hall.description}</p>
                        {!showFullDescription && hall.description.length > 300 && <div
                            className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-white to-transparent"></div>}
                    </div>
                    {hall.description.length > 300 && (
                        <button onClick={() => setShowFullDescription(!showFullDescription)}
                                className="text-sm text-primary hover:text-primary-dark font-medium mt-3">
                            {showFullDescription ? 'Show Less' : 'Read More...'}
                        </button>
                    )}
                </div>
            )}


            {/* Availability Calendar Section */}
            <div className="bg-white p-6 rounded-xl shadow-xl">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                    <CalendarIcon className="h-7 w-7 mr-2 text-primary opacity-80"/> Availability Calendar
                </h3>
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => changeMonth(-1)}
                            className="p-2 rounded-md hover:bg-gray-100 text-gray-600 hover:text-primary transition-colors"
                            aria-label="Previous month">
                        <ChevronLeftIcon className="h-6 w-6"/>
                    </button>
                    <h4 className="text-xl font-semibold text-gray-700">{format(currentMonthDate, 'MMMM yyyy')}</h4>
                    <button onClick={() => changeMonth(1)}
                            className="p-2 rounded-md hover:bg-gray-100 text-gray-600 hover:text-primary transition-colors"
                            aria-label="Next month">
                        <ChevronRightIcon className="h-6 w-6"/>
                    </button>
                </div>
                <div
                    className="grid grid-cols-7 gap-px bg-gray-300 border border-gray-300 rounded-lg overflow-hidden shadow">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
                        <div key={dayName}
                             className="bg-gray-100 p-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{dayName}</div>
                    ))}
                    {calendarDays}
                </div>
            </div>

            <Modal isOpen={!!selectedBookedDateInfo} onClose={() => setSelectedBookedDateInfo(null)}
                   title="Reservation Details">
                {selectedBookedDateInfo && (
                    <>
                        <p><strong
                            className="font-medium text-gray-600">Date:</strong> {format(parseISO(selectedBookedDateInfo.date), 'PPP')}
                        </p>
                        <p><strong className="font-medium text-gray-600">Booked
                            by:</strong> {selectedBookedDateInfo.customer_name} {selectedBookedDateInfo.customer_surname}
                        </p>
                        <p><strong className="font-medium text-gray-600">User
                            Account:</strong> {selectedBookedDateInfo.booked_by_username || 'N/A'}</p>
                        <p><strong className="font-medium text-gray-600">Number of
                            Guests:</strong> {selectedBookedDateInfo.number_of_guests}</p>
                    </>
                )}
            </Modal>

            <div className="mt-10 text-center">
                <Link to="/wedding-halls"
                      className="text-primary hover:text-primary-dark font-medium inline-flex items-center transition-colors">
                    <ChevronLeftIcon className="h-5 w-5 mr-1"/> Back to Halls List
                </Link>
            </div>
        </div>
    );
};

const DetailItem = ({icon, label, value}) => (
    <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 pt-0.5">{icon}</div>
        <div>
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-0.5 text-sm text-gray-900">{value}</dd>
        </div>
    </div>
);

export default WeddingHallDetailPage;
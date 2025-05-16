// File: src/pages/admin/AdminAllReservationsPage.jsx
import React, {useState, useEffect} from 'react';
import {useAdminListAllReservationsQuery, useAdminCancelReservationMutation} from '../../features/admin/adminApi';
import {useGetDistrictsQuery, useGetWeddingHallsQuery} from '../../features/weddingHalls/weddingHallApi'; // For filters
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import {format, parseISO} from 'date-fns';

const AdminAllReservationsPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('reservation_date');
    const [sortDirection, setSortDirection] = useState('desc');
    const [statusFilter, setStatusFilter] = useState('');
    const [districtFilter, setDistrictFilter] = useState('');
    const [hallFilter, setHallFilter] = useState('');
    const [dateFromFilter, setDateFromFilter] = useState('');
    const [dateToFilter, setDateToFilter] = useState('');


    const queryParams = {
        page: currentPage,
        sort_by: sortBy,
        sort_direction: sortDirection,
    };
    if (statusFilter) queryParams.status = statusFilter;
    if (districtFilter) queryParams.district_id = districtFilter;
    if (hallFilter) queryParams.wedding_hall_id = hallFilter;
    if (dateFromFilter) queryParams.date_from = dateFromFilter;
    if (dateToFilter) queryParams.date_to = dateToFilter;


    const {data: reservationsResponse, isLoading, error, refetch} = useAdminListAllReservationsQuery(queryParams);
    const [cancelReservation, {isLoading: isCancelling}] = useAdminCancelReservationMutation();

    // For filter dropdowns
    const {data: districtsData} = useGetDistrictsQuery();
    const {data: weddingHallsData} = useGetWeddingHallsQuery({per_page: 1000}); // Fetch all for filter; consider a dedicated light endpoint

    useEffect(() => {
        refetch();
    }, [sortBy, sortDirection, statusFilter, districtFilter, hallFilter, dateFromFilter, dateToFilter, currentPage, refetch]);

    const handleCancelReservation = async (id) => {
        if (window.confirm('Are you sure you want to cancel this reservation?')) {
            try {
                await cancelReservation({id}).unwrap();
                alert('Reservation cancelled by admin.');
                refetch();
            } catch (err) {
                alert(err.data?.message || 'Failed to cancel reservation.');
            }
        }
    };

    const handleSortChange = (e) => {
        const value = e.target.value;
        if (value) {
            const [field, direction] = value.split('_');
            setSortBy(field);
            setSortDirection(direction);
        } else {
            setSortBy('reservation_date');
            setSortDirection('desc');
        }
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        if (reservationsResponse?.data?.meta) {
            const {last_page} = reservationsResponse.data.meta;
            if (newPage >= 1 && newPage <= last_page) setCurrentPage(newPage);
        } else if (reservationsResponse?.data?.last_page) {
            if (newPage >= 1 && newPage <= reservationsResponse.data.last_page) setCurrentPage(newPage);
        }
    };

    if (isLoading) return <LoadingSpinner/>;
    if (error) return <ErrorMessage message={error.data?.message || "Could not load reservations."}/>;

    const reservations = reservationsResponse?.data?.data || [];
    const paginationInfo = reservationsResponse?.data || {};
    const districts = districtsData?.data || [];
    const allHalls = weddingHallsData?.data?.data || [];

    return (
        <div className="container">
            <h2>All Reservations (Admin View)</h2>

            {/* Filters */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '15px',
                marginBottom: '20px',
                padding: '10px',
                border: '1px solid #eee',
                borderRadius: '5px'
            }}>
                <div>
                    <label htmlFor="admin-res-district-filter">District:</label>
                    <select id="admin-res-district-filter" value={districtFilter} onChange={e => {
                        setDistrictFilter(e.target.value);
                        setCurrentPage(1);
                    }}>
                        <option value="">All Districts</option>
                        {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="admin-res-hall-filter">Venue:</label>
                    <select id="admin-res-hall-filter" value={hallFilter} onChange={e => {
                        setHallFilter(e.target.value);
                        setCurrentPage(1);
                    }}>
                        <option value="">All Venues</option>
                        {allHalls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="admin-res-status-filter">Status:</label>
                    <select id="admin-res-status-filter" value={statusFilter} onChange={e => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                    }}>
                        <option value="">All Statuses</option>
                        <option value="booked">Booked</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                        {/* Add other statuses your system uses */}
                    </select>
                </div>
                <div>
                    <label htmlFor="admin-res-date-from">Date From:</label>
                    <input type="date" id="admin-res-date-from" value={dateFromFilter} onChange={e => {
                        setDateFromFilter(e.target.value);
                        setCurrentPage(1);
                    }}/>
                </div>
                <div>
                    <label htmlFor="admin-res-date-to">Date To:</label>
                    <input type="date" id="admin-res-date-to" value={dateToFilter} onChange={e => {
                        setDateToFilter(e.target.value);
                        setCurrentPage(1);
                    }}/>
                </div>
                <div>
                    <label htmlFor="admin-res-sort-by">Sort by:</label>
                    <select id="admin-res-sort-by" value={`${sortBy}_${sortDirection}`} onChange={handleSortChange}>
                        <option value="reservation_date_desc">Date (Newest First)</option>
                        <option value="reservation_date_asc">Date (Oldest First)</option>
                        <option value="venue_name_asc">Venue (A-Z)</option>
                        <option value="venue_name_desc">Venue (Z-A)</option>
                        <option value="district_name_asc">Region (A-Z)</option>
                        <option value="district_name_desc">Region (Z-A)</option>
                        <option value="status_asc">Status (A-Z)</option>
                        <option value="status_desc">Status (Z-A)</option>
                        <option value="number_of_guests_desc">Guests (High-Low)</option>
                        <option value="number_of_guests_asc">Guests (Low-High)</option>
                    </select>
                </div>
                <button onClick={() => {
                    setDistrictFilter('');
                    setHallFilter('');
                    setStatusFilter('');
                    setDateFromFilter('');
                    setDateToFilter('');
                    setSortBy('reservation_date');
                    setSortDirection('desc');
                    setCurrentPage(1);
                    // refetch(); // useEffect will trigger refetch
                }} style={{alignSelf: 'flex-end'}}>Clear Filters
                </button>
            </div>

            {reservations.length === 0 && !isLoading ? (
                <p>No reservations found for the selected criteria.</p>
            ) : (
                <>
                    <table>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Venue</th>
                            <th>District</th>
                            <th>Date</th>
                            <th>Guests</th>
                            <th>Booked By (Customer)</th>
                            <th>User</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {reservations.map((res) => (
                            <tr key={res.id}>
                                <td>{res.id}</td>
                                <td>{res.wedding_hall?.name || 'N/A'}</td>
                                <td>{res.wedding_hall?.district?.name || 'N/A'}</td>
                                <td>{format(parseISO(res.reservation_date), 'PPP')}</td>
                                <td>{res.number_of_guests}</td>
                                <td>{res.customer_name} {res.customer_surname} ({res.customer_phone})</td>
                                <td>{res.user?.username || 'N/A'} (ID: {res.user_id})</td>
                                <td>{res.status}</td>
                                <td>
                                    {res.status !== 'cancelled' && res.status !== 'completed' && (
                                        <button
                                            onClick={() => handleCancelReservation(res.id)}
                                            disabled={isCancelling}
                                            className="danger small"
                                        >
                                            {isCancelling ? 'Cancelling...' : 'Cancel'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {/* Pagination Controls */}
                    {reservations.length > 0 && paginationInfo.last_page > 1 && (
                        <div style={{marginTop: '20px', textAlign: 'center'}}>
                            <button onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={!paginationInfo.prev_page_url || isLoading}>Prev
                            </button>
                            <span
                                style={{margin: '0 10px'}}>Page {paginationInfo.current_page || 1} of {paginationInfo.last_page || 1}</span>
                            <button onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={!paginationInfo.next_page_url || isLoading}>Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminAllReservationsPage;
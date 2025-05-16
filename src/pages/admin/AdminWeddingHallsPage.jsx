import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {useGetWeddingHallsQuery, useGetDistrictsQuery} from '../../features/weddingHalls/weddingHallApi';
import {
    useAdminDeleteWeddingHallMutation,
    useAdminApproveWeddingHallMutation,
    useAdminRejectWeddingHallMutation
} from '../../features/admin/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AdminWeddingHallsPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');
    const [statusFilter, setStatusFilter] = useState('');
    const [districtFilter, setDistrictFilter] = useState('');

    const {data: districtsData, isLoading: isLoadingDistricts} = useGetDistrictsQuery();

    const queryParams = {
        page: currentPage,
        per_page: 10,
        sort_by: sortBy,
        sort_direction: sortDirection,
    };
    if (statusFilter) {
        queryParams.status = statusFilter;
    }
    if (districtFilter) {
        queryParams.district_id = districtFilter;
    }

    const {
        data: hallsResponse,
        isLoading: isLoadingHalls,
        error: hallsError,
        refetch
    } = useGetWeddingHallsQuery(queryParams);

    const [deleteHall, {isLoading: isDeleting}] = useAdminDeleteWeddingHallMutation();
    const [approveHall, {isLoading: isApproving}] = useAdminApproveWeddingHallMutation();
    const [rejectHall, {isLoading: isRejecting}] = useAdminRejectWeddingHallMutation();

    useEffect(() => {
        refetch();
    }, [sortBy, sortDirection, statusFilter, districtFilter, currentPage, refetch]);


    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this wedding hall? This action cannot be undone.')) {
            try {
                await deleteHall(id).unwrap();
                alert('Wedding hall deleted by admin.');
                refetch();
            } catch (err) {
                alert(err.data?.message || 'Failed to delete wedding hall.');
            }
        }
    };

    const handleApprove = async (id) => {
        try {
            await approveHall(id).unwrap();
            alert('Wedding hall approved.');
            refetch();
        } catch (err) {
            alert(err.data?.message || 'Failed to approve wedding hall.');
        }
    };

    const handleReject = async (id) => {
        if (window.confirm('Are you sure you want to reject this wedding hall?')) {
            try {
                await rejectHall(id).unwrap();
                alert('Wedding hall rejected.');
                refetch();
            } catch (err) {
                alert(err.data?.message || 'Failed to reject wedding hall.');
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
            setSortBy('created_at');
            setSortDirection('desc');
        }
        setCurrentPage(1);
    };

    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleDistrictFilterChange = (e) => {
        setDistrictFilter(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        if (hallsResponse?.data?.meta) {
            const {last_page} = hallsResponse.data.meta;
            if (newPage >= 1 && newPage <= last_page) {
                setCurrentPage(newPage);
            }
        } else if (hallsResponse?.data?.last_page) {
            if (newPage >= 1 && newPage <= hallsResponse.data.last_page) {
                setCurrentPage(newPage);
            }
        }
    };


    const isLoading = isLoadingHalls || isLoadingDistricts;
    const error = hallsError || hallsResponse?.error;

    if (isLoading) return <LoadingSpinner/>;
    if (error) return <ErrorMessage message={error.data?.message || "Could not load wedding halls."}/>;

    const halls = hallsResponse?.data?.data || [];
    const paginationInfo = hallsResponse?.data || {};
    const districts = districtsData?.data || [];


    return (
        <div className="container">
            <h2>Manage All Wedding Halls (Admin)</h2>
            <Link to="/admin/wedding-halls/new" style={{marginRight: '10px'}}>
                <button>Add New Wedding Hall (Admin)</button>
            </Link>

            <div style={{
                display: 'flex',
                gap: '15px',
                marginBottom: '20px',
                padding: '10px',
                border: '1px solid #eee',
                borderRadius: '5px',
                flexWrap: 'wrap'
            }}>
                <div>
                    <label htmlFor="admin-district-filter" style={{marginRight: '5px'}}>District:</label>
                    <select id="admin-district-filter" value={districtFilter} onChange={handleDistrictFilterChange}
                            disabled={isLoadingDistricts}>
                        <option value="">All Districts</option>
                        {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="admin-status-filter" style={{marginRight: '5px'}}>Status:</label>
                    <select id="admin-status-filter" value={statusFilter} onChange={handleStatusFilterChange}>
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="admin-sort-by" style={{marginRight: '5px'}}>Sort by:</label>
                    <select id="admin-sort-by" value={`${sortBy}_${sortDirection}`} onChange={handleSortChange}>
                        <option value="created_at_desc">Newest First</option>
                        <option value="price_per_seat_asc">Price: Low to High</option>
                        <option value="price_per_seat_desc">Price: High to Low</option>
                        <option value="capacity_asc">Capacity: Low to High</option>
                        <option value="capacity_desc">Capacity: High to Low</option>
                        <option value="name_asc">Name: A-Z</option>
                        <option value="name_desc">Name: Z-A</option>
                        <option value="status_asc">Status: A-Z</option>
                        <option value="status_desc">Status: Z-A</option>
                    </select>
                </div>
            </div>

            {halls.length === 0 && !isLoadingHalls ? (
                <p>No wedding halls found for the selected criteria.</p>
            ) : (
                <>
                    <ul className="item-list">
                        {halls.map((hall) => (
                            <li key={hall.id}>
                                <h3>{hall.name} (ID: {hall.id})</h3>
                                <p>Owner: {hall.owner?.name || 'N/A'} (Owner ID: {hall.owner_id})</p>
                                <p>Address: {hall.address || hall.location}</p>
                                <p>Price per seat: ${hall.price_per_seat}</p>
                                <p>Capacity: {hall.capacity} seats</p>
                                <p>District: {hall.district?.name || 'N/A'}</p>
                                <p>Status: <span style={{
                                    fontWeight: 'bold',
                                    color: hall.status === 'approved' ? 'green' : (hall.status === 'pending' ? 'orange' : 'red')
                                }}>{hall.status || 'N/A'}</span></p>
                                <Link to={`/wedding-halls/${hall.id}`}>
                                    <button className="small">View Details</button>
                                </Link>
                                <Link
                                    to={`/owner/wedding-halls/edit/${hall.id}`}> {/* Or an admin specific edit route */}
                                    <button className="small" style={{backgroundColor: '#ffc107', color: 'black'}}>Edit
                                        Hall
                                    </button>
                                </Link>
                                {hall.status === 'pending' && (
                                    <>
                                        <button onClick={() => handleApprove(hall.id)} disabled={isApproving}
                                                className="small" style={{backgroundColor: 'green'}}>
                                            {isApproving ? 'Approving...' : 'Approve'}
                                        </button>
                                        <button onClick={() => handleReject(hall.id)} disabled={isRejecting}
                                                className="small" style={{backgroundColor: 'orange'}}>
                                            {isRejecting ? 'Rejecting...' : 'Reject'}
                                        </button>
                                    </>
                                )}
                                <button onClick={() => handleDelete(hall.id)} disabled={isDeleting}
                                        className="danger small">
                                    {isDeleting ? 'Deleting...' : 'Delete Hall'}
                                </button>
                            </li>
                        ))}
                    </ul>
                    {halls.length > 0 && paginationInfo.last_page > 1 && (
                        <div style={{marginTop: '20px', textAlign: 'center'}}>
                            <button onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={!paginationInfo.prev_page_url || isLoadingHalls}>
                                Previous
                            </button>
                            <span style={{margin: '0 10px'}}>
                                Page {paginationInfo.current_page || 1} of {paginationInfo.last_page || 1}
                            </span>
                            <button onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={!paginationInfo.next_page_url || isLoadingHalls}>
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminWeddingHallsPage;
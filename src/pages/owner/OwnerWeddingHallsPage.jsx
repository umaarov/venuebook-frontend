import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {useGetOwnerWeddingHallsQuery} from '../../features/owner/ownerApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
// import { useGetDistrictsQuery } from '../../features/weddingHalls/weddingHallApi';


const OwnerWeddingHallsPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');
    const [statusFilter, setStatusFilter] = useState('');

    const queryParams = {
        page: currentPage,
        sort_by: sortBy,
        sort_direction: sortDirection,
    };
    if (statusFilter) {
        queryParams.status = statusFilter;
    }

    const {data: hallsResponse, isLoading, error, refetch} = useGetOwnerWeddingHallsQuery(queryParams);

    useEffect(() => {
        refetch();
    }, [sortBy, sortDirection, statusFilter, currentPage, refetch]);


    if (isLoading) return <LoadingSpinner/>;
    if (error) return <ErrorMessage message={error.data?.message || "Could not load your wedding halls."}/>;

    const halls = hallsResponse?.data?.data || hallsResponse?.data || [];
    const paginationInfo = hallsResponse?.data || {};


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

    const handlePageChange = (newPage) => {
        if (paginationInfo.last_page) {
            if (newPage >= 1 && newPage <= paginationInfo.last_page) {
                setCurrentPage(newPage);
            }
        }
    };


    return (
        <div className="container">
            <h2>My Wedding Halls</h2>
            <Link to="/owner/wedding-halls/new" style={{marginRight: '10px'}}>
                <button style={{marginBottom: '20px'}}>Add New Wedding Hall</button>
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
                    <label htmlFor="owner-status-filter" style={{marginRight: '5px'}}>Status:</label>
                    <select id="owner-status-filter" value={statusFilter} onChange={handleStatusFilterChange}>
                        <option value="">All My Halls</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="owner-sort-by" style={{marginRight: '5px'}}>Sort by:</label>
                    <select id="owner-sort-by" value={`${sortBy}_${sortDirection}`} onChange={handleSortChange}>
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

            {halls.length === 0 && !isLoading ? (
                <p>You have not added any wedding halls yet or none match the current filter.</p>
            ) : (
                <>
                    <ul className="item-list">
                        {halls.map((hall) => (
                            <li key={hall.id}>
                                <h3>{hall.name}</h3>
                                <p>Address: {hall.address || hall.location}</p> {/* Use correct field name */}
                                <p>Capacity: {hall.capacity} seats</p>
                                <p>Price per seat: ${hall.price_per_seat}</p> {/* Use correct field name */}
                                <p>Status: <span style={{
                                    fontWeight: 'bold',
                                    color: hall.status === 'approved' ? 'green' : (hall.status === 'pending' ? 'orange' : 'red')
                                }}>{hall.status || 'N/A'}</span></p>
                                <Link to={`/owner/wedding-halls/edit/${hall.id}`}>
                                    <button>Edit</button>
                                </Link>
                                <Link to={`/wedding-halls/${hall.id}`} style={{marginLeft: '5px'}}>
                                    <button className="small">View Public</button>
                                </Link>
                            </li>
                        ))}
                    </ul>
                    {halls.length > 0 && paginationInfo.last_page > 1 && (
                        <div style={{marginTop: '20px', textAlign: 'center'}}>
                            <button onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={!paginationInfo.prev_page_url || isLoading}>
                                Previous
                            </button>
                            <span style={{margin: '0 10px'}}>
                                Page {paginationInfo.current_page || 1} of {paginationInfo.last_page || 1}
                            </span>
                            <button onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={!paginationInfo.next_page_url || isLoading}>
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default OwnerWeddingHallsPage;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetWeddingHallsQuery } from '../../features/weddingHalls/weddingHallApi'; // Use public listing
import {
    useAdminDeleteWeddingHallMutation,
    useAdminApproveWeddingHallMutation,
    useAdminRejectWeddingHallMutation
} from '../../features/admin/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AdminWeddingHallsPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const { data: hallsResponse, isLoading, error, refetch } = useGetWeddingHallsQuery({ page: currentPage, per_page: 10 }); // Fetch all halls, paginated

    const [deleteHall, { isLoading: isDeleting }] = useAdminDeleteWeddingHallMutation();
    const [approveHall, { isLoading: isApproving }] = useAdminApproveWeddingHallMutation();
    const [rejectHall, { isLoading: isRejecting }] = useAdminRejectWeddingHallMutation();

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

    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error.data?.message || "Could not load wedding halls."} />;

    const halls = hallsResponse?.data?.data || []; // Paginated data
    const paginationInfo = hallsResponse?.data || {};

    return (
        <div className="container">
            <h2>Manage All Wedding Halls (Admin)</h2>
            {/* Admin might also have a "Create Hall" button if they can create for owners */}
            {/* <Link to="/admin/wedding-halls/new"><button>Create Hall (Admin)</button></Link> */}

            {halls.length === 0 ? (
                <p>No wedding halls found in the system.</p>
            ) : (
                <>
                    <ul className="item-list">
                        {halls.map((hall) => (
                            <li key={hall.id}>
                                <h3>{hall.name} (ID: {hall.id})</h3>
                                <p>Owner: {hall.owner?.name || 'N/A'} (Owner ID: {hall.owner_id})</p>
                                <p>Location: {hall.location}</p>
                                <p>District: {hall.district?.name || 'N/A'}</p>
                                <p>Status: <span style={{fontWeight: 'bold', color: hall.status === 'approved' ? 'green' : (hall.status === 'pending' ? 'orange' : 'red')}}>{hall.status || 'N/A'}</span></p>
                                <Link to={`/wedding-halls/${hall.id}`}><button className="small">View Details</button></Link>
                                {/* Admin can edit any hall, potentially redirect to a generic edit page or an admin-specific one */}
                                <Link to={`/owner/wedding-halls/edit/${hall.id}`}><button className="small" style={{backgroundColor: '#ffc107', color: 'black'}}>Edit Hall</button></Link>

                                {hall.status === 'pending' && (
                                    <>
                                        <button onClick={() => handleApprove(hall.id)} disabled={isApproving} className="small" style={{backgroundColor: 'green'}}>
                                            {isApproving ? 'Approving...' : 'Approve'}
                                        </button>
                                        <button onClick={() => handleReject(hall.id)} disabled={isRejecting} className="small" style={{backgroundColor: 'orange'}}>
                                            {isRejecting ? 'Rejecting...' : 'Reject'}
                                        </button>
                                    </>
                                )}
                                <button onClick={() => handleDelete(hall.id)} disabled={isDeleting} className="danger small">
                                    {isDeleting ? 'Deleting...' : 'Delete Hall'}
                                </button>
                            </li>
                        ))}
                    </ul>
                    {/* Pagination Controls */}
                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={!paginationInfo.prev_page_url || isLoading}>
                            Previous
                        </button>
                        <span style={{ margin: '0 10px' }}>
              Page {paginationInfo.current_page || 1} of {paginationInfo.last_page || 1}
            </span>
                        <button onClick={() => setCurrentPage(p => p + 1)} disabled={!paginationInfo.next_page_url || isLoading}>
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminWeddingHallsPage;

import React from 'react';
import {Link} from 'react-router-dom';
import {useAdminGetAllWeddingHallsQuery, useAdminDeleteWeddingHallMutation} from '../../features/admin/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AdminWeddingHallsPage = () => {
    const {data: hallsData, isLoading, error, refetch} = useAdminGetAllWeddingHallsQuery();
    const [deleteHall, {isLoading: isDeleting}] = useAdminDeleteWeddingHallMutation();

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this wedding hall? This will also affect its owner and reservations.')) {
            try {
                await deleteHall(id).unwrap();
                alert('Wedding hall deleted.');
                // refetch(); // Tag invalidation should handle this
            } catch (err) {
                alert('Failed to delete wedding hall.');
            }
        }
    };

    if (isLoading) return <LoadingSpinner/>;
    if (error) return <ErrorMessage message="Could not load wedding halls."/>;

    const halls = hallsData?.data || [];

    return (
        <div className="container">
            <h2>Manage All Wedding Halls (Admin)</h2>
            {/* Admin typically doesn't create halls, owners do. But can view/delete. */}
            {halls.length === 0 ? (
                <p>No wedding halls found in the system.</p>
            ) : (
                <ul className="item-list">
                    {halls.map((hall) => (
                        <li key={hall.id}>
                            <h3>{hall.name} (ID: {hall.id})</h3>
                            <p>Owner: {hall.owner?.name || 'N/A'} (ID: {hall.owner_id})</p>
                            <p>Location: {hall.location}</p>
                            <p>District: {hall.district?.name || 'N/A'}</p>
                            <Link to={`/wedding-halls/${hall.id}`}>
                                <button>View Details</button>
                            </Link> {/* Public view */}
                            {/* Admin might have a specific edit view if different from owner's */}
                            {/* <Link to={`/admin/wedding-halls/edit/${hall.id}`}><button>Edit (Admin)</button></Link> */}
                            <button onClick={() => handleDelete(hall.id)} disabled={isDeleting} className="danger"
                                    style={{marginLeft: '5px'}}>
                                {isDeleting ? 'Deleting...' : 'Delete Hall'}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AdminWeddingHallsPage;
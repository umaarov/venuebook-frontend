import React from 'react';
import {Link} from 'react-router-dom';
import {useGetOwnerWeddingHallsQuery, useDeleteOwnerWeddingHallMutation} from '../../features/owner/ownerApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const OwnerWeddingHallsPage = () => {
    const {data: hallsData, isLoading, error, refetch} = useGetOwnerWeddingHallsQuery();
    const [deleteHall, {isLoading: isDeleting}] = useDeleteOwnerWeddingHallMutation();

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this wedding hall? This action cannot be undone.')) {
            try {
                await deleteHall(id).unwrap();
                alert('Wedding hall deleted.');
                // refetch(); // Or rely on tag invalidation
            } catch (err) {
                alert('Failed to delete wedding hall.');
                console.error(err);
            }
        }
    };

    if (isLoading) return <LoadingSpinner/>;
    if (error) return <ErrorMessage message="Could not load your wedding halls."/>;

    const halls = hallsData?.data || [];

    return (
        <div className="container">
            <h2>My Wedding Halls</h2>
            <Link to="/owner/wedding-halls/new">
                <button style={{marginBottom: '20px'}}>Add New Wedding Hall</button>
            </Link>
            {halls.length === 0 ? (
                <p>You have not added any wedding halls yet.</p>
            ) : (
                <ul className="item-list">
                    {halls.map((hall) => (
                        <li key={hall.id}>
                            <h3>{hall.name}</h3>
                            <p>Location: {hall.location}</p>
                            <p>Capacity: {hall.capacity}</p>
                            <p>Price: ${hall.price_per_hour}/hr</p>
                            <Link to={`/owner/wedding-halls/edit/${hall.id}`}>
                                <button>Edit</button>
                            </Link>
                            <button onClick={() => handleDelete(hall.id)} disabled={isDeleting} className="danger">
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default OwnerWeddingHallsPage;
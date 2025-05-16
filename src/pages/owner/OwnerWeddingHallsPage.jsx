import React from 'react';
import { Link } from 'react-router-dom';
import { useGetOwnerWeddingHallsQuery } from '../../features/owner/ownerApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const OwnerWeddingHallsPage = () => {
    const { data: hallsResponse, isLoading, error } = useGetOwnerWeddingHallsQuery();

    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error.data?.message || "Could not load your wedding halls."} />;

    const halls = hallsResponse?.data || []; // Actual halls array is in .data

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
                            <p>Status: {hall.status || 'N/A'}</p>
                            <Link to={`/owner/wedding-halls/edit/${hall.id}`}><button>Edit</button></Link>
                            {/* Delete button removed as owners don't have this route */}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default OwnerWeddingHallsPage;

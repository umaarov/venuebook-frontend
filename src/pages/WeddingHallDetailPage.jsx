import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetWeddingHallByIdQuery } from '../features/weddingHalls/weddingHallApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const WeddingHallDetailPage = () => {
    const { id } = useParams();
    const { data: weddingHallResponse, isLoading, error } = useGetWeddingHallByIdQuery(id);

    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error.data?.message || `Could not load wedding hall details. Error: ${error.status}`} />;

    const hall = weddingHallResponse?.data; // Actual hall object is in .data

    if (!hall) return <p>Wedding hall not found.</p>;

    return (
        <div className="container">
            <h2>{hall.name}</h2>
            <p><strong>Location:</strong> {hall.location}</p>
            <p><strong>Description:</strong> {hall.description}</p>
            <p><strong>Capacity:</strong> {hall.capacity} guests</p>
            <p><strong>Price per hour:</strong> ${hall.price_per_hour}</p>
            {hall.district && <p><strong>District:</strong> {hall.district.name}</p>}
            {hall.owner && <p><strong>Owner:</strong> {hall.owner.name} (Contact: {hall.owner.email})</p>}

            <h3>Images</h3>
            {hall.images && hall.images.length > 0 ? (
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
                    {hall.images.map(image => (
                        <img
                            key={image.id}
                            src={image.image_path.startsWith('http') ? image.image_path : `http://localhost:8000${image.image_path}`}
                            alt={`${hall.name} image`}
                            style={{ width: '200px', height: 'auto', margin: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
                            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/200x150?text=Image+Not+Found"; }}
                        />
                    ))}
                </div>
            ) : (
                <p>No images available for this hall.</p>
            )}

            <br />
            <Link to={`/reservations/new?hall_id=${hall.id}&hall_name=${encodeURIComponent(hall.name)}`}>
                <button style={{marginTop: '10px'}}>Book this Hall</button>
            </Link>
            <br />
            <Link to="/wedding-halls" style={{display: 'inline-block', marginTop: '10px'}}>Back to list</Link>
        </div>
    );
};

export default WeddingHallDetailPage;
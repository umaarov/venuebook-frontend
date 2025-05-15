import React from 'react';
import {useParams, Link} from 'react-router-dom';
import {useGetWeddingHallByIdQuery} from '../features/weddingHalls/weddingHallApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const WeddingHallDetailPage = () => {
    const {id} = useParams();
    const {data: weddingHallData, isLoading, error} = useGetWeddingHallByIdQuery(id);

    if (isLoading) return <LoadingSpinner/>;
    if (error) return <ErrorMessage message={`Could not load wedding hall details. Error: ${error.status}`}/>;
    if (!weddingHallData || !weddingHallData.data) return <p>Wedding hall not found.</p>;

    const hall = weddingHallData.data;

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
                <div>
                    {hall.images.map(image => (
                        // Assuming image_path is a relative path from your Laravel public folder
                        // For development with Vite proxy, this might need adjustment or full URLs from backend
                        <img
                            key={image.id}
                            src={image.image_path.startsWith('http') ? image.image_path : `http://localhost:8000${image.image_path}`} // Adjust base URL if needed
                            alt={`${hall.name} image`}
                            style={{width: '200px', height: 'auto', margin: '5px', border: '1px solid #ccc'}}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/200x150?text=Image+Not+Found";
                            }}
                        />
                    ))}
                </div>
            ) : (
                <p>No images available for this hall.</p>
            )}

            <br/>
            <Link to={`/reservations/new?hall_id=${hall.id}&hall_name=${encodeURIComponent(hall.name)}`}>
                <button>Book this Hall</button>
            </Link>
            <br/>
            <Link to="/wedding-halls">Back to list</Link>
        </div>
    );
};

export default WeddingHallDetailPage;

// File: src/pages/WeddingHallsPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetWeddingHallsQuery, useGetDistrictsQuery, useGetWeddingHallsByDistrictQuery } from '../features/weddingHalls/weddingHallApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const WeddingHallsPage = () => {
    const [selectedDistrict, setSelectedDistrict] = useState('');

    const { data: districtsResponse, isLoading: isLoadingDistricts, error: districtsError } = useGetDistrictsQuery();

    const { data: weddingHallsResponse, isLoading: isLoadingHalls, error: hallsError } =
        selectedDistrict
            ? useGetWeddingHallsByDistrictQuery(selectedDistrict) // Removed commonQueryOptions for simplicity, can be added back if needed
            : useGetWeddingHallsQuery(); // Query params like page can be passed here if pagination is implemented in UI

    const isLoading = isLoadingDistricts || isLoadingHalls;
    const error = districtsError || hallsError; // Combine errors

    if (isLoading) return <LoadingSpinner />;
    // Display specific errors if helpful
    if (districtsError) return <ErrorMessage message={`Could not load districts: ${districtsError.data?.message || districtsError.status}`} />;
    if (hallsError) return <ErrorMessage message={`Could not load wedding halls: ${hallsError.data?.message || hallsError.status}`} />;


    // Extract districts array
    const districts = (districtsResponse && districtsResponse.data && Array.isArray(districtsResponse.data))
        ? districtsResponse.data
        : [];

    // Extract wedding halls array based on which query was used
    let weddingHalls = [];
    if (weddingHallsResponse && weddingHallsResponse.data) {
        if (selectedDistrict) {
            // For getWeddingHallsByDistrictQuery, halls are in weddingHallsResponse.data (which is an array)
            weddingHalls = Array.isArray(weddingHallsResponse.data) ? weddingHallsResponse.data : [];
        } else {
            // For getWeddingHallsQuery (paginated), halls are in weddingHallsResponse.data.data
            weddingHalls = (weddingHallsResponse.data && Array.isArray(weddingHallsResponse.data.data))
                ? weddingHallsResponse.data.data
                : [];
        }
    }

    return (
        <div className="container">
            <h2>Wedding Halls</h2>

            <div>
                <label htmlFor="district-filter">Filter by District: </label>
                <select
                    id="district-filter"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    disabled={isLoadingDistricts || districts.length === 0}
                >
                    <option value="">All Districts</option>
                    {districts.map(district => (
                        <option key={district.id} value={district.id}>{district.name}</option>
                    ))}
                </select>
            </div>

            {weddingHalls.length === 0 && !isLoadingHalls && <p>No wedding halls found.</p>}

            <ul className="item-list">
                {weddingHalls.map((hall) => ( // This should now work
                    <li key={hall.id}>
                        <Link to={`/wedding-halls/${hall.id}`}>
                            <h3>{hall.name}</h3>
                        </Link>
                        <p>Location: {hall.location}</p>
                        <p>Capacity: {hall.capacity}</p>
                        <p>Price per hour: ${hall.price_per_hour}</p>
                        {/* Display district name if available (hall.district might not be populated on list view) */}
                        {/* If district name is needed, ensure backend includes it or fetch separately */}
                    </li>
                ))}
            </ul>
            {/* TODO: Add pagination controls if !selectedDistrict and weddingHallsResponse.data.meta exists */}
        </div>
    );
};

export default WeddingHallsPage;
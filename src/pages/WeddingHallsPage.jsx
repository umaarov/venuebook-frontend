import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetWeddingHallsQuery, useGetDistrictsQuery, useGetWeddingHallsByDistrictQuery } from '../features/weddingHalls/weddingHallApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const WeddingHallsPage = () => {
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [currentPage, setCurrentPage] = useState(1); // For pagination

    const { data: districtsData, isLoading: isLoadingDistricts, error: districtsError } = useGetDistrictsQuery();

    // Pass page and district_id to useGetWeddingHallsQuery if selectedDistrict is empty
    // Otherwise, useGetWeddingHallsByDistrictQuery will be used (which itself now points to /wedding-halls?district_id=X)
    const queryParams = selectedDistrict ? { district_id: selectedDistrict, page: currentPage } : { page: currentPage };

    const { data: weddingHallsResponse, isLoading: isLoadingHalls, error: hallsError } =
        useGetWeddingHallsQuery(queryParams); // Always use this, filter by district_id in params

    const isLoading = isLoadingDistricts || isLoadingHalls;
    const error = districtsError || hallsError;

    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={hallsError?.data?.message || districtsError?.data?.message || "Could not load data."} />;

    // Corrected data extraction for paginated wedding halls
    const weddingHalls = weddingHallsResponse?.data?.data || []; // items are in .data.data
    const paginationInfo = weddingHallsResponse?.data || {}; // links, meta, etc.

    const districts = districtsData?.data || []; // districts are in .data

    const handlePreviousPage = () => {
        if (paginationInfo.prev_page_url) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const handleNextPage = () => {
        if (paginationInfo.next_page_url) {
            setCurrentPage(prev => prev + 1);
        }
    };


    return (
        <div className="container">
            <h2>Wedding Halls</h2>

            <div>
                <label htmlFor="district-filter">Filter by District: </label>
                <select
                    id="district-filter"
                    value={selectedDistrict}
                    onChange={(e) => {
                        setSelectedDistrict(e.target.value);
                        setCurrentPage(1); // Reset to first page on filter change
                    }}
                >
                    <option value="">All Districts</option>
                    {districts.map(district => (
                        <option key={district.id} value={district.id}>{district.name}</option>
                    ))}
                </select>
            </div>

            {weddingHalls.length === 0 && !isLoadingHalls && <p>No wedding halls found for the selected criteria.</p>}

            <ul className="item-list">
                {weddingHalls.map((hall) => (
                    <li key={hall.id}>
                        <Link to={`/wedding-halls/${hall.id}`}>
                            <h3>{hall.name}</h3>
                        </Link>
                        <p>Location: {hall.location}</p>
                        <p>Capacity: {hall.capacity}</p>
                        <p>Price per hour: ${hall.price_per_hour}</p>
                        {hall.district && <p>District: {hall.district.name}</p>}
                    </li>
                ))}
            </ul>

            {/* Pagination Controls */}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button onClick={handlePreviousPage} disabled={!paginationInfo.prev_page_url || isLoadingHalls}>
                    Previous
                </button>
                <span style={{ margin: '0 10px' }}>
          Page {paginationInfo.current_page || 1} of {paginationInfo.last_page || 1}
        </span>
                <button onClick={handleNextPage} disabled={!paginationInfo.next_page_url || isLoadingHalls}>
                    Next
                </button>
            </div>
        </div>
    );
};

export default WeddingHallsPage;
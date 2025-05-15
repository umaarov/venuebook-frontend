import React from 'react';
import {Link} from 'react-router-dom';
import {useGetDistrictsQuery} from '../features/weddingHalls/weddingHallApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const DistrictsPage = () => {
    const {data: districtsData, isLoading, error} = useGetDistrictsQuery();

    if (isLoading) return <LoadingSpinner/>;
    if (error) return <ErrorMessage message="Could not load districts."/>;

    const districts = districtsData?.data || [];

    return (
        <div className="container">
            <h2>Districts</h2>
            {districts.length === 0 ? (
                <p>No districts found.</p>
            ) : (
                <ul className="item-list">
                    {districts.map((district) => (
                        <li key={district.id}>
                            <h3>{district.name}</h3>
                            {/* Link to a page showing halls for this district, or implement filtering on WeddingHallsPage */}
                            <Link to={`/wedding-halls?district_id=${district.id}`}>View Halls in {district.name}</Link>
                            {/* Or, if you have a dedicated route like /districts/{id}/wedding-halls */}
                            {/* <Link to={`/districts/${district.id}/wedding-halls`}>View Halls in {district.name}</Link> */}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DistrictsPage;
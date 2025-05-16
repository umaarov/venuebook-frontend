import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {useGetWeddingHallsQuery, useGetDistrictsQuery} from '../features/weddingHalls/weddingHallApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const WeddingHallsPage = () => {
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');

    const {data: districtsData, isLoading: isLoadingDistricts, error: districtsError} = useGetDistrictsQuery();

    const queryParams = {
        page: currentPage,
        sort_by: sortBy,
        sort_direction: sortDirection,
    };
    if (selectedDistrict) {
        queryParams.district_id = selectedDistrict;
    }

    const {
        data: weddingHallsResponse,
        isLoading: isLoadingHalls,
        error: hallsError,
        refetch
    } = useGetWeddingHallsQuery(queryParams);

    useEffect(() => {
        refetch();
    }, [sortBy, sortDirection, selectedDistrict, currentPage, refetch]);


    const isLoading = isLoadingDistricts || isLoadingHalls;
    const error = districtsError || hallsError;

    if (isLoading) return <LoadingSpinner/>;
    if (error) return <ErrorMessage
        message={hallsError?.data?.message || districtsError?.data?.message || "Could not load data."}/>;

    const weddingHalls = weddingHallsResponse?.data?.data || [];
    const paginationInfo = weddingHallsResponse?.data || {};
    const districts = districtsData?.data || [];

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= (paginationInfo.last_page || 1)) {
            setCurrentPage(newPage);
        }
    };

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


    return (
        <div className="container">
            <h2>Wedding Halls</h2>
            <div style={{display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center'}}>
                <div>
                    <label htmlFor="district-filter" style={{marginRight: '5px'}}>Filter by District: </label>
                    <select id="district-filter" value={selectedDistrict} onChange={(e) => {
                        setSelectedDistrict(e.target.value);
                        setCurrentPage(1);
                    }}>
                        <option value="">All Districts</option>
                        {districts.map(district => (
                            <option key={district.id} value={district.id}>{district.name}</option>))}
                    </select>
                </div>
                <div>
                    <label htmlFor="sort-by" style={{marginRight: '5px'}}>Sort by: </label>
                    <select id="sort-by" value={`${sortBy}_${sortDirection}`} onChange={handleSortChange}>
                        <option value="created_at_desc">Newest First</option>
                        <option value="price_per_seat_asc">Price: Low to High</option>
                        <option value="price_per_seat_desc">Price: High to Low</option>
                        <option value="capacity_asc">Capacity: Low to High</option>
                        <option value="capacity_desc">Capacity: High to Low</option>
                        <option value="name_asc">Name: A-Z</option>
                        <option value="name_desc">Name: Z-A</option>
                    </select>
                </div>
            </div>

            {weddingHalls.length === 0 && !isLoadingHalls && <p>No wedding halls found.</p>}
            <ul className="item-list">
                {weddingHalls.map((hall) => (
                    <li key={hall.id}>
                        <Link to={`/wedding-halls/${hall.id}`}><h3>{hall.name}</h3></Link>
                        <p>Address: {hall.address}</p>
                        <p>Capacity: {hall.capacity} seats</p>
                        <p>Price per seat: ${hall.price_per_seat}</p>
                        {hall.district && <p>District: {hall.district.name}</p>}
                    </li>
                ))}
            </ul>
            {weddingHalls.length > 0 && paginationInfo.last_page > 1 && (
                <div style={{marginTop: '20px', textAlign: 'center'}}>
                    <button onClick={() => handlePageChange(currentPage - 1)}
                            disabled={!paginationInfo.prev_page_url || isLoadingHalls}>Previous
                    </button>
                    <span
                        style={{margin: '0 10px'}}>Page {paginationInfo.current_page || 1} of {paginationInfo.last_page || 1}</span>
                    <button onClick={() => handlePageChange(currentPage + 1)}
                            disabled={!paginationInfo.next_page_url || isLoadingHalls}>Next
                    </button>
                </div>
            )}
        </div>
    );
};
export default WeddingHallsPage;
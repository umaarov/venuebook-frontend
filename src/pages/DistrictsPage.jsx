import React from 'react';
import {Link} from 'react-router-dom';
import {useGetDistrictsQuery} from '../features/weddingHalls/weddingHallApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {ChevronRightIcon, MapIcon, MapPinIcon} from '@heroicons/react/24/solid';

const DistrictsPage = () => {
    const {data: districtsResponse, isLoading, error} = useGetDistrictsQuery();

    if (isLoading) return <LoadingSpinner message="Loading districts..."/>;
    if (error) return <ErrorMessage message={error.data?.message || "Could not load districts."}
                                    details={error.data?.errors}/>;

    const districts = districtsResponse?.data || [];

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <MapIcon className="mx-auto h-12 w-12 text-primary opacity-80"/>
                <h1 className="text-4xl font-extrabold text-gray-900 mt-2 sm:text-5xl">
                    Explore by District
                </h1>
                <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
                    Discover wedding halls in your preferred areas. Click on a district to see available venues.
                </p>
            </div>

            {districts.length === 0 && !isLoading ? (
                <div className="text-center py-10 bg-white rounded-lg shadow-md">
                    <MapPinIcon className="h-16 w-16 mx-auto text-gray-400 mb-4"/>
                    <p className="text-gray-500 text-lg">No districts are currently listed.</p>
                    <p className="text-sm text-gray-400 mt-1">Please check back later or contact support.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {districts.map((district) => (
                        <Link
                            key={district.id}
                            to={`/wedding-halls?district_id=${district.id}&district_name=${encodeURIComponent(district.name)}`}
                            className="group block bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1.5 hover:scale-105"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-primary-dark group-hover:text-primary transition-colors">
                                    {district.name}
                                </h3>
                                <MapPinIcon
                                    className="h-8 w-8 text-primary-light group-hover:text-primary transition-colors transform group-hover:scale-110"/>
                            </div>
                            <p className="text-sm text-gray-500 mt-2 mb-4">
                                Find stunning venues in the {district.name} area.
                            </p>
                            <span
                                className="inline-flex items-center text-sm font-medium text-primary group-hover:text-primary-dark transition-colors">
                                View Halls <ChevronRightIcon
                                className="h-5 w-5 ml-1 transform group-hover:translate-x-1 transition-transform"/>
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DistrictsPage;
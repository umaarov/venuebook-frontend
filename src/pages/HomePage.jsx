import React from 'react';
import {Link} from 'react-router-dom';
import {useAppSelector} from '../app/hooks';
import {selectCurrentUser, selectIsAuthenticated} from '../features/auth/authSlice';
import {
    SparklesIcon,
    CalendarIcon,
    MagnifyingGlassCircleIcon,
} from '@heroicons/react/24/outline';

const FeatureCard = ({icon, title, description}) => (
    <div
        className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
        <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-primary-light text-primary">
            {icon}
        </div>
        <h3 className="mb-2 text-xl font-semibold text-gray-800">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
    </div>
);

const HomePage = () => {
    const user = useAppSelector(selectCurrentUser);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    return (
        <>
            <section
                className="py-20 bg-gradient-to-br from-primary-light via-pink-50 to-rose-100 rounded-xl shadow-xl">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-800 mb-6 leading-tight">
                        Find Your <span className="text-primary-dark">Perfect Venue</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-700 mb-10 max-w-2xl mx-auto">
                        Discover and book exquisite wedding halls for your special day. Effortless planning starts here.
                    </p>
                    <div className="space-x-0 space-y-4 sm:space-y-0 sm:space-x-4">
                        <Link
                            to="/wedding-halls"
                            className="inline-block bg-primary hover:bg-primary-dark text-white font-bold py-4 px-10 rounded-lg text-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
                        >
                            Browse Halls
                        </Link>
                        {!isAuthenticated && (
                            <Link
                                to="/register"
                                className="inline-block bg-transparent hover:bg-primary-light text-primary-dark font-semibold py-4 px-10 border-2 border-primary-dark rounded-lg text-lg shadow-sm hover:shadow-md transition duration-300 ease-in-out"
                            >
                                Get Started
                            </Link>
                        )}
                    </div>
                    {isAuthenticated && user && (
                        <p className="mt-12 text-xl text-gray-700">
                            Welcome back, <span className="font-semibold text-primary-dark">{user.name}</span>! Ready to
                            plan?
                        </p>
                    )}
                </div>
            </section>

            <section className="py-20">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Why Choose Us?</h2>
                    <p className="text-center text-gray-600 mb-12 max-w-xl mx-auto">
                        We provide a seamless and enjoyable experience for finding and booking the ideal wedding venue.
                    </p>
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<MagnifyingGlassCircleIcon className="w-8 h-8"/>}
                            title="Vast Selection"
                            description="Explore a wide variety of halls to match your style and budget, from intimate gatherings to grand celebrations."
                        />
                        <FeatureCard
                            icon={<CalendarIcon className="w-8 h-8"/>}
                            title="Easy Booking"
                            description="Check availability, compare options, and secure your date with our simple and intuitive booking process."
                        />
                        <FeatureCard
                            icon={<SparklesIcon className="w-8 h-8"/>}
                            title="Memorable Events"
                            description="We're committed to helping you find the perfect backdrop for your unforgettable wedding day."
                        />
                    </div>
                </div>
            </section>

            {!isAuthenticated || (user && user.role !== 'owner' && user.role !== 'admin') && (
                <section className="py-16 bg-gray-200 rounded-lg">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Are You a Hall Owner?</h2>
                        <p className="text-gray-700 mb-8 max-w-lg mx-auto">
                            List your venue with us and reach thousands of couples looking for their perfect wedding
                            hall.
                        </p>
                        <Link
                            to={isAuthenticated ? '/owner/dashboard' : '/register?role=owner'}
                            className="bg-secondary hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-md hover:shadow-lg transition duration-300"
                        >
                            List Your Hall
                        </Link>
                    </div>
                </section>
            )}
        </>
    );
};

export default HomePage;
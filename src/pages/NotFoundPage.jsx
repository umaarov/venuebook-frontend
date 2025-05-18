import React from 'react';
import {Link} from 'react-router-dom';
import {ExclamationCircleIcon, HomeIcon} from '@heroicons/react/24/solid';

const NotFoundPage = () => (
    <div
        className="min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-8 sm:p-12 rounded-xl shadow-2xl max-w-lg w-full">
            <ExclamationCircleIcon className="mx-auto h-20 w-20 text-red-400 mb-6"/>
            <h1 className="text-5xl sm:text-7xl font-extrabold text-primary mb-3">404</h1>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4">
                Page Not Found
            </h2>
            <p className="text-gray-600 mb-10 text-lg leading-relaxed">
                Oops! The page you are looking for doesn't exist or has been moved.
            </p>
            <Link
                to="/"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-transform transform hover:scale-105"
            >
                <HomeIcon className="h-5 w-5 mr-2"/>
                Go to Homepage
            </Link>
        </div>
    </div>
);

export default NotFoundPage;
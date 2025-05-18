import React from 'react';

const LoadingSpinner = ({ message = "Loading..." }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 border-8 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xl font-semibold text-gray-700">{message}</p>
    </div>
);

export default LoadingSpinner;
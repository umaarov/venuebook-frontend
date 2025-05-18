import React from 'react';
import {ExclamationCircleIcon} from "@heroicons/react/24/outline/index.js";

const ErrorMessage = ({message, details}) => (
    <div
        className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md my-4"
        role="alert"
    >
        <div className="flex">
            <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true"/>
            </div>
            <div className="ml-3">
                <p className="text-sm font-semibold text-red-800">
                    {message || "An unexpected error occurred."}
                </p>
                {details && typeof details === 'object' && Object.keys(details).length > 0 && (
                    <ul className="mt-2 list-disc list-inside text-sm text-red-700 space-y-1">
                        {Object.entries(details).map(([field, errors]) => (
                            <li key={field}>
                                <strong
                                    className="capitalize">{field.replace(/_/g, ' ')}:</strong> {Array.isArray(errors) ? errors.join(', ') : String(errors)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    </div>
);

export default ErrorMessage;
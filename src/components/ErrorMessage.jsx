import React from 'react';

const ErrorMessage = ({ message, details }) => (
    <div style={{ color: 'red', border: '1px solid red', padding: '10px', margin: '10px 0', borderRadius: '4px', backgroundColor: '#ffebee' }}>
        <p><strong>Error:</strong> {message || "An unexpected error occurred."}</p>
        {details && typeof details === 'object' && Object.keys(details).length > 0 && (
            <ul style={{paddingLeft: '20px', margin: '5px 0 0 0'}}>
                {Object.entries(details).map(([field, errors]) => (
                    <li key={field}>
                        <strong>{field}:</strong> {Array.isArray(errors) ? errors.join(', ') : String(errors)}
                    </li>
                ))}
            </ul>
        )}
    </div>
);

export default ErrorMessage;
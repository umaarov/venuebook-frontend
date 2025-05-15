import React from 'react';

const ErrorMessage = ({message, details}) => (
    <div style={{
        color: 'red',
        border: '1px solid red',
        padding: '10px',
        margin: '10px 0',
        borderRadius: '4px',
        backgroundColor: '#ffebee'
    }}>
        <p><strong>Error:</strong> {message}</p>
        {details && (
            <ul style={{paddingLeft: '20px', margin: '5px 0 0 0'}}>
                {Object.entries(details).map(([field, errors]) => (
                    <li key={field}>
                        {field}: {Array.isArray(errors) ? errors.join(', ') : errors}
                    </li>
                ))}
            </ul>
        )}
    </div>
);

export default ErrorMessage;
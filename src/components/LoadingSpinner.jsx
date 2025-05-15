import React from 'react';

const LoadingSpinner = ({message = "Loading..."}) => (
    <div style={{textAlign: 'center', padding: '20px'}}>
        <p>{message}</p>
        {/* You can add a CSS spinner animation here if desired */}
    </div>
);

export default LoadingSpinner;
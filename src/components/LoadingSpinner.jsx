import React from 'react';

const LoadingSpinner = ({ message = "Loading..."}) => (
    <div style={{ textAlign: 'center', padding: '20px', fontSize: '1.2em' }}>
        <p>{message}</p>
        <div style={{display: 'inline-block', animation: 'spin 1s linear infinite'}}>⏳</div>
        <style>
            {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
        </style>
    </div>
);

export default LoadingSpinner;
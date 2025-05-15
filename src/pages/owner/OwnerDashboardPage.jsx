import React from 'react';
import {Link} from 'react-router-dom';
import {useAppSelector} from '../../app/hooks';
import {selectCurrentUser} from '../../features/auth/authSlice';

const OwnerDashboardPage = () => {
    const user = useAppSelector(selectCurrentUser);

    return (
        <div className="container">
            <h2>Owner Dashboard</h2>
            <p>Welcome, {user?.name}!</p>
            <p>This is your dashboard where you can manage your wedding halls and reservations.</p>
            <ul>
                <li><Link to="/owner/wedding-halls">Manage My Wedding Halls</Link></li>
                <li><Link to="/owner/reservations">View Reservations for My Halls</Link></li>
            </ul>
        </div>
    );
};

export default OwnerDashboardPage;
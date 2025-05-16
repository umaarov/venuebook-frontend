import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { selectCurrentUser } from '../../features/auth/authSlice';

const AdminDashboardPage = () => {
    const user = useAppSelector(selectCurrentUser);

    return (
        <div className="container">
            <h2>Admin Dashboard</h2>
            <p>Welcome, Administrator {user?.name}!</p>
            <p>Manage owners and wedding halls across the platform.</p>
            <ul>
                <li><Link to="/admin/owners">Manage Owners</Link></li>
                <li><Link to="/admin/wedding-halls">Manage All Wedding Halls</Link></li>
                <li><Link to="/admin/reservations">Manage All Reservations</Link></li>
            </ul>
        </div>
    );
};

export default AdminDashboardPage;

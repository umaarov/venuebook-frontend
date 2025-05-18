import React from 'react';
import {Link} from 'react-router-dom';
import {useAppSelector} from '../../app/hooks';
import {selectCurrentUser} from '../../features/auth/authSlice';
import {BuildingOfficeIcon, ListBulletIcon, UserGroupIcon} from '@heroicons/react/24/outline';

const DashboardCard = ({to, title, description, icon, color}) => (
    <Link
        to={to}
        className={`block p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1 ${color}`}
    >
        <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-white bg-opacity-30 mr-4 text-white">
                {icon}
            </div>
            <h3 className="text-2xl font-semibold text-white">{title}</h3>
        </div>
        <p className="text-white text-opacity-90">{description}</p>
    </Link>
);


const AdminDashboardPage = () => {
    const user = useAppSelector(selectCurrentUser);

    return (
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-xl">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
                <p className="text-xl text-gray-600">
                    Welcome, Administrator <span className="font-semibold text-primary">{user?.name || 'Admin'}</span>!
                </p>
                <p className="text-gray-500 mt-1">Oversee and manage the platform's core functionalities.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <DashboardCard
                    to="/admin/owners"
                    title="Manage Owners"
                    description="View, add, or modify venue owner accounts."
                    icon={<UserGroupIcon className="h-8 w-8"/>}
                    color="bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                />
                <DashboardCard
                    to="/admin/wedding-halls"
                    title="Manage Halls"
                    description="Approve, reject, or edit all wedding hall listings."
                    icon={<BuildingOfficeIcon className="h-8 w-8"/>}
                    color="bg-gradient-to-br from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
                />
                <DashboardCard
                    to="/admin/reservations"
                    title="Manage Reservations"
                    description="View and manage all bookings across the platform."
                    icon={<ListBulletIcon className="h-8 w-8"/>}
                    color="bg-gradient-to-br from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700"
                />
            </div>
        </div>
    );
};

export default AdminDashboardPage;
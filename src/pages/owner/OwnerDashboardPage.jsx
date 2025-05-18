import React from 'react';
import {Link} from 'react-router-dom';
import {useAppSelector} from '../../app/hooks';
import {selectCurrentUser} from '../../features/auth/authSlice';
import {CalendarIcon, RectangleStackIcon} from '@heroicons/react/24/outline';

const DashboardCard = ({to, title, description, icon, colorScheme}) => (
    <Link
        to={to}
        className={`block p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1.5 ${colorScheme}`}
    >
        <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-white bg-opacity-25 text-white mr-4">
                {React.cloneElement(icon, {className: "h-8 w-8"})}
            </div>
            <h3 className="text-2xl font-semibold text-white tracking-tight">{title}</h3>
        </div>
        <p className="text-white text-opacity-90 leading-relaxed">{description}</p>
    </Link>
);

const OwnerDashboardPage = () => {
    const user = useAppSelector(selectCurrentUser);

    return (
        <div className="space-y-10">
            <header className="bg-white p-8 rounded-xl shadow-xl">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Owner Dashboard</h1>
                <p className="text-xl text-gray-600">
                    Welcome back, <span className="font-semibold text-primary">{user?.name || 'Owner'}</span>!
                </p>
                <p className="text-gray-500 mt-1">Manage your wedding halls, view bookings, and update your
                    listings.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <DashboardCard
                    to="/owner/wedding-halls"
                    title="My Wedding Halls"
                    description="Add, edit, and manage all your listed wedding hall details and availability."
                    icon={<RectangleStackIcon/>}
                    colorScheme="bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                />
                <DashboardCard
                    to="/owner/reservations"
                    title="View Reservations"
                    description="Track bookings for your halls, view customer details, and manage reservation statuses."
                    icon={<CalendarIcon/>}
                    colorScheme="bg-gradient-to-br from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
                />
            </div>
        </div>
    );
};

export default OwnerDashboardPage;
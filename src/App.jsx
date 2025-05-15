import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Page Components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import WeddingHallsPage from './pages/WeddingHallsPage';
import WeddingHallDetailPage from './pages/WeddingHallDetailPage';
import DistrictsPage from './pages/DistrictsPage';
import MyReservationsPage from './pages/MyReservationsPage';
import CreateReservationPage from './pages/CreateReservationPage';
import NotFoundPage from './pages/NotFoundPage';

// Owner Pages
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage';
import OwnerWeddingHallsPage from './pages/owner/OwnerWeddingHallsPage';
import OwnerManageWeddingHallPage from './pages/owner/OwnerManageWeddingHallPage';
import OwnerReservationsPage from './pages/owner/OwnerReservationsPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminManageUserPage from './pages/admin/AdminManageUserPage';
import AdminWeddingHallsPage from './pages/admin/AdminWeddingHallsPage';
import AdminReservationsPage from './pages/admin/AdminReservationsPage';

function App() {
    return (
        <>
            <Navbar />
            <div style={{ padding: '20px' }}> {/* Basic padding */}
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/wedding-halls" element={<WeddingHallsPage />} />
                    <Route path="/wedding-halls/:id" element={<WeddingHallDetailPage />} />
                    <Route path="/districts" element={<DistrictsPage />} />

                    {/* User Protected Routes */}
                    <Route element={<PrivateRoute allowedRoles={['user', 'owner', 'admin']} />}>
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/my-reservations" element={<MyReservationsPage />} />
                        <Route path="/reservations/new" element={<CreateReservationPage />} />
                        {/* Add route for updating reservation if needed */}
                    </Route>

                    {/* Owner Protected Routes */}
                    <Route element={<PrivateRoute allowedRoles={['owner', 'admin']} />}>
                        <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
                        <Route path="/owner/wedding-halls" element={<OwnerWeddingHallsPage />} />
                        <Route path="/owner/wedding-halls/new" element={<OwnerManageWeddingHallPage mode="create" />} />
                        <Route path="/owner/wedding-halls/edit/:id" element={<OwnerManageWeddingHallPage mode="edit" />} />
                        <Route path="/owner/reservations" element={<OwnerReservationsPage />} />
                    </Route>

                    {/* Admin Protected Routes */}
                    <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                        <Route path="/admin/users" element={<AdminUsersPage />} />
                        <Route path="/admin/users/edit/:id" element={<AdminManageUserPage />} />
                        <Route path="/admin/wedding-halls" element={<AdminWeddingHallsPage />} />
                        <Route path="/admin/reservations" element={<AdminReservationsPage />} />
                    </Route>

                    {/* Not Found Route */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </div>
        </>
    );
}

export default App;
import React from 'react';
import {Routes, Route} from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

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

import OwnerDashboardPage from './pages/owner/OwnerDashboardPage';
import OwnerWeddingHallsPage from './pages/owner/OwnerWeddingHallsPage';
import OwnerManageWeddingHallPage from './pages/owner/OwnerManageWeddingHallPage';
import OwnerReservationsPage from './pages/owner/OwnerReservationsPage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminWeddingHallsPage from './pages/admin/AdminWeddingHallsPage';
import AdminManageOwnersPage from './pages/admin/AdminManageOwnersPage';
import AdminAllReservationsPage from "./pages/admin/AdminAllReservationsPage.jsx";

function App() {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Navbar/>
            <main className="flex-grow">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Routes>
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/login" element={<LoginPage/>}/>
                        <Route path="/register" element={<RegisterPage/>}/>
                        <Route path="/wedding-halls" element={<WeddingHallsPage/>}/>
                        <Route path="/wedding-halls/:id" element={<WeddingHallDetailPage/>}/>
                        <Route path="/districts" element={<DistrictsPage/>}/>

                        <Route element={<PrivateRoute allowedRoles={['user', 'owner', 'admin']}/>}>
                            <Route path="/profile" element={<ProfilePage/>}/>
                            <Route path="/my-reservations" element={<MyReservationsPage/>}/>
                            <Route path="/reservations/new/:hallId"
                                   element={<CreateReservationPage/>}/> {/* Added hallId example */}
                        </Route>

                        <Route element={<PrivateRoute allowedRoles={['owner', 'admin']}/>}>
                            <Route path="/owner/dashboard" element={<OwnerDashboardPage/>}/>
                            <Route path="/owner/wedding-halls" element={<OwnerWeddingHallsPage/>}/>
                            <Route path="/owner/wedding-halls/new"
                                   element={<OwnerManageWeddingHallPage mode="create"/>}/>
                            <Route path="/owner/wedding-halls/edit/:id"
                                   element={<OwnerManageWeddingHallPage mode="edit"/>}/>
                            <Route path="/owner/reservations" element={<OwnerReservationsPage/>}/>
                        </Route>

                        <Route element={<PrivateRoute allowedRoles={['admin']}/>}>
                            <Route path="/admin/dashboard" element={<AdminDashboardPage/>}/>
                            <Route path="/admin/owners" element={<AdminManageOwnersPage/>}/>
                            <Route path="/admin/wedding-halls" element={<AdminWeddingHallsPage/>}/>
                            <Route path="/admin/wedding-halls/new"
                                   element={<OwnerManageWeddingHallPage mode="create" isAdminView={true}/>}/>
                            <Route path="/admin/wedding-halls/edit/:id"
                                   element={<OwnerManageWeddingHallPage mode="edit" isAdminView={true}/>}/>
                            <Route path="/admin/reservations" element={<AdminAllReservationsPage/>}/>
                        </Route>

                        <Route path="*" element={<NotFoundPage/>}/>
                    </Routes>
                </div>
            </main>
            <footer className="bg-gray-800 text-white text-center p-6 shadow-inner mt-auto">
                <p>&copy; {new Date().getFullYear()} VenueBook. All rights reserved.</p>
                <p className="text-sm text-gray-400">Crafted with ❤️ for your special moments.</p>
            </footer>
        </div>
    );
}

export default App;
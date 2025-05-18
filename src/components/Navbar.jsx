import React, {useState} from 'react';
import {Link, NavLink, useNavigate} from 'react-router-dom';
import {useAppSelector, useAppDispatch} from '../app/hooks';
import {selectIsAuthenticated, selectCurrentUser, logoutUser} from '../features/auth/authSlice';
import {useLogoutMutation} from '../features/auth/authApi';
import {
    UserCircleIcon,
    HomeIcon,
    CalendarIcon,
    CogIcon,
    ViewColumnsIcon,
    RectangleStackIcon,
    ArrowLeftOnRectangleIcon,
    XMarkIcon,
    Bars3Icon,
} from '@heroicons/react/24/outline';

const Navbar = () => {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const currentUser = useAppSelector(selectCurrentUser);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [logoutApiCall] = useLogoutMutation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logoutApiCall().unwrap();
        } catch (error) {
            console.error('Logout failed on API call:', error);
        } finally {
            dispatch(logoutUser());
            navigate('/login');
        }
    };

    const navLinkClass = ({isActive}) =>
        `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out ${
            isActive
                ? 'bg-primary-dark text-white'
                : 'text-gray-700 hover:bg-primary-light hover:text-primary-dark'
        }`;

    const mobileNavLinkClass = ({isActive}) =>
        `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 ease-in-out ${
            isActive
                ? 'bg-primary-dark text-white'
                : 'text-gray-700 hover:bg-primary-light hover:text-primary-dark'
        }`;

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex-shrink-0">
                        <Link
                            to="/"
                            className="text-3xl font-bold text-primary-dark hover:text-primary transition-colors"
                        >
                            Venue<span className="text-primary">Book</span>
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <NavLink to="/" className={navLinkClass} end>
                                <HomeIcon className="h-5 w-5 mr-1"/>
                                Home
                            </NavLink>
                            <NavLink to="/wedding-halls" className={navLinkClass}>
                                <ViewColumnsIcon className="h-5 w-5 mr-1"/>
                                Halls
                            </NavLink>
                            <NavLink to="/districts" className={navLinkClass}>
                                <RectangleStackIcon className="h-5 w-5 mr-1"/>
                                Districts
                            </NavLink>

                            {isAuthenticated ? (
                                <>
                                    <NavLink to="/profile" className={navLinkClass}>
                                        <UserCircleIcon className="h-5 w-5 mr-1"/>
                                        Profile ({currentUser?.name})
                                    </NavLink>
                                    <NavLink to="/my-reservations" className={navLinkClass}>
                                        <CalendarIcon className="h-5 w-5 mr-1"/>
                                        My Reservations
                                    </NavLink>

                                    {currentUser?.role === 'owner' && (
                                        <NavLink to="/owner/dashboard" className={navLinkClass}>
                                            <CogIcon className="h-5 w-5 mr-1"/>
                                            Owner Dashboard
                                        </NavLink>
                                    )}
                                    {currentUser?.role === 'admin' && (
                                        <NavLink to="/admin/dashboard" className={navLinkClass}>
                                            <CogIcon className="h-5 w-5 mr-1"/>
                                            Admin Dashboard
                                        </NavLink>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out text-sm"
                                    >
                                        <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-1"/>
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <NavLink to="/login" className={navLinkClass}>
                                        Login
                                    </NavLink>
                                    <NavLink
                                        to="/register"
                                        className="ml-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-colors"
                                    >
                                        Register
                                    </NavLink>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            type="button"
                            className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                            aria-controls="mobile-menu"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {mobileMenuOpen ? (
                                <XMarkIcon className="block h-6 w-6" aria-hidden="true"/>
                            ) : (
                                <Bars3Icon className="block h-6 w-6" aria-hidden="true"/>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {mobileMenuOpen && (
                <div className="md:hidden" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <NavLink
                            to="/"
                            className={mobileNavLinkClass}
                            end
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Home
                        </NavLink>
                        <NavLink
                            to="/wedding-halls"
                            className={mobileNavLinkClass}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Wedding Halls
                        </NavLink>
                        <NavLink
                            to="/districts"
                            className={mobileNavLinkClass}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Districts
                        </NavLink>

                        {isAuthenticated ? (
                            <>
                                <NavLink
                                    to="/profile"
                                    className={mobileNavLinkClass}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Profile ({currentUser?.name})
                                </NavLink>
                                <NavLink
                                    to="/my-reservations"
                                    className={mobileNavLinkClass}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    My Reservations
                                </NavLink>
                                {currentUser?.role === 'owner' && (
                                    <NavLink
                                        to="/owner/dashboard"
                                        className={mobileNavLinkClass}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Owner Dashboard
                                    </NavLink>
                                )}
                                {currentUser?.role === 'admin' && (
                                    <NavLink
                                        to="/admin/dashboard"
                                        className={mobileNavLinkClass}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Admin Dashboard
                                    </NavLink>
                                )}
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <NavLink
                                    to="/login"
                                    className={mobileNavLinkClass}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Login
                                </NavLink>
                                <NavLink
                                    to="/register"
                                    className={mobileNavLinkClass}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Register
                                </NavLink>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
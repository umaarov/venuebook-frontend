import React, {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useRegisterMutation} from '../features/auth/authApi';
import {useAppSelector} from '../app/hooks';
import {selectIsAuthenticated} from '../features/auth/authSlice';
import ErrorMessage from '../components/ErrorMessage';
import {
    EnvelopeIcon,
    IdentificationIcon,
    LockClosedIcon,
    UserCircleIcon,
    UserPlusIcon
} from '@heroicons/react/24/solid';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [formError, setFormError] = useState('');

    const navigate = useNavigate();
    const [register, {isLoading, error: apiError, reset: resetApiError}] = useRegisterMutation();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/profile');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        resetApiError();

        if (password !== passwordConfirmation) {
            setFormError("Passwords don't match!");
            return;
        }
        if (password.length < 8) {
            setFormError("Password must be at least 8 characters long.");
            return;
        }

        try {
            await register({name, username, email, password, password_confirmation: passwordConfirmation}).unwrap();
            alert("Registration successful! Please login.");
            navigate('/login');
        } catch (err) {
            console.error('Failed to register:', err);
        }
    };

    const inputClass = "appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary sm:text-sm transition-colors pl-10";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-2xl">
                <div>
                    <UserPlusIcon className="mx-auto h-12 w-auto text-primary opacity-80"/>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login"
                              className="font-medium text-primary hover:text-primary-dark transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>

                {formError && <ErrorMessage message={formError}/>}
                {apiError &&
                    <ErrorMessage message={apiError.data?.message || 'Registration failed. Please check your input.'}
                                  details={apiError.data?.errors}/>}

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    <div>
                        <label htmlFor="name" className={labelClass}>Full Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <IdentificationIcon className="h-5 w-5 text-gray-400" aria-hidden="true"/>
                            </div>
                            <input id="name" name="name" type="text" value={name}
                                   onChange={(e) => setName(e.target.value)} required className={`${inputClass} pl-10`}
                                   placeholder="Full Name"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="username" className={labelClass}>Username</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserCircleIcon className="h-5 w-5 text-gray-400" aria-hidden="true"/>
                            </div>
                            <input id="username" name="username" type="text" value={username}
                                   onChange={(e) => setUsername(e.target.value)} required
                                   className={`${inputClass} pl-10`} placeholder="Username"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="email" className={labelClass}>Email address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <EnvelopeIcon className="h-5 w-5 text-gray-400" aria-hidden="true"/>
                            </div>
                            <input id="email" name="email" type="email" autoComplete="email" value={email}
                                   onChange={(e) => setEmail(e.target.value)} required className={`${inputClass} pl-10`}
                                   placeholder="Email address"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password" className={labelClass}>Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true"/>
                            </div>
                            <input id="password" name="password" type="password" value={password}
                                   onChange={(e) => setPassword(e.target.value)} required minLength="8"
                                   className={`${inputClass} pl-10`} placeholder="Password (min. 8 characters)"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="passwordConfirmation" className={labelClass}>Confirm Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true"/>
                            </div>
                            <input id="passwordConfirmation" name="passwordConfirmation" type="password"
                                   value={passwordConfirmation}
                                   onChange={(e) => setPasswordConfirmation(e.target.value)} required
                                   className={`${inputClass} pl-10`} placeholder="Confirm Password"/>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark disabled:opacity-70 transition-colors"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                         xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor"
                                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Registering...</>
                            ) : "Create Account"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default RegisterPage;
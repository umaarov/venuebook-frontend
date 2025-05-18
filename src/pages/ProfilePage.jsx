import React, {useEffect, useState} from 'react';
import {useGetAuthUserProfileQuery, useUpdateAuthUserProfileMutation} from '../features/auth/authApi';
import {useAppSelector} from '../app/hooks';
import {selectCurrentUser} from '../features/auth/authSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
    ArrowDownTrayIcon,
    ArrowPathIcon,
    IdentificationIcon,
    LockClosedIcon,
    UserCircleIcon
} from '@heroicons/react/24/solid';
import {Link} from "react-router-dom";

const ProfilePage = () => {
    const {data: profileData, isLoading: isLoadingProfile, error: profileError, refetch} = useGetAuthUserProfileQuery();
    const currentUserFromSlice = useAppSelector(selectCurrentUser);

    const [updateProfile, {
        isLoading: isUpdating,
        error: updateError,
        reset: resetUpdateError
    }] = useUpdateAuthUserProfileMutation();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
    const [passwordFormError, setPasswordFormError] = useState('');


    const effectiveUser = profileData?.data || currentUserFromSlice;

    useEffect(() => {
        if (effectiveUser) {
            setName(effectiveUser.name || '');
            setEmail(effectiveUser.email || '');
            setUsername(effectiveUser.username || '');
        }
    }, [effectiveUser]);

    const handleProfileUpdateSubmit = async (e) => {
        e.preventDefault();
        resetUpdateError();
        const updateData = {name, email, username};
        try {
            await updateProfile({profileData: updateData}).unwrap();
            alert('Profile details updated successfully!');
            refetch();
        } catch (err) {
            console.error('Failed to update profile details:', err);
        }
    };

    const handlePasswordUpdateSubmit = async (e) => {
        e.preventDefault();
        resetUpdateError();
        setPasswordFormError('');

        if (newPassword !== newPasswordConfirmation) {
            setPasswordFormError("New passwords don't match!");
            return;
        }
        if (newPassword.length > 0 && newPassword.length < 8) {
            setPasswordFormError("New password must be at least 8 characters long.");
            return;
        }
        if (newPassword.length > 0 && !currentPassword) {
            setPasswordFormError("Current password is required to set a new password.");
            return;
        }


        const passwordUpdateData = {};
        if (currentPassword) passwordUpdateData.current_password = currentPassword;
        if (newPassword) passwordUpdateData.password = newPassword;
        if (newPasswordConfirmation) passwordUpdateData.password_confirmation = newPasswordConfirmation;


        if (Object.keys(passwordUpdateData).length === 0 || (!newPassword && !currentPassword)) {
            setPasswordFormError("Please provide current and new password details.");
            return;
        }

        try {
            await updateProfile({passwordData: passwordUpdateData}).unwrap();
            alert('Password updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setNewPasswordConfirmation('');
            refetch();
        } catch (err) {
            console.error('Failed to update password:', err);
            setPasswordFormError(err.data?.message || "Failed to update password.");
        }
    };


    const inputClass = "mt-1 block w-full py-2.5 px-3.5 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary sm:text-sm transition-colors disabled:bg-gray-100";
    const labelClass = "block text-sm font-medium text-gray-700";

    if (isLoadingProfile && !effectiveUser) return <LoadingSpinner message="Loading profile..."/>;

    if (profileError && !effectiveUser) return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <ErrorMessage message={`Could not load profile. ${profileError.data?.message || profileError.status}`}/>
            <Link to="/login" className="mt-4 inline-block text-primary hover:text-primary-dark">Go to Login</Link>
        </div>
    );

    if (!effectiveUser) return (
        <div className="max-w-3xl mx-auto py-10 px-4 text-center">
            <UserCircleIcon className="mx-auto h-20 w-20 text-gray-400 mb-4"/>
            <p className="text-gray-500 text-lg">No user data available.</p>
            <p className="text-sm text-gray-400 mt-1">You might need to log in to view your profile.</p>
            <Link to="/login"
                  className="mt-6 inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark transition-colors">
                Go to Login
            </Link>
        </div>
    );


    return (
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center sm:text-left">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">My Profile</h1>
                <p className="mt-2 text-lg text-gray-500">
                    View and manage your account details and preferences.
                </p>
            </div>

            <div className="bg-white shadow-2xl rounded-xl overflow-hidden">
                {/* Profile Display Section */}
                <div className="p-6 md:p-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-200 flex items-center">
                        <UserCircleIcon className="h-8 w-8 mr-3 text-primary opacity-80"/> Account Information
                    </h2>
                    <div className="space-y-3 text-sm">
                        <InfoRow label="User ID" value={effectiveUser.id}/>
                        <InfoRow label="Full Name" value={effectiveUser.name}/>
                        <InfoRow label="Username" value={effectiveUser.username}/>
                        <InfoRow label="Email Address" value={effectiveUser.email}/>
                        <InfoRow label="Role"
                                 value={effectiveUser.role ? effectiveUser.role.charAt(0).toUpperCase() + effectiveUser.role.slice(1) : 'N/A'}/>
                    </div>
                </div>

                {/* Update Profile Details Form */}
                <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
                        <IdentificationIcon className="h-7 w-7 mr-2 text-gray-500"/> Update Profile Details
                    </h3>
                    {updateError && updateError.config?.method !== 'patch' && /* Differentiate errors if needed */
                        <ErrorMessage message={updateError.data?.message || 'Profile update failed.'}
                                      details={updateError.data?.errors}/>
                    }
                    <form onSubmit={handleProfileUpdateSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                            <div>
                                <label htmlFor="profileName" className={labelClass}>Full Name:</label>
                                <input type="text" id="profileName" className={inputClass} value={name}
                                       onChange={(e) => setName(e.target.value)} required/>
                            </div>
                            <div>
                                <label htmlFor="profileUsername" className={labelClass}>Username:</label>
                                <input type="text" id="profileUsername" className={inputClass} value={username}
                                       onChange={(e) => setUsername(e.target.value)} required/>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="profileEmail" className={labelClass}>Email Address:</label>
                                <input type="email" id="profileEmail" className={inputClass} value={email}
                                       onChange={(e) => setEmail(e.target.value)} required/>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" disabled={isUpdating}
                                    className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark disabled:opacity-70 transition-colors">
                                <ArrowDownTrayIcon
                                    className="h-5 w-5 mr-2"/> {isUpdating && !passwordFormError ? 'Updating Details...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Update Password Form */}
                <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
                        <LockClosedIcon className="h-7 w-7 mr-2 text-gray-500"/> Change Password
                    </h3>
                    {passwordFormError && <ErrorMessage message={passwordFormError}/>}
                    {updateError && updateError.config?.method === 'patch' &&
                        <ErrorMessage message={updateError.data?.message || 'Password update failed.'}
                                      details={updateError.data?.errors}/>
                    }
                    <form onSubmit={handlePasswordUpdateSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="currentPassword" className={labelClass}>Current Password:</label>
                            <input type="password" id="currentPassword" className={inputClass} value={currentPassword}
                                   onChange={(e) => setCurrentPassword(e.target.value)}
                                   placeholder="Required to set a new password"/>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                            <div>
                                <label htmlFor="newPassword" className={labelClass}>New Password:</label>
                                <input type="password" id="newPassword" className={inputClass} value={newPassword}
                                       onChange={(e) => setNewPassword(e.target.value)}
                                       placeholder="Min. 8 characters"/>
                            </div>
                            <div>
                                <label htmlFor="newPasswordConfirmation" className={labelClass}>Confirm New
                                    Password:</label>
                                <input type="password" id="newPasswordConfirmation" className={inputClass}
                                       value={newPasswordConfirmation}
                                       onChange={(e) => setNewPasswordConfirmation(e.target.value)}/>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" disabled={isUpdating}
                                    className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-70 transition-colors">
                                <ArrowPathIcon
                                    className="h-5 w-5 mr-2"/> {isUpdating && passwordFormError ? 'Updating Password...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const InfoRow = ({label, value}) => (
    <div
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2.5 border-b border-gray-100 last:border-b-0">
        <dt className="font-medium text-gray-500">{label}:</dt>
        <dd className="text-gray-900 sm:text-right mt-1 sm:mt-0">{value || 'N/A'}</dd>
    </div>
);

export default ProfilePage;
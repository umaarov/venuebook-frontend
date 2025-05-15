import React, {useState, useEffect} from 'react';
import {useGetAuthUserQuery, useUpdateAuthUserMutation} from '../features/auth/authApi';
import {useAppSelector} from '../app/hooks';
import {selectCurrentUser} from '../features/auth/authSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const ProfilePage = () => {
    const {data: user, isLoading, error, refetch} = useGetAuthUserQuery();
    const currentUserFromSlice = useAppSelector(selectCurrentUser); // Get user from slice as fallback or for immediate display

    const [updateUser, {isLoading: isUpdating, error: updateError}] = useUpdateAuthUserMutation();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    // Add other updatable fields if necessary, e.g., password
    // const [currentPassword, setCurrentPassword] = useState('');
    // const [newPassword, setNewPassword] = useState('');
    // const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');


    useEffect(() => {
        // If query has not run or user is not in slice, useGetAuthUserQuery will fetch it.
        // If user is already in slice (e.g. after login), we can prefill form.
        const effectiveUser = user?.data || currentUserFromSlice;
        if (effectiveUser) {
            setName(effectiveUser.name || '');
            setEmail(effectiveUser.email || '');
        }
    }, [user, currentUserFromSlice]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const updateData = {name, email};
        // if (newPassword && newPassword === newPasswordConfirmation) {
        //   updateData.password = newPassword;
        //   updateData.password_confirmation = newPasswordConfirmation;
        //   if (currentPassword) updateData.current_password = currentPassword; // If backend requires it
        // }
        try {
            await updateUser(updateData).unwrap();
            alert('Profile updated successfully!'); // Replace with better UI
            refetch(); // Refetch user data after update
        } catch (err) {
            console.error('Failed to update profile:', err);
            alert('Failed to update profile.'); // Replace with better UI
        }
    };

    if (isLoading) return <LoadingSpinner/>;
    if (error) return <ErrorMessage message="Could not load profile."/>;

    const displayUser = user?.data || currentUserFromSlice;

    if (!displayUser) return <p>No user data available. You might need to log in.</p>;


    return (
        <div className="container">
            <h2>User Profile</h2>
            <p><strong>ID:</strong> {displayUser.id}</p>
            <p><strong>Name:</strong> {displayUser.name}</p>
            <p><strong>Email:</strong> {displayUser.email}</p>
            <p><strong>Role:</strong> {displayUser.role}</p>

            <h3>Update Profile</h3>
            {updateError && <ErrorMessage message={updateError.data?.message || 'Update failed.'}
                                          details={updateError.data?.errors}/>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                {/* Add password change fields here if needed */}
                <button type="submit" disabled={isUpdating}>
                    {isUpdating ? 'Updating...' : 'Update Profile'}
                </button>
            </form>
        </div>
    );
};

export default ProfilePage;
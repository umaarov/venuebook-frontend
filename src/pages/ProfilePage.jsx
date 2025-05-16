import React, {useState, useEffect} from 'react';
import {useGetAuthUserProfileQuery, useUpdateAuthUserProfileMutation} from '../features/auth/authApi'; // Updated hook names
import {useAppSelector} from '../app/hooks';
import {selectCurrentUser} from '../features/auth/authSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const ProfilePage = () => {
    const {data: profileData, isLoading, error: profileError, refetch} = useGetAuthUserProfileQuery();
    const currentUserFromSlice = useAppSelector(selectCurrentUser);

    const [updateProfile, {isLoading: isUpdating, error: updateError}] = useUpdateAuthUserProfileMutation();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        const effectiveUser = profileData?.data || currentUserFromSlice;
        if (effectiveUser) {
            setName(effectiveUser.name || '');
            setEmail(effectiveUser.email || '');
            setUsername(effectiveUser.username || '');
        }
    }, [profileData, currentUserFromSlice]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const updateData = {name, email, username};
        try {
            await updateProfile(updateData).unwrap();
            alert('Profile updated successfully!');
            refetch();
        } catch (err) {
            console.error('Failed to update profile:', err);
            alert('Failed to update profile.');
        }
    };

    if (isLoading) return <LoadingSpinner/>;
    if (profileError) return <ErrorMessage
        message={`Could not load profile. ${profileError.data?.message || profileError.status}`}/>;

    const displayUser = profileData?.data || currentUserFromSlice;

    if (!displayUser) return <p>No user data available. You might need to log in.</p>;

    return (
        <div className="container">
            <h2>User Profile</h2>
            <p><strong>ID:</strong> {displayUser.id}</p>
            <p><strong>Name:</strong> {displayUser.name}</p>
            <p><strong>Username:</strong> {displayUser.username}</p>
            <p><strong>Email:</strong> {displayUser.email}</p>
            <p><strong>Role:</strong> {displayUser.role}</p>

            <h3>Update Profile</h3>
            {updateError && <ErrorMessage message={updateError.data?.message || 'Update failed.'}
                                          details={updateError.data?.errors}/>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="profileName">Name:</label>
                    <input
                        type="text"
                        id="profileName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="profileUsername">Username:</label>
                    <input
                        type="text"
                        id="profileUsername"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="profileEmail">Email:</label>
                    <input
                        type="email"
                        id="profileEmail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={isUpdating}>
                    {isUpdating ? 'Updating...' : 'Update Profile'}
                </button>
            </form>
        </div>
    );
};

export default ProfilePage;
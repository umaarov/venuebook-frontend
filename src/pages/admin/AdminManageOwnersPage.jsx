import React, {useState} from 'react';
import {useAdminListOwnersQuery, useAdminAddOwnerMutation} from '../../features/admin/adminApi';
// If you have a general user list to pick from for making an owner:
// import { useAdminGetAllUsersQuery } from '../../features/admin/adminApi'; // (This endpoint was removed as not in api.php)
// For now, admin will input user ID directly.
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AdminManageOwnersPage = () => {
    const {data: ownersResponse, isLoading: isLoadingOwners, error: ownersError, refetch} = useAdminListOwnersQuery();
    const [addOwner, {isLoading: isAddingOwner, error: addOwnerError}] = useAdminAddOwnerMutation();

    const [userIdToMakeOwner, setUserIdToMakeOwner] = useState('');

    // If you had a general user list to select from:
    // const { data: usersResponse, isLoading: isLoadingUsers, error: usersError } = useAdminGetAllUsersQuery();

    const handleAddOwner = async (e) => {
        e.preventDefault();
        if (!userIdToMakeOwner) {
            alert('Please enter a User ID.');
            return;
        }
        try {
            await addOwner({user_id: parseInt(userIdToMakeOwner, 10)}).unwrap();
            alert(`User ID ${userIdToMakeOwner} successfully made an owner.`);
            setUserIdToMakeOwner('');
            refetch();
        } catch (err) {
            alert(err.data?.message || 'Failed to make user an owner.');
            console.error(err);
        }
    };

    if (isLoadingOwners /*|| isLoadingUsers*/) return <LoadingSpinner/>;

    const owners = ownersResponse?.data || [];
    // const allUsers = usersResponse?.data || []; // If fetching all users

    return (
        <div className="container">
            <h2>Manage Owners</h2>
            {ownersError && <ErrorMessage message={ownersError.data?.message || "Could not load owners."}/>}
            {/* {usersError && <ErrorMessage message="Could not load users list." />} */}

            <form onSubmit={handleAddOwner} style={{marginBottom: '20px'}}>
                <h3>Add New Owner</h3>
                <div>
                    <label htmlFor="userIdToMakeOwner">User ID to make Owner:</label>
                    <input
                        type="number"
                        id="userIdToMakeOwner"
                        value={userIdToMakeOwner}
                        onChange={(e) => setUserIdToMakeOwner(e.target.value)}
                        placeholder="Enter User ID"
                        required
                    />
                </div>
                {/* Alternative: Dropdown if `allUsers` is available
        <select value={userIdToMakeOwner} onChange={(e) => setUserIdToMakeOwner(e.target.value)} required>
            <option value="">Select User</option>
            {allUsers.filter(u => u.role !== 'owner' && u.role !== 'admin').map(user => ( // Example filter
                <option key={user.id} value={user.id}>{user.name} (ID: {user.id}, Email: {user.email})</option>
            ))}
        </select>
        */}
                <button type="submit" disabled={isAddingOwner}>
                    {isAddingOwner ? 'Adding...' : 'Make Owner'}
                </button>
                {addOwnerError && <ErrorMessage message={addOwnerError.data?.message || "Failed to add owner."}
                                                details={addOwnerError.data?.errors}/>}
            </form>

            <h3>Current Owners</h3>
            {owners.length === 0 ? (
                <p>No users currently have the owner role.</p>
            ) : (
                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Username</th>
                        {/* Add actions like "Revoke Owner" if API supports */}
                    </tr>
                    </thead>
                    <tbody>
                    {owners.map((owner) => (
                        <tr key={owner.id}>
                            <td>{owner.id}</td>
                            <td>{owner.name}</td>
                            <td>{owner.email}</td>
                            <td>{owner.username}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminManageOwnersPage;
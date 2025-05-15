import React from 'react';
import {Link} from 'react-router-dom';
import {
    useAdminGetAllUsersQuery,
    useAdminDeleteUserMutation,
    useAdminAssignOwnerRoleMutation,
    useAdminRevokeOwnerRoleMutation
} from '../../features/admin/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AdminUsersPage = () => {
    const {data: usersData, isLoading, error, refetch} = useAdminGetAllUsersQuery();
    const [deleteUser, {isLoading: isDeleting}] = useAdminDeleteUserMutation();
    const [assignOwner, {isLoading: isAssigning}] = useAdminAssignOwnerRoleMutation();
    const [revokeOwner, {isLoading: isRevoking}] = useAdminRevokeOwnerRoleMutation();

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(id).unwrap();
                alert('User deleted.');
                // refetch(); // Or rely on tag invalidation
            } catch (err) {
                alert('Failed to delete user.');
            }
        }
    };

    const handleRoleChange = async (userId, currentRole) => {
        const action = currentRole === 'owner' ? revokeOwner : assignOwner;
        const messageAction = currentRole === 'owner' ? 'Revoke owner role from' : 'Assign owner role to';
        if (window.confirm(`Are you sure you want to ${messageAction.toLowerCase()} this user?`)) {
            try {
                await action(userId).unwrap();
                alert(`User role updated.`);
                // refetch(); // Or rely on tag invalidation
            } catch (err) {
                alert('Failed to update user role.');
                console.error(err);
            }
        }
    };


    if (isLoading) return <LoadingSpinner/>;
    if (error) return <ErrorMessage message="Could not load users."/>;

    const users = usersData?.data || [];

    return (
        <div className="container">
            <h2>Manage Users</h2>
            {/* Optional: Link to create user if admin can create users */}
            {/* <Link to="/admin/users/new"><button>Create New User</button></Link> */}
            {users.length === 0 ? (
                <p>No users found.</p>
            ) : (
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead>
                    <tr>
                        <th style={{border: '1px solid #ddd', padding: '8px'}}>ID</th>
                        <th style={{border: '1px solid #ddd', padding: '8px'}}>Name</th>
                        <th style={{border: '1px solid #ddd', padding: '8px'}}>Email</th>
                        <th style={{border: '1px solid #ddd', padding: '8px'}}>Role</th>
                        <th style={{border: '1px solid #ddd', padding: '8px'}}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td style={{border: '1px solid #ddd', padding: '8px'}}>{user.id}</td>
                            <td style={{border: '1px solid #ddd', padding: '8px'}}>{user.name}</td>
                            <td style={{border: '1px solid #ddd', padding: '8px'}}>{user.email}</td>
                            <td style={{border: '1px solid #ddd', padding: '8px'}}>{user.role}</td>
                            <td style={{border: '1px solid #ddd', padding: '8px'}}>
                                <Link to={`/admin/users/edit/${user.id}`}>
                                    <button>Edit</button>
                                </Link>
                                <button
                                    onClick={() => handleRoleChange(user.id, user.role)}
                                    disabled={isAssigning || isRevoking}
                                    style={{
                                        marginLeft: '5px',
                                        backgroundColor: user.role === 'owner' ? '#ffc107' : '#17a2b8'
                                    }} // Yellow for revoke, Teal for assign
                                >
                                    {isAssigning || isRevoking ? '...' : (user.role === 'owner' ? 'Revoke Owner' : 'Make Owner')}
                                </button>
                                <button onClick={() => handleDelete(user.id)} disabled={isDeleting} className="danger"
                                        style={{marginLeft: '5px'}}>
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminUsersPage;
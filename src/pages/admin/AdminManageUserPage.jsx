import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {useAdminGetUserByIdQuery, useAdminUpdateUserMutation} from '../../features/admin/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AdminManageUserPage = () => {
    const {id: userId} = useParams();
    const navigate = useNavigate();

    const {data: userData, isLoading: isLoadingUser, error: userError, refetch} = useAdminGetUserByIdQuery(userId);
    const [updateUser, {isLoading: isUpdating, error: updateError}] = useAdminUpdateUserMutation();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState(''); // Admin might change roles here too, or via separate buttons

    useEffect(() => {
        if (userData?.data) {
            setName(userData.data.name || '');
            setEmail(userData.data.email || '');
            setRole(userData.data.role || 'user');
        }
    }, [userData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateUser({id: userId, name, email, role}).unwrap();
            alert('User updated successfully!');
            navigate('/admin/users');
        } catch (err) {
            console.error('Failed to update user:', err);
        }
    };

    if (isLoadingUser) return <LoadingSpinner/>;
    if (userError) return <ErrorMessage
        message={`Could not load user: ${userError.data?.message || userError.status}`}/>;
    if (!userData?.data) return <p>User not found.</p>;

    return (
        <div className="container">
            <h2>Edit User: {userData.data.name}</h2>
            {updateError && <ErrorMessage message={updateError.data?.message || 'Update failed.'}
                                          details={updateError.data?.errors}/>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Name:</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required/>
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                </div>
                <div>
                    <label htmlFor="role">Role:</label>
                    <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="user">User</option>
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                {/* Add password change fields if admin can change passwords, ensure backend supports this */}
                <button type="submit" disabled={isUpdating}>
                    {isUpdating ? 'Updating...' : 'Update User'}
                </button>
            </form>
        </div>
    );
};

export default AdminManageUserPage;
import React, { useState } from 'react';
import { useAdminListOwnersQuery, useAdminAddOwnerMutation } from '../../features/admin/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AdminManageOwnersPage = () => {
    const { data: ownersResponse, isLoading: isLoadingOwners, error: ownersError, refetch } = useAdminListOwnersQuery();
    const [addOwner, { isLoading: isAddingOwner, error: addOwnerError }] = useAdminAddOwnerMutation();

    // State for the new owner creation form
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');

    const handleCreateOwnerSubmit = async (e) => {
        e.preventDefault();
        if (password !== passwordConfirmation) {
            alert("Passwords don't match!");
            return;
        }
        try {
            await addOwner({
                name,
                surname,
                username,
                email,
                phone,
                password,
                // password_confirmation
            }).unwrap();
            alert(`New owner user '${username}' created successfully.`);
            setName('');
            setSurname('');
            setUsername('');
            setEmail('');
            setPhone('');
            setPassword('');
            setPasswordConfirmation('');
            refetch();
        } catch (err) {
            console.error('Failed to create new owner:', err);
        }
    };

    if (isLoadingOwners) return <LoadingSpinner />;

    const owners = ownersResponse?.data || [];

    return (
        <div className="container">
            <h2>Manage Owners</h2>
            {ownersError && <ErrorMessage message={ownersError.data?.message || "Could not load the list of owners."} />}

            <form onSubmit={handleCreateOwnerSubmit} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #eee', borderRadius: '5px' }}>
                <h3>Create New Owner User</h3>
                {addOwnerError && <ErrorMessage message={addOwnerError.data?.message || "Failed to create owner."} details={addOwnerError.data?.errors} />}

                <div>
                    <label htmlFor="new-owner-name">Name:</label>
                    <input type="text" id="new-owner-name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="new-owner-surname">Surname:</label>
                    <input type="text" id="new-owner-surname" value={surname} onChange={(e) => setSurname(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="new-owner-username">Username:</label>
                    <input type="text" id="new-owner-username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="new-owner-email">Email:</label>
                    <input type="email" id="new-owner-email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="new-owner-phone">Phone:</label>
                    <input type="tel" id="new-owner-phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="new-owner-password">Password (min 8 chars):</label>
                    <input type="password" id="new-owner-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="8"/>
                </div>
                <div>
                    <label htmlFor="new-owner-password-confirm">Confirm Password:</label>
                    <input type="password" id="new-owner-password-confirm" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required />
                </div>
                <button type="submit" disabled={isAddingOwner} style={{marginTop: '10px'}}>
                    {isAddingOwner ? 'Creating...' : 'Create Owner User'}
                </button>
            </form>

            <h3>Current Owners</h3>
            {owners.length === 0 && !isLoadingOwners ? (
                <p>No owners found.</p>
            ) : (
                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Surname</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Phone</th>
                    </tr>
                    </thead>
                    <tbody>
                    {owners.map((owner) => (
                        <tr key={owner.id}>
                            <td>{owner.id}</td>
                            <td>{owner.name}</td>
                            <td>{owner.surname || 'N/A'}</td>
                            <td>{owner.username}</td>
                            <td>{owner.email}</td>
                            <td>{owner.phone || 'N/A'}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminManageOwnersPage;
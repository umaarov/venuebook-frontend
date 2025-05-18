import React, {useState} from 'react';
import {useAdminAddOwnerMutation, useAdminListOwnersQuery} from '../../features/admin/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import {UserPlusIcon, UsersIcon} from '@heroicons/react/24/outline';

const AdminManageOwnersPage = () => {
    const {data: ownersResponse, isLoading: isLoadingOwners, error: ownersError, refetch} = useAdminListOwnersQuery();
    const [addOwner, {
        isLoading: isAddingOwner,
        error: addOwnerError,
        reset: resetAddOwnerError
    }] = useAdminAddOwnerMutation();

    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');

    const [formError, setFormError] = useState('');

    const handleCreateOwnerSubmit = async (e) => {
        e.preventDefault();
        resetAddOwnerError();
        setFormError('');

        if (password !== passwordConfirmation) {
            setFormError("Passwords don't match!");
            return;
        }
        if (password.length < 8) {
            setFormError("Password must be at least 8 characters long.");
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
                password_confirmation: passwordConfirmation,
            }).unwrap();
            alert(`New owner user '${username}' created successfully.`);
            // Clear form
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
            // setFormError(err.data?.message || "An unexpected error occurred.");
        }
    };


    const inputClass = "mt-1 block w-full py-2.5 px-3.5 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary sm:text-sm transition-colors";
    const labelClass = "block text-sm font-medium text-gray-700";

    return (
        <div className="space-y-10">
            <h1 className="text-3xl font-bold text-gray-800">Manage Owners</h1>

            {/* Create New Owner Form */}
            <section className="bg-white p-6 md:p-8 rounded-xl shadow-xl">
                <h2 className="text-2xl font-semibold text-gray-700 mb-6 pb-4 border-b border-gray-200 flex items-center">
                    <UserPlusIcon className="h-7 w-7 mr-3 text-primary"/> Create New Owner User
                </h2>

                {formError && <ErrorMessage message={formError}/>}
                {addOwnerError && <ErrorMessage message={addOwnerError.data?.message || "Failed to create owner."}
                                                details={addOwnerError.data?.errors}/>}

                <form onSubmit={handleCreateOwnerSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        <div>
                            <label htmlFor="new-owner-name" className={labelClass}>Name:</label>
                            <input type="text" id="new-owner-name" className={inputClass} value={name}
                                   onChange={(e) => setName(e.target.value)} required/>
                        </div>
                        <div>
                            <label htmlFor="new-owner-surname" className={labelClass}>Surname:</label>
                            <input type="text" id="new-owner-surname" className={inputClass} value={surname}
                                   onChange={(e) => setSurname(e.target.value)} required/>
                        </div>
                        <div>
                            <label htmlFor="new-owner-username" className={labelClass}>Username:</label>
                            <input type="text" id="new-owner-username" className={inputClass} value={username}
                                   onChange={(e) => setUsername(e.target.value)} required/>
                        </div>
                        <div>
                            <label htmlFor="new-owner-email" className={labelClass}>Email:</label>
                            <input type="email" id="new-owner-email" className={inputClass} value={email}
                                   onChange={(e) => setEmail(e.target.value)} required/>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="new-owner-phone" className={labelClass}>Phone:</label>
                            <input type="tel" id="new-owner-phone" className={inputClass} value={phone}
                                   onChange={(e) => setPhone(e.target.value)} required/>
                        </div>
                        <div>
                            <label htmlFor="new-owner-password" className={labelClass}>Password (min 8 chars):</label>
                            <input type="password" id="new-owner-password" className={inputClass} value={password}
                                   onChange={(e) => setPassword(e.target.value)} required minLength="8"/>
                        </div>
                        <div>
                            <label htmlFor="new-owner-password-confirm" className={labelClass}>Confirm Password:</label>
                            <input type="password" id="new-owner-password-confirm" className={inputClass}
                                   value={passwordConfirmation}
                                   onChange={(e) => setPasswordConfirmation(e.target.value)} required/>
                        </div>
                    </div>
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isAddingOwner}
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                        >
                            {isAddingOwner ? (
                                <> <LoadingSpinner LitleSpinner={true}/> Creating...</>
                            ) : 'Create Owner User'}
                        </button>
                    </div>
                </form>
            </section>

            {/* Current Owners List */}
            <section>
                <h2 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center">
                    <UsersIcon className="h-7 w-7 mr-3 text-gray-600"/> Current Owners
                </h2>
                {isLoadingOwners && <LoadingSpinner message="Loading owners..."/>}
                {ownersError &&
                    <ErrorMessage message={ownersError.data?.message || "Could not load the list of owners."}
                                  details={ownersError.data?.errors}/>}

                {!isLoadingOwners && !ownersError && (
                    ownersResponse?.data?.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-lg shadow">
                            <UsersIcon className="h-16 w-16 mx-auto text-gray-400 mb-4"/>
                            <p className="text-gray-500 text-lg">No owners found.</p>
                        </div>
                    ) : (
                        <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {ownersResponse?.data?.map((owner) => (
                                    <tr key={owner.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{owner.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{owner.name} {owner.surname || ''}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{owner.username}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{owner.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{owner.phone || 'N/A'}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </section>
        </div>
    );
};
const LoadingSpinnerLitleSpinner = () => <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
</svg>;


export default AdminManageOwnersPage;
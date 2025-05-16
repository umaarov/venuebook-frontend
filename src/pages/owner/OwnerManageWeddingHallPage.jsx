// File: src/pages/owner/OwnerManageWeddingHallPage.jsx
// (Showing only changes and relevant parts)

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    useCreateOwnerWeddingHallMutation, // For Owners
    useUpdateOwnerWeddingHallMutation,
    useDeleteWeddingHallImageMutation,
} from '../../features/owner/ownerApi';
import { useAdminCreateWeddingHallMutation, useAdminUpdateWeddingHallMutation } from '../../features/admin/adminApi'; // For Admins
import { useGetWeddingHallByIdQuery } from '../../features/weddingHalls/weddingHallApi';
import { useGetDistrictsQuery } from '../../features/weddingHalls/weddingHallApi';
import { useAppSelector } from '../../app/hooks'; // To get current user role
import { selectCurrentUser } from '../../features/auth/authSlice'; // To get current user
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
// Potentially import a hook to get list of users (owners) if admin needs to select an owner_id from a list
// For now, we'll assume admin inputs owner_id directly if needed.
// import { useAdminListOwnersQuery } from '../../features/admin/adminApi';


const OwnerManageWeddingHallPage = ({ mode }) => {
    const navigate = useNavigate();
    const { id: hallIdParam } = useParams();
    const currentUser = useAppSelector(selectCurrentUser);
    const isAdmin = currentUser?.role === 'admin';

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [capacity, setCapacity] = useState('');
    const [pricePerSeat, setPricePerSeat] = useState('');
    const [phone, setPhone] = useState('');
    const [districtId, setDistrictId] = useState('');
    const [images, setImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [primaryImageIndex, setPrimaryImageIndex] = useState(null);
    const [existingImages, setExistingImages] = useState([]);
    const [ownerId, setOwnerId] = useState(''); // For Admin to specify owner_id

    const { data: districtsResponse, isLoading: isLoadingDistricts } = useGetDistrictsQuery();
    const { data: hallDetailResponse, isLoading: isLoadingHallDetails, error: hallDetailsError, refetch: refetchHallDetails } = useGetWeddingHallByIdQuery(hallIdParam, {
        skip: mode === 'create' || !hallIdParam,
    });

    // Owner mutations
    const [createOwnerHall, { isLoading: isCreatingOwner, error: createOwnerError }] = useCreateOwnerWeddingHallMutation();
    const [updateOwnerHall, { isLoading: isUpdatingOwner, error: updateOwnerError }] = useUpdateOwnerWeddingHallMutation();

    // Admin mutations
    const [createAdminHall, { isLoading: isCreatingAdmin, error: createAdminError }] = useAdminCreateWeddingHallMutation();
    const [updateAdminHall, { isLoading: isUpdatingAdmin, error: updateAdminError }] = useAdminUpdateWeddingHallMutation();

    const [deleteImage, { isLoading: isDeletingImage, error: deleteImageError }] = useDeleteWeddingHallImageMutation();

    // If admin needs to select from a list of owners:
    // const { data: ownersData, isLoading: isLoadingOwners } = useAdminListOwnersQuery(undefined, { skip: !isAdmin });


    useEffect(() => {
        if (mode === 'edit' && hallDetailResponse?.data) {
            const hall = hallDetailResponse.data;
            setName(hall.name || '');
            setAddress(hall.address || '');
            setCapacity(hall.capacity || '');
            setPricePerSeat(hall.price_per_seat || '');
            setPhone(hall.phone || '');
            setDistrictId(hall.district_id || '');
            setExistingImages(hall.images || []);
            if (isAdmin && hall.owner_id) { // Pre-fill owner_id for admin edit if available
                setOwnerId(hall.owner_id.toString());
            }
        }
    }, [mode, hallDetailResponse, isAdmin]);

    const handleImageFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (mode === 'create') {
            setImages(files);
        } else {
            setNewImages(files);
        }
        setPrimaryImageIndex(null);
    };

    const handleDeleteImage = async (imageId) => { /* ... existing logic ... */ };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const hallPayload = {
            name,
            address,
            capacity: parseInt(capacity, 10),
            price_per_seat: parseFloat(pricePerSeat),
            phone,
            district_id: parseInt(districtId, 10),
        };

        if (primaryImageIndex !== null && primaryImageIndex !== undefined) {
            hallPayload.primary_image = parseInt(primaryImageIndex, 10);
        }

        if (isAdmin && ownerId) { // If admin is creating/editing and owner_id is set
            hallPayload.owner_id = parseInt(ownerId, 10);
        }

        try {
            if (mode === 'create') {
                if (isAdmin) {
                    await createAdminHall({ ...hallPayload, images: images }).unwrap();
                } else { // Owner creating
                    await createOwnerHall({ ...hallPayload, images: images }).unwrap();
                }
                alert('Wedding hall created successfully! It may require admin approval if not created by admin.');
            } else { // mode === 'edit'
                if (isAdmin) {
                    await updateAdminHall({ id: hallIdParam, ...hallPayload, new_images: newImages }).unwrap();
                } else { // Owner updating
                    await updateOwnerHall({ id: hallIdParam, ...hallPayload, new_images: newImages }).unwrap();
                }
                alert('Wedding hall updated successfully!');
            }
            navigate(isAdmin ? '/admin/wedding-halls' : '/owner/wedding-halls');
        } catch (err) {
            console.error('Failed to save wedding hall:', err);
        }
    };

    const isLoadingSubmit = isCreatingOwner || isUpdatingOwner || isCreatingAdmin || isUpdatingAdmin;
    const submissionError = createOwnerError || updateOwnerError || createAdminError || updateAdminError;
    const pageLoading = isLoadingDistricts || (mode === 'edit' && isLoadingHallDetails); /* || (isAdmin && isLoadingOwners)*/

    if (pageLoading) return <LoadingSpinner />;
    const districts = districtsResponse?.data || [];
    const currentImageFiles = mode === 'create' ? images : newImages;
    // const ownersList = ownersData?.data || []; // For admin dropdown

    return (
        <div className="container">
            <h2>{mode === 'create' ? 'Add New' : 'Edit'} Wedding Hall {isAdmin ? '(Admin Mode)' : ''}</h2>
            {submissionError && <ErrorMessage message={submissionError.data?.message || `Failed to ${mode} hall.`} details={submissionError.data?.errors} />}
            {hallDetailsError && mode === 'edit' && <ErrorMessage message={hallDetailsError.data?.message || "Failed to load hall details."} />}
            {deleteImageError && <ErrorMessage message={deleteImageError.data?.message || "Failed to delete image."} />}

            <form onSubmit={handleSubmit}>
                {/* ... existing form fields for name, address, capacity, pricePerSeat, phone, districtId ... */}
                <div><label htmlFor="wh-name">Name:</label><input type="text" id="wh-name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
                <div><label htmlFor="wh-address">Address:</label><input type="text" id="wh-address" value={address} onChange={(e) => setAddress(e.target.value)} required /></div>
                <div><label htmlFor="wh-capacity">Capacity (guests):</label><input type="number" id="wh-capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} required min="1"/></div>
                <div><label htmlFor="wh-pricePerSeat">Price Per Seat ($):</label><input type="number" step="0.01" id="wh-pricePerSeat" value={pricePerSeat} onChange={(e) => setPricePerSeat(e.target.value)} required min="0"/></div>
                <div><label htmlFor="wh-phone">Phone:</label><input type="tel" id="wh-phone" value={phone} onChange={(e) => setPhone(e.target.value)} required /></div>
                <div>
                    <label htmlFor="wh-districtId">District:</label>
                    <select id="wh-districtId" value={districtId} onChange={(e) => setDistrictId(e.target.value)} required>
                        <option value="">Select District</option>
                        {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>

                {/* Owner ID field for Admin */}
                {isAdmin && (
                    <div>
                        <label htmlFor="wh-ownerId">Assign Owner (User ID - optional):</label>
                        <input
                            type="number"
                            id="wh-ownerId"
                            value={ownerId}
                            onChange={(e) => setOwnerId(e.target.value)}
                            placeholder="Enter User ID of Owner"
                        />
                        {/* Or a select dropdown for owners
                <select value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
                    <option value="">Assign to self (Admin)</option>
                    {ownersList.map(owner => (
                        <option key={owner.id} value={owner.id}>{owner.name} (ID: {owner.id})</option>
                    ))}
                </select>
                */}
                    </div>
                )}

                {/* ... existing form fields for images, primaryImageIndex, existingImages ... */}
                <div>
                    <label htmlFor="wh-image-files">{mode === 'edit' ? 'Add New Images:' : 'Images:'}</label>
                    <input type="file" id="wh-image-files" multiple onChange={handleImageFileChange} accept="image/*" />
                </div>

                {currentImageFiles.length > 0 && (
                    <div>
                        <label htmlFor="wh-primaryImageIndex">Select Primary Image (optional):</label>
                        <select id="wh-primaryImageIndex" value={primaryImageIndex === null ? '' : primaryImageIndex} onChange={(e) => setPrimaryImageIndex(e.target.value === '' ? null : parseInt(e.target.value, 10))}>
                            <option value="">None</option>
                            {currentImageFiles.map((file, index) => (
                                <option key={index} value={index}>
                                    {file.name} (Image {index + 1})
                                </option>
                            ))}
                        </select>
                        <small>This will be the main display image.</small>
                    </div>
                )}


                {mode === 'edit' && existingImages.length > 0 && (
                    <div>
                        <h4>Current Images:</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                            {existingImages.map(img => (
                                <div key={img.id} style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center', borderRadius: '4px' }}>
                                    <img src={img.image_path.startsWith('http') ? img.image_path : `http://localhost:8000${img.image_path}`} alt="Hall" style={{ width: '100px', height: 'auto', marginBottom: '5px', borderRadius: '3px' }} onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x75?text=Img"; }}/>
                                    <button type="button" onClick={() => handleDeleteImage(img.id)} disabled={isDeletingImage} className="danger small">Delete</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <button type="submit" disabled={isLoadingSubmit}>{isLoadingSubmit ? 'Saving...' : (mode === 'create' ? 'Create Hall' : 'Update Hall')}</button>
            </form>
        </div>
    );
};

export default OwnerManageWeddingHallPage;
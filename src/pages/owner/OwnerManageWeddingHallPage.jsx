import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    useCreateOwnerWeddingHallMutation,
    useUpdateOwnerWeddingHallMutation,
    useDeleteWeddingHallImageMutation,
} from '../../features/owner/ownerApi';
import { useGetWeddingHallByIdQuery } from '../../features/weddingHalls/weddingHallApi';
import { useGetDistrictsQuery } from '../../features/weddingHalls/weddingHallApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const OwnerManageWeddingHallPage = ({ mode }) => {
    const navigate = useNavigate();
    const { id: hallIdParam } = useParams();

    const [name, setName] = useState('');
    // const [description, setDescription] = useState(''); // Removed, not in WeddingHallRequest
    const [address, setAddress] = useState(''); // Changed from location
    const [capacity, setCapacity] = useState('');
    const [pricePerSeat, setPricePerSeat] = useState(''); // Changed from pricePerHour
    const [phone, setPhone] = useState(''); // Added phone field
    const [districtId, setDistrictId] = useState('');
    const [images, setImages] = useState([]); // For new image uploads (File objects for create)
    const [newImages, setNewImages] = useState([]); // For new image uploads (File objects for update)
    const [primaryImageIndex, setPrimaryImageIndex] = useState(null); // Index of primary image in 'images' or 'newImages' array
    const [existingImages, setExistingImages] = useState([]);

    const { data: districtsResponse, isLoading: isLoadingDistricts } = useGetDistrictsQuery();

    const { data: hallDetailResponse, isLoading: isLoadingHallDetails, error: hallDetailsError, refetch: refetchHallDetails } = useGetWeddingHallByIdQuery(hallIdParam, {
        skip: mode === 'create' || !hallIdParam,
    });

    const [createHall, { isLoading: isCreating, error: createError }] = useCreateOwnerWeddingHallMutation();
    const [updateHall, { isLoading: isUpdating, error: updateError }] = useUpdateOwnerWeddingHallMutation();
    const [deleteImage, { isLoading: isDeletingImage, error: deleteImageError }] = useDeleteWeddingHallImageMutation();

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
            // Find primary image among existing images to pre-select if possible
            const currentPrimary = hall.images?.findIndex(img => img.is_primary);
            if (currentPrimary !== -1 && currentPrimary !== undefined) {
                // This is tricky because primaryImageIndex refers to the *newly uploaded* array
                // For now, we won't pre-fill primaryImageIndex based on existing primary,
                // user has to re-select if they upload new images and want to change primary.
            }
        }
    }, [mode, hallDetailResponse]);

    const handleImageFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (mode === 'create') {
            setImages(files);
        } else {
            setNewImages(files);
        }
        setPrimaryImageIndex(null); // Reset primary image selection when new files are chosen
    };

    const handleDeleteImage = async (imageId) => {
        if (window.confirm('Are you sure you want to delete this image?')) {
            try {
                await deleteImage(imageId).unwrap();
                alert('Image deleted.');
                if (mode === 'edit') refetchHallDetails();
            } catch (err) {
                alert(err.data?.message || 'Failed to delete image.');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const hallPayload = {
            name,
            address, // Changed from location
            capacity: parseInt(capacity, 10),
            price_per_seat: parseFloat(pricePerSeat), // Changed from price_per_hour
            phone, // Added phone
            district_id: parseInt(districtId, 10),
        };

        // Add primary_image index if selected
        if (primaryImageIndex !== null && primaryImageIndex !== undefined) {
            hallPayload.primary_image = parseInt(primaryImageIndex, 10);
        }

        try {
            if (mode === 'create') {
                // For create, 'images' field in payload should contain the FileList/Array of files
                await createHall({ ...hallPayload, images: images }).unwrap();
                alert('Wedding hall created successfully! It may require admin approval.');
            } else {
                // For update, 'new_images' field for new files. Existing images are handled by backend.
                await updateHall({ id: hallIdParam, ...hallPayload, new_images: newImages }).unwrap();
                alert('Wedding hall updated successfully!');
            }
            navigate('/owner/wedding-halls');
        } catch (err) {
            console.error('Failed to save wedding hall:', err);
        }
    };

    const isLoadingSubmit = isCreating || isUpdating;
    const submissionError = createError || updateError;
    const pageLoading = isLoadingDistricts || (mode === 'edit' && isLoadingHallDetails);

    if (pageLoading) return <LoadingSpinner />;
    const districts = districtsResponse?.data || [];
    const currentImageFiles = mode === 'create' ? images : newImages;


    return (
        <div className="container">
            <h2>{mode === 'create' ? 'Add New' : 'Edit'} Wedding Hall</h2>
            {submissionError && <ErrorMessage message={submissionError.data?.message || `Failed to ${mode} hall.`} details={submissionError.data?.errors} />}
            {hallDetailsError && mode === 'edit' && <ErrorMessage message={hallDetailsError.data?.message || "Failed to load hall details."} />}
            {deleteImageError && <ErrorMessage message={deleteImageError.data?.message || "Failed to delete image."} />}

            <form onSubmit={handleSubmit}>
                <div><label htmlFor="wh-name">Name:</label><input type="text" id="wh-name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
                {/* Description field removed */}
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

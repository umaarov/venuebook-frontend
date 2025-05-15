import React, {useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
    useCreateOwnerWeddingHallMutation,
    useUpdateOwnerWeddingHallMutation,
    useGetOwnerWeddingHallByIdQuery,
    useDeleteWeddingHallImageMutation, // For deleting existing images
    useUploadWeddingHallImagesMutation // For adding new images to existing hall
} from '../../features/owner/ownerApi';
import {useGetDistrictsQuery} from '../../features/weddingHalls/weddingHallApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const OwnerManageWeddingHallPage = ({mode}) => { // mode: 'create' or 'edit'
    const navigate = useNavigate();
    const {id: hallId} = useParams(); // For edit mode

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [capacity, setCapacity] = useState('');
    const [pricePerHour, setPricePerHour] = useState('');
    const [districtId, setDistrictId] = useState('');
    const [images, setImages] = useState([]); // For new image uploads (File objects)
    const [existingImages, setExistingImages] = useState([]); // For displaying/deleting existing images

    const {data: districtsData, isLoading: isLoadingDistricts} = useGetDistrictsQuery();

    // Fetch hall data if in edit mode
    const {
        data: hallData,
        isLoading: isLoadingHallDetails,
        error: hallDetailsError,
        refetch: refetchHallDetails
    } = useGetOwnerWeddingHallByIdQuery(hallId, {
        skip: mode === 'create', // Skip if creating
    });

    const [createHall, {isLoading: isCreating, error: createError}] = useCreateOwnerWeddingHallMutation();
    const [updateHall, {isLoading: isUpdating, error: updateError}] = useUpdateOwnerWeddingHallMutation();
    const [deleteImage, {isLoading: isDeletingImage}] = useDeleteWeddingHallImageMutation();
    // const [uploadImages, { isLoading: isUploadingImages }] = useUploadWeddingHallImagesMutation(); // If adding images separately

    useEffect(() => {
        if (mode === 'edit' && hallData?.data) {
            const {
                name,
                description,
                location,
                capacity,
                price_per_hour,
                district_id,
                images: hallImages
            } = hallData.data;
            setName(name || '');
            setDescription(description || '');
            setLocation(location || '');
            setCapacity(capacity || '');
            setPricePerHour(price_per_hour || '');
            setDistrictId(district_id || '');
            setExistingImages(hallImages || []);
        }
    }, [mode, hallData]);

    const handleImageChange = (e) => {
        setImages([...e.target.files]);
    };

    const handleDeleteImage = async (imageId) => {
        if (window.confirm('Are you sure you want to delete this image?')) {
            try {
                await deleteImage(imageId).unwrap();
                alert('Image deleted.');
                // Refetch hall details to update the list of images
                if (mode === 'edit') refetchHallDetails();
            } catch (err) {
                alert('Failed to delete image.');
                console.error(err);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const hallDetails = {
            name,
            description,
            location,
            capacity: parseInt(capacity, 10),
            price_per_hour: parseFloat(pricePerHour),
            district_id: parseInt(districtId, 10),
        };

        try {
            if (mode === 'create') {
                // For create, images are part of the main hallData object for the mutation
                await createHall({...hallDetails, images}).unwrap();
                alert('Wedding hall created successfully!');
            } else { // mode === 'edit'
                // For update, decide how to handle images.
                // The backend might expect 'new_images' field or a separate endpoint.
                // Current updateOwnerWeddingHall mutation might need adjustment for FormData and images.
                // For simplicity here, assuming updateHall can take 'new_images' if it's FormData based.
                // Or, you'd call uploadWeddingHallImages separately after updating text fields.
                await updateHall({id: hallId, ...hallDetails, ...(images.length > 0 && {new_images: images})}).unwrap();
                alert('Wedding hall updated successfully!');
            }
            navigate('/owner/wedding-halls');
        } catch (err) {
            console.error('Failed to save wedding hall:', err);
            // Error shown by ErrorMessage component
        }
    };

    const isLoading = isLoadingDistricts || (mode === 'edit' && isLoadingHallDetails) || isCreating || isUpdating;
    const error = createError || updateError || (mode === 'edit' && hallDetailsError);

    if (isLoading && !districtsData) return <LoadingSpinner/>; // Show spinner if districts still loading

    return (
        <div className="container">
            <h2>{mode === 'create' ? 'Add New' : 'Edit'} Wedding Hall</h2>
            {error &&
                <ErrorMessage message={error.data?.message || `Failed to ${mode} hall.`} details={error.data?.errors}/>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Name:</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required/>
                </div>
                <div>
                    <label htmlFor="description">Description:</label>
                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)}
                              required/>
                </div>
                <div>
                    <label htmlFor="location">Location (Address):</label>
                    <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)}
                           required/>
                </div>
                <div>
                    <label htmlFor="capacity">Capacity (guests):</label>
                    <input type="number" id="capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)}
                           required/>
                </div>
                <div>
                    <label htmlFor="pricePerHour">Price Per Hour ($):</label>
                    <input type="number" step="0.01" id="pricePerHour" value={pricePerHour}
                           onChange={(e) => setPricePerHour(e.target.value)} required/>
                </div>
                <div>
                    <label htmlFor="districtId">District:</label>
                    <select id="districtId" value={districtId} onChange={(e) => setDistrictId(e.target.value)} required>
                        <option value="">Select District</option>
                        {districtsData?.data?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="images">{mode === 'edit' ? 'Add New Images:' : 'Images:'}</label>
                    <input type="file" id="images" multiple onChange={handleImageChange} accept="image/*"/>
                    {mode === 'create' && <small>You can upload multiple images.</small>}
                </div>

                {mode === 'edit' && existingImages.length > 0 && (
                    <div>
                        <h4>Current Images:</h4>
                        <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
                            {existingImages.map(img => (
                                <div key={img.id}
                                     style={{border: '1px solid #ccc', padding: '5px', textAlign: 'center'}}>
                                    <img
                                        src={img.image_path.startsWith('http') ? img.image_path : `http://localhost:8000${img.image_path}`}
                                        alt="Hall"
                                        style={{width: '100px', height: 'auto', marginBottom: '5px'}}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://placehold.co/100x75?text=Img";
                                        }}
                                    />
                                    <button type="button" onClick={() => handleDeleteImage(img.id)}
                                            disabled={isDeletingImage} className="danger small">Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : (mode === 'create' ? 'Create Hall' : 'Update Hall')}
                </button>
            </form>
        </div>
    );
};

export default OwnerManageWeddingHallPage;
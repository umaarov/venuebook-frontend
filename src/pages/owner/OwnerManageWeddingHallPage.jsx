import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
    useCreateOwnerWeddingHallMutation,
    useDeleteWeddingHallImageMutation,
    useUpdateOwnerWeddingHallMutation,
} from '../../features/owner/ownerApi';
import {
    useAdminCreateWeddingHallMutation,
    useAdminListOwnersQuery,
    useAdminUpdateWeddingHallMutation
} from '../../features/admin/adminApi'; // For Admin
import {useGetDistrictsQuery, useGetWeddingHallByIdQuery} from '../../features/weddingHalls/weddingHallApi';
import {useAppSelector} from '../../app/hooks';
import {selectCurrentUser} from '../../features/auth/authSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import {CheckCircleIcon, PhotoIcon, PlusCircleIcon, TrashIcon} from '@heroicons/react/24/solid';

const OwnerManageWeddingHallPage = ({mode}) => {
    const navigate = useNavigate();
    const {id: hallIdParam} = useParams();
    const currentUser = useAppSelector(selectCurrentUser);
    const isAdminView = currentUser?.role === 'admin';

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [capacity, setCapacity] = useState('');
    const [pricePerSeat, setPricePerSeat] = useState('');
    const [phone, setPhone] = useState('');
    const [districtId, setDistrictId] = useState('');
    const [description, setDescription] = useState('');

    const [existingImages, setExistingImages] = useState([]);
    const [newImageFiles, setNewImageFiles] = useState([]);
    const [primaryImageId, setPrimaryImageId] = useState(null);
    const [newPrimaryImageIndex, setNewPrimaryImageIndex] = useState(null);

    const [ownerId, setOwnerId] = useState(isAdminView ? '' : currentUser?.id);

    const {data: districtsResponse, isLoading: isLoadingDistricts} = useGetDistrictsQuery();
    const {
        data: hallDetailResponse,
        isLoading: isLoadingHallDetails,
        error: hallDetailsError,
    } = useGetWeddingHallByIdQuery(hallIdParam, {skip: mode === 'create' || !hallIdParam});

    // Owner mutations
    const [createOwnerHall, {
        isLoading: isCreatingOwner,
        error: createOwnerError
    }] = useCreateOwnerWeddingHallMutation();
    const [updateOwnerHall, {
        isLoading: isUpdatingOwner,
        error: updateOwnerError
    }] = useUpdateOwnerWeddingHallMutation();

    // Admin mutations
    const [createAdminHall, {
        isLoading: isCreatingAdmin,
        error: createAdminError
    }] = useAdminCreateWeddingHallMutation();
    const [updateAdminHall, {
        isLoading: isUpdatingAdmin,
        error: updateAdminError
    }] = useAdminUpdateWeddingHallMutation();

    const [deleteImage, {isLoading: isDeletingImage, error: deleteImageError}] = useDeleteWeddingHallImageMutation();

    const {data: ownersData, isLoading: isLoadingOwners} = useAdminListOwnersQuery(undefined, {skip: !isAdminView});


    useEffect(() => {
        if (mode === 'edit' && hallDetailResponse?.data) {
            const hall = hallDetailResponse.data;
            setName(hall.name || '');
            setAddress(hall.address || '');
            setCapacity(hall.capacity?.toString() || '');
            setPricePerSeat(hall.price_per_seat?.toString() || '');
            setPhone(hall.phone || '');
            setDistrictId(hall.district_id?.toString() || '');
            setDescription(hall.description || '');
            setExistingImages(hall.images || []);
            const primary = hall.images?.find(img => img.is_primary);
            if (primary) setPrimaryImageId(primary.id.toString());

            if (isAdminView && hall.owner_id) {
                setOwnerId(hall.owner_id.toString());
            }
        } else if (mode === 'create' && !isAdminView && currentUser?.id) {
            setOwnerId(currentUser.id.toString());
        }
    }, [mode, hallDetailResponse, isAdminView, currentUser]);

    const handleImageFileChange = (e) => {
        const files = Array.from(e.target.files);
        setNewImageFiles(prev => [...prev, ...files]);
        e.target.value = null;
    };

    const handleRemoveNewImage = (index) => {
        setNewImageFiles(prev => prev.filter((_, i) => i !== index));
        if (newPrimaryImageIndex === index) setNewPrimaryImageIndex(null);
        else if (newPrimaryImageIndex > index) setNewPrimaryImageIndex(prevIdx => prevIdx - 1);
    };

    const handleDeleteExistingImage = async (imageId) => {
        if (!hallIdParam || !imageId) return;
        if (window.confirm('Are you sure you want to delete this image?')) {
            try {
                await deleteImage({weddingHallId: hallIdParam, imageId}).unwrap();
                setExistingImages(prev => prev.filter(img => img.id !== imageId));
                if (primaryImageId === imageId.toString()) setPrimaryImageId(null);
                alert('Image deleted successfully.');
            } catch (err) {
                console.error('Failed to delete image:', err);
                alert(err.data?.message || 'Failed to delete image.');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', name);
        formData.append('address', address);
        formData.append('capacity', parseInt(capacity, 10));
        formData.append('price_per_seat', parseFloat(pricePerSeat));
        formData.append('phone', phone);
        formData.append('district_id', parseInt(districtId, 10));
        formData.append('description', description);

        if (isAdminView && ownerId) {
            formData.append('owner_id', parseInt(ownerId));
        } else if (!isAdminView && currentUser?.id) {
            formData.append('owner_id', currentUser.id);
        }


        newImageFiles.forEach((file, index) => {
            formData.append('images[]', file);
            if (index === newPrimaryImageIndex) {
                formData.append('primary_image_index', index);
            }
        });

        if (mode === 'edit' && primaryImageId !== null) {
            formData.append('primary_image_id', primaryImageId);
        }


        try {
            let response;
            if (mode === 'create') {
                response = isAdminView ? await createAdminHall({data: formData}).unwrap() : await createOwnerHall({data: formData}).unwrap();
                alert('Wedding hall created successfully! It may require admin approval.');
            } else { // mode === 'edit'
                formData.append('_method', 'PUT');
                response = isAdminView ? await updateAdminHall({
                    id: hallIdParam,
                    data: formData
                }).unwrap() : await updateOwnerHall({id: hallIdParam, data: formData}).unwrap();
                alert('Wedding hall updated successfully!');
            }
            navigate(isAdminView ? '/admin/wedding-halls' : '/owner/wedding-halls');
        } catch (err) {
            console.error('Failed to save wedding hall:', err);
        }
    };

    const isLoadingMutation = isCreatingOwner || isUpdatingOwner || isCreatingAdmin || isUpdatingAdmin;
    const submissionError = createOwnerError || updateOwnerError || createAdminError || updateAdminError;
    const pageLoading = isLoadingDistricts || (mode === 'edit' && isLoadingHallDetails) || (isAdminView && isLoadingOwners);
    const inputClass = "mt-1 block w-full py-2.5 px-3.5 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary sm:text-sm transition-colors";
    const labelClass = "block text-sm font-medium text-gray-700";

    if (pageLoading) return <LoadingSpinner message="Loading hall data..."/>;

    const districts = districtsResponse?.data || [];
    const ownersList = ownersData?.data || [];

    return (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {mode === 'create' ? 'Add New' : 'Edit'} Wedding Hall
            </h1>
            <p className="text-gray-500 mb-8">
                {isAdminView ? 'Managing as Administrator.' : `Fill in the details for your venue.`}
            </p>

            {submissionError && <ErrorMessage message={submissionError.data?.message || `Failed to ${mode} hall.`}
                                              details={submissionError.data?.errors}/>}
            {hallDetailsError && mode === 'edit' &&
                <ErrorMessage message={hallDetailsError.data?.message || "Failed to load hall details."}/>}
            {deleteImageError && <ErrorMessage message={deleteImageError.data?.message || "Failed to delete image."}/>}

            <form onSubmit={handleSubmit} className="space-y-8" encType="multipart/form-data">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                    <div className="md:col-span-2">
                        <label htmlFor="wh-name" className={labelClass}>Name:</label>
                        <input type="text" id="wh-name" className={inputClass} value={name}
                               onChange={(e) => setName(e.target.value)} required/>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="wh-address" className={labelClass}>Address:</label>
                        <input type="text" id="wh-address" className={inputClass} value={address}
                               onChange={(e) => setAddress(e.target.value)} required/>
                    </div>
                    <div>
                        <label htmlFor="wh-capacity" className={labelClass}>Capacity (guests):</label>
                        <input type="number" id="wh-capacity" className={inputClass} value={capacity}
                               onChange={(e) => setCapacity(e.target.value)} required min="1"/>
                    </div>
                    <div>
                        <label htmlFor="wh-pricePerSeat" className={labelClass}>Price Per Seat ($):</label>
                        <input type="number" step="0.01" id="wh-pricePerSeat" className={inputClass}
                               value={pricePerSeat} onChange={(e) => setPricePerSeat(e.target.value)} required min="0"/>
                    </div>
                    <div>
                        <label htmlFor="wh-phone" className={labelClass}>Contact Phone:</label>
                        <input type="tel" id="wh-phone" className={inputClass} value={phone}
                               onChange={(e) => setPhone(e.target.value)} required/>
                    </div>
                    <div>
                        <label htmlFor="wh-districtId" className={labelClass}>District:</label>
                        <select id="wh-districtId" className={inputClass} value={districtId}
                                onChange={(e) => setDistrictId(e.target.value)} required>
                            <option value="">Select District</option>
                            {districts.map(d => <option key={d.id} value={d.id.toString()}>{d.name}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="wh-description" className={labelClass}>Description (optional):</label>
                        <textarea id="wh-description" rows="4" className={inputClass} value={description}
                                  onChange={(e) => setDescription(e.target.value)}
                                  placeholder="Tell us more about your venue..."></textarea>
                    </div>

                    {isAdminView && (
                        <div className="md:col-span-2">
                            <label htmlFor="wh-ownerId" className={labelClass}>Assign Owner (User ID):</label>
                            <select id="wh-ownerId" className={inputClass} value={ownerId} onChange={(e) => setOwnerId(e.target.value)} required={isAdminView}>
                                <option value="">Select Owner</option>
                                {ownersList && ownersList.map(owner => (
                                    <option key={owner.id} value={owner.id.toString()}>
                                        {owner.name} (ID: {owner.id})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Image Upload Section */}
                <div className="space-y-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Venue Images</h3>
                    <div>
                        <label htmlFor="wh-image-files" className={labelClass}>
                            {mode === 'edit' ? 'Upload New Images:' : 'Upload Images:'} <span
                            className="text-xs text-gray-500">(Multiple files can be selected)</span>
                        </label>
                        <input
                            type="file"
                            id="wh-image-files"
                            multiple
                            onChange={handleImageFileChange}
                            accept="image/jpeg, image/png, image/webp"
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary-dark hover:file:bg-primary-light/80 transition-colors"
                        />
                    </div>

                    {/* Display New Images to be Uploaded */}
                    {newImageFiles.length > 0 && (
                        <div className="mt-4">
                            <p className={labelClass}>New Images Preview:</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                                {newImageFiles.map((file, index) => (
                                    <div key={index}
                                         className="relative group border border-gray-300 rounded-lg overflow-hidden shadow-sm aspect-w-1 aspect-h-1">
                                        <img src={URL.createObjectURL(file)} alt={`New ${file.name}`}
                                             className="w-full h-full object-cover"/>
                                        <div
                                            className="absolute inset-0 bg-black bg-opacity-20 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button type="button" onClick={() => handleRemoveNewImage(index)}
                                                    className="text-white p-1.5 bg-red-600 hover:bg-red-700 rounded-full mb-1 text-xs"
                                                    title="Remove image"><TrashIcon className="w-4 h-4"/></button>
                                            <label htmlFor={`new-primary-${index}`}
                                                   className="flex items-center text-xs text-white bg-black/50 px-1.5 py-0.5 rounded-md cursor-pointer">
                                                <input type="radio" id={`new-primary-${index}`} name="new_primary_image"
                                                       value={index} checked={newPrimaryImageIndex === index}
                                                       onChange={() => setNewPrimaryImageIndex(index)}
                                                       className="w-3 h-3 text-primary focus:ring-primary-dark mr-1"/> Set
                                                Primary
                                            </label>
                                        </div>
                                        {newPrimaryImageIndex === index && <CheckCircleIcon
                                            className="absolute top-1 right-1 w-6 h-6 text-green-500 bg-white rounded-full p-0.5"
                                            title="Primary Image"/>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Display Existing Images for Edit Mode */}
                    {mode === 'edit' && existingImages.length > 0 && (
                        <div className="mt-6">
                            <p className={labelClass}>Current Images:</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                                {existingImages.map(img => (
                                    <div key={img.id}
                                         className="relative group border border-gray-300 rounded-lg overflow-hidden shadow-sm aspect-w-1 aspect-h-1">
                                        <img
                                            src={img.image_path.startsWith('http') ? img.image_path : `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${img.image_path}`}
                                            alt="Hall" className="w-full h-full object-cover" onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://placehold.co/300x200?text=Image+Error";
                                        }}/>
                                        <div
                                            className="absolute inset-0 bg-black bg-opacity-20 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button type="button" onClick={() => handleDeleteExistingImage(img.id)}
                                                    disabled={isDeletingImage}
                                                    className="text-white p-1.5 bg-red-600 hover:bg-red-700 rounded-full mb-1 text-xs"
                                                    title="Delete image"><TrashIcon className="w-4 h-4"/></button>
                                            <label htmlFor={`existing-primary-${img.id}`}
                                                   className="flex items-center text-xs text-white bg-black/50 px-1.5 py-0.5 rounded-md cursor-pointer">
                                                <input type="radio" id={`existing-primary-${img.id}`}
                                                       name="existing_primary_image" value={img.id.toString()}
                                                       checked={primaryImageId === img.id.toString()}
                                                       onChange={() => setPrimaryImageId(img.id.toString())}
                                                       className="w-3 h-3 text-primary focus:ring-primary-dark mr-1"/> Set
                                                Primary
                                            </label>
                                        </div>
                                        {primaryImageId === img.id.toString() && <CheckCircleIcon
                                            className="absolute top-1 right-1 w-6 h-6 text-green-500 bg-white rounded-full p-0.5"
                                            title="Primary Image"/>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {mode === 'edit' && existingImages.length === 0 && newImageFiles.length === 0 && (
                        <div className="mt-4 text-center py-6 border border-dashed border-gray-300 rounded-lg">
                            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400"/>
                            <p className="mt-2 text-sm text-gray-500">No images have been uploaded for this hall
                                yet.</p>
                        </div>
                    )}
                </div>

                <div className="pt-8 border-t border-gray-200 flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoadingMutation}
                        className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoadingMutation ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...</>
                        ) : (mode === 'create' ? <><PlusCircleIcon className="h-5 w-5 mr-2"/>Create Hall</> : <>
                            <CheckCircleIcon className="h-5 w-5 mr-2"/>Update Hall</>)}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default OwnerManageWeddingHallPage;
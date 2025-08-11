import React, { useEffect } from 'react';
import { X, Edit, User, Phone, MapPin } from 'lucide-react';
import { FaEdit } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import useEditProfile from './Hooks/useEditProfile';

/**
 * Modal para editar el perfil del usuario
 * Permite editar teléfono, dirección y foto de perfil
 * 
 * @param {boolean} isOpen - Si el modal está abierto
 * @param {Function} onClose - Función para cerrar el modal
 * @param {Function} onSuccess - Función callback cuando se actualiza exitosamente
 */
const EditProfileModal = ({ isOpen, onClose, onSuccess }) => {
    const { userInfo } = useAuth();

    const {
        formData,
        errors,
        isLoading,
        previewImage,
        handleInputChange,
        handleImageChange,
        removeImage,
        submitForm,
        initializeForm,
        setErrors
    } = useEditProfile();

    // Inicializar formulario cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            initializeForm();
        }
    }, [isOpen, initializeForm]);

    // Prevenir scroll del body cuando el modal está abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    const handleClose = () => {
        if (isLoading) return;

        setErrors({});
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = await submitForm();

        if (result.success) {
            onSuccess?.(result.message);
            onClose();
        } else {
            console.error('Error al actualizar perfil:', result.message);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';

        const words = name.trim().split(' ');
        if (words.length === 1) {
            return words[0].substring(0, 2).toUpperCase();
        }

        return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden transform transition-all duration-300 ease-out flex flex-col">
                {/* Header del modal */}
                <div className="flex items-center justify-between p-6 border-b border-pink-100 flex-shrink-0" style={{ backgroundColor: '#FDB4B7' }}>
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                            <Edit className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Editar Perfil
                        </h3>
                    </div>

                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        style={{ cursor: 'pointer' }}
                        className="p-2 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Contenido del modal con scroll */}
                <div className="flex-1 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6" style={{ backgroundColor: '#FFEEF0' }}>

                        {/* Sección de foto de perfil */}
                        <div className="text-center">
                            <div className="relative inline-block">
                                <div className="relative group">
                                    {previewImage ? (
                                        <img
                                            src={previewImage}
                                            alt="Preview"
                                            className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-lg"
                                        />
                                    ) : userInfo?.profilePicture ? (
                                        <img
                                            src={userInfo.profilePicture}
                                            alt="Foto de perfil"
                                            className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-lg"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-700 text-2xl md:text-3xl border-4 border-white shadow-lg">
                                            {getInitials(userInfo?.displayName)}
                                        </div>
                                    )}

                                    <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
                                        <label htmlFor="profilePicture" className="cursor-pointer">
                                            <FaEdit className="w-6 h-6 text-white" />
                                        </label>
                                    </div>
                                </div>

                                <input
                                    id="profilePicture"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    disabled={isLoading}
                                    className="hidden"
                                />

                                {previewImage && (
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        disabled={isLoading}
                                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors duration-200 disabled:opacity-50"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <p className="text-sm text-gray-600 mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Haz clic en la imagen para cambiarla
                            </p>

                            {errors.profilePicture && (
                                <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {errors.profilePicture}
                                </p>
                            )}
                        </div>

                        {/* NUEVO: Campo Nombre Completo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                <User className="w-4 h-4 inline mr-2" />
                                Nombre Completo *
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                placeholder="Tu nombre completo"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                                maxLength={100}
                            />
                            {errors.fullName && (
                                <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {errors.fullName}
                                </p>
                            )}
                        </div>

                        {/* Campo: Teléfono */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                <Phone className="w-4 h-4 inline mr-2" />
                                Teléfono *
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                placeholder="7123-4567"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                                maxLength={9}
                            />
                            {errors.phone && (
                                <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {errors.phone}
                                </p>
                            )}
                        </div>

                        {/* Campo: Dirección */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                <MapPin className="w-4 h-4 inline mr-2" />
                                Dirección *
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                placeholder="Ingresa tu dirección completa"
                                rows={3}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent resize-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                                maxLength={200}
                            />
                            {errors.address && (
                                <p className="text-red-500 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {errors.address}
                                </p>
                            )}
                        </div>

                        {/* Botones */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 bg-[#FDB4B7] hover:bg-pink-300 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Edit className="w-4 h-4" />
                                        Guardar cambios
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;
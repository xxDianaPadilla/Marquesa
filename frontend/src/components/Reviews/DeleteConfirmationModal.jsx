// frontend/src/components/Reviews/DeleteConfirmationModal.jsx
import React, { useState, useEffect } from 'react';

/**
 * Modal de confirmación para eliminar reseñas con validación de ID
 * 
 * Muestra los detalles de la reseña que se va a eliminar y solicita confirmación
 * del usuario antes de proceder con la eliminación. Incluye información del cliente,
 * calificación y mensaje de la reseña con validaciones mejoradas.
 * 
 * @param {Object} props - Props del componente
 * @param {boolean} props.isOpen - Controla si el modal está visible
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onConfirm - Función para confirmar la eliminación
 * @param {Object} props.reviewToDelete - Objeto con los datos de la reseña a eliminar
 */
const DeleteConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    reviewToDelete 
}) => {
    // Estado para controlar la confirmación explícita del usuario
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');

    /**
     * Efecto para limpiar el estado cuando se abre/cierra el modal
     */
    useEffect(() => {
        if (isOpen) {
            // Limpiar estado cuando se abre el modal
            setIsConfirmed(false);
            setIsDeleting(false);
            setError('');
        }
    }, [isOpen]);

    /**
     * Valida el ID de la reseña antes de proceder
     * 
     * @param {Object} review - Objeto de la reseña
     * @returns {Object} Resultado de validación
     */
    const validateReviewForDeletion = (review) => {
        console.log('=== VALIDATING REVIEW FOR DELETION ===');
        console.log('Review object:', review);
        console.log('Review ID:', review?._id);
        console.log('Review ID type:', typeof review?._id);

        if (!review) {
            return { isValid: false, error: 'No hay reseña para eliminar' };
        }

        if (!review._id) {
            return { isValid: false, error: 'La reseña no tiene un ID válido' };
        }

        // Validar formato de ObjectId de MongoDB (24 caracteres hexadecimales)
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        const reviewId = String(review._id).trim();
        
        if (!objectIdRegex.test(reviewId)) {
            console.log('ID format validation failed:', reviewId);
            return { 
                isValid: false, 
                error: `ID de reseña con formato inválido: ${reviewId.substring(0, 10)}...` 
            };
        }

        // Validar que tenga datos mínimos
        if (!review.message && !review.rating) {
            return { isValid: false, error: 'La reseña no tiene datos válidos' };
        }

        console.log('Review validation passed for ID:', reviewId);
        return { isValid: true, error: null };
    };

    /**
     * Maneja el cambio del checkbox de confirmación
     * 
     * @param {Event} e - Evento del checkbox
     */
    const handleConfirmationChange = (e) => {
        const confirmed = e.target.checked;
        setIsConfirmed(confirmed);
        
        // Limpiar error cuando el usuario confirma
        if (confirmed && error) {
            setError('');
        }
    };

    /**
     * Maneja la confirmación de eliminación con validaciones mejoradas
     */
    const handleConfirmDelete = async () => {
        console.log('=== CONFIRMING DELETE WITH IMPROVED VALIDATION ===');
        
        // Validar confirmación del usuario
        if (!isConfirmed) {
            setError('Debes confirmar que deseas eliminar la reseña');
            return;
        }

        // Validar la reseña antes de proceder
        const validation = validateReviewForDeletion(reviewToDelete);
        if (!validation.isValid) {
            console.error('Validation failed:', validation.error);
            setError(validation.error);
            return;
        }

        // Validar función callback
        if (!onConfirm || typeof onConfirm !== 'function') {
            setError('Error interno: función de eliminación no disponible');
            return;
        }

        setIsDeleting(true);
        setError('');

        try {
            console.log('Proceeding with deletion for review ID:', reviewToDelete._id);
            
            await onConfirm();
            
            console.log('Review deleted successfully');
            
            // Limpiar estado después de eliminación exitosa
            setIsConfirmed(false);
            setIsDeleting(false);
            setError('');
            
        } catch (error) {
            console.error('Error al eliminar reseña:', error);
            setIsDeleting(false);
            
            // Mostrar error específico del servidor
            let errorMessage = 'Error desconocido al eliminar la reseña';
            
            if (error.message) {
                errorMessage = error.message;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            
            setError(errorMessage);
        }
    };

    /**
     * Maneja la cancelación del modal
     */
    const handleCancel = () => {
        if (!isDeleting) {
            setIsConfirmed(false);
            setIsDeleting(false);
            setError('');
            onClose();
        }
    };

    /**
     * Renderiza las estrellas de calificación
     * 
     * @param {number} rating - Calificación de 1 a 5 estrellas
     * @returns {Array} Array de elementos JSX con las estrellas
     */
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <svg
                    key={i}
                    className={`w-4 h-4 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            );
        }
        return stars;
    };

    /**
     * Obtiene la información del cliente que dejó la reseña
     * 
     * @param {Object} review - Objeto de la reseña
     * @returns {Object} Objeto con name y profilePicture del cliente
     */
    const getClientInfo = (review) => {
        return {
            name: review?.clientId?.fullName || 'Usuario Anónimo',
            profilePicture: review?.clientId?.profilePicture || null
        };
    };

    /**
     * Trunca el texto del mensaje para mostrar una vista previa
     * 
     * @param {string} text - Texto a truncar
     * @param {number} maxLength - Longitud máxima permitida
     * @returns {string} Texto truncado
     */
    const truncateText = (text, maxLength = 100) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // No renderizar nada si el modal no está abierto
    if (!isOpen) return null;

    // Validar que hay una reseña para mostrar
    if (!reviewToDelete) {
        return (
            <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 border border-gray-200 shadow-xl">
                    <div className="text-center">
                        <div className="text-red-500 mb-4">
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Error
                        </h3>
                        <p className="text-gray-600 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            No se pudo cargar la información de la reseña
                        </p>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                            style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 border border-gray-200 shadow-xl">
                
                {/* Header con ícono de advertencia y título */}
                <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Confirmar eliminación
                        </h3>
                    </div>
                </div>

                {/* Mensaje de confirmación y preview de la reseña */}
                <div className="mb-4">
                    <p className="text-sm text-gray-700 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        ¿Estás seguro de que quieres eliminar esta reseña? Esta acción no se puede deshacer.
                    </p>
                    
                    {/* Vista previa de la reseña a eliminar */}
                    <div className="p-3 bg-gray-50 rounded-lg border">
                        {/* Información de debug (solo en desarrollo) */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="text-xs text-gray-500 mb-2 font-mono">
                                ID: {reviewToDelete._id}
                            </div>
                        )}
                        
                        {/* Calificación con estrellas */}
                        {reviewToDelete.rating && (
                            <div className="flex items-center mb-2">
                                {renderStars(reviewToDelete.rating)}
                                <span className="ml-2 text-xs text-gray-600">
                                    {reviewToDelete.rating}/5
                                </span>
                            </div>
                        )}
                        
                        {/* Mensaje de la reseña truncado */}
                        {reviewToDelete.message && (
                            <p className="text-sm text-gray-800 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                "{truncateText(reviewToDelete.message, 100)}"
                            </p>
                        )}
                        
                        {/* Autor de la reseña */}
                        <p className="text-xs text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Por: {getClientInfo(reviewToDelete).name}
                        </p>
                    </div>
                </div>

                {/* Checkbox de confirmación explícita */}
                <div className="mb-4">
                    <label className="flex items-start space-x-3">
                        <input
                            type="checkbox"
                            checked={isConfirmed}
                            onChange={handleConfirmationChange}
                            disabled={isDeleting}
                            className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                            style={{ cursor: 'pointer' }}
                        />
                        <span className="text-sm text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Confirmo que deseo eliminar permanentemente esta reseña. Entiendo que esta acción no se puede deshacer.
                        </span>
                    </label>
                </div>

                {/* Mensaje de error si existe */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center">
                            <svg className="w-4 h-4 text-red-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm text-red-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {error}
                            </span>
                        </div>
                    </div>
                )}

                {/* Botones de acción */}
                <div className="flex justify-end space-x-3">
                    {/* Botón cancelar */}
                    <button
                        onClick={handleCancel}
                        disabled={isDeleting}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                    >
                        Cancelar
                    </button>
                    
                    {/* Botón confirmar eliminación */}
                    <button
                        onClick={handleConfirmDelete}
                        disabled={isDeleting || !isConfirmed}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                    >
                        {isDeleting ? (
                            <>
                                {/* Spinner de carga */}
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Eliminando...
                            </>
                        ) : (
                            <>
                                {/* Ícono de eliminación */}
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Eliminar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
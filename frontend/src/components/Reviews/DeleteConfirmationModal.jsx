// frontend/src/components/Reviews/Components/DeleteConfirmationModal.jsx
import React from 'react';

// Componente para confirmar la eliminación de una reseña
// Muestra detalles de la reseña y solicita confirmación para eliminarla
const DeleteConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    reviewToDelete 
}) => {
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
// Función para obtener la información del cliente que dejó la reseña
    const getClientInfo = (review) => {
        return {
            name: review.clientId?.fullName || 'Usuario Anónimo',
            profilePicture: review.clientId?.profilePicture || null
        };
    };
// Función para truncar el texto del mensaje de la reseña
    const truncateText = (text, maxLength = 100) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 border border-gray-200 shadow-xl">
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

                <div className="mb-4">
                    <p className="text-sm text-gray-700 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        ¿Estás seguro de que quieres eliminar esta reseña? Esta acción no se puede deshacer.
                    </p>
                    {reviewToDelete && (
                        <div className="p-3 bg-gray-50 rounded-lg border">
                            <div className="flex items-center mb-2">
                                {renderStars(reviewToDelete.rating)}
                                <span className="ml-2 text-xs text-gray-600">
                                    {reviewToDelete.rating}/5
                                </span>
                            </div>
                            <p className="text-sm text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                "{truncateText(reviewToDelete.message, 100)}"
                            </p>
                            <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Por: {getClientInfo(reviewToDelete).name}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                        style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-pink-200 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
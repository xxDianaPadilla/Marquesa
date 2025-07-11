import React, { useState, useEffect } from 'react';
import OverlayBackdrop from '../OverlayBackdrop';

// Componente para el modal de respuesta a reseñas
// Permite a los administradores responder a reseñas de clientes
const ReviewReplyModal = ({ isOpen, onClose, review, onSubmit }) => {
    const [reply, setReply] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Si la reseña ya tiene una respuesta, mostrarla
            setReply(review?.response || '');
        }
    }, [isOpen, review]);
// Dependencia review para actualizar la respuesta cuando cambie
    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('=== MODAL SUBMIT DEBUG ===');
        console.log('Reply text:', reply.trim());
        console.log('Reply length:', reply.trim().length);
        console.log('Selected review:', review);
        console.log('Selected review ID:', review?._id);
        console.log('onSubmit function:', typeof onSubmit);

        if (!reply.trim()) {
            console.log('Reply is empty, returning');
            return;
        }

        if (!review?._id) {
            console.error('No review ID found');
            alert('Error: No se encontró el ID de la reseña');
            return;
        }

        if (typeof onSubmit !== 'function') {
            console.error('onSubmit is not a function');
            alert('Error: Función onSubmit no está definida');
            return;
        }

        setIsSubmitting(true);

        try {
            console.log('Calling onSubmit with:', reply.trim());
            await onSubmit(reply.trim());
            console.log('onSubmit completed successfully');

            // No limpiar el reply aquí, se maneja desde el componente padre
        } catch (error) {
            console.error('Error in modal handleSubmit:', error);
            // Mostrar el error al usuario
            alert('Error al enviar la respuesta: ' + (error.message || 'Error desconocido'));
        } finally {
            setIsSubmitting(false);
        }
    };
// Función para renderizar las estrellas de calificación
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <svg
                    key={i}
                    className={`w-3 h-3 sm:w-4 sm:h-4 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            );
        }
        return stars;
    };

    // Función para obtener información del cliente
    const getClientInfo = (review) => {
        return {
            name: review?.clientId?.fullName || 'Usuario Anónimo',
            profilePicture: review?.clientId?.profilePicture || null
        };
    };

    // Función para obtener información del producto
    const getProductInfo = (review) => {
        if (!review?.products || review.products.length === 0) {
            return { name: 'Sin producto', image: null };
        }
        // Si hay varios productos, mostrar el primero
        const firstProduct = review.products[0];

        if (firstProduct.itemType === 'custom') {
            return {
                name: 'Producto personalizado',
                image: firstProduct.itemId?.referenceImage || null
            };
        } else {
            return {
                name: firstProduct.itemId?.name || 'Producto',
                image: firstProduct.itemId?.images?.[0]?.image || null
            };
        }
    };

    if (!isOpen || !review) return null;

    const clientInfo = getClientInfo(review);
    const productInfo = getProductInfo(review);

    return (
        <OverlayBackdrop isVisible={isOpen} onClose={onClose}>
            <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto">
                <div
                    className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300 ease-out border border-gray-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header - Responsive */}
                    <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6 border-b border-gray-200 bg-white flex-shrink-0">
                        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 pr-2 sm:pr-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {review.response ? 'Editar Respuesta' : 'Responder Reseña'}
                        </h2>
                        <button
                            style={{ cursor: 'pointer' }}
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Contenido scrolleable - Responsive */}
                    <div className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                        {/* Información de la reseña - Compacta en móvil */}
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                            <div className="flex items-start gap-2 sm:gap-3 mb-3">
                                {/* Avatar del cliente - Más pequeño en móvil */}
                                <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                                    {clientInfo.profilePicture ? (
                                        <img
                                            src={clientInfo.profilePicture}
                                            alt="Cliente"
                                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-300 flex items-center justify-center ${clientInfo.profilePicture ? 'hidden' : ''}`}>
                                        <span className="text-xs sm:text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            {clientInfo.name.charAt(0)?.toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {clientInfo.name}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-500 truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {productInfo.name}
                                    </p>
                                </div>
                            </div>

                            {/* Calificación - Responsive */}
                            <div className="flex items-center mb-3">
                                <div className="flex items-center">
                                    {renderStars(review.rating)}
                                </div>
                                <span className="ml-2 text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {review.rating}/5
                                </span>
                            </div>

                            {/* Comentario - Responsive */}
                            <div className="bg-white rounded-lg p-2 sm:p-3 border">
                                <p className="text-xs sm:text-sm text-gray-900 leading-relaxed break-words" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    "{review.message}"
                                </p>
                            </div>

                            {/* Fecha - Responsive */}
                            <div className="mt-2">
                                <span className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {new Date(review.createdAt).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: window.innerWidth < 640 ? '2-digit' : 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        </div>

                        {/* Respuesta actual (si existe) - Responsive */}
                        {review.response && (
                            <div className="bg-blue-50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 border border-blue-200">
                                <h4 className="text-xs sm:text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Respuesta actual:
                                </h4>
                                <p className="text-xs sm:text-sm text-blue-700 leading-relaxed break-words" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {review.response}
                                </p>
                            </div>
                        )}

                        {/* Formulario de respuesta - Responsive */}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3 sm:mb-4">
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {review.response ? 'Editar tu respuesta' : 'Tu respuesta'}
                                </label>
                                <textarea
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                    disabled={isSubmitting}
                                    rows={window.innerWidth < 640 ? 3 : 4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent resize-none text-xs sm:text-sm"
                                    placeholder="Escribe tu respuesta a esta reseña..."
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                    required
                                />
                                <div className="mt-1 text-xs text-gray-500 flex justify-between" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    <span>{reply.length}/500 caracteres</span>
                                    <span className="hidden sm:inline">Máximo 500 caracteres</span>
                                </div>
                            </div>

                            {/* Consejos para responder - Colapsible en móvil */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 sm:mb-4">
                                <h4 className="text-xs sm:text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    💡 Consejos para una buena respuesta:
                                </h4>
                                <ul className="text-xs text-blue-700 space-y-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    <li>• Agradece al cliente por su reseña</li>
                                    <li>• Sé específico y personal en tu respuesta</li>
                                    <li className="hidden sm:list-item">• Si hay un problema, ofrece una solución</li>
                                    <li className="hidden sm:list-item">• Mantén un tono profesional y amigable</li>
                                    <li className="sm:hidden">• Ofrece soluciones si es necesario</li>
                                </ul>
                            </div>
                        </form>
                    </div>

                    {/* Footer con botones - Stack en móvil */}
                    <div className="bg-white border-t border-gray-200 p-3 sm:p-4 lg:p-6 flex-shrink-0">
                        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="w-full sm:w-auto px-3 sm:px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={isSubmitting || !reply.trim()}
                                className="w-full sm:w-auto px-3 sm:px-4 py-2 text-white rounded-lg hover:bg-pink-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                                style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#FDB4B7', cursor: 'pointer' }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Enviando...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                        <span className="hidden xs:inline">
                                            {review.response ? 'Actualizar Respuesta' : 'Enviar Respuesta'}
                                        </span>
                                        <span className="xs:hidden">
                                            {review.response ? 'Actualizar' : 'Enviar'}
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </OverlayBackdrop>
    );
};

export default ReviewReplyModal;
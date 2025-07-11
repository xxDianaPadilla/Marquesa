import React from 'react';

// Componente para mostrar una tarjeta de reseña
// Permite responder, moderar o eliminar reseñas de clientes
const ReviewCard = ({ 
    review, 
    onReply, 
    onModerate, 
    onDelete, 
    expandedReviews, 
    onToggleExpand 
}) => {
    // Formatea la fecha de creación y respuesta
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

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
    // Genera el badge de estado según el estado de la reseña
    const getStatusBadge = (status, hasResponse) => {
        if (hasResponse && status !== 'replied') {
            status = 'replied';
        }
        // Configuración de estilos para cada estado
        const statusConfig = {
            'pending': { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', text: 'Pendiente', icon: '⏳' },
            'approved': { color: 'bg-green-100 text-green-800 border-green-300', text: 'Aprobada', icon: '✅' },
            'rejected': { color: 'bg-red-100 text-red-800 border-red-300', text: 'Rechazada', icon: '❌' },
            'replied': { color: 'bg-blue-100 text-blue-800 border-blue-300', text: 'Respondida', icon: '💬' }
        };
        // Selecciona la configuración según el estado
        const config = statusConfig[status] || statusConfig['pending'];

        return (
            <span className={`inline-flex items-center px-2 py-1 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium border gap-1 ${config.color}`}>
                <span className="text-xs">{config.icon}</span>
                <span className="hidden xs:inline">{config.text}</span>
            </span>
        );
    };
    // Verifica si la reseña tiene respuesta
    const isReviewReplied = (review) => {
        return review.response && review.response.trim() !== '';
    };
    // Obtiene la información del producto asociado a la reseña
    const getProductInfo = (review) => {
        if (!review.products || review.products.length === 0) {
            return { name: 'Sin producto', image: null };
        }

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
    // Obtiene la información del cliente que dejó la reseña
    const getClientInfo = (review) => {
        return {
            name: review.clientId?.fullName || 'Usuario Anónimo',
            profilePicture: review.clientId?.profilePicture || null
        };
    };
    // Trunca el texto del mensaje para mostrar una vista previa
    const truncateText = (text, maxLength = 100, mobileMaxLength = 60) => {
        if (!text) return '';
        // Usar longitud diferente según el tamaño de pantalla
        const finalMaxLength = window.innerWidth < 640 ? mobileMaxLength : maxLength;
        if (text.length <= finalMaxLength) return text;
        return text.substring(0, finalMaxLength) + '...';
    };

    const productInfo = getProductInfo(review);
    const clientInfo = getClientInfo(review);
    const isReplied = isReviewReplied(review);
    const isExpanded = expandedReviews.has(review._id);
    const messageToShow = isExpanded ? review.message : truncateText(review.message, 100, 60);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mx-2 sm:mx-0">
            {/* Header con cliente - Responsive */}
            <div className="flex items-start justify-between mb-3 gap-2">
                <div className="flex items-center min-w-0 flex-1">
                    {/* Avatar más pequeño en móvil */}
                    <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 mr-2 sm:mr-3">
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
                        <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center ${clientInfo.profilePicture ? 'hidden' : ''}`}>
                            <span className="text-xs sm:text-sm font-medium text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {clientInfo.name.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-1 mb-1">
                            <span className="text-sm sm:text-base font-medium text-gray-900 truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {clientInfo.name}
                            </span>
                            {review.verified && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 flex-shrink-0">
                                    ✓
                                </span>
                            )}
                            {isReplied && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0">
                                    💬
                                </span>
                            )}
                        </div>
                        <div className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {formatDate(review.createdAt)}
                        </div>
                    </div>
                </div>

                {/* Badge de estado */}
                <div className="flex-shrink-0">
                    {getStatusBadge(review.status || 'pending', isReplied)}
                </div>
            </div>

            {/* Información del producto - Layout más compacto en móvil */}
            <div className="flex items-center mb-3 p-2 bg-gray-50 rounded-lg gap-2">
                <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                    {productInfo.image ? (
                        <img
                            src={productInfo.image}
                            alt="Producto"
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-cover border border-gray-200"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 ${productInfo.image ? 'hidden' : ''}`}>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {productInfo.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {review.products?.[0]?.itemType === 'custom' ? 'Personalizado' : 'Producto estándar'}
                    </div>
                </div>
            </div>

            {/* Calificación - Responsive */}
            <div className="flex items-center mb-3">
                <div className="flex items-center">
                    {renderStars(review.rating)}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {review.rating}/5
                </span>
            </div>

            {/* Comentario - Mejor manejo de texto en móvil */}
            <div className="mb-3">
                <p className="text-sm text-gray-900 leading-relaxed break-words" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {messageToShow}
                </p>
                {review.message && review.message.length > (window.innerWidth < 640 ? 60 : 100) && (
                    <button
                        onClick={() => onToggleExpand(review._id)}
                        className="text-xs text-blue-600 hover:text-blue-800 mt-1 font-medium"
                        style={{ cursor: 'pointer' }}
                    >
                        {isExpanded ? 'Ver menos' : 'Ver más'}
                    </button>
                )}

                {/* Respuesta - Mejorada para móvil */}
                {review.response && (
                    <div className="mt-3 p-2 sm:p-3 bg-blue-50 rounded border-l-4 border-blue-300">
                        <p className="text-xs font-medium text-blue-800 flex items-center gap-1 mb-1">
                            <span>💬</span>
                            <span>Tu respuesta:</span>
                        </p>
                        <p className="text-xs sm:text-sm text-blue-600 leading-relaxed break-words" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {review.response}
                        </p>
                    </div>
                )}

                {/* Imágenes - Grid responsive */}
                {review.images && review.images.length > 0 && (
                    <div className="mt-3">
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {review.images.slice(0, window.innerWidth < 640 ? 3 : 5).map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`Imagen ${index + 1}`}
                                    className="h-12 w-12 sm:h-14 sm:w-14 object-cover rounded border aspect-square"
                                />
                            ))}
                            {review.images.length > (window.innerWidth < 640 ? 3 : 5) && (
                                <div className="h-12 w-12 sm:h-14 sm:w-14 bg-gray-100 rounded border flex items-center justify-center aspect-square">
                                    <span className="text-xs text-gray-600 font-medium">
                                        +{review.images.length - (window.innerWidth < 640 ? 3 : 5)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Acciones - Layout mejorado para móvil */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <span className="hidden sm:inline">Creada: </span>
                    <span className="sm:hidden">
                        {new Date(review.createdAt).toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: '2-digit' 
                        })}
                    </span>
                    <span className="hidden sm:inline">
                        {new Date(review.createdAt).toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: '2-digit' 
                        })}
                    </span>
                </div>
                
                <div className="flex items-center space-x-1">
                    {/* Botón de responder */}
                    <button
                        onClick={() => onReply(review)}
                        className={`transition-colors p-2 rounded-full ${isReplied
                            ? 'text-blue-800 hover:text-blue-900 hover:bg-blue-200'
                            : 'text-blue-600 hover:text-blue-800 hover:bg-blue-100'
                            }`}
                        title={isReplied ? 'Editar respuesta' : 'Responder'}
                        style={{ cursor: 'pointer' }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                    </button>

                    {/* Botón de eliminar */}
                    <button
                        onClick={() => onDelete(review)}
                        className="text-red-600 hover:text-red-800 transition-colors p-2 rounded-full hover:bg-red-100"
                        title="Eliminar reseña"
                        style={{ cursor: 'pointer' }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewCard;
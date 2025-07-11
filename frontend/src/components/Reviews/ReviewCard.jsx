// frontend/src/components/Reviews/Components/ReviewCard.jsx
import React from 'react';

const ReviewCard = ({ 
    review, 
    onReply, 
    onModerate, 
    onDelete, 
    expandedReviews, 
    onToggleExpand 
}) => {
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

    const getStatusBadge = (status, hasResponse) => {
        if (hasResponse && status !== 'replied') {
            status = 'replied';
        }

        const statusConfig = {
            'pending': { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', text: 'Pendiente', icon: '⏳' },
            'approved': { color: 'bg-green-100 text-green-800 border-green-300', text: 'Aprobada', icon: '✅' },
            'rejected': { color: 'bg-red-100 text-red-800 border-red-300', text: 'Rechazada', icon: '❌' },
            'replied': { color: 'bg-blue-100 text-blue-800 border-blue-300', text: 'Respondida', icon: '💬' }
        };

        const config = statusConfig[status] || statusConfig['pending'];

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border gap-1 ${config.color}`}>
                <span>{config.icon}</span>
                <span>{config.text}</span>
            </span>
        );
    };

    const isReviewReplied = (review) => {
        return review.response && review.response.trim() !== '';
    };

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

    const getClientInfo = (review) => {
        return {
            name: review.clientId?.fullName || 'Usuario Anónimo',
            profilePicture: review.clientId?.profilePicture || null
        };
    };

    const truncateText = (text, maxLength = 100) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const productInfo = getProductInfo(review);
    const clientInfo = getClientInfo(review);
    const isReplied = isReviewReplied(review);
    const isExpanded = expandedReviews.has(review._id);
    const messageToShow = isExpanded ? review.message : truncateText(review.message, 100);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            {/* Header con cliente */}
            <div className="flex items-center mb-3">
                <div className="flex-shrink-0 h-10 w-10 mr-3">
                    {clientInfo.profilePicture ? (
                        <img
                            src={clientInfo.profilePicture}
                            alt="Cliente"
                            className="h-10 w-10 rounded-full object-cover"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div className={`h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center ${clientInfo.profilePicture ? 'hidden' : ''}`}>
                        <span className="text-sm font-medium text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {clientInfo.name.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                    </div>
                </div>

                <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 flex items-center flex-wrap gap-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {clientInfo.name}
                        {review.verified && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                ✓
                            </span>
                        )}
                        {isReplied && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                💬
                            </span>
                        )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {formatDate(review.createdAt)}
                    </div>
                </div>

                <div>
                    {getStatusBadge(review.status || 'pending', isReplied)}
                </div>
            </div>

            {/* Información del producto */}
            <div className="flex items-center mb-3 p-2 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 h-10 w-10 mr-3">
                    {productInfo.image ? (
                        <img
                            src={productInfo.image}
                            alt="Producto"
                            className="h-10 w-10 rounded-lg object-cover border border-gray-200"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div className={`h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 ${productInfo.image ? 'hidden' : ''}`}>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                </div>
                <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {productInfo.name}
                    </div>
                    <div className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {review.products?.[0]?.itemType === 'custom' ? 'Personalizado' : 'Producto estándar'}
                    </div>
                </div>
            </div>

            {/* Calificación */}
            <div className="flex items-center mb-3">
                {renderStars(review.rating)}
                <span className="ml-2 text-sm font-medium text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {review.rating}/5
                </span>
            </div>

            {/* Comentario */}
            <div className="mb-3">
                <p className="text-sm text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {messageToShow}
                </p>
                {review.message && review.message.length > 100 && (
                    <button
                        onClick={() => onToggleExpand(review._id)}
                        className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                        style={{ cursor: 'pointer' }}
                    >
                        {isExpanded ? 'Ver menos' : 'Ver más'}
                    </button>
                )}

                {/* Respuesta */}
                {review.response && (
                    <div className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-300">
                        <p className="text-xs text-blue-700 font-medium flex items-center gap-1">
                            <span>💬</span>
                            Tu respuesta:
                        </p>
                        <p className="text-xs text-blue-600 mt-1">{review.response}</p>
                    </div>
                )}

                {/* Imágenes */}
                {review.images && review.images.length > 0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                        {review.images.slice(0, 4).map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`Imagen ${index + 1}`}
                                className="h-12 w-12 object-cover rounded border"
                            />
                        ))}
                        {review.images.length > 4 && (
                            <div className="h-12 w-12 bg-gray-100 rounded border flex items-center justify-center">
                                <span className="text-xs text-gray-600">
                                    +{review.images.length - 4}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ReviewCard
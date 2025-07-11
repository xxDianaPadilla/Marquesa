import React, { useState } from 'react';
import ReviewReplyModal from './ReviewReplyModal';

const ReviewsTable = ({ reviews, onReply, onModerate, onDelete, onReviewUpdate }) => {
    const [replyModalOpen, setReplyModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);

    const handleReplyClick = (review) => {
        setSelectedReview(review);
        setReplyModalOpen(true);
    };

    const handleReplySubmit = async (reply) => {
        if (selectedReview) {
            try {
                // Llamar a la función de respuesta
                await onReply(selectedReview._id, reply);

                // Actualizar el estado local si se proporciona la función
                if (onReviewUpdate) {
                    onReviewUpdate(selectedReview._id, {
                        response: reply,
                        status: 'replied',
                        responseDate: new Date().toISOString()
                    });
                }

                // Cerrar el modal
                setReplyModalOpen(false);
                setSelectedReview(null);

                // Opcional: Mostrar mensaje de éxito
                console.log('Respuesta enviada exitosamente');

            } catch (error) {
                console.error('Error al enviar respuesta:', error);
                alert('Error al enviar la respuesta: ' + error.message);
            }
        }
    };

    const handleDeleteClick = (review) => {
        console.log('Delete clicked for review:', review._id); // Debug
        setReviewToDelete(review);
        setDeleteConfirmModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (reviewToDelete && onDelete) {
            try {
                console.log('Attempting to delete review:', reviewToDelete._id); // Debug
                await onDelete(reviewToDelete._id);
                setDeleteConfirmModal(false);
                setReviewToDelete(null);
                console.log('Reseña eliminada exitosamente');
            } catch (error) {
                console.error('Error al eliminar reseña:', error);
                alert('Error al eliminar la reseña: ' + error.message);
            }
        } else {
            console.error('No se puede eliminar:', { reviewToDelete, onDelete }); // Debug
        }
    };

    // Función para manejar la moderación (aprobar/rechazar)
    const handleModerateClick = async (reviewId, action) => {
        if (onModerate) {
            try {
                console.log(`Attempting to ${action} review:`, reviewId); // Debug
                await onModerate(reviewId, action);
                console.log(`Reseña ${action === 'approve' ? 'aprobada' : 'rechazada'} exitosamente`);
            } catch (error) {
                console.error('Error al moderar reseña:', error);
                alert('Error al moderar la reseña: ' + error.message);
            }
        }
    };

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
        // Priorizar el estado 'replied' si tiene respuesta
        if (hasResponse && status !== 'replied') {
            status = 'replied';
        }

        const statusConfig = {
            'pending': { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', text: 'Pendiente' },
            'approved': { color: 'bg-green-100 text-green-800 border-green-300', text: 'Aprobada' },
            'rejected': { color: 'bg-red-100 text-red-800 border-red-300', text: 'Rechazada' },
            'replied': { color: 'bg-blue-100 text-blue-800 border-blue-300', text: 'Respondida' }
        };

        const config = statusConfig[status] || statusConfig['pending'];

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
                {config.text}
            </span>
        );
    };

    // Función para verificar si una reseña está respondida
    const isReviewReplied = (review) => {
        return review.response && review.response.trim() !== '';
    };

    // Función para obtener información del producto
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

    // Función para obtener información del cliente
    const getClientInfo = (review) => {
        return {
            name: review.clientId?.fullName || 'Usuario Anónimo',
            profilePicture: review.clientId?.profilePicture || null
        };
    };

    if (reviews.length === 0) {
        return (
            <div className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <p className="text-gray-500 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    No se encontraron reseñas
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Vista Desktop */}
            <div className="hidden lg:block">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Cliente y Producto
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Calificación
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Comentario
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Fecha
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reviews.map((review) => {
                                const productInfo = getProductInfo(review);
                                const clientInfo = getClientInfo(review);
                                const isReplied = isReviewReplied(review);

                                return (
                                    <tr key={review._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {/* Avatar del cliente */}
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
                                                    <div className={`h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center ${clientInfo.profilePicture ? 'hidden' : ''}`}>
                                                        <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                            {clientInfo.name.charAt(0)?.toUpperCase() || 'U'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Información del cliente */}
                                                <div className="flex-1 mr-4">
                                                    <div className="text-sm font-medium text-gray-900 flex items-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                        {clientInfo.name}
                                                        {isReplied && (
                                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                                ✓ Respondida
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                        Cliente
                                                    </div>
                                                </div>

                                                {/* Imagen del producto */}
                                                <div className="flex-shrink-0 h-12 w-12 mr-3">
                                                    {productInfo.image ? (
                                                        <img
                                                            src={productInfo.image}
                                                            alt="Producto"
                                                            className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'flex';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className={`h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 ${productInfo.image ? 'hidden' : ''}`}>
                                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                        </svg>
                                                    </div>
                                                </div>

                                                {/* Información del producto */}
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                        {productInfo.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                        {review.products?.[0]?.itemType === 'custom' ? 'Personalizado' : 'Producto'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {renderStars(review.rating)}
                                                <span className="ml-2 text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                    {review.rating}/5
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                <p className="line-clamp-3">{review.message}</p>
                                                {/* Mostrar respuesta si existe */}
                                                {review.response && (
                                                    <div className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-300">
                                                        <p className="text-xs text-blue-700 font-medium">Respuesta:</p>
                                                        <p className="text-xs text-blue-600">{review.response}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(review.status || 'pending', isReplied)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            {formatDate(review.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                {/* Botón de responder */}
                                                <button
                                                    onClick={() => handleReplyClick(review)}
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
                                                    onClick={() => handleDeleteClick(review)}
                                                    className="text-red-600 hover:text-red-800 transition-colors p-2 rounded-full hover:bg-red-100"
                                                    title="Eliminar reseña"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Vista Mobile */}
            <div className="lg:hidden">
                <div className="space-y-4">
                    {reviews.map((review) => {
                        const productInfo = getProductInfo(review);
                        const clientInfo = getClientInfo(review);
                        const isReplied = isReviewReplied(review);

                        return (
                            <div key={review._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                {/* Header con cliente y producto */}
                                <div className="flex items-center mb-3">
                                    {/* Avatar del cliente */}
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
                                        <div className={`h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center ${clientInfo.profilePicture ? 'hidden' : ''}`}>
                                            <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                {clientInfo.name.charAt(0)?.toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Información del cliente */}
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-900 flex items-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            {clientInfo.name}
                                            {isReplied && (
                                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                    ✓
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            {formatDate(review.createdAt)}
                                        </div>
                                    </div>

                                    {/* Estado */}
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
                                            {review.products?.[0]?.itemType === 'custom' ? 'Personalizado' : 'Producto'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center mb-3">
                                    {renderStars(review.rating)}
                                    <span className="ml-2 text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {review.rating}/5
                                    </span>
                                </div>

                                <div className="mb-3">
                                    <p className="text-sm text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {review.message}
                                    </p>
                                    {review.response && (
                                        <div className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-300">
                                            <p className="text-xs text-blue-700 font-medium">Respuesta:</p>
                                            <p className="text-xs text-blue-600">{review.response}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                                    <button
                                        onClick={() => handleReplyClick(review)}
                                        className={`transition-colors p-2 rounded-full ${isReplied
                                            ? 'text-blue-800 hover:text-blue-900 hover:bg-blue-200'
                                            : 'text-blue-600 hover:text-blue-800 hover:bg-blue-100'
                                            }`}
                                        title={isReplied ? 'Editar respuesta' : 'Responder'}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleModerateClick(review._id, 'approve')}
                                        className="text-green-600 hover:text-green-800 transition-colors p-2 rounded-full hover:bg-green-100"
                                        title="scxls"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleModerateClick(review._id, 'reject')}
                                        className="text-orange-600 hover:text-orange-800 transition-colors p-2 rounded-full hover:bg-orange-100"
                                        title="Rechazar"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(review)}
                                        className="text-red-600 hover:text-red-800 transition-colors p-2 rounded-full hover:bg-red-100"
                                        title="Eliminar reseña"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal de respuesta */}
            <ReviewReplyModal
                isOpen={replyModalOpen}
                onClose={() => {
                    setReplyModalOpen(false);
                    setSelectedReview(null);
                }}
                review={selectedReview}
                onSubmit={handleReplySubmit}
            />

            {/* Modal de confirmación de eliminación */}
            {deleteConfirmModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
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
                            <p className="text-sm text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                ¿Estás seguro de que quieres eliminar esta reseña? Esta acción no se puede deshacer.
                            </p>
                            {reviewToDelete && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-600 font-medium">Reseña:</p>
                                    <p className="text-sm text-gray-800 mt-1">{reviewToDelete.message}</p>
                                    <div className="flex items-center mt-2">
                                        {renderStars(reviewToDelete.rating)}
                                        <span className="ml-2 text-xs text-gray-600">
                                            {reviewToDelete.rating}/5
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setDeleteConfirmModal(false);
                                    setReviewToDelete(null);
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ReviewsTable;
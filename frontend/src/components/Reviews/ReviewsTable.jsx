import React, { useState } from 'react';
import ReviewReplyModal from './ReviewReplyModal';

const ReviewsTable = ({ reviews, onReply, onModerate }) => {
    const [replyModalOpen, setReplyModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);

    const handleReplyClick = (review) => {
        setSelectedReview(review);
        setReplyModalOpen(true);
    };

    const handleReplySubmit = (reply) => {
        if (selectedReview) {
            onReply(selectedReview._id, reply);
            setReplyModalOpen(false);
            setSelectedReview(null);
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

    const getStatusBadge = (status) => {
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
                            {reviews.map((review) => (
                                <tr key={review._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                        {review.customerName?.charAt(0)?.toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                    {review.customerName || 'Usuario Anónimo'}
                                                </div>
                                                <div className="text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                    {review.productName}
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
                                        <div className="text-sm text-gray-900 max-w-xs truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            {review.comment}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(review.status || 'pending')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {formatDate(review.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleReplyClick(review)}
                                                className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-full hover:bg-blue-100"
                                                title="Responder"
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => onModerate(review._id, 'approve')}
                                                className="text-green-600 hover:text-green-800 transition-colors p-2 rounded-full hover:bg-green-100"
                                                title="Aprobar"
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => onModerate(review._id, 'reject')}
                                                className="text-red-600 hover:text-red-800 transition-colors p-2 rounded-full hover:bg-red-100"
                                                title="Rechazar"
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
        </>
    );
};

export default ReviewsTable;
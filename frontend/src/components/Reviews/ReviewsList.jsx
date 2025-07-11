import React from 'react';
import ReviewCard from './ReviewCard';
import { useReviewActions } from './Hooks/useReviewActions';

// Componente para mostrar la lista de reseñas
// Permite a los usuarios ver, responder, moderar o eliminar reseñas
const ReviewsList = ({ reviews, onReply, onModerate, onDelete, onReviewUpdate }) => {
    const {
        // Estados del modal
        expandedReviews,
        
        // Handlers de acciones
        toggleExpandReview
    } = useReviewActions({ onReply, onModerate, onDelete, onReviewUpdate });

    if (reviews.length === 0) {
        return (
            <div className="lg:hidden">
                <div className="p-4 sm:p-8 text-center">
                    <div className="text-gray-400 mb-4">
                        <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        No se encontraron reseñas
                    </h3>
                    <p className="text-gray-500 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Las reseñas aparecerán aquí cuando coincidan con tus filtros de búsqueda
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="lg:hidden">
            {/* Container con padding responsivo */}
            <div className="px-2 sm:px-4">
                {/* Grid responsivo para las tarjetas */}
                <div className="space-y-3 sm:space-y-4">
                    {reviews.map((review) => (
                        <ReviewCard
                            key={review._id}
                            review={review}
                            onReply={onReply}
                            onModerate={onModerate}
                            onDelete={onDelete}
                            expandedReviews={expandedReviews}
                            onToggleExpand={toggleExpandReview}
                        />
                    ))}
                </div>
            </div>

            {/* Información adicional en la parte inferior */}
            {reviews.length > 0 && (
                <div className="mt-4 sm:mt-6 px-4 py-3 bg-gray-50 border-t border-gray-200">
                    <div className="text-center">
                        <p className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {reviews.length} reseña{reviews.length !== 1 ? 's' : ''} mostrada{reviews.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewsList;
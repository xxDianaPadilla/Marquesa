import React from 'react';
import ReviewCard from './ReviewCard';
import { useReviewActions } from './Hooks/useReviewActions';

/**
 * Componente ReviewsList - Lista de reseñas para dispositivos móviles y tablet
 * 
 * Renderiza las reseñas en formato de lista usando el componente ReviewCard.
 * Optimizado para pantallas pequeñas y medianas. Incluye manejo de estado vacío
 * y utiliza el hook useReviewActions para gestionar las interacciones.
 * 
 * @param {Object} props - Props del componente
 * @param {Array} props.reviews - Array de reseñas a mostrar
 * @param {Function} props.onReply - Función callback para responder reseñas
 * @param {Function} props.onModerate - Función callback para moderar reseñas
 * @param {Function} props.onDelete - Función callback para eliminar reseñas
 * @param {Function} props.onReviewUpdate - Función callback para actualizar reseñas
 */
const ReviewsList = ({ reviews, onReply, onModerate, onDelete, onReviewUpdate }) => {
    
    /**
     * Hook para manejar las acciones de reseñas
     * Solo necesitamos la funcionalidad de expandir/contraer para la lista
     */
    const {
        // Estado para controlar qué reseñas están expandidas
        expandedReviews,
        
        // Función para alternar el estado expandido de una reseña
        toggleExpandReview
    } = useReviewActions({ onReply, onModerate, onDelete, onReviewUpdate });


    /**
     * Renderizado principal - Lista de tarjetas de reseñas
     * Solo visible en dispositivos móviles y tablet (lg:hidden)
     */
    return (
        <div className="lg:hidden">
            {/* Container principal con padding responsivo */}
            <div className="px-2 sm:px-4">
                {/* Grid de tarjetas con espacio responsivo */}
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

            {/* Footer con información adicional */}
            {reviews.length > 0 && (
                <div className="mt-4 sm:mt-6 px-4 py-3 bg-gray-50 border-t border-gray-200">
                    <div className="text-center">
                        {/* Contador de reseñas mostradas */}
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
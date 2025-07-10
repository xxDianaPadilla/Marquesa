import React from 'react';
import ReviewsTable from './ReviewsTable';
import ReviewsList from './ReviewsList';
import LoadingState from '../LoadingState';

const ReviewsContent = ({ 
    reviews, 
    loading, 
    error,
    totalItems,
    onReply, 
    onModerate 
}) => {
    if (loading) {
        return <LoadingState message="Cargando reseñas..." />;
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="text-red-500 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-red-600 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Error al cargar las reseñas: {error}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Vista Desktop - Tabla */}
            <ReviewsTable 
                reviews={reviews}
                onReply={onReply}
                onModerate={onModerate}
            />

            {/* Vista Mobile y Tablet - Lista */}
            <ReviewsList 
                reviews={reviews}
                onReply={onReply}
                onModerate={onModerate}
            />

            {/* Footer con información */}
            {reviews.length > 0 && (
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                    <div className="text-center text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Mostrando {reviews.length} de {totalItems} reseñas
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewsContent;
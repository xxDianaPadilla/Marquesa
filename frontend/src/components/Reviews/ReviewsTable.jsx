import React from 'react';
import ReviewRow from './ReviewRow';
import ReviewCard from './ReviewCard';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ReviewReplyModal from './ReviewReplyModal';
import { useReviewActions } from './Hooks/useReviewActions';

/**
 * Componente ReviewsTable - Tabla de reseñas para vista desktop
 * 
 * Componente principal que maneja la visualización de reseñas en formato tabla
 * para pantallas grandes y formato de tarjetas para pantallas medianas.
 * Integra todos los modales necesarios y gestiona las acciones de usuario.
 * 
 * @param {Object} props - Props del componente
 * @param {Array} props.reviews - Array de reseñas a mostrar
 * @param {Function} props.onReply - Función callback para responder reseñas
 * @param {Function} props.onModerate - Función callback para moderar reseñas
 * @param {Function} props.onDelete - Función callback para eliminar reseñas
 * @param {Function} props.onReviewUpdate - Función callback para actualizar reseñas
 */
const ReviewsTable = ({ reviews, onReply, onModerate, onDelete, onReviewUpdate }) => {
    
    /**
     * Hook para manejar todas las acciones de reseñas
     * Centraliza la lógica de modales y estados de interacción
     */
    const {
        // Estados de los modales
        replyModalOpen,        // Estado del modal de respuesta
        selectedReview,        // Reseña seleccionada para responder
        deleteConfirmModal,    // Estado del modal de confirmación de eliminación
        reviewToDelete,        // Reseña seleccionada para eliminar
        expandedReviews,       // Set de reseñas con texto expandido

        // Handlers de acciones
        handleReplyClick,      // Maneja clic en botón responder
        handleReplySubmit,     // Maneja envío de respuesta
        handleReplyCancel,     // Maneja cancelación de respuesta
        handleDeleteClick,     // Maneja clic en botón eliminar
        handleDeleteConfirm,   // Maneja confirmación de eliminación
        handleDeleteCancel,    // Maneja cancelación de eliminación
        toggleExpandReview     // Maneja expansión/contracción de texto
    } = useReviewActions({ onReply, onModerate, onDelete, onReviewUpdate });

    /**
     * Estado vacío - Cuando no hay reseñas que mostrar
     * Renderiza un mensaje amigable indicando que no hay reseñas
     */
    if (reviews.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 sm:p-8 text-center">
                    {/* Ícono de estado vacío */}
                    <div className="text-gray-400 mb-4">
                        <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    {/* Título del estado vacío */}
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        No se encontraron reseñas
                    </h3>
                    {/* Descripción del estado vacío */}
                    <p className="text-gray-500 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Las reseñas aparecerán aquí cuando coincidan con tus filtros de búsqueda
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Vista Desktop - Tabla completa */}
            <div className="hidden lg:block">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        
                        {/* Encabezado de la tabla */}
                        <thead className="bg-gray-50">
                            <tr>
                                {/* Columna Cliente */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Cliente
                                </th>
                                {/* Columna Producto */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Producto
                                </th>
                                {/* Columna Calificación */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Calificación
                                </th>
                                {/* Columna Comentario */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Comentario
                                </th>
                                {/* Columna Estado */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Estado
                                </th>
                                {/* Columna Fecha */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Fecha
                                </th>
                                {/* Columna Acciones */}
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        
                        {/* Cuerpo de la tabla */}
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reviews.map((review) => (
                                <ReviewRow
                                    key={review._id}
                                    review={review}
                                    onReply={handleReplyClick}
                                    onModerate={onModerate}
                                    onDelete={handleDeleteClick}
                                    expandedReviews={expandedReviews}
                                    onToggleExpand={toggleExpandReview}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Vista Mobile y Tablet - Lista de tarjetas */}
            <div className="lg:hidden">
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <ReviewCard
                            key={review._id}
                            review={review}
                            onReply={handleReplyClick}
                            onModerate={onModerate}
                            onDelete={handleDeleteClick}
                            expandedReviews={expandedReviews}
                            onToggleExpand={toggleExpandReview}
                        />
                    ))}
                </div>
            </div>

            {/* Modal de respuesta a reseña */}
            <ReviewReplyModal
                isOpen={replyModalOpen}
                onClose={handleReplyCancel}
                review={selectedReview}
                onSubmit={handleReplySubmit}
            />

            {/* Modal de confirmación de eliminación */}
            <DeleteConfirmationModal
                isOpen={deleteConfirmModal}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                reviewToDelete={reviewToDelete}
            />
        </>
    );
};

export default ReviewsTable;
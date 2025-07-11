import React from 'react';
import ReviewRow from './ReviewRow';
import ReviewCard from './ReviewCard';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ReviewReplyModal from './ReviewReplyModal';
import { useReviewActions } from './Hooks/useReviewActions';

const ReviewsTable = ({ reviews, onReply, onModerate, onDelete, onReviewUpdate }) => {
    const {
        // Estados del modal
        replyModalOpen,
        selectedReview,
        deleteConfirmModal,
        reviewToDelete,
        expandedReviews,

        // Handlers de acciones
        handleReplyClick,
        handleReplySubmit,
        handleReplyCancel,
        handleDeleteClick,
        handleDeleteConfirm,
        handleDeleteCancel,
        handleModerateClick,
        toggleExpandReview
    } = useReviewActions({ onReply, onModerate, onDelete, onReviewUpdate });

    return (
        <>
            {/* Vista Desktop - Tabla */}
            <div className="hidden lg:block">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Cliente
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Producto
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
                                <ReviewRow
                                    key={review._id}
                                    review={review}
                                    onReply={handleReplyClick}
                                    onModerate={handleModerateClick}
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
                            onModerate={handleModerateClick}
                            onDelete={handleDeleteClick}
                            expandedReviews={expandedReviews}
                            onToggleExpand={toggleExpandReview}
                        />
                    ))}
                </div>
            </div>

            {/* Modal de respuesta */}
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
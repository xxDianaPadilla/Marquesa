import { useState } from 'react';

// Hook para manejar acciones de reseñas
// Permite responder, moderar, eliminar reseñas y manejar estados de modales
export const useReviewActions = ({ onReply, onModerate, onDelete, onReviewUpdate }) => {
    const [replyModalOpen, setReplyModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const [expandedReviews, setExpandedReviews] = useState(new Set());

    // Función para manejar clics en responder
    const handleReplyClick = (review) => {
        console.log('=== REPLY CLICK ===');
        console.log('Review:', review);
        setSelectedReview(review);
        setReplyModalOpen(true);
    };

    // Función para enviar respuesta
    const handleReplySubmit = async (reply) => {
        if (!selectedReview) {
            console.error('No review selected');
            return;
        }

        try {
            console.log('=== SUBMITTING REPLY ===');
            console.log('Review ID:', selectedReview._id);
            console.log('Reply:', reply);

            await onReply(selectedReview._id, reply);

            // Actualizar estado local si se proporciona la función
            if (onReviewUpdate) {
                onReviewUpdate(selectedReview._id, {
                    response: reply,
                    status: 'replied',
                    responseDate: new Date().toISOString()
                });
            }

            // Cerrar modal
            setReplyModalOpen(false);
            setSelectedReview(null);

            console.log('Reply submitted successfully');

        } catch (error) {
            console.error('Error al enviar respuesta:', error);
            alert('Error al enviar la respuesta: ' + error.message);
        }
    };

    // Función para manejar clics en eliminar
    const handleDeleteClick = (review) => {
        console.log('=== DELETE CLICK ===');
        console.log('Review:', review);
        setReviewToDelete(review);
        setDeleteConfirmModal(true);
    };

    // Función para confirmar eliminación
    const handleDeleteConfirm = async () => {
        if (!reviewToDelete) {
            console.error('No review to delete');
            return;
        }

        try {
            console.log('=== CONFIRMING DELETE ===');
            console.log('Review ID:', reviewToDelete._id);

            await onDelete(reviewToDelete._id);
            
            // Cerrar modal
            setDeleteConfirmModal(false);
            setReviewToDelete(null);

            console.log('Review deleted successfully');

        } catch (error) {
            console.error('Error al eliminar reseña:', error);
            alert('Error al eliminar la reseña: ' + error.message);
        }
    };

    // Función para cerrar modal de eliminación
    const handleDeleteCancel = () => {
        setDeleteConfirmModal(false);
        setReviewToDelete(null);
    };

    // Función para cerrar modal de respuesta
    const handleReplyCancel = () => {
        setReplyModalOpen(false);
        setSelectedReview(null);
    };

    // Función para expandir/contraer reseñas
    const toggleExpandReview = (reviewId) => {
        setExpandedReviews(prev => {
            const newSet = new Set(prev);
            if (newSet.has(reviewId)) {
                newSet.delete(reviewId);
            } else {
                newSet.add(reviewId);
            }
            return newSet;
        });
    };

    return {
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
        toggleExpandReview
    };
};
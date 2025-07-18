import { useState } from 'react';

/**
 * Hook personalizado para manejar acciones de reseñas
 * 
 * Gestiona todos los estados y funciones relacionadas con las acciones que se pueden
 * realizar sobre las reseñas: responder, moderar, eliminar y expandir/contraer.
 * Centraliza la lógica de manejo de modales y estado de la UI.
 * 
 * @param {Object} params - Parámetros del hook
 * @param {Function} params.onReply - Función callback para responder a una reseña
 * @param {Function} params.onModerate - Función callback para moderar una reseña
 * @param {Function} params.onDelete - Función callback para eliminar una reseña
 * @param {Function} params.onReviewUpdate - Función callback para actualizar una reseña
 * 
 * @returns {Object} Objeto con estados y handlers para manejar acciones de reseñas
 */
export const useReviewActions = ({ onReply, onModerate, onDelete, onReviewUpdate }) => {
    // Estados para manejar el modal de respuesta
    const [replyModalOpen, setReplyModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    
    // Estados para manejar el modal de confirmación de eliminación
    const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    
    // Estado para manejar qué reseñas están expandidas (para texto largo)
    const [expandedReviews, setExpandedReviews] = useState(new Set());

    /**
     * Maneja el clic en el botón "Responder"
     * Abre el modal de respuesta y establece la reseña seleccionada
     * 
     * @param {Object} review - Objeto de la reseña a responder
     */
    const handleReplyClick = (review) => {
        console.log('=== REPLY CLICK ===');
        console.log('Review:', review);
        setSelectedReview(review);
        setReplyModalOpen(true);
    };

    /**
     * Maneja el envío de una respuesta a una reseña
     * Procesa la respuesta, actualiza el estado local y cierra el modal
     * 
     * @param {string} reply - Texto de la respuesta
     */
    const handleReplySubmit = async (reply) => {
        if (!selectedReview) {
            console.error('No review selected');
            return;
        }

        try {
            console.log('=== SUBMITTING REPLY ===');
            console.log('Review ID:', selectedReview._id);
            console.log('Reply:', reply);

            // Llamar a la función de respuesta del componente padre
            await onReply(selectedReview._id, reply);

            // Actualizar estado local si se proporciona la función
            if (onReviewUpdate) {
                onReviewUpdate(selectedReview._id, {
                    response: reply,
                    status: 'replied',
                    responseDate: new Date().toISOString()
                });
            }

            // Cerrar modal y limpiar estado
            setReplyModalOpen(false);
            setSelectedReview(null);

            console.log('Reply submitted successfully');

        } catch (error) {
            console.error('Error al enviar respuesta:', error);
            alert('Error al enviar la respuesta: ' + error.message);
        }
    };

    /**
     * Maneja el clic en el botón "Eliminar"
     * Abre el modal de confirmación de eliminación
     * 
     * @param {Object} review - Objeto de la reseña a eliminar
     */
    const handleDeleteClick = (review) => {
        console.log('=== DELETE CLICK ===');
        console.log('Review:', review);
        setReviewToDelete(review);
        setDeleteConfirmModal(true);
    };

    /**
     * Maneja la confirmación de eliminación de una reseña
     * Ejecuta la eliminación y cierra el modal
     */
    const handleDeleteConfirm = async () => {
        if (!reviewToDelete) {
            console.error('No review to delete');
            return;
        }

        try {
            console.log('=== CONFIRMING DELETE ===');
            console.log('Review ID:', reviewToDelete._id);

            // Llamar a la función de eliminación del componente padre
            await onDelete(reviewToDelete._id);
            
            // Cerrar modal y limpiar estado
            setDeleteConfirmModal(false);
            setReviewToDelete(null);

            console.log('Review deleted successfully');

        } catch (error) {
            console.error('Error al eliminar reseña:', error);
            alert('Error al eliminar la reseña: ' + error.message);
        }
    };

    /**
     * Maneja la cancelación del modal de eliminación
     * Cierra el modal sin eliminar nada
     */
    const handleDeleteCancel = () => {
        setDeleteConfirmModal(false);
        setReviewToDelete(null);
    };

    /**
     * Maneja la cancelación del modal de respuesta
     * Cierra el modal sin enviar respuesta
     */
    const handleReplyCancel = () => {
        setReplyModalOpen(false);
        setSelectedReview(null);
    };

    /**
     * Alterna el estado expandido/contraído de una reseña
     * Utilizado para mostrar texto completo o truncado en reseñas largas
     * 
     * @param {string} reviewId - ID de la reseña a expandir/contraer
     */
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

    // Retornar todos los estados y handlers para uso en componentes
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
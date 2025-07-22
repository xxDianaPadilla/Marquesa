import { useState } from 'react';
import { useReviewValidation } from './useReviewValidation';

/**
 * Hook personalizado para manejar acciones de reseñas con validaciones integradas
 * 
 * Gestiona todos los estados y funciones relacionadas con las acciones que se pueden
 * realizar sobre las reseñas: responder, moderar, eliminar y expandir/contraer.
 * Centraliza la lógica de manejo de modales, estado de la UI y validaciones.
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

    // Hook de validaciones
    const {
        validateReplySubmission,
        validateModerationSubmission,
        validateDeleteSubmission,
        clearValidationErrors,
        hasValidationErrors
    } = useReviewValidation();

    /**
     * Maneja el clic en el botón "Responder" con validación previa
     * Valida el ID de la reseña antes de abrir el modal
     * 
     * @param {Object} review - Objeto de la reseña a responder
     */
    const handleReplyClick = (review) => {
        console.log('=== REPLY CLICK ===');
        console.log('Review:', review);

        // Validar que la reseña tenga un ID válido
        if (!review || !review._id) {
            console.error('Reseña inválida o sin ID');
            alert('Error: No se puede responder a esta reseña. ID inválido.');
            return;
        }

        // Limpiar errores de validación anteriores
        clearValidationErrors();

        // Establecer la reseña seleccionada y abrir modal
        setSelectedReview(review);
        setReplyModalOpen(true);
    };

    /**
     * Maneja el envío de una respuesta a una reseña con validaciones completas
     * Procesa la respuesta, actualiza el estado local y cierra el modal
     * 
     * @param {string} reply - Texto de la respuesta
     */
    const handleReplySubmit = async (reply) => {
        if (!selectedReview) {
            console.error('No review selected');
            alert('Error: No hay reseña seleccionada');
            return;
        }

        console.log('=== SUBMITTING REPLY ===');
        console.log('Review ID:', selectedReview._id);
        console.log('Reply:', reply);

        try {
            // Validar la operación de respuesta completa
            const validation = validateReplySubmission(selectedReview._id, reply);
            
            if (!validation.isValid) {
                console.error('Validación falló:', validation.error);
                alert('Error de validación: ' + validation.error);
                return;
            }

            // Verificar que existe la función callback
            if (!onReply || typeof onReply !== 'function') {
                console.error('onReply function is not available');
                alert('Error: Función de respuesta no disponible');
                return;
            }

            // Llamar a la función de respuesta del componente padre
            await onReply(selectedReview._id, reply);

            // Actualizar estado local si se proporciona la función
            if (onReviewUpdate && typeof onReviewUpdate === 'function') {
                onReviewUpdate(selectedReview._id, {
                    response: reply,
                    status: 'replied',
                    responseDate: new Date().toISOString()
                });
            }

            // Cerrar modal y limpiar estado
            setReplyModalOpen(false);
            setSelectedReview(null);
            clearValidationErrors();

            console.log('Reply submitted successfully');

        } catch (error) {
            console.error('Error al enviar respuesta:', error);
            
            // Mostrar error específico al usuario
            const errorMessage = error.message || 'Error desconocido al enviar la respuesta';
            alert('Error al enviar la respuesta: ' + errorMessage);
        }
    };

    /**
     * Maneja el clic en el botón "Eliminar" con validación previa
     * Valida el ID de la reseña antes de abrir el modal de confirmación
     * 
     * @param {Object} review - Objeto de la reseña a eliminar
     */
    const handleDeleteClick = (review) => {
        console.log('=== DELETE CLICK ===');
        console.log('Review:', review);

        // Validar que la reseña tenga un ID válido
        if (!review || !review._id) {
            console.error('Reseña inválida o sin ID');
            alert('Error: No se puede eliminar esta reseña. ID inválido.');
            return;
        }

        // Limpiar errores de validación anteriores
        clearValidationErrors();

        // Establecer la reseña a eliminar y abrir modal de confirmación
        setReviewToDelete(review);
        setDeleteConfirmModal(true);
    };

    /**
     * Maneja la confirmación de eliminación de una reseña con validaciones
     * Ejecuta la eliminación después de validar todos los requisitos
     */
    const handleDeleteConfirm = async () => {
        if (!reviewToDelete) {
            console.error('No review to delete');
            alert('Error: No hay reseña para eliminar');
            return;
        }

        console.log('=== CONFIRMING DELETE ===');
        console.log('Review ID:', reviewToDelete._id);

        try {
            // Validar la operación de eliminación (la confirmación se valida en el modal)
            const validation = validateDeleteSubmission(reviewToDelete._id, true);
            
            if (!validation.isValid) {
                console.error('Validación de eliminación falló:', validation.error);
                alert('Error de validación: ' + validation.error);
                return;
            }

            // Verificar que existe la función callback
            if (!onDelete || typeof onDelete !== 'function') {
                console.error('onDelete function is not available');
                alert('Error: Función de eliminación no disponible');
                return;
            }

            // Llamar a la función de eliminación del componente padre
            await onDelete(reviewToDelete._id);
            
            // Cerrar modal y limpiar estado
            setDeleteConfirmModal(false);
            setReviewToDelete(null);
            clearValidationErrors();

            console.log('Review deleted successfully');

        } catch (error) {
            console.error('Error al eliminar reseña:', error);
            
            // Mostrar error específico al usuario
            const errorMessage = error.message || 'Error desconocido al eliminar la reseña';
            alert('Error al eliminar la reseña: ' + errorMessage);
        }
    };

    /**
     * Maneja la cancelación del modal de eliminación
     * Cierra el modal sin eliminar nada y limpia errores
     */
    const handleDeleteCancel = () => {
        setDeleteConfirmModal(false);
        setReviewToDelete(null);
        clearValidationErrors();
    };

    /**
     * Maneja la cancelación del modal de respuesta
     * Cierra el modal sin enviar respuesta y limpia errores
     */
    const handleReplyCancel = () => {
        setReplyModalOpen(false);
        setSelectedReview(null);
        clearValidationErrors();
    };

    /**
     * Maneja acciones de moderación con validaciones
     * Valida antes de ejecutar la acción de moderación
     * 
     * @param {Object} review - Reseña a moderar
     * @param {string} action - Acción a realizar ('approve' o 'reject')
     */
    const handleModerateAction = async (review, action) => {
        console.log('=== MODERATE ACTION ===');
        console.log('Review ID:', review?._id);
        console.log('Action:', action);

        try {
            // Validar la operación de moderación
            const validation = validateModerationSubmission(review?._id, action);
            
            if (!validation.isValid) {
                console.error('Validación de moderación falló:', validation.error);
                alert('Error de validación: ' + validation.error);
                return;
            }

            // Verificar que existe la función callback
            if (!onModerate || typeof onModerate !== 'function') {
                console.error('onModerate function is not available');
                alert('Error: Función de moderación no disponible');
                return;
            }

            // Llamar a la función de moderación del componente padre
            await onModerate(review._id, action);

            // Actualizar estado local si se proporciona la función
            if (onReviewUpdate && typeof onReviewUpdate === 'function') {
                const newStatus = action === 'approve' ? 'approved' : 'rejected';
                onReviewUpdate(review._id, {
                    status: newStatus,
                    moderatedDate: new Date().toISOString()
                });
            }

            console.log('Review moderated successfully');

        } catch (error) {
            console.error('Error al moderar reseña:', error);
            
            // Mostrar error específico al usuario
            const errorMessage = error.message || 'Error desconocido al moderar la reseña';
            alert('Error al moderar la reseña: ' + errorMessage);
        }
    };

    /**
     * Alterna el estado expandido/contraído de una reseña
     * Utilizado para mostrar texto completo o truncado en reseñas largas
     * 
     * @param {string} reviewId - ID de la reseña a expandir/contraer
     */
    const toggleExpandReview = (reviewId) => {
        // Validar que el ID sea válido antes de proceder
        if (!reviewId || typeof reviewId !== 'string') {
            console.warn('ID de reseña inválido para expandir/contraer');
            return;
        }

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

    /**
     * Función utilitaria para verificar si hay errores de validación activos
     * Útil para deshabilitar acciones cuando hay errores
     * 
     * @returns {boolean} True si hay errores de validación
     */
    const hasActiveValidationErrors = () => {
        return hasValidationErrors();
    };

    /**
     * Función para limpiar todos los estados y errores
     * Útil para resetear el hook a su estado inicial
     */
    const resetHookState = () => {
        setReplyModalOpen(false);
        setSelectedReview(null);
        setDeleteConfirmModal(false);
        setReviewToDelete(null);
        setExpandedReviews(new Set());
        clearValidationErrors();
    };

    // Retornar todos los estados y handlers para uso en componentes
    return {
        // Estados del modal
        replyModalOpen,
        selectedReview,
        deleteConfirmModal,
        reviewToDelete,
        expandedReviews,

        // Handlers de acciones principales
        handleReplyClick,
        handleReplySubmit,
        handleReplyCancel,
        handleDeleteClick,
        handleDeleteConfirm,
        handleDeleteCancel,
        handleModerateAction,
        toggleExpandReview,

        // Funciones utilitarias
        hasActiveValidationErrors,
        resetHookState,
        clearValidationErrors
    };
};
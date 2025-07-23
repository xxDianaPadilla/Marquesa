import { useState } from 'react';

/**
 * Hook personalizado para manejar acciones de reseñas con validación de ID mejorada
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

    /**
     * Valida el ID de una reseña de forma más robusta
     * 
     * @param {*} reviewId - ID a validar
     * @returns {Object} Resultado de validación
     */
    const validateReviewId = (reviewId) => {
        console.log('=== VALIDATING REVIEW ID ===');
        console.log('Review ID:', reviewId);
        console.log('Type:', typeof reviewId);

        if (!reviewId) {
            return { isValid: false, error: 'ID de reseña requerido' };
        }

        // Convertir a string si no lo es
        const idString = String(reviewId).trim();
        
        if (idString.length === 0) {
            return { isValid: false, error: 'ID de reseña vacío' };
        }

        // Validar formato de ObjectId de MongoDB (24 caracteres hexadecimales)
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(idString)) {
            console.log('ID format validation failed for:', idString);
            return { 
                isValid: false, 
                error: `ID de reseña con formato inválido: ${idString.substring(0, 10)}...` 
            };
        }

        console.log('ID validation passed:', idString);
        return { isValid: true, error: null };
    };

    /**
     * Valida un objeto de reseña completo
     * 
     * @param {Object} review - Objeto de reseña a validar
     * @returns {Object} Resultado de validación
     */
    const validateReviewObject = (review) => {
        console.log('=== VALIDATING REVIEW OBJECT ===');
        console.log('Review:', review);

        if (!review || typeof review !== 'object') {
            return { isValid: false, error: 'Objeto de reseña inválido' };
        }

        // Validar ID
        const idValidation = validateReviewId(review._id);
        if (!idValidation.isValid) {
            return idValidation;
        }

        // Validar que tenga datos básicos
        if (!review.message && !review.rating) {
            return { isValid: false, error: 'La reseña no tiene contenido válido' };
        }

        return { isValid: true, error: null };
    };

    /**
     * Maneja el clic en el botón "Responder" con validación mejorada
     * 
     * @param {Object} review - Objeto de la reseña a responder
     */
    const handleReplyClick = (review) => {
        console.log('=== REPLY CLICK ===');
        console.log('Review:', review);

        // Validar el objeto de reseña
        const validation = validateReviewObject(review);
        if (!validation.isValid) {
            console.error('Validation failed:', validation.error);
            alert('Error: ' + validation.error);
            return;
        }

        // Establecer la reseña seleccionada y abrir modal
        setSelectedReview(review);
        setReplyModalOpen(true);
    };

    /**
     * Maneja el envío de una respuesta a una reseña
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
            // Validar respuesta
            if (!reply || typeof reply !== 'string' || reply.trim().length === 0) {
                alert('Error: La respuesta no puede estar vacía');
                return;
            }

            if (reply.trim().length < 10) {
                alert('Error: La respuesta debe tener al menos 10 caracteres');
                return;
            }

            // Validar función callback
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

            console.log('Reply submitted successfully');

        } catch (error) {
            console.error('Error al enviar respuesta:', error);
            
            // Mostrar error específico al usuario
            let errorMessage = 'Error desconocido al enviar la respuesta';
            
            if (error.message) {
                errorMessage = error.message;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            
            alert('Error al enviar la respuesta: ' + errorMessage);
        }
    };

    /**
     * Maneja el clic en el botón "Eliminar" con validación mejorada
     * 
     * @param {Object} review - Objeto de la reseña a eliminar
     */
    const handleDeleteClick = (review) => {
        console.log('=== DELETE CLICK ===');
        console.log('Review:', review);

        // Validar el objeto de reseña
        const validation = validateReviewObject(review);
        if (!validation.isValid) {
            console.error('Validation failed:', validation.error);
            alert('Error: ' + validation.error);
            return;
        }

        // Establecer la reseña a eliminar y abrir modal de confirmación
        setReviewToDelete(review);
        setDeleteConfirmModal(true);
    };

    /**
     * Maneja la confirmación de eliminación de una reseña
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
            // Validar función callback
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

            console.log('Review deleted successfully');

        } catch (error) {
            console.error('Error al eliminar reseña:', error);
            
            // Mostrar error específico al usuario
            let errorMessage = 'Error desconocido al eliminar la reseña';
            
            if (error.message) {
                errorMessage = error.message;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            
            alert('Error al eliminar la reseña: ' + errorMessage);
            
            // No cerrar el modal en caso de error para que el usuario pueda reintentar
        }
    };

    /**
     * Maneja la cancelación del modal de eliminación
     */
    const handleDeleteCancel = () => {
        setDeleteConfirmModal(false);
        setReviewToDelete(null);
    };

    /**
     * Maneja la cancelación del modal de respuesta
     */
    const handleReplyCancel = () => {
        setReplyModalOpen(false);
        setSelectedReview(null);
    };

    /**
     * Maneja acciones de moderación
     * 
     * @param {Object} review - Reseña a moderar
     * @param {string} action - Acción a realizar ('approve' o 'reject')
     */
    const handleModerateAction = async (review, action) => {
        console.log('=== MODERATE ACTION ===');
        console.log('Review ID:', review?._id);
        console.log('Action:', action);

        try {
            // Validar el objeto de reseña
            const reviewValidation = validateReviewObject(review);
            if (!reviewValidation.isValid) {
                console.error('Review validation failed:', reviewValidation.error);
                alert('Error: ' + reviewValidation.error);
                return;
            }

            // Validar acción
            const validActions = ['approve', 'reject'];
            if (!action || !validActions.includes(action)) {
                alert('Error: Acción de moderación inválida');
                return;
            }

            // Validar función callback
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
            let errorMessage = 'Error desconocido al moderar la reseña';
            
            if (error.message) {
                errorMessage = error.message;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            
            alert('Error al moderar la reseña: ' + errorMessage);
        }
    };

    /**
     * Alterna el estado expandido/contraído de una reseña
     * 
     * @param {string} reviewId - ID de la reseña a expandir/contraer
     */
    const toggleExpandReview = (reviewId) => {
        // Validar que el ID sea válido antes de proceder
        const validation = validateReviewId(reviewId);
        if (!validation.isValid) {
            console.warn('ID de reseña inválido para expandir/contraer:', reviewId);
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
     * Función para limpiar todos los estados
     */
    const resetHookState = () => {
        setReplyModalOpen(false);
        setSelectedReview(null);
        setDeleteConfirmModal(false);
        setReviewToDelete(null);
        setExpandedReviews(new Set());
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
        resetHookState,
        validateReviewId,
        validateReviewObject
    };
};
// frontend/src/components/Reviews/Hooks/useReviewValidation.jsx
import { useState, useCallback, useMemo } from 'react';

/**
 * Hook personalizado para manejar validaciones de reseñas
 * 
 * Gestiona todas las validaciones necesarias para formularios de reseñas,
 * incluyendo respuestas, filtros, búsquedas y moderación. Proporciona
 * validaciones en tiempo real y antes de ejecutar acciones.
 * 
 * @returns {Object} Objeto con funciones de validación y estado de errores
 */
export const useReviewValidation = () => {
    // Estado para almacenar errores de validación
    const [validationErrors, setValidationErrors] = useState({});
    
    // Estado para validaciones en tiempo real
    const [realTimeErrors, setRealTimeErrors] = useState({});

    /**
     * Limpia todos los errores de validación
     * Útil para resetear el estado cuando se cambia de formulario
     */
    const clearValidationErrors = useCallback(() => {
        setValidationErrors({});
        setRealTimeErrors({});
    }, []);

    /**
     * Limpia un error específico por campo
     * Usado cuando el usuario corrige un campo específico
     * 
     * @param {string} fieldName - Nombre del campo a limpiar
     */
    const clearFieldError = useCallback((fieldName) => {
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
        
        setRealTimeErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    }, []);

    /**
     * Establece un error específico para un campo
     * Usado para mostrar errores específicos durante validaciones
     * 
     * @param {string} fieldName - Nombre del campo
     * @param {string} errorMessage - Mensaje de error a mostrar
     * @param {boolean} isRealTime - Si es un error en tiempo real
     */
    const setFieldError = useCallback((fieldName, errorMessage, isRealTime = false) => {
        if (isRealTime) {
            setRealTimeErrors(prev => ({
                ...prev,
                [fieldName]: errorMessage
            }));
        } else {
            setValidationErrors(prev => ({
                ...prev,
                [fieldName]: errorMessage
            }));
        }
    }, []);

    /**
     * Valida el texto de una respuesta a reseña
     * Verifica longitud, contenido y caracteres permitidos
     * 
     * @param {string} replyText - Texto de la respuesta a validar
     * @param {boolean} isRealTime - Si es validación en tiempo real
     * @returns {Object} Resultado de validación con isValid y error
     */
    const validateReplyText = useCallback((replyText, isRealTime = false) => {
        const fieldName = 'replyText';
        
        // Validar que el texto no esté vacío
        if (!replyText || typeof replyText !== 'string') {
            const error = 'La respuesta es requerida';
            setFieldError(fieldName, error, isRealTime);
            return { isValid: false, error };
        }

        // Validar texto trimmed
        const trimmedText = replyText.trim();
        if (trimmedText.length === 0) {
            const error = 'La respuesta no puede estar vacía';
            setFieldError(fieldName, error, isRealTime);
            return { isValid: false, error };
        }

        // Validar longitud mínima
        if (trimmedText.length < 10) {
            const error = 'La respuesta debe tener al menos 10 caracteres';
            setFieldError(fieldName, error, isRealTime);
            return { isValid: false, error };
        }

        // Validar longitud máxima
        if (trimmedText.length > 500) {
            const error = 'La respuesta no puede exceder 500 caracteres';
            setFieldError(fieldName, error, isRealTime);
            return { isValid: false, error };
        }

        // Validar que contenga al menos una palabra
        const wordCount = trimmedText.split(/\s+/).filter(word => word.length > 0).length;
        if (wordCount < 2) {
            const error = 'La respuesta debe contener al menos 2 palabras';
            setFieldError(fieldName, error, isRealTime);
            return { isValid: false, error };
        }

        // Si llegamos aquí, es válido - limpiar errores
        clearFieldError(fieldName);
        return { isValid: true, error: null };
    }, [setFieldError, clearFieldError]);

    /**
     * Valida un ID de reseña
     * Verifica formato y existencia del ID
     * 
     * @param {string} reviewId - ID de la reseña a validar
     * @returns {Object} Resultado de validación con isValid y error
     */
    const validateReviewId = useCallback((reviewId) => {
        const fieldName = 'reviewId';
        
        // Validar que el ID existe
        if (!reviewId || typeof reviewId !== 'string') {
            const error = 'ID de reseña requerido';
            setFieldError(fieldName, error);
            return { isValid: false, error };
        }

        // Validar formato básico de MongoDB ObjectId (24 caracteres hexadecimales)
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(reviewId.trim())) {
            const error = 'Formato de ID de reseña inválido';
            setFieldError(fieldName, error);
            return { isValid: false, error };
        }

        clearFieldError(fieldName);
        return { isValid: true, error: null };
    }, [setFieldError, clearFieldError]);

    /**
     * Valida términos de búsqueda
     * Verifica longitud y caracteres permitidos
     * 
     * @param {string} searchTerm - Término de búsqueda a validar
     * @param {boolean} isRealTime - Si es validación en tiempo real
     * @returns {Object} Resultado de validación con isValid y error
     */
    const validateSearchTerm = useCallback((searchTerm, isRealTime = false) => {
        const fieldName = 'searchTerm';
        
        // Permitir términos vacíos (búsqueda vacía es válida)
        if (!searchTerm || searchTerm.trim().length === 0) {
            clearFieldError(fieldName);
            return { isValid: true, error: null };
        }

        // Validar longitud máxima
        if (searchTerm.length > 100) {
            const error = 'El término de búsqueda no puede exceder 100 caracteres';
            setFieldError(fieldName, error, isRealTime);
            return { isValid: false, error };
        }

        // Validar caracteres permitidos (letras, números, espacios, algunos símbolos)
        const allowedCharsRegex = /^[a-zA-Z0-9\s\-\_\.\@\#ñÑáéíóúÁÉÍÓÚüÜ]+$/;
        if (!allowedCharsRegex.test(searchTerm)) {
            const error = 'El término de búsqueda contiene caracteres no permitidos';
            setFieldError(fieldName, error, isRealTime);
            return { isValid: false, error };
        }

        clearFieldError(fieldName);
        return { isValid: true, error: null };
    }, [setFieldError, clearFieldError]);

    /**
     * Valida filtros de fecha
     * Verifica formato y lógica de fechas desde/hasta
     * 
     * @param {string} dateFrom - Fecha desde (formato YYYY-MM-DD)
     * @param {string} dateTo - Fecha hasta (formato YYYY-MM-DD)
     * @returns {Object} Resultado de validación con isValid y error
     */
    const validateDateFilters = useCallback((dateFrom, dateTo) => {
        const fieldName = 'dateFilters';
        
        // Si ambas fechas están vacías, es válido
        if (!dateFrom && !dateTo) {
            clearFieldError(fieldName);
            return { isValid: true, error: null };
        }

        // Validar formato de fecha "desde"
        if (dateFrom) {
            const dateFromObj = new Date(dateFrom);
            if (isNaN(dateFromObj.getTime())) {
                const error = 'Formato de fecha "desde" inválido';
                setFieldError(fieldName, error);
                return { isValid: false, error };
            }

            // Validar que no sea una fecha futura
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            if (dateFromObj > today) {
                const error = 'La fecha "desde" no puede ser futura';
                setFieldError(fieldName, error);
                return { isValid: false, error };
            }
        }

        // Validar formato de fecha "hasta"
        if (dateTo) {
            const dateToObj = new Date(dateTo);
            if (isNaN(dateToObj.getTime())) {
                const error = 'Formato de fecha "hasta" inválido';
                setFieldError(fieldName, error);
                return { isValid: false, error };
            }

            // Validar que no sea una fecha futura
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            if (dateToObj > today) {
                const error = 'La fecha "hasta" no puede ser futura';
                setFieldError(fieldName, error);
                return { isValid: false, error };
            }
        }

        // Validar lógica entre fechas
        if (dateFrom && dateTo) {
            const dateFromObj = new Date(dateFrom);
            const dateToObj = new Date(dateTo);
            
            if (dateFromObj > dateToObj) {
                const error = 'La fecha "desde" no puede ser posterior a la fecha "hasta"';
                setFieldError(fieldName, error);
                return { isValid: false, error };
            }

            // Validar que el rango no sea mayor a 1 año
            const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
            if (dateToObj.getTime() - dateFromObj.getTime() > oneYearInMs) {
                const error = 'El rango de fechas no puede ser mayor a 1 año';
                setFieldError(fieldName, error);
                return { isValid: false, error };
            }
        }

        clearFieldError(fieldName);
        return { isValid: true, error: null };
    }, [setFieldError, clearFieldError]);

    /**
     * Valida filtros de calificación
     * Verifica que la calificación esté en el rango válido
     * 
     * @param {string|number} rating - Calificación a validar
     * @returns {Object} Resultado de validación con isValid y error
     */
    const validateRatingFilter = useCallback((rating) => {
        const fieldName = 'ratingFilter';
        
        // Permitir "todos" como valor válido
        if (!rating || rating === 'todos') {
            clearFieldError(fieldName);
            return { isValid: true, error: null };
        }

        // Convertir a número si es string
        const ratingNum = typeof rating === 'string' ? parseInt(rating, 10) : rating;

        // Validar que sea un número válido
        if (isNaN(ratingNum)) {
            const error = 'La calificación debe ser un número válido';
            setFieldError(fieldName, error);
            return { isValid: false, error };
        }

        // Validar rango (1-5 estrellas)
        if (ratingNum < 1 || ratingNum > 5) {
            const error = 'La calificación debe estar entre 1 y 5 estrellas';
            setFieldError(fieldName, error);
            return { isValid: false, error };
        }

        clearFieldError(fieldName);
        return { isValid: true, error: null };
    }, [setFieldError, clearFieldError]);

    /**
     * Validación completa para responder a una reseña
     * Combina validaciones de ID y texto de respuesta
     * 
     * @param {string} reviewId - ID de la reseña
     * @param {string} replyText - Texto de la respuesta
     * @returns {Object} Resultado de validación completa
     */
    const validateReplySubmission = useCallback((reviewId, replyText) => {
        // Validar ID de reseña
        const reviewIdValidation = validateReviewId(reviewId);
        if (!reviewIdValidation.isValid) {
            return reviewIdValidation;
        }

        // Validar texto de respuesta
        const replyTextValidation = validateReplyText(replyText);
        if (!replyTextValidation.isValid) {
            return replyTextValidation;
        }

        return { isValid: true, error: null };
    }, [validateReviewId, validateReplyText]);

    /**
     * Obtiene el mensaje de error para un campo específico
     * Prioriza errores de validación sobre errores en tiempo real
     * 
     * @param {string} fieldName - Nombre del campo
     * @returns {string|null} Mensaje de error o null si no hay error
     */
    const getFieldError = useCallback((fieldName) => {
        return validationErrors[fieldName] || realTimeErrors[fieldName] || null;
    }, [validationErrors, realTimeErrors]);

    /**
     * Verifica si hay algún error de validación
     * Útil para deshabilitar botones de envío
     * 
     * @returns {boolean} True si hay errores, false si no
     */
    const hasValidationErrors = useCallback(() => {
        return Object.keys(validationErrors).length > 0 || Object.keys(realTimeErrors).length > 0;
    }, [validationErrors, realTimeErrors]);

    /**
     * Verifica si un campo específico tiene error
     * Útil para styling condicional de campos
     * 
     * @param {string} fieldName - Nombre del campo
     * @returns {boolean} True si el campo tiene error
     */
    const hasFieldError = useCallback((fieldName) => {
        return !!(validationErrors[fieldName] || realTimeErrors[fieldName]);
    }, [validationErrors, realTimeErrors]);

    // Memoizar el objeto de retorno para evitar re-renders innecesarios
    const returnValue = useMemo(() => ({
        // Estado de errores
        validationErrors,
        realTimeErrors,
        
        // Funciones de gestión de errores
        clearValidationErrors,
        clearFieldError,
        setFieldError,
        getFieldError,
        hasValidationErrors,
        hasFieldError,
        
        // Validaciones individuales
        validateReplyText,
        validateReviewId,
        validateSearchTerm,
        validateDateFilters,
        validateRatingFilter,
        
        // Validaciones complejas
        validateReplySubmission
    }), [
        validationErrors,
        realTimeErrors,
        clearValidationErrors,
        clearFieldError,
        setFieldError,
        getFieldError,
        hasValidationErrors,
        hasFieldError,
        validateReplyText,
        validateReviewId,
        validateSearchTerm,
        validateDateFilters,
        validateRatingFilter,
        validateReplySubmission
    ]);

    return returnValue;
};
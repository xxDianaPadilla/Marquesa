// frontend/src/components/Reviews/Hooks/useReviews.jsx
import { useState, useEffect } from "react";

/**
 * Hook personalizado para manejar todas las operaciones relacionadas con reseñas
 * 
 * Gestiona la obtención, filtrado, ordenamiento y manipulación de reseñas.
 * Proporciona funciones para eliminar, responder y moderar reseñas, así como
 * funciones utilitarias para análisis y presentación de datos.
 * 
 * @returns {Object} Objeto con reseñas, estado, funciones CRUD y utilidades
 */
export const useReviews = () => {
    // Estados principales del hook
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Función helper para obtener el nombre del cliente de forma segura
     * Maneja diferentes estructuras de datos del cliente
     * 
     * @param {Object} review - Objeto de la reseña
     * @returns {string} Nombre del cliente o texto por defecto
     */
    const getClientName = (review) => {
        if (!review.clientId) return 'Cliente no disponible';
        if (typeof review.clientId === 'string') return 'Cliente';
        return review.clientId.fullName || review.clientId.name || 'Cliente sin nombre';
    };

    /**
     * Función para obtener el nombre del producto asociado a la reseña
     * Maneja productos estándar y personalizados
     * 
     * @param {Object} review - Objeto de la reseña
     * @returns {string} Nombre del producto o texto por defecto
     */
    const getProductName = (review) => {
        if (!review.products || review.products.length === 0) {
            return review.productName || 'Sin producto';
        }

        const firstProduct = review.products[0];
        if (firstProduct.itemType === 'custom') {
            return 'Producto personalizado';
        } else {
            return firstProduct.itemId?.name || 'Producto';
        }
    };

    /**
     * Efecto para cargar reseñas al montar el componente
     * Realiza la petición inicial a la API de reseñas
     */
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true);
                setError(null);
                
                console.log('=== Fetch Reviews Debug ===');
                console.log('Iniciando solicitud a /api/reviews');
                
                const response = await fetch('http://localhost:4000/api/reviews');
                
                console.log('Response status:', response.status);
                console.log('Response ok:', response.ok);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: Error al obtener las reseñas`);
                }
                
                const data = await response.json();
                console.log('Data received:', data);
                console.log('Data type:', typeof data);
                console.log('Is array:', Array.isArray(data));
                
                // Verificar si la respuesta es un array directo o tiene estructura de éxito
                let reviewsArray = [];
                
                if (Array.isArray(data)) {
                    reviewsArray = data;
                } else if (data.success && Array.isArray(data.data)) {
                    reviewsArray = data.data;
                } else if (data.data && Array.isArray(data.data)) {
                    reviewsArray = data.data;
                } else {
                    console.warn('Formato de datos inesperado:', data);
                    reviewsArray = [];
                }
                
                console.log('Reviews array final:', reviewsArray);
                console.log('Total reviews:', reviewsArray.length);
                
                setReviews(reviewsArray);
                setError(null);
            } catch (error) {
                console.error('Error fetching reviews:', error);
                setError(error.message);
                setReviews([]); // Fallback a array vacío
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    /**
     * Función para eliminar una reseña por ID
     * Realiza la petición DELETE a la API y actualiza el estado local
     * 
     * @param {string} reviewId - ID de la reseña a eliminar
     * @returns {Promise<Object>} Respuesta de la API
     */
    const deleteReview = async (reviewId) => {
        try {
            console.log('=== FRONTEND deleteReview DEBUG ===');
            console.log('Review ID:', reviewId);
            
            if (!reviewId) {
                throw new Error('reviewId es requerido');
            }

            const response = await fetch(`http://localhost:4000/api/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.log('Error response text:', errorText);
                
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    console.log('Error parsing JSON:', e);
                    errorData = { message: errorText || `Error HTTP ${response.status}` };
                }
                
                throw new Error(errorData.message || `Error HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log('Success response:', data);

            // Eliminar la reseña del estado local
            setReviews(prev => prev.filter(review => review._id !== reviewId));

            return data;

        } catch (error) {
            console.error('Error en deleteReview frontend:', error);
            throw error;
        }
    };

    /**
     * Función para responder a una reseña
     * Envía la respuesta a la API y actualiza el estado local
     * 
     * @param {string} reviewId - ID de la reseña a responder
     * @param {string} replyText - Texto de la respuesta
     * @returns {Promise<Object>} Respuesta de la API
     */
    const replyToReview = async (reviewId, replyText) => {
        try {
            console.log('=== FRONTEND replyToReview DEBUG ===');
            console.log('Review ID:', reviewId);
            console.log('Reply text:', replyText);
            
            if (!reviewId) {
                throw new Error('reviewId es requerido');
            }
            
            if (!replyText || replyText.trim() === '') {
                throw new Error('replyText es requerido');
            }

            const requestBody = { response: replyText.trim() };
            console.log('Request body:', JSON.stringify(requestBody));

            const response = await fetch(`http://localhost:4000/api/reviews/${reviewId}/reply`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.log('Error response text:', errorText);
                
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    console.log('Error parsing JSON:', e);
                    errorData = { message: errorText || `Error HTTP ${response.status}` };
                }
                
                throw new Error(errorData.message || `Error HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log('Success response:', data);

            // Actualizar estado local con la respuesta del servidor
            if (data.success && data.data) {
                setReviews(prev => prev.map(review =>
                    review._id === reviewId
                        ? data.data
                        : review
                ));
            } else {
                setReviews(prev => prev.map(review =>
                    review._id === reviewId
                        ? { ...review, response: replyText.trim(), status: 'replied' }
                        : review
                ));
            }

            return data;

        } catch (error) {
            console.error('Error en replyToReview frontend:', error);
            throw error;
        }
    };

    /**
     * Función para moderar una reseña (aprobar o rechazar)
     * Envía la acción de moderación a la API y actualiza el estado local
     * 
     * @param {string} reviewId - ID de la reseña a moderar
     * @param {string} action - Acción a realizar: 'approve' o 'reject'
     * @returns {Promise<Object>} Respuesta de la API
     */
    const moderateReview = async (reviewId, action) => {
        try {
            console.log('=== FRONTEND moderateReview DEBUG ===');
            console.log('Review ID:', reviewId);
            console.log('Action:', action);
            
            if (!reviewId) {
                throw new Error('reviewId es requerido');
            }
            
            if (!action || !['approve', 'reject'].includes(action)) {
                throw new Error('action debe ser "approve" o "reject"');
            }

            const requestBody = { action };
            console.log('Request body:', JSON.stringify(requestBody));

            const response = await fetch(`http://localhost:4000/api/reviews/${reviewId}/moderate`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.log('Error response text:', errorText);
                
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    console.log('Error parsing JSON:', e);
                    errorData = { message: errorText || `Error HTTP ${response.status}` };
                }
                
                throw new Error(errorData.message || `Error HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log('Success response:', data);

            // Actualizar estado local
            const newStatus = action === 'approve' ? 'approved' : 'rejected';
            if (data.success && data.data) {
                setReviews(prev => prev.map(review =>
                    review._id === reviewId
                        ? data.data
                        : review
                ));
            } else {
                setReviews(prev => prev.map(review =>
                    review._id === reviewId
                        ? { ...review, status: newStatus }
                        : review
                ));
            }

            return data;

        } catch (error) {
            console.error('Error en moderateReview frontend:', error);
            throw error;
        }
    };

    /**
     * Función para actualizar una reseña específica en el estado local
     * Útil para actualizaciones optimistas de la UI
     * 
     * @param {string} reviewId - ID de la reseña a actualizar
     * @param {Object} updates - Objeto con los campos a actualizar
     */
    const updateReview = (reviewId, updates) => {
        setReviews(prev => prev.map(review =>
            review._id === reviewId
                ? { ...review, ...updates }
                : review
        ));
    };

    /**
     * Función para obtener estadísticas completas de las reseñas
     * Calcula métricas como promedios, distribuciones y conteos
     * 
     * @returns {Object} Objeto con todas las estadísticas calculadas
     */
    const getReviewStats = () => {
        if (!reviews || reviews.length === 0) {
            return {
                total: 0,
                pending: 0,
                approved: 0,
                rejected: 0,
                replied: 0,
                unanswered: 0,
                averageRating: 0,
                positiveReviews: 0,
                neutralReviews: 0,
                negativeReviews: 0,
                verifiedReviews: 0,
                reviewsWithImages: 0,
                ratingDistribution: {
                    1: 0, 2: 0, 3: 0, 4: 0, 5: 0
                }
            };
        }

        const total = reviews.length;
        const pending = reviews.filter(review => review.status === 'pending').length;
        const approved = reviews.filter(review => review.status === 'approved').length;
        const rejected = reviews.filter(review => review.status === 'rejected').length;
        const replied = reviews.filter(review => review.response && review.response.trim() !== '').length;
        const unanswered = total - replied;

        // Calcular promedio de calificación
        const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
        const averageRating = total > 0 ? (totalRating / total).toFixed(1) : 0;

        // Clasificar reseñas por calificación
        const positiveReviews = reviews.filter(review => review.rating >= 4).length;
        const neutralReviews = reviews.filter(review => review.rating === 3).length;
        const negativeReviews = reviews.filter(review => review.rating <= 2).length;

        // Reseñas verificadas y con imágenes
        const verifiedReviews = reviews.filter(review => review.verified === true).length;
        const reviewsWithImages = reviews.filter(review => 
            review.images && Array.isArray(review.images) && review.images.length > 0
        ).length;

        // Distribución de calificaciones
        const ratingDistribution = {
            1: reviews.filter(review => review.rating === 1).length,
            2: reviews.filter(review => review.rating === 2).length,
            3: reviews.filter(review => review.rating === 3).length,
            4: reviews.filter(review => review.rating === 4).length,
            5: reviews.filter(review => review.rating === 5).length,
        };

        return {
            total,
            pending,
            approved,
            rejected,
            replied,
            unanswered,
            averageRating: parseFloat(averageRating),
            positiveReviews,
            neutralReviews,
            negativeReviews,
            verifiedReviews,
            reviewsWithImages,
            ratingDistribution
        };
    };

    /**
     * Función para filtrar reseñas por múltiples criterios
     * Permite filtrar por texto, calificación, estado, producto y fechas
     * 
     * @param {Object} filters - Objeto con los criterios de filtrado
     * @returns {Array} Array de reseñas filtradas
     */
    const filterReviews = (filters) => {
        if (!reviews || reviews.length === 0) return [];

        let filtered = [...reviews];

        // Filtro por texto de búsqueda
        if (filters.searchTerm && filters.searchTerm.trim()) {
            const searchTerm = filters.searchTerm.toLowerCase().trim();
            filtered = filtered.filter(review => {
                const clientName = getClientName(review).toLowerCase();
                const productName = getProductName(review).toLowerCase();
                const message = (review.message || '').toLowerCase();
                const response = (review.response || '').toLowerCase();
                
                return clientName.includes(searchTerm) ||
                       productName.includes(searchTerm) ||
                       message.includes(searchTerm) ||
                       response.includes(searchTerm);
            });
        }

        // Filtro por calificación
        if (filters.rating && filters.rating !== 'todos') {
            filtered = filtered.filter(review => review.rating === parseInt(filters.rating));
        }

        // Filtro por estado
        if (filters.status && filters.status !== 'todos') {
            if (filters.status === 'replied') {
                filtered = filtered.filter(review => review.response && review.response.trim() !== '');
            } else {
                filtered = filtered.filter(review => review.status === filters.status);
            }
        }

        // Filtro por producto
        if (filters.product && filters.product !== 'todos') {
            filtered = filtered.filter(review => {
                const productName = getProductName(review);
                return productName === filters.product;
            });
        }

        // Filtro por fecha
        if (filters.dateFrom) {
            const dateFrom = new Date(filters.dateFrom);
            filtered = filtered.filter(review => new Date(review.createdAt) >= dateFrom);
        }

        if (filters.dateTo) {
            const dateTo = new Date(filters.dateTo);
            dateTo.setHours(23, 59, 59, 999); // Incluir todo el día
            filtered = filtered.filter(review => new Date(review.createdAt) <= dateTo);
        }

        return filtered;
    };

    /**
     * Función para ordenar reseñas según diferentes criterios
     * Permite ordenamiento por fecha, calificación, producto y estado
     * 
     * @param {Array} reviewsToSort - Array de reseñas a ordenar
     * @param {string} sortBy - Campo por el cual ordenar
     * @param {string} sortOrder - Dirección del ordenamiento ('asc' o 'desc')
     * @returns {Array} Array de reseñas ordenadas
     */
    const sortReviews = (reviewsToSort, sortBy, sortOrder) => {
        const sorted = [...reviewsToSort];

        sorted.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'fecha':
                    aValue = new Date(a.createdAt);
                    bValue = new Date(b.createdAt);
                    break;
                case 'calificacion':
                    aValue = a.rating;
                    bValue = b.rating;
                    break;
                case 'producto':
                    aValue = getProductName(a).toLowerCase();
                    bValue = getProductName(b).toLowerCase();
                    break;
                case 'estado':
                    aValue = a.status || 'pending';
                    bValue = b.status || 'pending';
                    break;
                default:
                    aValue = new Date(a.createdAt);
                    bValue = new Date(b.createdAt);
            }

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return sorted;
    };

    /**
     * Función para obtener una lista única de productos de las reseñas
     * Útil para popular filtros y selects
     * 
     * @returns {Array} Array de nombres de productos únicos
     */
    const getUniqueProducts = () => {
        const products = new Set();
        
        reviews.forEach(review => {
            const productName = getProductName(review);
            if (productName && productName !== 'Sin producto') {
                products.add(productName);
            }
        });

        return Array.from(products).sort();
    };

    // Retornar todas las funciones y estados del hook
    return {
        reviews,
        loading,
        error,
        deleteReview,
        replyToReview,
        moderateReview,
        updateReview,
        getReviewStats,
        filterReviews,
        sortReviews,
        getUniqueProducts,
        getProductName,
        getClientName
    };
};
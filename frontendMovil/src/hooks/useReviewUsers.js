import { useState, useEffect } from "react";

// Hook para reseñas de usuarios
const useReviewsUsers = (productId, alertHelpers = null) => {
    const [reviews, setReviews] = useState({
        average: 0,
        count: 0,
        comments: []
    });
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Función helper para mostrar alertas
    const showAlert = (type, title, message) => {
        if (alertHelpers) {
            switch (type) {
                case 'success':
                    alertHelpers.showSuccess(message, title);
                    break;
                case 'error':
                    alertHelpers.showError(message, title);
                    break;
                case 'warning':
                    alertHelpers.showWarning(message, title);
                    break;
                default:
                    alertHelpers.showInfo(message, title);
            }
        } else {
            // Fallback a console si no se proporcionan alertHelpers
            console.log(`${type.toUpperCase()}: ${title} - ${message}`);
        }
    };

    // Función helper para mostrar toast
    const showToast = (type, message) => {
        if (alertHelpers) {
            switch (type) {
                case 'success':
                    alertHelpers.showSuccessToast(message);
                    break;
                case 'error':
                    alertHelpers.showErrorToast(message);
                    break;
                case 'warning':
                    alertHelpers.showWarningToast(message);
                    break;
                default:
                    alertHelpers.showInfoToast(message);
            }
        } else {
            console.log(`TOAST ${type.toUpperCase()}: ${message}`);
        }
    };

    // Obtener reseñas de un producto específico
    const fetchProductReviews = async (productId) => {
        if (!productId) return;

        try {
            setLoading(true);
            const response = await fetch(`https://marquesa.onrender.com/api/reviews/product/${productId}`);

            if (!response.ok) {
                throw new Error('Error al obtener las reseñas');
            }

            const data = await response.json();

            if (data.success) {
                // Transformar las reseñas del backend al formato esperado por el componente
                console.log('Raw data from backend:', data.data);

                const transformedReviews = {
                    average: data.data.averageRating || 0,
                    count: data.data.totalReviews || 0,
                    comments: data.data.reviews?.map(review => {
                        console.log('Transformando review completa:', review);
                        console.log('clientId data:', review.clientId);

                        // El backend ya devuelve los datos formateados, usar esos primero
                        const clientName = review.clientName || review.clientId?.fullName || 'Usuario anónimo';
                        const profilePicture = review.clientProfilePicture || review.clientId?.profilePicture || null;

                        console.log('Datos finales:', { clientName, profilePicture });

                        return {
                            name: clientName,
                            comment: review.message,
                            rating: review.rating,
                            year: new Date(review.createdAt).getFullYear(),
                            date: review.createdAt,
                            response: review.response || null,
                            status: review.status,
                            profilePicture: profilePicture,
                            email: review.clientEmail || review.clientId?.email
                        };
                    }) || []
                };

                console.log('Reviews transformadas:', transformedReviews);

                setReviews(transformedReviews);
            }
        } catch (error) {
            console.error('Error al obtener reseñas:', error);
            // Usar alerta personalizada para errores
            showAlert('error', 'Error', 'Error al cargar las reseñas. Inténtalo nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    // Crear una nueva reseña - CORREGIDO para coincidir con el backend
    const submitReview = async (reviewData) => {
        try {
            setSubmitting(true);
            
            console.log('Datos de reseña recibidos en hook:', reviewData);
            console.log('Estado completo de reviewData:', JSON.stringify(reviewData, null, 2));

            // Validaciones básicas en el frontend con debugging mejorado
            if (!reviewData.clientId) {
                console.error('clientId faltante. reviewData completo:', reviewData);
                throw new Error('ID de cliente requerido. Verifica que el usuario esté autenticado correctamente.');
            }
            if (!reviewData.productId) {
                throw new Error('ID de producto requerido');
            }
            if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
                throw new Error('Calificación debe estar entre 1 y 5');
            }
            if (!reviewData.message || reviewData.message.trim() === '') {
                throw new Error('Mensaje de reseña requerido');
            }

            // Formatear los datos según lo que espera el backend y el schema
            const formattedData = {
                clientId: reviewData.clientId,
                products: [{
                    itemType: "product",        // Tipo de item según el schema
                    itemId: reviewData.productId,  // ID del producto
                    itemTypeRef: "products"     // Referencia a la colección "products"
                }], // El backend espera un array de objetos con itemType, itemId e itemTypeRef
                rating: parseInt(reviewData.rating),
                message: reviewData.message.trim()
            };

            console.log('Datos formateados para enviar:', formattedData);

            const response = await fetch('https://marquesa.onrender.com/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedData)
            });

            const data = await response.json();
            console.log('Respuesta del servidor:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Error al enviar la reseña');
            }

            if (data.success) {
                // Mostrar toast de éxito
                showToast('success', '¡Reseña enviada exitosamente! ⭐');

                // Recargar las reseñas después de crear una nueva
                await fetchProductReviews(productId);

                return { success: true, data: data.data };
            } else {
                throw new Error(data.message || 'Error desconocido al enviar la reseña');
            }
        } catch (error) {
            console.error('Error al enviar reseña:', error);
            // Mostrar alerta de error
            showAlert('error', 'Error', `No se pudo enviar la reseña: ${error.message}`);
            return { success: false, error: error.message };
        } finally {
            setSubmitting(false);
        }
    };

    // Cargar reseñas cuando cambie el productId
    useEffect(() => {
        if (productId) {
            fetchProductReviews(productId);
        }
    }, [productId]);

    return {
        reviews,
        loading,
        submitting,
        fetchProductReviews,
        submitReview,
        setReviews
    };
};

export default useReviewsUsers;
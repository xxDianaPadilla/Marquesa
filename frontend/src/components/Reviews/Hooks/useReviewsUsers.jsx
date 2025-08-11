import { useState, useEffect } from "react";
import toast from 'react-hot-toast';

const useReviewsUsers = (productId) => {
    const [reviews, setReviews] = useState({
        average: 0,
        count: 0,
        comments: []
    });
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

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
            toast.error('Error al cargar las reseñas');
        } finally {
            setLoading(false);
        }
    };

    // Crear una nueva reseña
    const submitReview = async (reviewData) => {
        try {
            setSubmitting(true);

            const response = await fetch('https://marquesa.onrender.com/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reviewData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al enviar la reseña');
            }

            if (data.success) {
                toast.success('¡Reseña enviada exitosamente!', {
                    duration: 3000,
                    position: 'top-center',
                    icon: '⭐',
                    style: {
                        background: '#10B981',
                        color: '#fff',
                    }
                });

                // Recargar las reseñas después de crear una nueva
                await fetchProductReviews(productId);

                return { success: true, data: data.data };
            }
        } catch (error) {
            console.error('Error al enviar reseña:', error);
            toast.error(`Error: ${error.message}`, {
                duration: 4000,
                position: 'top-center',
                icon: '❌'
            });
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
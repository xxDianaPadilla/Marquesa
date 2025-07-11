import { useState, useEffect } from "react";

export const useReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:4000/api/reviews');
                if (!response.ok) {
                    throw new Error('Error al obtener las reseñas');
                }
                const data = await response.json();
                setReviews(data);
                setError(null);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    const moderateReview = async (reviewId, action) => {
        try {
            const response = await fetch(`http://localhost:4000/api/reviews/${reviewId}/moderate`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action }),
            });

            if (!response.ok) {
                throw new Error('Error al moderar la reseña');
            }

            // Actualizar el estado local
            setReviews(prev => prev.map(review =>
                review._id === reviewId
                    ? { ...review, status: action === 'approve' ? 'approved' : 'rejected' }
                    : review
            ));

        } catch (error) {
            console.error('Error al moderar reseña:', error);
            throw error;
        }
    };

    const deleteReview = async (reviewId) => {
        try {
            console.log('=== FRONTEND deleteReview DEBUG ===');
            console.log('Review ID:', reviewId);
            
            // Validaciones
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

    const replyToReview = async (reviewId, replyText) => {
        try {
            console.log('=== FRONTEND replyToReview DEBUG ===');
            console.log('Review ID:', reviewId);
            console.log('Reply text:', replyText);
            
            // Validaciones
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

            // Actualizar estado local con la respuesta del servidor (ya viene poblada)
            if (data.review) {
                setReviews(prev => prev.map(review =>
                    review._id === reviewId
                        ? data.review
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

    // Función para actualizar una reseña específica (útil para el componente ReviewsTable)
    const updateReview = (reviewId, updates) => {
        setReviews(prev => prev.map(review =>
            review._id === reviewId
                ? { ...review, ...updates }
                : review
        ));
    };

    // Función para obtener estadísticas de las reseñas
    const getReviewStats = () => {
        const total = reviews.length;
        const pending = reviews.filter(review => review.status === 'pending').length;
        const approved = reviews.filter(review => review.status === 'approved').length;
        const rejected = reviews.filter(review => review.status === 'rejected').length;
        const replied = reviews.filter(review => review.status === 'replied' || review.response).length;

        return {
            total,
            pending,
            approved,
            rejected,
            replied,
            unanswered: total - replied
        };
    };

    return {
        reviews,
        loading,
        error,
        moderateReview,
        deleteReview,
        replyToReview,
        updateReview,
        getReviewStats
    };
};
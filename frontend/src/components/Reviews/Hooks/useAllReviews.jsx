import { useState, useEffect } from "react";
import toast from 'react-hot-toast';

const useAllReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Obtener todas las reseñas del sistema
    const fetchAllReviews = async (limit = 50) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`http://localhost:4000/api/reviews?limit=${limit}&status=replied`);

            if (!response.ok) {
                throw new Error('Error al obtener las reseñas');
            }

            const data = await response.json();
            console.log('Todas las reseñas obtenidas:', data);

            // Transformar las reseñas del backend al formato esperado
            const transformedReviews = data.map(review => {
                console.log('Transformando review:', review);
                
                const clientName = review.clientName || review.clientId?.fullName || 'Usuario anónimo';
                const profilePicture = review.clientProfilePicture || review.clientId?.profilePicture || null;

                return {
                    id: review._id,
                    name: clientName,
                    comment: review.message,
                    rating: review.rating,
                    year: new Date(review.createdAt).getFullYear(),
                    date: review.createdAt,
                    response: review.response || null,
                    status: review.status,
                    profilePicture: profilePicture,
                    email: review.clientEmail || review.clientId?.email,
                    productName: review.productId?.name || 'Producto'
                };
            }).filter(review => review.rating >= 4); // Solo mostrar reseñas de 4 y 5 estrellas

            setReviews(transformedReviews);
            
        } catch (error) {
            console.error('Error al obtener todas las reseñas:', error);
            setError(error.message);
            toast.error('Error al cargar las reseñas');
        } finally {
            setLoading(false);
        }
    };

    // Cargar reseñas al montar el componente
    useEffect(() => {
        fetchAllReviews();
    }, []);

    return {
        reviews,
        loading,
        error,
        fetchAllReviews,
        refetch: () => fetchAllReviews()
    };
};

export default useAllReviews;
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
                if(!response.ok){
                    throw new Error('Error al obtener las reseñas');
                }
                const data = await response.json();
                setReviews(data);
                setError(null);
            } catch (error) {
                setError(error.message);
            }finally{
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    return {reviews, loading, error};
};
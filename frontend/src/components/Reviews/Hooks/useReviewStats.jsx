import { useState, useEffect } from "react";

export const useReviewStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:4000/api/reviews/stats');
                if(!response.ok){
                    throw new Error('Error al obtener estadísticas');
                }
                const data = await response.json();
                setStats(data);
                setError(null);
            } catch (error) {
                setError(error.message);
            }finally{
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return {stats, loading, error};
};
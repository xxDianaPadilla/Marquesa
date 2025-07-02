import { useState, useEffect } from "react";

export const useBestRankedProducts = () => {
    const [bestProducts, setBestProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBestRankedProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:4000/api/reviews/best-ranked');
                
                if (!response.ok) {
                    throw new Error('Error al obtener productos mejor calificados');
                }
                
                const data = await response.json();
                console.log('Datos recibidos del servidor:', data);
                
                const limitedProducts = data.slice(0, 5);
                
                setBestProducts(limitedProducts);
                setError(null);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching best ranked products:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchBestRankedProducts();
    }, []);

    return { bestProducts, loading, error };
};
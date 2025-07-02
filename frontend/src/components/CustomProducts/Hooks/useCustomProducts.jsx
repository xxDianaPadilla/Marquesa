import { useState, useEffect } from "react";

export const useCustomProducts = () => {
    const [customProducts, setCustomProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCustomProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:4000/api/customProducts');
                if(!response.ok){
                    throw new Error('Error al obtener productos personalizados');
                }
                const data = await response.json();
                setCustomProducts(data);
            } catch (error) {
                setError(error.message);
            }finally{
                setLoading(false);
            }
        };

        fetchCustomProducts();
    }, []);

    return {customProducts, loading, error};
};
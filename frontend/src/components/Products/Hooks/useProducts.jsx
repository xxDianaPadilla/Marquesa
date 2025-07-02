import { useState, useEffect } from "react";

export const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const reponse = await fetch('http://localhost:4000/api/products');
                if(!reponse.ok){
                    throw new Error('Error al obtener productos');
                }
                const data = await reponse.json();
                setProducts(data);
            } catch (error) {
                setError(error.message);
            }finally{
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return {products, loading, error};
};
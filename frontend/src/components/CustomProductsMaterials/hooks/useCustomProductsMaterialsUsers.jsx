import { useState, useEffect } from "react";

const API_BASE_URL = 'http://localhost:4000/api/customProductsMaterials';

export const useCustomProductsMaterialsUsers = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                setLoading(true);
                // CORREGIDO: Eliminar /customProductsMaterials duplicado
                const response = await fetch(API_BASE_URL);
                const data = await response.json();

                if(data.success){
                    setMaterials(data.data);
                }else{
                    setError(data.message || 'Error al obtener los materiales');
                }
            } catch (error) {
                setError('Error de conexión al servidor');
                console.error('Error fetching materials: ', error);
            }finally{
                setLoading(false);
            }
        };

        fetchMaterials()
    }, []);

    return {materials, loading, error, refetch: () => window.location.reload()};
};

export const useCustomProductsByType = (productType) => {
    const [productData, setProductData] = useState({
        productType: '',
        categories: {},
        totalMaterials: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if(!productType){
            setLoading(false);
            return;
        }

        const fetchProductMaterials = async () => {
            try {
                setLoading(true);
                setError(null);

                const encodedProductType = encodeURIComponent(productType);
                // CORREGIDO: Eliminar /customProductsMaterials duplicado
                const response = await fetch(`${API_BASE_URL}/product/${encodedProductType}`);
                const data = await response.json();

                if(data.success){
                    setProductData(data.data);
                }else{
                    setError(data.message || 'Error al obtener los materiales del producto');
                }
            } catch (error) {
                setError('Error de conexión al servidor');
                console.error('Error fetching product materials: ', error);
            }finally{
                setLoading(false);
            }
        };

        fetchProductMaterials();
    }, [productType]);

    return {productData, loading, error};
};

export const useCustomProductsByCategory = (productType, category) => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if(!productType || !category){
            setLoading(false);
            return;
        }

        const fetchCategoryMaterials = async () => {
            try {
                setLoading(true);
                setError(null);

                const encodedProductType = encodeURIComponent(productType);
                const encodedCategory = encodeURIComponent(category);
                // CORREGIDO: Eliminar /customProductsMaterials duplicado
                const response = await fetch(`${API_BASE_URL}/product/${encodedProductType}/category/${encodedCategory}`);
                const data = await response.json();

                if(data.success){
                    setMaterials(data.data);
                }else{
                    setError(data.message || 'Error al obtener los materiales de la categoría');
                }
            } catch (error) {
                setError('Error de conexión al servidor');
                console.error('Error fetching category materials: ', error);
            }finally{
                setLoading(false);
            }
        };

        fetchCategoryMaterials();
    }, [productType, category]);

    return {materials, loading, error};
};

export const useCustomProductMaterial = (materialId) => {
    const [material, setMaterial] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if(!materialId){
            setLoading(false);
            return;
        }

        const fetchMaterial = async () => {
            try {
                setLoading(true);
                setError(null);

                // CORREGIDO: Eliminar /customProductsMaterials duplicado
                const response = await fetch(`${API_BASE_URL}/${materialId}`);
                const data = await response.json();

                if(data.success){
                    setMaterial(data.data);
                }else{
                    setError(data.message || 'Error al obtener el material');
                }
            } catch (error) {
                setError('Error de conexión al servidor');
                console.error('Error fetching material: ', error);
            }finally{
                setLoading(false);
            }
        };

        fetchMaterial();
    }, [materialId]);

    return {material, loading, error};
};
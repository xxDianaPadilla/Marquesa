import { useState, useEffect, useCallback } from "react";

// Definimos la URL base para usarla en distintos fetch
const API_BASE_URL = 'https://marquesa.onrender.com/api/customProductsMaterials';

// Hook principal para obtener todos los materiales de personalización
export const useCustomProductsMaterialsUsers = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Función para refrescar los datos
    const refetch = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(API_BASE_URL);
            const data = await response.json();

            if (data.success) {
                setMaterials(data.data);
            } else {
                setError(data.message || 'Error al obtener los materiales');
            }
        } catch (error) {
            setError('Error de conexión al servidor');
            console.error('Error fetching materials: ', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // useEffect para obtener los materiales de personalización disponibles
    useEffect(() => {
        refetch();
    }, [refetch]);

    return { materials, loading, error, refetch };
};

// Hook para obtener los materiales de personalización por tipo de producto
export const useCustomProductsByType = (productType) => {
    const [productData, setProductData] = useState({
        productType: '',
        categories: {},
        totalMaterials: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Función para refrescar los datos del producto específico
    const refetch = useCallback(async () => {
        if (!productType) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const encodedProductType = encodeURIComponent(productType);
            const response = await fetch(`${API_BASE_URL}/product/${encodedProductType}`);
            const data = await response.json();

            if (data.success) {
                setProductData(data.data);
            } else {
                setError(data.message || 'Error al obtener los materiales del producto');
            }
        } catch (error) {
            setError('Error de conexión al servidor');
            console.error('Error fetching product materials: ', error);
        } finally {
            setLoading(false);
        }
    }, [productType]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { productData, loading, error, refetch };
};

// Hook para obtener los materiales de personalización por categoría del material
export const useCustomProductsByCategory = (productType, category) => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Función para refrescar los datos de la categoría
    const refetch = useCallback(async () => {
        if (!productType || !category) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const encodedProductType = encodeURIComponent(productType);
            const encodedCategory = encodeURIComponent(category);
            const response = await fetch(`${API_BASE_URL}/product/${encodedProductType}/category/${encodedCategory}`);
            const data = await response.json();

            if (data.success) {
                setMaterials(data.data);
            } else {
                setError(data.message || 'Error al obtener los materiales de la categoría');
            }
        } catch (error) {
            setError('Error de conexión al servidor');
            console.error('Error fetching category materials: ', error);
        } finally {
            setLoading(false);
        }
    }, [productType, category]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { materials, loading, error, refetch };
};

// Hook para manejar un material específico por ID
export const useCustomProductMaterial = (materialId) => {
    const [material, setMaterial] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Función para refrescar los datos del material específico
    const refetch = useCallback(async () => {
        if (!materialId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE_URL}/${materialId}`);
            const data = await response.json();

            if (data.success) {
                setMaterial(data.data);
            } else {
                setError(data.message || 'Error al obtener el material');
            }
        } catch (error) {
            setError('Error de conexión al servidor');
            console.error('Error fetching material: ', error);
        } finally {
            setLoading(false);
        }
    }, [materialId]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { material, loading, error, refetch };
};

// Hook adicional para manejar la lógica de personalización de productos
export const useProductCustomization = () => {
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [customizationCart, setCustomizationCart] = useState([]);

    // Función para agregar/quitar productos de la selección
    const toggleProductSelection = useCallback((product, isSelected) => {
        if (isSelected) {
            setSelectedProducts(prev => {
                const existingProduct = prev.find(p => p._id === product._id);
                if (existingProduct) {
                    console.log('Producto ya seleccionado:', product.name);
                    return prev;
                }
                return [...prev, product];
            });
        } else {
            setSelectedProducts(prev => prev.filter(p => p._id !== product._id));
        }
    }, []);

    // Función para remover un producto específico de la selección
    const removeProduct = useCallback((productId) => {
        setSelectedProducts(prev => prev.filter(p => p._id !== productId));
    }, []);

    // Función para finalizar la personalización
    const finishCustomization = useCallback((customizationData) => {
        const { productType, totalPrice, referenceImage, comments } = customizationData;

        // Crear objeto de personalización completo
        const customizationOrder = {
            id: `custom-${Date.now()}`,
            productType,
            selectedProducts,
            totalPrice,
            referenceImage,
            comments,
            timestamp: new Date().toISOString(),
        };

        // Agregar al carrito de personalizaciones
        setCustomizationCart(prev => [...prev, customizationOrder]);
        
        // Limpiar selección
        setSelectedProducts([]);

        console.log('Orden de personalización creada:', customizationOrder);
        return customizationOrder;
    }, [selectedProducts]);

    // Función para limpiar la selección
    const clearSelection = useCallback(() => {
        setSelectedProducts([]);
    }, []);

    // Función para calcular el precio total
    const calculateTotalPrice = useCallback(() => {
        return selectedProducts.reduce((total, product) => {
            return total + (product.price || 0);
        }, 0);
    }, [selectedProducts]);

    return {
        selectedProducts,
        customizationCart,
        toggleProductSelection,
        removeProduct,
        finishCustomization,
        clearSelection,
        calculateTotalPrice,
        hasSelectedProducts: selectedProducts.length > 0
    };
};

// Hook utilitario para transformar datos de materiales al formato de productos
export const useMaterialsTransformation = () => {
    // Función para transformar los datos de la API al formato esperado
    const transformMaterialsToProducts = useCallback((materials) => {
        if (!Array.isArray(materials)) return [];
        
        return materials.map(material => ({
            _id: material._id,
            name: material.name,
            description: `Stock disponible: ${material.stock}`,
            price: material.price,
            image: material.image,
            inStock: material.stock > 0,
            category: material.categoryToParticipate,
            stock: material.stock,
            productToPersonalize: material.productToPersonalize
        }));
    }, []);

    // Función para filtrar productos por categoría
    const filterProductsByCategory = useCallback((materials, categoryId) => {
        if (!Array.isArray(materials)) return [];
        if (categoryId === 'todos') return materials;
        
        return materials.filter(material => 
            material.categoryToParticipate?.toLowerCase().includes(categoryId.toLowerCase())
        );
    }, []);

    // Función para obtener categorías disponibles de un conjunto de materiales
    const getAvailableCategories = useCallback((materials) => {
        if (!Array.isArray(materials)) return [];
        
        const categories = materials.reduce((acc, material) => {
            if (material.categoryToParticipate && !acc.includes(material.categoryToParticipate)) {
                acc.push(material.categoryToParticipate);
            }
            return acc;
        }, []);

        return categories;
    }, []);

    return {
        transformMaterialsToProducts,
        filterProductsByCategory,
        getAvailableCategories
    };
};
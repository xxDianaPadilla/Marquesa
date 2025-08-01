import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import Header from "../components/Header/Header";
import Footer from "../components/Footer";
import CustomizationPanel from "../components/CustomizationPanel";
import CustomCategorySection from "../components/CustomCategorySection";
import { useCustomProductsByType } from "../components/CustomProductsMaterials/hooks/useCustomProductsMaterialsUsers";

const CustomProducts = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Obtener parámetros de la URL
    const productType = searchParams.get('product');
    const availableCategories = searchParams.get('categories') ? JSON.parse(searchParams.get('categories')) : [];

    // Estados locales
    const [activeCategory, setActiveCategory] = useState('todos');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [cart, setCart] = useState([]);

    // Hook para obtener datos del producto
    const { productData, loading, error } = useCustomProductsByType(productType);

    // Redirigir si no hay tipo de producto
    useEffect(() => {
        if (!productType) {
            navigate('/');
        }
    }, [productType, navigate]);

    // Configuración de categorías dinámicas basadas en el producto seleccionado
    const getCategoriesForProduct = () => {
        const baseCategories = [{ id: 'todos', name: 'Todos' }];

        if (availableCategories.length > 0) {
            return [
                ...baseCategories,
                ...availableCategories.map((cat, index) => ({
                    id: cat.toLowerCase().replace(/\s+/g, '-'),
                    name: cat
                }))
            ];
        }

        return baseCategories;
    };

    const categories = getCategoriesForProduct();

    /**
     * Maneja el cambio de categoría en la navegación
     */
    const handleCategoryChange = (categoryId) => {
        setActiveCategory(categoryId);

        if (categoryId !== 'todos') {
            // Scroll suave hacia la sección correspondiente
            const element = document.getElementById(`category-${categoryId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    /**
     * Maneja la adición de productos al carrito
     */
    const handleAddToCart = (product) => {
        setCart(prev => [...prev, product]);
        console.log('Producto añadido al carrito:', product);
        // Aquí se puede mostrar una notificación
    };

    /**
     * Maneja la personalización de productos
     */
    const handleCustomize = (product, isSelected) => {
        if (isSelected) {
            // Verificar si el producto ya está seleccionado antes de agregarlo
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
    };

    /**
     * Maneja la eliminación de productos de la personalización
     */
    const handleRemoveProduct = (productId) => {
        setSelectedProducts(prev => prev.filter(p => p._id !== productId));
    };

    /**
     * Maneja la finalización de la personalización
     */
    const handleFinishCustomization = () => {
        if (selectedProducts.length === 0) {
            alert('Selecciona al menos un producto para personalizar');
            return;
        }

        console.log('Personalización finalizada con productos:', selectedProducts);

        // Calcular precio total
        const totalPrice = selectedProducts.reduce((total, product) => total + product.price, 0);

        // Crear objeto de personalización
        const customizationOrder = {
            productType,
            selectedProducts,
            totalPrice,
            timestamp: new Date().toISOString()
        };

        // Agregar al carrito
        setCart(prev => [...prev, customizationOrder]);

        alert(`¡Personalización completada! Total: ${totalPrice.toFixed(2)}`);

        // Limpiar selección
        setSelectedProducts([]);

        // Opcional: navegar al carrito o checkout
        // navigate('/cart');
    };

    // Función para transformar los datos de la API al formato esperado por los componentes
    const transformMaterialsToProducts = (materials) => {
        return materials.map(material => ({
            _id: material._id,  // Solo usar _id como identificador único
            name: material.name,
            description: `Stock disponible: ${material.stock}`,
            price: material.price,
            image: material.image,
            inStock: material.stock > 0,
            category: material.categoryToParticipate,
            stock: material.stock,
            productToPersonalize: material.productToPersonalize
        }));
    };

    // Mostrar loading
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando productos personalizables...</p>
                </div>
            </div>
        );
    }

    // Mostrar error
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-4">⚠️</div>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    // Verificar si no hay datos
    if (!productData || Object.keys(productData.categories).length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-gray-400 text-xl mb-4">📦</div>
                    <p className="text-gray-600 mb-4">No hay materiales disponibles para este producto</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Header />

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Encabezado de la página */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Personalizar {productType}
                    </h1>
                    <p className="text-gray-600">
                        Selecciona los materiales para crear tu producto personalizado único
                    </p>
                    <div className="mt-4 flex items-center space-x-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {productData.totalMaterials} materiales disponibles
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            {Object.keys(productData.categories).length} categorías
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Área de productos */}
                    <div className="lg:col-span-3">
                        {Object.entries(productData.categories).map(([categoryName, materials]) => {
                            const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-');
                            const transformedProducts = transformMaterialsToProducts(materials);

                            return (
                                <div key={categoryName} id={`category-${categoryId}`}>
                                    <CustomCategorySection
                                        title={`Escoge ${categoryName.toLowerCase()}`}
                                        products={transformedProducts}
                                        onAddToCart={handleAddToCart}
                                        onCustomize={handleCustomize}
                                        selectedProducts={selectedProducts}
                                    />
                                </div>
                            );
                        })}
                    </div>

                    {/* Panel de personalización */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-4">
                            <CustomizationPanel
                                selectedProducts={selectedProducts}
                                onRemoveProduct={handleRemoveProduct}
                                onFinishCustomization={handleFinishCustomization}
                                productType={productType}
                            />

                            {/* Información del carrito */}
                            {cart.length > 0 && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <p className="text-sm text-green-700 font-medium">
                                            Productos en carrito: {cart.length}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Información adicional */}
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                    💡 Consejos de personalización
                                </h3>
                                <ul className="text-xs text-gray-600 space-y-1">
                                    <li>• Selecciona al menos un elemento de cada categoría</li>
                                    <li>• Puedes cambiar tu selección en cualquier momento</li>
                                    <li>• El precio final se calculará automáticamente</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default CustomProducts;
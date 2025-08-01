import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";
import CategoryNavigation from "../components/CategoryNavigation";
import CategorySection from "../components/CategorySection";
import PersonalizableSection from "../components/PersonalizableSection"; // Nuevo componente
import LoadingSpinner from "../components/LoadingSpinner";
import Container from "../components/Container";

const CategoryProducts = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Estados para el manejo de la página
    const [activeCategory, setActiveCategory] = useState('todos');
    const [isLoading, setIsLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);

    // URL base de la API - Tu backend en puerto 4000
    const API_BASE_URL = process.env.NODE_ENV === 'production' 
        ? '/api' 
        : 'http://localhost:4000/api';

    /**
     * Configuración de categorías disponibles (igual que CategoryProductsPage)
     */
    const categories = [
        { _id: 'todos', name: 'Todos' },
        { _id: '688175a69579a7cde1657aaa', name: 'Arreglos con flores naturales' },
        { _id: '688175d89579a7cde1657ac2', name: 'Arreglos con flores secas' },
        { _id: '688175fd9579a7cde1657aca', name: 'Cuadros decorativos' },
        { _id: '688176179579a7cde1657ace', name: 'Giftboxes' },
        { _id: '688175e79579a7cde1657ac6', name: 'Tarjetas' }
    ];

    const categoryMap = {
        '688175a69579a7cde1657aaa': 'Arreglos con flores naturales',
        '688175d89579a7cde1657ac2': 'Arreglos con flores secas',
        '688175fd9579a7cde1657aca': 'Cuadros decorativos',
        '688176179579a7cde1657ace': 'Giftboxes',
        '688175e79579a7cde1657ac6': 'Tarjetas'
    };

    /**
     * Función para obtener todos los productos
     */
    const fetchAllProducts = async () => {
        try {
            setIsLoading(true);
            console.log('🔄 Fetching all products...');
            
            const response = await fetch(`${API_BASE_URL}/products`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📦 All products response:', data);
            
            // Manejar diferentes estructuras de respuesta
            const productsData = Array.isArray(data) ? data : (data.products || data.data || []);
            
            console.log('📊 Total products loaded:', productsData.length);
            setProducts(productsData);
            setError(null);
            
        } catch (error) {
            console.error('❌ Error fetching all products:', error);
            setError('Error al cargar todos los productos');
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Función para obtener productos por categoría específica
     * Usa el mismo endpoint que CategoryProductsPage
     */
    const fetchProductsByCategory = async (categoryId) => {
        try {
            setIsLoading(true);
            console.log('🔄 Fetching products for category:', categoryId);
            
            const response = await fetch(`${API_BASE_URL}/products/by-category/${categoryId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`📦 Products for category ${categoryId}:`, data);
            
            // Manejar diferentes estructuras de respuesta
            const productsData = Array.isArray(data) ? data : (data.products || data.data || []);
            
            console.log(`📊 Products loaded for category ${categoryId}:`, productsData.length);
            setProducts(productsData);
            setError(null);
            
        } catch (error) {
            console.error(`❌ Error fetching products for category ${categoryId}:`, error);
            setError(`Error al cargar los productos de la categoría`);
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * useEffect para cargar datos iniciales
     */
    useEffect(() => {
        console.log('🚀 Loading initial data...');
        fetchAllProducts();
    }, []);

    /**
     * useEffect para detectar cambios en la URL
     */
    useEffect(() => {
        const pathParts = location.pathname.split('/');
        if (pathParts[1] === 'categoria' && pathParts[2]) {
            const categoryFromUrl = pathParts[2];
            if (categoryFromUrl !== activeCategory) {
                console.log('🌐 URL category change detected:', categoryFromUrl);
                setActiveCategory(categoryFromUrl);
                fetchProductsByCategory(categoryFromUrl);
            }
        } else if (location.pathname === '/' && activeCategory !== 'todos') {
            console.log('🏠 Home page detected, setting to todos');
            setActiveCategory('todos');
            fetchAllProducts();
        }
    }, [location.pathname]);

    /**
     * Maneja el cambio de categoría en la navegación
     */
    const handleCategoryChange = async (categoryId) => {
        console.log('🎯 Category changed to:', categoryId);
        setActiveCategory(categoryId);
        
        if (categoryId === 'todos') {
            await fetchAllProducts();
            navigate('/', { replace: true });
        } else {
            await fetchProductsByCategory(categoryId);
            navigate(`/categoria/${categoryId}`, { replace: true });
        }
        
        // Scroll suave al top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /**
     * Maneja el click en "Ver todos" de una categoría
     */
    const handleViewAll = (categoryId) => {
        console.log('👀 View all clicked for category:', categoryId);
        handleCategoryChange(categoryId);
    };

    /**
     * Maneja la navegación al detalle del producto
     */
    const handleProductDetailClick = (productId) => {
        console.log('🔗 Navigating to product detail:', productId);
        navigate(`/ProductDetail/${productId}`);
    };

    /**
     * Maneja la navegación a la página de personalización por categoría
     */
    const handlePersonalizeClick = (categoryId) => {
        console.log('🎨 Navigating to personalize category:', categoryId);
        navigate(`/personalizar/${categoryId}`);
    };

    /**
     * Agrupa los productos por categoría para mostrar en secciones
     */
    const getProductsByCategory = () => {
        const safeProducts = Array.isArray(products) ? products : [];
        
        if (activeCategory === 'todos') {
            // Agrupar todos los productos por categoría
            const groupedProducts = {};
            
            safeProducts.forEach(product => {
                // Obtener el categoryId - puede ser string directo o objeto poblado
                let categoryId, categoryName;
                
                if (typeof product.categoryId === 'object' && product.categoryId._id) {
                    // Si está poblado (objeto)
                    categoryId = product.categoryId._id;
                    categoryName = product.categoryId.name;
                } else {
                    // Si es solo el ID (string)
                    categoryId = product.categoryId;
                    categoryName = categoryMap[categoryId] || 'Sin categoría';
                }
                
                if (!groupedProducts[categoryId]) {
                    groupedProducts[categoryId] = {
                        name: categoryName,
                        products: []
                    };
                }
                
                groupedProducts[categoryId].products.push(product);
            });
            
            console.log('📊 Grouped products:', Object.keys(groupedProducts).map(key => ({
                categoryId: key,
                name: groupedProducts[key].name,
                count: groupedProducts[key].products.length
            })));
            
            return groupedProducts;
        } else {
            // Mostrar solo la categoría activa
            const categoryName = categoryMap[activeCategory] || categories.find(cat => cat._id === activeCategory)?.name || 'Categoría';
            return {
                [activeCategory]: {
                    name: categoryName,
                    products: safeProducts
                }
            };
        }
    };

    /**
     * Formatea los productos para el componente CategorySection
     */
    const formatProductForSection = (product) => {
        console.log("🎨 Formateando producto:", product);

        const fallbackImage = '/placeholder-image.jpg';

        // Verificamos que haya al menos una imagen válida
        let image = fallbackImage;
        if (
            product.images &&
            Array.isArray(product.images) &&
            product.images.length > 0 &&
            product.images[0].image
        ) {
            image = product.images[0].image;
        }

        return {
            id: product._id || product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            image: image,
            stock: product.stock,
            isPersonalizable: product.isPersonalizable
        };
    };

    /**
     * Función para reintentar la carga
     */
    const handleRetry = () => {
        setError(null);
        if (activeCategory === 'todos') {
            fetchAllProducts();
        } else {
            fetchProductsByCategory(activeCategory);
        }
    };

    // Mostrar error si existe
    if (error && !isLoading) {
        return (
            <div className="min-h-screen bg-white-50">
                <Header />
                <Container>
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="text-red-500 text-lg mb-4">⚠️ {error}</div>
                            <button 
                                onClick={handleRetry}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                            >
                                Reintentar
                            </button>
                        </div>
                    </div>
                </Container>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white-50">
            {/* Header de la página */}
            <Header />

            {/* Navegación de categorías */}
            <section className="bg-white pt-2 sm:pt-4 pb-4 sm:pb-6">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                    <CategoryNavigation
                        categories={categories}
                        activeCategory={activeCategory}
                        onCategoryChange={handleCategoryChange}
                    />
                </div>
            </section>

            {/* Contenido principal */}
            <main className="py-4 sm:py-8">
                <Container>
                    {isLoading ? (
                        <LoadingSpinner 
                            text="Cargando productos..."
                            className="min-h-[300px] sm:min-h-[400px]"
                        />
                    ) : (
                        <div className="space-y-6 sm:space-y-8">
                            {/* Sección de productos personalizables - Solo mostrar en "todos" */}
                            {activeCategory === 'todos' && (
                                <PersonalizableSection
                                    onPersonalizeClick={handlePersonalizeClick}
                                />
                            )}
                            
                            {/* Renderizar secciones de productos */}
                            {Object.entries(getProductsByCategory()).map(([categoryId, categoryData]) => (
                                <div key={categoryId} id={`section-${categoryId}`}>
                                    <CategorySection
                                        title={categoryData.name}
                                        products={categoryData.products.map(formatProductForSection)}
                                        categoryId={categoryId}
                                        onProductClick={handleProductDetailClick}
                                        onViewAll={handleViewAll}
                                    />
                                </div>
                            ))}
                            
                            {/* Mensaje si no hay productos */}
                            {products.length === 0 && !isLoading && (
                                <div className="text-center py-12">
                                    <div className="text-gray-500 text-lg">
                                        No se encontraron productos
                                        {activeCategory !== 'todos' && ' en esta categoría'}
                                    </div>
                                    {activeCategory !== 'todos' && (
                                        <button
                                            onClick={() => handleCategoryChange('todos')}
                                            className="mt-4 text-blue-500 hover:text-blue-600 underline"
                                        >
                                            Ver todos los productos
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </Container>
            </main>

            {/* Footer de la página */}
            <Footer />
        </div>
    );
};

export default CategoryProducts;
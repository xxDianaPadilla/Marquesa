import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useFavorites } from "../context/FavoritesContext";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";
import CategoryNavigation from "../components/CategoryNavigation";
import PersonalizableSection from "../components/PersonalizableSection";
import LoadingSpinner from "../components/LoadingSpinner";
import Container from "../components/Container";
import ProductCard from "../components/ProductCard";

const CategoryProducts = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Estados para el manejo de la página
    const [activeCategory, setActiveCategory] = useState('todos');
    const [isLoading, setIsLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);

    // Hook de favoritos - usando todas las funciones disponibles
    const {
        favorites,
        isLoading: favoritesLoading,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        toggleFavorite,
        favoritesCount
    } = useFavorites();

    // URL base de la API
    const API_BASE_URL = process.env.NODE_ENV === 'production'
        ? '/api'
        : 'http://localhost:4000/api';

    // Configuración de categorías - memoizada para evitar recreación
    const categories = useMemo(() => [
        { _id: 'todos', name: 'Todos' },
        { _id: '688175a69579a7cde1657aaa', name: 'Arreglos con flores naturales' },
        { _id: '688175d89579a7cde1657ac2', name: 'Arreglos con flores secas' },
        { _id: '688175fd9579a7cde1657aca', name: 'Cuadros decorativos' },
        { _id: '688176179579a7cde1657ace', name: 'Giftboxes' },
        { _id: '688175e79579a7cde1657ac6', name: 'Tarjetas' }
    ], []);

    const categoryMap = useMemo(() => ({
        '688175a69579a7cde1657aaa': 'Arreglos con flores naturales',
        '688175d89579a7cde1657ac2': 'Arreglos con flores secas',
        '688175fd9579a7cde1657aca': 'Cuadros decorativos',
        '688176179579a7cde1657ace': 'Giftboxes',
        '688175e79579a7cde1657ac6': 'Tarjetas'
    }), []);

    /**
     * Función optimizada para obtener todos los productos
     */
    const fetchAllProducts = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            console.log('🔄 Fetching all products...');

            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📦 All products response:', data);

            const productsData = Array.isArray(data) ? data : (data.products || data.data || []);

            console.log('📊 Total products loaded:', productsData.length);
            setProducts(productsData);

        } catch (error) {
            console.error('❌ Error fetching all products:', error);
            setError('Error al cargar todos los productos. Por favor, inténtalo de nuevo.');
            setProducts([]);
            
            // Toast de error
            toast.error('Error al cargar productos', {
                duration: 3000,
                position: 'top-center',
            });
        } finally {
            setIsLoading(false);
        }
    }, [API_BASE_URL]);

    /**
     * Función optimizada para obtener productos por categoría
     */
    const fetchProductsByCategory = useCallback(async (categoryId) => {
        try {
            setIsLoading(true);
            setError(null);
            console.log('🔄 Fetching products for category:', categoryId);

            const response = await fetch(`${API_BASE_URL}/products/by-category/${categoryId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(`📦 Products for category ${categoryId}:`, data);

            const productsData = Array.isArray(data) ? data : (data.products || data.data || []);

            console.log(`📊 Products loaded for category ${categoryId}:`, productsData.length);
            setProducts(productsData);

        } catch (error) {
            console.error(`❌ Error fetching products for category ${categoryId}:`, error);
            setError(`Error al cargar los productos de esta categoría`);
            setProducts([]);
            
            // Toast de error
            toast.error('Error al cargar productos de la categoría', {
                duration: 3000,
                position: 'top-center',
            });
        } finally {
            setIsLoading(false);
        }
    }, [API_BASE_URL]);

    /**
     * Determina la categoría inicial basada en la URL - memoizada
     */
    const getInitialCategory = useCallback(() => {
        const pathParts = location.pathname.split('/');
        if (pathParts[1] === 'categoria' && pathParts[2]) {
            return pathParts[2];
        }
        return 'todos';
    }, [location.pathname]);

    /**
     * Maneja el toggle de favorito con mejor feedback y validación
     */
    const handleToggleFavorite = useCallback(async (product) => {
        try {
            // Validación del producto
            if (!product || (!product._id && !product.id)) {
                console.error('❌ Producto inválido para favoritos:', product);
                toast.error('Error: Producto inválido', {
                    duration: 2000,
                    position: 'top-center',
                });
                return;
            }

            const productId = product._id || product.id;
            const wasCurrentlyFavorite = isFavorite(productId);

            console.log('❤️ Toggle favorite for product:', {
                id: productId,
                name: product.name,
                wasCurrentlyFavorite
            });

            // Realizar el toggle
            const result = toggleFavorite(product);

            // Feedback mejorado basado en el resultado
            if (wasCurrentlyFavorite) {
                // Se removió de favoritos
                toast.success(`${product.name} eliminado de favoritos`, {
                    duration: 2000,
                    position: 'top-center',
                    icon: '💔',
                    style: {
                        background: '#6B7280',
                        color: '#fff',
                    },
                });
                console.log('❌ Producto removido de favoritos');
            } else {
                // Se agregó a favoritos
                toast.success(`¡${product.name} agregado a favoritos!`, {
                    duration: 2000,
                    position: 'top-center',
                    icon: '❤️',
                    style: {
                        background: '#EC4899',
                        color: '#fff',
                    },
                });
                console.log('✅ Producto agregado a favoritos');
            }

            // Log del estado actual de favoritos
            console.log(`📊 Total favoritos: ${favoritesCount}`);

        } catch (error) {
            console.error('❌ Error al manejar favoritos:', error);
            toast.error('Error al actualizar favoritos', {
                duration: 3000,
                position: 'top-center',
                icon: '❌'
            });
        }
    }, [isFavorite, toggleFavorite, favoritesCount]);

    /**
     * Effect para cargar datos basado en la URL
     */
    useEffect(() => {
        console.log('🚀 Loading data based on URL change...');

        const initialCategory = getInitialCategory();
        console.log('🎯 Category from URL:', initialCategory);

        // Solo actualizar si realmente cambió la categoría
        if (initialCategory !== activeCategory) {
            setActiveCategory(initialCategory);
        }

        // Cargar productos según la categoría
        if (initialCategory === 'todos') {
            fetchAllProducts();
        } else {
            fetchProductsByCategory(initialCategory);
        }
    }, [location.pathname, getInitialCategory, fetchAllProducts, fetchProductsByCategory, activeCategory]);

    /**
     * Maneja el cambio de categoría con validación mejorada
     */
    const handleCategoryChange = useCallback(async (categoryId) => {
        // Validaciones
        if (!categoryId || categoryId === activeCategory || isLoading) {
            console.log('⚠️ Category change ignored:', { categoryId, activeCategory, isLoading });
            return;
        }

        console.log('🎯 Category changing from', activeCategory, 'to', categoryId);
        
        try {
            setActiveCategory(categoryId);
            setError(null);

            if (categoryId === 'todos') {
                await fetchAllProducts();
                navigate('/categoryProducts', { replace: true });
            } else {
                await fetchProductsByCategory(categoryId);
                navigate(`/categoria/${categoryId}`, { replace: true });
            }

            // Scroll suave al inicio
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error('❌ Error in category change:', error);
            toast.error('Error al cambiar de categoría', {
                duration: 2000,
                position: 'top-center',
            });
        }
    }, [activeCategory, isLoading, navigate, fetchAllProducts, fetchProductsByCategory]);

    /**
     * Maneja la navegación al detalle del producto
     */
    const handleProductDetailClick = useCallback((productId) => {
        if (!productId) {
            console.error('❌ No product ID provided');
            return;
        }
        console.log('🔗 Navigating to product detail:', productId);
        navigate(`/ProductDetail/${productId}`);
    }, [navigate]);

    /**
     * Maneja la navegación a personalización
     */
    const handlePersonalizeClick = useCallback((categoryId) => {
        if (!categoryId) {
            console.error('❌ No category ID provided for personalization');
            return;
        }
        console.log('🎨 Navigating to personalize category:', categoryId);
        navigate(`/personalizar/${categoryId}`);
    }, [navigate]);

    /**
     * Agrupa productos por categoría - memoizado para optimización
     */
    const productsByCategory = useMemo(() => {
        const safeProducts = Array.isArray(products) ? products : [];

        if (activeCategory === 'todos') {
            const groupedProducts = {};

            safeProducts.forEach(product => {
                let categoryId, categoryName;

                if (typeof product.categoryId === 'object' && product.categoryId._id) {
                    categoryId = product.categoryId._id;
                    categoryName = product.categoryId.name;
                } else {
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
            const categoryName = categoryMap[activeCategory] || 
                               categories.find(cat => cat._id === activeCategory)?.name || 
                               'Categoría';
            return {
                [activeCategory]: {
                    name: categoryName,
                    products: safeProducts
                }
            };
        }
    }, [products, activeCategory, categoryMap, categories]);

    /**
     * Formatea producto para ProductCard - optimizado y mejorado
     */
    const formatProductForCard = useCallback((product) => {
        if (!product) return null;

        const fallbackImage = '/placeholder-image.jpg';
        let image = fallbackImage;

        // Mejor manejo de imágenes
        if (product.images) {
            if (Array.isArray(product.images) && product.images.length > 0) {
                // Si es un array de objetos con propiedad image
                if (product.images[0].image) {
                    image = product.images[0].image;
                }
                // Si es un array de strings
                else if (typeof product.images[0] === 'string') {
                    image = product.images[0];
                }
            } 
            // Si images es un string directo
            else if (typeof product.images === 'string') {
                image = product.images;
            }
        }
        // Fallback a la propiedad image directa
        else if (product.image) {
            image = product.image;
        }

        // Extraer información de la categoría
        let categoryName = 'Sin categoría';
        if (typeof product.categoryId === 'object' && product.categoryId.name) {
            categoryName = product.categoryId.name;
        } else if (product.categoryId && categoryMap[product.categoryId]) {
            categoryName = categoryMap[product.categoryId];
        }

        const productId = product._id || product.id;

        return {
            ...product,
            id: productId,
            _id: productId,
            name: product.name || 'Producto sin nombre',
            description: product.description || '',
            price: product.price || 0,
            image: image,
            stock: product.stock,
            category: categoryName,
            isPersonalizable: product.isPersonalizable || false
        };
    }, [categoryMap]);

    /**
     * Función para reintentar la carga
     */
    const handleRetry = useCallback(() => {
        setError(null);
        if (activeCategory === 'todos') {
            fetchAllProducts();
        } else {
            fetchProductsByCategory(activeCategory);
        }
    }, [activeCategory, fetchAllProducts, fetchProductsByCategory]);

    /**
     * Renderiza la grilla de productos optimizada
     */
    const renderProductGrid = useCallback((productsToRender, categoryId) => {
        if (!productsToRender || productsToRender.length === 0) {
            return (
                <div className="text-center py-8">
                    <div className="text-gray-500 text-lg mb-2">
                        📦 No hay productos disponibles en esta categoría
                    </div>
                    <p className="text-sm text-gray-400">
                        Inténtalo más tarde o explora otras categorías
                    </p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {productsToRender.map((product) => {
                    const formattedProduct = formatProductForCard(product);
                    
                    if (!formattedProduct) {
                        console.warn('⚠️ Product could not be formatted:', product);
                        return null;
                    }

                    const productId = formattedProduct._id || formattedProduct.id;

                    return (
                        <ProductCard
                            key={`${categoryId}-${productId}`}
                            product={formattedProduct}
                            showFavoriteButton={true}
                            showRemoveButton={false}
                            isFavorite={isFavorite(productId)}
                            onToggleFavorite={() => handleToggleFavorite(formattedProduct)}
                            onClick={() => handleProductDetailClick(productId)}
                            className="transition-transform hover:scale-105"
                        />
                    );
                }).filter(Boolean)} {/* Filtrar elementos null */}
            </div>
        );
    }, [formatProductForCard, isFavorite, handleToggleFavorite, handleProductDetailClick]);

    // Loading state mejorado
    if (isLoading || favoritesLoading) {
        return (
            <div className="min-h-screen bg-white-50">
                <Header />
                <Container>
                    <LoadingSpinner
                        text={isLoading ? "Cargando productos..." : "Cargando favoritos..."}
                        className="min-h-[400px]"
                    />
                </Container>
                <Footer />
            </div>
        );
    }

    // Error state mejorado
    if (error && !isLoading) {
        return (
            <div className="min-h-screen bg-white-50">
                <Header />
                <Container>
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center max-w-md">
                            <div className="text-6xl mb-4">😔</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                ¡Ups! Algo salió mal
                            </h3>
                            <p className="text-gray-600 mb-6">{error}</p>
                            <div className="space-x-4">
                                <button
                                    onClick={handleRetry}
                                    className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium"
                                >
                                    🔄 Reintentar
                                </button>
                                <button
                                    onClick={() => handleCategoryChange('todos')}
                                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                                >
                                    🏠 Ir a inicio
                                </button>
                            </div>
                        </div>
                    </div>
                </Container>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white-50">
            <Header />

            {/* Navegación de categorías */}
            <section className="bg-white pt-2 sm:pt-4 pb-4 sm:pb-6 shadow-sm">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                    <CategoryNavigation
                        categories={categories}
                        activeCategory={activeCategory}
                        onCategoryChange={handleCategoryChange}
                    />
                    
                    {/* Indicador de favoritos */}
                    {favoritesCount > 0 && (
                        <div className="mt-4 text-center">
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pink-100 text-pink-800">
                                ❤️ {favoritesCount} producto{favoritesCount === 1 ? '' : 's'} en favoritos
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Contenido principal */}
            <main className="py-4 sm:py-8">
                <Container>
                    <div className="space-y-8 sm:space-y-12">
                        {/* Sección de personalización solo en vista "todos" */}
                        {activeCategory === 'todos' && (
                            <PersonalizableSection
                                onPersonalizeClick={handlePersonalizeClick}
                            />
                        )}

                        {/* Secciones de productos por categoría */}
                        {Object.entries(productsByCategory).map(([categoryId, categoryData]) => (
                            <section 
                                key={categoryId} 
                                id={`section-${categoryId}`} 
                                className="space-y-4 sm:space-y-6"
                            >
                                {/* Encabezado de la categoría */}
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900" 
                                        style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {categoryData.name}
                                        <span className="text-sm font-normal text-gray-500 ml-2">
                                            ({categoryData.products.length} producto{categoryData.products.length === 1 ? '' : 's'})
                                        </span>
                                    </h2>
                                    
                                    {/* Botón "Ver todos" solo en vista general y si hay más de 4 productos */}
                                    {activeCategory === 'todos' && categoryData.products.length > 4 && (
                                        <button
                                            onClick={() => handleCategoryChange(categoryId)}
                                            className="text-pink-500 hover:text-pink-600 font-medium transition-colors duration-200 flex items-center gap-1"
                                            style={{ fontFamily: 'Poppins, sans-serif' }}
                                        >
                                            Ver todos
                                            <span className="text-xs">→</span>
                                        </button>
                                    )}
                                </div>

                                {/* Grilla de productos */}
                                {renderProductGrid(
                                    activeCategory === 'todos'
                                        ? categoryData.products.slice(0, 4)
                                        : categoryData.products,
                                    categoryId
                                )}
                            </section>
                        ))}

                        {/* Estado vacío mejorado */}
                        {products.length === 0 && !isLoading && (
                            <div className="text-center py-16">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    No encontramos productos
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {activeCategory !== 'todos' 
                                        ? 'No hay productos en esta categoría por el momento'
                                        : 'No hay productos disponibles'
                                    }
                                </p>
                                {activeCategory !== 'todos' && (
                                    <button
                                        onClick={() => handleCategoryChange('todos')}
                                        className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium"
                                    >
                                        🏠 Ver todos los productos
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </Container>
            </main>

            <Footer />
        </div>
    );
};

export default CategoryProducts;
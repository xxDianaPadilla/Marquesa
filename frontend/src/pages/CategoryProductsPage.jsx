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

/**
 * CategoryProductsPage - VERSIÓN SIN CACHE
 * Siempre carga desde el servidor, como la primera vez
 */

// **VARIABLE PARA MANEJAR REQUESTS ACTIVOS (SIN CACHE)**
let currentFetch = null;

const CategoryProductsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // **CONFIGURACIÓN ESTÁTICA**
    const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:4000/api';

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

    // **FUNCIÓN PARA DETERMINAR CATEGORÍA DESDE URL**
    const getCurrentCategory = useCallback(() => {
        const pathParts = location.pathname.split('/');
        
        if (location.pathname === '/categoryProducts') {
            return 'todos';
        }
        
        if (pathParts[1] === 'categoria' && pathParts[2]) {
            return pathParts[2];
        }
        
        return 'todos';
    }, [location.pathname]);

    // **ESTADOS PRINCIPALES**
    const [activeCategory, setActiveCategory] = useState(getCurrentCategory());
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Iniciar en true para primera carga
    const [error, setError] = useState(null);
    const [favoriteToggling, setFavoriteToggling] = useState(new Set());
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false); // Para controlar primera carga

    // **HOOKS**
    const { isFavorite, toggleFavorite } = useFavorites();

    /**
     * **FUNCIÓN DE CARGA SIN CACHE - SIEMPRE DESDE SERVIDOR**
     */
    const fetchProducts = useCallback(async (categoryId) => {
        console.log(`🎯 CategoryProductsPage - Cargando productos desde servidor para: ${categoryId}`);

        // **CANCELAR FETCH ANTERIOR SI EXISTE**
        if (currentFetch) {
            console.log(`🚫 Cancelando fetch anterior: ${currentFetch.categoryId}`);
            currentFetch.controller.abort();
            currentFetch = null;
        }

        try {
            console.log(`🚀 CategoryProductsPage - Iniciando carga fresca para: ${categoryId}`);
            setIsLoading(true);
            setError(null);
            
            // **NO LIMPIAR PRODUCTOS HASTA QUE TERMINE LA CARGA**
            // setProducts([]); // ❌ Comentado para evitar parpadeo

            const controller = new AbortController();
            currentFetch = { categoryId, controller };

            // **DETERMINAR ENDPOINT**
            const endpoint = categoryId === 'todos' 
                ? `${API_BASE_URL}/products`
                : `${API_BASE_URL}/products/by-category/${categoryId}`;

            console.log(`📡 CategoryProductsPage - Fetching desde: ${endpoint}`);

            const response = await fetch(endpoint, {
                signal: controller.signal,
                headers: { 
                    'Content-Type': 'application/json',
                    // **AGREGAR HEADERS PARA EVITAR CACHE DEL NAVEGADOR**
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            let productsData = [];

            // **NORMALIZAR RESPUESTA**
            if (Array.isArray(data)) {
                productsData = data;
            } else if (data.success && Array.isArray(data.data)) {
                productsData = data.data;
            } else if (data.products && Array.isArray(data.products)) {
                productsData = data.products;
            } else if (data.data && Array.isArray(data.data)) {
                productsData = data.data;
            }

            console.log(`✅ CategoryProductsPage - ${productsData.length} productos cargados desde servidor para: ${categoryId}`);

            // **VERIFICAR QUE SIGUE SIENDO LA CATEGORÍA ACTUAL ANTES DE ACTUALIZAR**
            const currentCat = getCurrentCategory();
            if (categoryId === currentCat) {
                console.log(`🔄 CategoryProductsPage - Actualizando UI para: ${categoryId}`);
                setProducts(productsData);
                setError(null);
                setHasLoadedOnce(true); // Marcar que ya se cargó una vez
            } else {
                console.log(`⚠️ CategoryProductsPage - Categoría cambió durante fetch: ${categoryId} → ${currentCat}`);
            }

        } catch (error) {
            if (error.name === 'AbortError') {
                console.log(`🚫 CategoryProductsPage - Fetch cancelado para: ${categoryId}`);
                return;
            }

            console.error(`❌ CategoryProductsPage - Error al cargar ${categoryId}:`, error);
            
            const errorMsg = `Error al cargar ${categoryMap[categoryId] || 'productos'}`;
            
            // **SOLO MOSTRAR ERROR SI ES LA CATEGORÍA ACTUAL**
            const currentCat = getCurrentCategory();
            if (categoryId === currentCat) {
                setError(errorMsg);
                setProducts([]);
                setHasLoadedOnce(true); // Marcar como cargado aunque haya error
                toast.error(errorMsg, { duration: 3000, position: 'top-center' });
            }

        } finally {
            // **SOLO QUITAR LOADING SI ES LA CATEGORÍA ACTUAL**
            const currentCat = getCurrentCategory();
            if (categoryId === currentCat) {
                setIsLoading(false);
            }

            // **LIMPIAR FETCH ACTUAL**
            if (currentFetch && currentFetch.categoryId === categoryId) {
                currentFetch = null;
            }
        }
    }, [API_BASE_URL, categoryMap, getCurrentCategory]);

    /**
     * **EFECTO PRINCIPAL - SIEMPRE CARGA DESDE SERVIDOR**
     */
    useEffect(() => {
        const urlCategory = getCurrentCategory();
        
        console.log(`🔄 CategoryProductsPage Effect - URL: ${location.pathname}, Categoría: ${urlCategory}`);

        // **ACTUALIZAR CATEGORÍA ACTIVA SI ES DIFERENTE**
        if (urlCategory !== activeCategory) {
            console.log(`📝 CategoryProductsPage - Actualizando categoría activa: ${activeCategory} → ${urlCategory}`);
            setActiveCategory(urlCategory);
        }

        // **SIEMPRE CARGAR DESDE SERVIDOR**
        console.log(`📦 CategoryProductsPage - Cargando productos desde servidor para: ${urlCategory}`);
        fetchProducts(urlCategory);

        // **CLEANUP AL DESMONTAR O CAMBIAR**
        return () => {
            if (currentFetch) {
                console.log(`🧹 CategoryProductsPage Cleanup: cancelando fetch para ${currentFetch.categoryId}`);
                currentFetch.controller.abort();
                currentFetch = null;
            }
        };
    }, [location.pathname, getCurrentCategory, fetchProducts, activeCategory]);

    /**
     * **MANEJO DE CAMBIO DE CATEGORÍA DESDE NAVEGACIÓN**
     */
    const handleCategoryChange = useCallback((categoryId) => {
        console.log(`👆 CategoryProductsPage - Cambio de categoría solicitado: ${activeCategory} → ${categoryId}`);

        // **EVITAR CAMBIO REDUNDANTE**
        if (categoryId === activeCategory) {
            console.log(`⚠️ CategoryProductsPage - Ya estamos en la categoría: ${categoryId}`);
            return;
        }

        // **RESETEAR SOLO LOADING Y ERROR (NO PRODUCTOS PARA EVITAR PARPADEO)**
        setIsLoading(true);
        setError(null);
        // NO limpiar productos aquí para evitar parpadeo
        // setProducts([]);

        // **NAVEGAR INMEDIATAMENTE**
        if (categoryId === 'todos') {
            navigate('/categoryProducts', { replace: true });
        } else {
            navigate(`/categoria/${categoryId}`, { replace: true });
        }

        // **SCROLL SUAVE**
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
    }, [activeCategory, navigate]);

    const handlePersonalizeClick = useCallback((categoryId) => {
        console.log('🎨 CategoryProductsPage - Navegando a personalización:', categoryId);
        navigate(`/personalizar/${categoryId}`);
    }, [navigate]);

    /**
     * **FUNCIONES AUXILIARES PARA FAVORITOS**
     */
    const getProductId = useCallback((product) => {
        return product?._id || product?.id || null;
    }, []);

    const normalizeProductForFavorites = useCallback((product) => {
        if (!product) return null;

        const productId = getProductId(product);
        if (!productId) return null;

        let categoryName = 'Sin categoría';
        let categoryId = null;

        if (typeof product.categoryId === 'object' && product.categoryId) {
            categoryId = product.categoryId._id || product.categoryId.id;
            categoryName = product.categoryId.name || categoryMap[categoryId] || 'Sin categoría';
        } else if (product.categoryId && categoryMap[product.categoryId]) {
            categoryId = product.categoryId;
            categoryName = categoryMap[product.categoryId];
        }

        let image = '/placeholder-image.jpg';
        if (product.image) {
            image = product.image;
        } else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            if (product.images[0]?.image) {
                image = product.images[0].image;
            } else if (typeof product.images[0] === 'string') {
                image = product.images[0];
            }
        }

        return {
            id: productId,
            _id: productId,
            name: product.name || 'Producto sin nombre',
            description: product.description || '',
            category: categoryName,
            categoryId: categoryId,
            price: product.price || 0,
            image: image,
            images: Array.isArray(product.images) ? product.images : [],
            isPersonalizable: Boolean(product.isPersonalizable),
            ...(product.stock !== undefined && { stock: Number(product.stock) }),
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        };
    }, [getProductId, categoryMap]);

    const handleToggleFavorite = useCallback(async (product) => {
        const productId = getProductId(product);

        if (!product || !productId || favoriteToggling.has(productId)) {
            return;
        }

        try {
            setFavoriteToggling(prev => new Set([...prev, productId]));

            const normalizedProduct = normalizeProductForFavorites(product);
            if (!normalizedProduct) {
                throw new Error('No se pudo normalizar el producto');
            }

            const wasAdded = toggleFavorite(normalizedProduct);

            if (wasAdded) {
                toast.success(`¡${normalizedProduct.name} agregado a favoritos!`, {
                    duration: 2000,
                    position: 'top-center',
                    icon: '❤️',
                    style: { background: '#EC4899', color: '#fff' },
                });
            } else {
                toast.success(`${normalizedProduct.name} eliminado de favoritos`, {
                    duration: 2000,
                    position: 'top-center',
                    icon: '💔',
                    style: { background: '#6B7280', color: '#fff' },
                });
            }

        } catch (error) {
            console.error('❌ CategoryProductsPage - Error al manejar favoritos:', error);
            toast.error('Error al actualizar favoritos', {
                duration: 3000,
                position: 'top-center',
            });
        } finally {
            setFavoriteToggling(prev => {
                const newSet = new Set(prev);
                newSet.delete(productId);
                return newSet;
            });
        }
    }, [getProductId, normalizeProductForFavorites, toggleFavorite, favoriteToggling]);

    /**
     * **AGRUPACIÓN DE PRODUCTOS**
     */
    const productsByCategory = useMemo(() => {
        if (!Array.isArray(products) || products.length === 0) {
            return {};
        }

        if (activeCategory === 'todos') {
            const grouped = {};

            products.forEach(product => {
                let catId, catName;

                if (typeof product.categoryId === 'object' && product.categoryId._id) {
                    catId = product.categoryId._id;
                    catName = product.categoryId.name;
                } else {
                    catId = product.categoryId;
                    catName = categoryMap[catId] || 'Sin categoría';
                }

                if (!grouped[catId]) {
                    grouped[catId] = {
                        name: catName,
                        products: []
                    };
                }

                grouped[catId].products.push(product);
            });

            return grouped;
        } else {
            const categoryName = categoryMap[activeCategory] || 
                               categories.find(cat => cat._id === activeCategory)?.name || 
                               'Categoría';
            return {
                [activeCategory]: {
                    name: categoryName,
                    products: products
                }
            };
        }
    }, [products, activeCategory, categoryMap, categories]);

    const formatProductForCard = useCallback((product) => {
        if (!product) return null;

        const productId = getProductId(product);
        if (!productId) return null;

        let image = '/placeholder-image.jpg';
        if (product.image) {
            image = product.image;
        } else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            if (product.images[0]?.image) {
                image = product.images[0].image;
            } else if (typeof product.images[0] === 'string') {
                image = product.images[0];
            }
        }

        let categoryName = 'Sin categoría';
        if (typeof product.categoryId === 'object' && product.categoryId.name) {
            categoryName = product.categoryId.name;
        } else if (product.categoryId && categoryMap[product.categoryId]) {
            categoryName = categoryMap[product.categoryId];
        }

        return {
            ...product,
            id: productId,
            _id: productId,
            name: product.name || 'Producto sin nombre',
            description: product.description || '',
            price: product.price || 0,
            image: image,
            images: Array.isArray(product.images) ? product.images : [],
            stock: product.stock,
            category: categoryName,
            isPersonalizable: Boolean(product.isPersonalizable)
        };
    }, [getProductId, categoryMap]);

    const renderProductGrid = useCallback((productsToRender) => {
        if (!productsToRender || productsToRender.length === 0) {
            return (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📦</div>
                    <p className="text-gray-500 text-lg">No hay productos disponibles</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {productsToRender.map((product) => {
                    const formattedProduct = formatProductForCard(product);
                    
                    if (!formattedProduct) return null;

                    const productId = formattedProduct._id || formattedProduct.id;
                    const isProductFavorite = isFavorite(productId);
                    const isToggling = favoriteToggling.has(productId);

                    return (
                        <div
                            key={`categorypage-product-${productId}-${activeCategory}`}
                            className={isToggling ? 'pointer-events-none opacity-75' : ''}
                        >
                            <ProductCard
                                product={formattedProduct}
                                showFavoriteButton={true}
                                showRemoveButton={false}
                                isFavorite={isProductFavorite}
                                onToggleFavorite={() => handleToggleFavorite(formattedProduct)}
                            />
                        </div>
                    );
                }).filter(Boolean)}
            </div>
        );
    }, [formatProductForCard, isFavorite, favoriteToggling, handleToggleFavorite, activeCategory]);

    const handleRetry = useCallback(() => {
        console.log('🔄 CategoryProductsPage - Retry solicitado - Recargando desde servidor');
        setError(null);
        setHasLoadedOnce(false); // Resetear para mostrar loading completo
        
        // **CANCELAR FETCH ACTUAL SI EXISTE**
        if (currentFetch) {
            currentFetch.controller.abort();
            currentFetch = null;
        }
        
        // **CARGAR DESDE SERVIDOR**
        fetchProducts(activeCategory);
    }, [activeCategory, fetchProducts]);

    // **RENDERIZADO CONDICIONAL**
    
    // **MOSTRAR LOADING EN PRIMERA CARGA O SI NO HAY PRODUCTOS Y ESTÁ CARGANDO**
    if (isLoading && (!hasLoadedOnce || products.length === 0)) {
        return (
            <div className="min-h-screen bg-white-50">
                <Header />
                <Container>
                    <LoadingSpinner
                        text={`Cargando ${categoryMap[activeCategory] || 'productos'}...`}
                        className="min-h-[400px]"
                    />
                </Container>
                <Footer />
            </div>
        );
    }

    if (error && products.length === 0) {
        return (
            <div className="min-h-screen bg-white-50">
                <Header />
                <Container>
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="text-6xl mb-4">😔</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                ¡Ups! Algo salió mal
                            </h3>
                            <p className="text-gray-600 mb-6">{error}</p>
                            <button
                                onClick={handleRetry}
                                className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
                            >
                                🔄 Reintentar
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
            <Header />

            {/* **NAVEGACIÓN** */}
            <section className="bg-white pt-2 sm:pt-4 pb-4 sm:pb-6 shadow-sm">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                    <CategoryNavigation
                        categories={categories}
                        activeCategory={activeCategory}
                        onCategoryChange={handleCategoryChange}
                    />
                </div>
            </section>

            {/* **CONTENIDO PRINCIPAL** */}
            <main className="py-4 sm:py-8 relative">
                <Container>
                    <div className="space-y-8 sm:space-y-12">

                        {/* **SECCIÓN DE PERSONALIZACIÓN** */}
                        {activeCategory === 'todos' && (
                            <PersonalizableSection
                                onPersonalizeClick={handlePersonalizeClick}
                            />
                        )}

                        {/* **OVERLAY DE CARGA SUTIL** */}
                        {isLoading && hasLoadedOnce && (
                            <div className="absolute inset-0 bg-white/30 backdrop-blur-[0.5px] z-10 pointer-events-none">
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <div className="flex flex-col items-center space-y-3">
                                        {/* Spinner principal */}
                                        <div className="relative">
                                            <div className="w-8 h-8 border-3 border-pink-200 rounded-full"></div>
                                            <div className="absolute top-0 left-0 w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                        {/* Puntos animados */}
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* **SECCIONES DE PRODUCTOS** */}
                        {Object.entries(productsByCategory).map(([categoryId, categoryData]) => (
                            <section 
                                key={`categorypage-section-${categoryId}-${activeCategory}`}
                                className={`space-y-4 sm:space-y-6 transition-opacity duration-300 ${
                                    isLoading && hasLoadedOnce ? 'opacity-70' : 'opacity-100'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <h2 
                                        className="text-2xl sm:text-3xl font-bold text-gray-900" 
                                        style={{ fontFamily: 'Poppins, sans-serif' }}
                                    >
                                        {categoryData.name}
                                        <span className="text-sm font-normal text-gray-500 ml-2">
                                            ({categoryData.products.length} producto{categoryData.products.length === 1 ? '' : 's'})
                                        </span>
                                    </h2>
                                    
                                    {activeCategory === 'todos' && categoryData.products.length > 4 && (
                                        <button
                                            onClick={() => handleCategoryChange(categoryId)}
                                            disabled={isLoading}
                                            className="text-pink-500 hover:text-pink-600 font-medium transition-colors disabled:opacity-50"
                                            style={{ fontFamily: 'Poppins, sans-serif' }}
                                        >
                                            Ver todos →
                                        </button>
                                    )}
                                </div>

                                {renderProductGrid(
                                    activeCategory === 'todos'
                                        ? categoryData.products.slice(0, 4)
                                        : categoryData.products
                                )}
                            </section>
                        ))}

                        {/* **ESTADO VACÍO - SOLO SI YA CARGÓ Y NO HAY PRODUCTOS** */}
                        {Object.keys(productsByCategory).length === 0 && !isLoading && hasLoadedOnce && (
                            <div className="text-center py-16">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    No encontramos productos
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {activeCategory !== 'todos' 
                                        ? 'No hay productos en esta categoría'
                                        : 'No hay productos disponibles'
                                    }
                                </p>
                                {activeCategory !== 'todos' && (
                                    <button
                                        onClick={() => handleCategoryChange('todos')}
                                        className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
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

            {/* **ESTILOS PERSONALIZADOS PARA ANIMACIONES** */}
            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                
                .animate-shimmer {
                    animation: shimmer 1.5s infinite;
                }
                
                .border-3 {
                    border-width: 3px;
                }
                
                /* Animación de entrada suave para el indicador */
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                .animate-slide-in {
                    animation: slideInRight 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default CategoryProductsPage;
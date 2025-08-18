// Importación de React y hooks necesarios
import React, { useState, useEffect, useCallback, useMemo } from "react";
// Importación de hooks de navegación de React Router
import { useNavigate, useLocation } from "react-router-dom";
// Importación de biblioteca para notificaciones
import toast from "react-hot-toast";
// Importación del contexto de favoritos personalizado
import { useFavorites } from "../context/FavoritesContext";
// Importación del contexto de autenticación global
import { useAuth } from "../context/AuthContext";
// Importación de componentes propios
import Header from "../components/Header/Header";
import Footer from "../components/Footer";
import CategoryNavigation from "../components/CategoryNavigation";
import PersonalizableSection from "../components/PersonalizableSection";
import LoadingSpinner from "../components/LoadingSpinner";
import Container from "../components/Container";
import ProductCard from "../components/ProductCard";

// Variable global para controlar fetch activo y evitar múltiples peticiones simultáneas
let currentFetch = null;

// Componente principal para página de productos por categorías
const CategoryProductsPage = () => {
    // Hook para navegación programática
    const navigate = useNavigate();
    // Hook para obtener información de ubicación actual
    const location = useLocation();
    
    // URL base del API para realizar peticiones
    const API_BASE_URL = 'https://marquesa.onrender.com/api';
    
    // Obtener estado de autenticación del contexto
    const { isAuthenticated } = useAuth();

    // Definir categorías base usando useMemo para optimización de rendimiento
    const categories = useMemo(() => [
        { _id: 'todos', name: 'Todos' },
        { _id: '688175a69579a7cde1657aaa', name: 'Arreglos con flores naturales' },
        { _id: '688175d89579a7cde1657ac2', name: 'Arreglos con flores secas' },
        { _id: '688175fd9579a7cde1657aca', name: 'Cuadros decorativos' },
        { _id: '688176179579a7cde1657ace', name: 'Giftboxes' },
        { _id: '688175e79579a7cde1657ac6', name: 'Tarjetas' }
    ], []);

    // Mapeo de IDs de categorías a nombres usando useMemo para optimización
    const categoryMap = useMemo(() => ({
        '688175a69579a7cde1657aaa': 'Arreglos con flores naturales',
        '688175d89579a7cde1657ac2': 'Arreglos con flores secas',
        '688175fd9579a7cde1657aca': 'Cuadros decorativos',
        '688176179579a7cde1657ace': 'Giftboxes',
        '688175e79579a7cde1657ac6': 'Tarjetas'
    }), []);

    // Función para obtener categoría actual desde la URL
    const getCurrentCategory = useCallback(() => {
        // Dividir pathname en partes para analizar estructura de URL
        const pathParts = location.pathname.split('/');
        
        // Verificar si está en la ruta base de productos por categoría
        if (location.pathname === '/categoryProducts') {
            return 'todos';
        }
        
        // Verificar si está en ruta específica de categoría (/categoria/id)
        if (pathParts[1] === 'categoria' && pathParts[2]) {
            return pathParts[2];
        }
        
        // Retornar 'todos' como valor por defecto
        return 'todos';
    }, [location.pathname]);

    // Estados del componente
    const [activeCategory, setActiveCategory] = useState(getCurrentCategory());
    // Lista de productos obtenidos del servidor
    const [products, setProducts] = useState([]);
    // Estado de carga inicial
    const [isLoading, setIsLoading] = useState(true);
    // Estado de error para mostrar mensajes de error
    const [error, setError] = useState(null);
    // Set para controlar qué favoritos están siendo procesados
    const [favoriteToggling, setFavoriteToggling] = useState(new Set());
    // Flag para controlar si ya se cargó al menos una vez
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

    // Desestructurar funciones del contexto de favoritos
    const { isFavorite, toggleFavorite } = useFavorites();

    // Función para obtener productos desde el servidor
    const fetchProducts = useCallback(async (categoryId) => {
        // Log del inicio de carga de productos con prefijo de componente
        console.log(`CategoryProductsPage - Cargando productos desde servidor para: ${categoryId}`);

        // Cancelar fetch anterior si existe para evitar race conditions
        if (currentFetch) {
            console.log(`Cancelando fetch anterior: ${currentFetch.categoryId}`);
            currentFetch.controller.abort();
            currentFetch = null;
        }

        try {
            // Log del inicio de carga fresca
            console.log(`CategoryProductsPage - Iniciando carga fresca para: ${categoryId}`);
            // Activar estado de carga
            setIsLoading(true);
            // Limpiar errores previos
            setError(null);

            // Crear controlador para poder cancelar petición si es necesario
            const controller = new AbortController();
            // Almacenar referencia del fetch actual con su controlador
            currentFetch = { categoryId, controller };

            // Determinar endpoint según si es vista general o categoría específica
            const endpoint = categoryId === 'todos' 
                ? `${API_BASE_URL}/products`
                : `${API_BASE_URL}/products/by-category/${categoryId}`;

            // Log del endpoint que se va a consultar
            console.log(`CategoryProductsPage - Fetching desde: ${endpoint}`);

            // Realizar petición HTTP con configuración completa de headers
            const response = await fetch(endpoint, {
                method: 'GET',
                signal: controller.signal,
                credentials: 'include',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            // Verificar si la respuesta HTTP es exitosa
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Parsear respuesta JSON del servidor
            const data = await response.json();
            // Inicializar array para almacenar productos
            let productsData = [];

            // Extraer productos de diferentes estructuras de respuesta del servidor
            if (Array.isArray(data)) {
                productsData = data;
            } else if (data.success && Array.isArray(data.data)) {
                productsData = data.data;
            } else if (data.products && Array.isArray(data.products)) {
                productsData = data.products;
            } else if (data.data && Array.isArray(data.data)) {
                productsData = data.data;
            }

            // Log de productos cargados exitosamente
            console.log(`CategoryProductsPage - ${productsData.length} productos cargados desde servidor para: ${categoryId}`);

            // Verificar que la categoría actual siga siendo la misma antes de actualizar estado
            const currentCat = getCurrentCategory();
            if (categoryId === currentCat) {
                // Log de actualización de UI
                console.log(`CategoryProductsPage - Actualizando UI para: ${categoryId}`);
                // Actualizar estados con productos obtenidos
                setProducts(productsData);
                setError(null);
                // Marcar que ya se cargó al menos una vez
                setHasLoadedOnce(true);
            } else {
                // Log de cambio de categoría durante fetch
                console.log(`CategoryProductsPage - Categoría cambió durante fetch: ${categoryId} → ${currentCat}`);
            }

        } catch (error) {
            // Verificar si el error es por cancelación de petición
            if (error.name === 'AbortError') {
                console.log(`CategoryProductsPage - Fetch cancelado para: ${categoryId}`);
                return;
            }

            // Log de error al cargar productos
            console.error(`CategoryProductsPage - Error al cargar ${categoryId}:`, error);
            
            // Crear mensaje de error personalizado según categoría
            const errorMsg = `Error al cargar ${categoryMap[categoryId] || 'productos'}`;
            
            // Verificar que la categoría actual siga siendo la misma antes de actualizar estado
            const currentCat = getCurrentCategory();
            if (categoryId === currentCat) {
                // Establecer error en el estado
                setError(errorMsg);
                // Limpiar productos
                setProducts([]);
                // Marcar que ya se cargó al menos una vez
                setHasLoadedOnce(true);
                // Mostrar notificación de error
                toast.error(errorMsg, { duration: 3000, position: 'top-center' });
            }

        } finally {
            // Verificar categoría actual antes de desactivar loading
            const currentCat = getCurrentCategory();
            if (categoryId === currentCat) {
                setIsLoading(false);
            }

            // Limpiar referencia de fetch actual si corresponde
            if (currentFetch && currentFetch.categoryId === categoryId) {
                currentFetch = null;
            }
        }
    }, [API_BASE_URL, categoryMap, getCurrentCategory]);

    // Effect para carga constante de productos
    useEffect(() => {
        // Obtener categoría actual de la URL
        const urlCategory = getCurrentCategory();
        
        // Log del effect principal con información de estado
        console.log(`CategoryProductsPage Effect - URL: ${location.pathname}, Categoría: ${urlCategory}`);

        // Actualizar categoría activa si cambió
        if (urlCategory !== activeCategory) {
            console.log(`CategoryProductsPage - Actualizando categoría activa: ${activeCategory} → ${urlCategory}`);
            setActiveCategory(urlCategory);
        }

        // Log de carga de productos desde servidor
        console.log(`CategoryProductsPage - Cargando productos desde servidor para: ${urlCategory}`);
        // Ejecutar fetch de productos para la categoría actual
        fetchProducts(urlCategory);

        // Función de limpieza para cancelar fetch al desmontar componente
        return () => {
            if (currentFetch) {
                console.log(`CategoryProductsPage Cleanup: cancelando fetch para ${currentFetch.categoryId}`);
                currentFetch.controller.abort();
                currentFetch = null;
            }
        };
    }, [location.pathname, getCurrentCategory, fetchProducts, activeCategory]);

    // Función para manejar cambio de categorías
    const handleCategoryChange = useCallback((categoryId) => {
        // Log del cambio de categoría solicitado
        console.log(`CategoryProductsPage - Cambio de categoría solicitado: ${activeCategory} → ${categoryId}`);

        // Verificar si ya está en la categoría solicitada
        if (categoryId === activeCategory) {
            console.log(`CategoryProductsPage - Ya estamos en la categoría: ${categoryId}`);
            return;
        }

        // Activar loading y limpiar error
        setIsLoading(true);
        setError(null);

        // Navegar a la nueva categoría
        if (categoryId === 'todos') {
            navigate('/categoryProducts', { replace: true });
        } else {
            navigate(`/categoria/${categoryId}`, { replace: true });
        }

        // Scroll suave hacia arriba después de un breve delay
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
    }, [activeCategory, navigate]);

    // Función para manejar clic en productos personalizados
    const handlePersonalizeClick = useCallback((categoryId) => {
        // Log de navegación a personalización
        console.log('CategoryProductsPage - Navegando a personalización:', categoryId);
        // Navegar a página de personalización
        navigate(`/personalizar/${categoryId}`);
    }, [navigate]);

    // Función para obtener ID de producto de manera consistente
    const getProductId = useCallback((product) => {
        // Retornar _id o id según disponibilidad
        return product?._id || product?.id || null;
    }, []);

    // Función para normalizar producto para el manejo de favoritos
    const normalizeProductForFavorites = useCallback((product) => {
        // Verificar que el producto exista
        if (!product) return null;

        // Obtener ID del producto
        const productId = getProductId(product);
        // Verificar que tenga ID válido
        if (!productId) return null;

        // Inicializar variables para información de categoría
        let categoryName = 'Sin categoría';
        let categoryId = null;

        // Extraer información de categoría de diferentes estructuras
        if (typeof product.categoryId === 'object' && product.categoryId) {
            categoryId = product.categoryId._id || product.categoryId.id;
            categoryName = product.categoryId.name || categoryMap[categoryId] || 'Sin categoría';
        } else if (product.categoryId && categoryMap[product.categoryId]) {
            categoryId = product.categoryId;
            categoryName = categoryMap[product.categoryId];
        }

        // Determinar imagen del producto
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

        // Retornar producto normalizado con toda la información necesaria
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
            // Incluir stock solo si está definido
            ...(product.stock !== undefined && { stock: Number(product.stock) }),
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        };
    }, [getProductId, categoryMap]);

    // Función para manejar toggle de favoritos con validación de autenticación
    const handleToggleFavorite = useCallback(async (product) => {
        // Obtener ID del producto
        const productId = getProductId(product);

        // Verificar prerrequisitos básicos
        if (!product || !productId || favoriteToggling.has(productId)) {
            return;
        }

        // Validar que el usuario esté autenticado
        if (!isAuthenticated) {
            // Mostrar notificación de error por falta de autenticación
            toast.error('Debes iniciar sesión para agregar productos a favoritos', {
                duration: 4000,
                position: 'top-center',
                style: {
                    background: '#F59E0B',
                    color: '#fff',
                },
            });
            return;
        }

        try {
            // Agregar producto al set de favoritos en proceso
            setFavoriteToggling(prev => new Set([...prev, productId]));

            // Normalizar producto para favoritos
            const normalizedProduct = normalizeProductForFavorites(product);
            if (!normalizedProduct) {
                throw new Error('No se pudo normalizar el producto');
            }

            // Verificar estado actual de favorito
            const wasCurrentlyFavorite = isFavorite(productId);

            // Log del toggle de favorito
            console.log('Toggle favorite for product:', {
                id: normalizedProduct._id,
                name: normalizedProduct.name,
                wasCurrentlyFavorite: wasCurrentlyFavorite
            });

            // Ejecutar toggle de favorito
            const wasAdded = await toggleFavorite(normalizedProduct);

            // Mostrar notificación según acción realizada
            if (wasCurrentlyFavorite) {
                // Notificación para remoción de favorito
                toast.success(`${normalizedProduct.name} eliminado de favoritos`, {
                    duration: 3000,
                    position: 'top-center',
                    style: {
                        background: '#6B7280',
                        color: '#fff',
                    },
                });
                console.log('Producto removido de favoritos');
            } else {
                // Notificación para adición a favoritos
                toast.success(`${normalizedProduct.name} agregado a favoritos`, {
                    duration: 3000,
                    position: 'top-center',
                    style: {
                        background: '#EC4899',
                        color: '#fff',
                    },
                });
                console.log('Producto agregado a favoritos');
            }

        } catch (error) {
            // Log de error al manejar favoritos
            console.error('CategoryProductsPage - Error al manejar favoritos:', error);
            
            // Determinar mensaje de error específico
            let errorMessage = 'Error al actualizar favoritos';
            if (error.message?.includes('storage')) {
                errorMessage = 'Error de almacenamiento. Verifica el espacio disponible';
            } else if (error.message) {
                errorMessage = error.message;
            }

            // Mostrar notificación de error
            toast.error(errorMessage, {
                duration: 3000,
                position: 'top-center'
            });
        } finally {
            // Remover producto del set de favoritos en proceso
            setFavoriteToggling(prev => {
                const newSet = new Set(prev);
                newSet.delete(productId);
                return newSet;
            });
        }
    }, [getProductId, normalizeProductForFavorites, toggleFavorite, favoriteToggling, isFavorite, isAuthenticated]);

    // Función para obtener productos agrupados por categoría
    const productsByCategory = useMemo(() => {
        // Verificar que existan productos
        if (!Array.isArray(products) || products.length === 0) {
            return {};
        }

        // Manejar vista de todas las categorías
        if (activeCategory === 'todos') {
            // Inicializar objeto de agrupación
            const grouped = {};

            // Agrupar productos por categoría
            products.forEach(product => {
                let catId, catName;

                // Extraer información de categoría
                if (typeof product.categoryId === 'object' && product.categoryId._id) {
                    catId = product.categoryId._id;
                    catName = product.categoryId.name;
                } else {
                    catId = product.categoryId;
                    catName = categoryMap[catId] || 'Sin categoría';
                }

                // Crear grupo si no existe
                if (!grouped[catId]) {
                    grouped[catId] = {
                        name: catName,
                        products: []
                    };
                }

                // Agregar producto al grupo
                grouped[catId].products.push(product);
            });

            return grouped;
        } else {
            // Manejar vista de categoría específica
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

    // Función para formatear producto para ProductCard
    const formatProductForCard = useCallback((product) => {
        // Verificar que el producto exista
        if (!product) return null;

        // Obtener ID del producto
        const productId = getProductId(product);
        if (!productId) return null;

        // Determinar imagen del producto
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

        // Determinar nombre de categoría
        let categoryName = 'Sin categoría';
        if (typeof product.categoryId === 'object' && product.categoryId.name) {
            categoryName = product.categoryId.name;
        } else if (product.categoryId && categoryMap[product.categoryId]) {
            categoryName = categoryMap[product.categoryId];
        }

        // Retornar producto formateado para ProductCard
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

    // Función para renderizar grid de productos
    const renderProductGrid = useCallback((productsToRender) => {
        // Verificar que existan productos para renderizar
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
                    // Formatear producto para la card
                    const formattedProduct = formatProductForCard(product);
                    
                    // Verificar que el formateo fue exitoso
                    if (!formattedProduct) return null;

                    // Obtener información de favorito
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
                }).filter(Boolean)} {/* Filtrar elementos null/undefined */}
            </div>
        );
    }, [formatProductForCard, isFavorite, favoriteToggling, handleToggleFavorite, activeCategory]);

    // Función para manejar reintento manual de carga
    const handleRetry = useCallback(() => {
        // Log de retry solicitado
        console.log('CategoryProductsPage - Retry solicitado - Recargando desde servidor');
        // Limpiar error y flag de carga
        setError(null);
        setHasLoadedOnce(false);
        
        // Cancelar fetch actual si existe
        if (currentFetch) {
            currentFetch.controller.abort();
            currentFetch = null;
        }
        
        // Recargar productos para categoría activa
        fetchProducts(activeCategory);
    }, [activeCategory, fetchProducts]);


    // Renderizar estado de carga inicial
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

    // Renderizar estado de error cuando no hay productos
    if (error && products.length === 0) {
        return (
            <div className="min-h-screen bg-white-50">
                <Header />
                <Container>
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="text-6xl mb-4">😔</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                Ups! Algo salió mal
                            </h3>
                            <p className="text-gray-600 mb-6">{error}</p>
                            <button
                                onClick={handleRetry}
                                className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
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

    // Renderizar contenido principal de la página
    return (
        <div className="min-h-screen bg-white-50">
            <Header />

            {/* Sección de navegación de categorías */}
            <section className="bg-white pt-2 sm:pt-4 pb-4 sm:pb-6 shadow-sm">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                    <CategoryNavigation
                        categories={categories}
                        activeCategory={activeCategory}
                        onCategoryChange={handleCategoryChange}
                    />
                </div>
            </section>

            {/* Contenido principal con overlay de loading para recarga */}
            <main className="py-4 sm:py-8 relative">
                <Container>
                    <div className="space-y-8 sm:space-y-12">

                        {/* Mostrar sección de personalizables solo en vista 'todos' */}
                        {activeCategory === 'todos' && (
                            <PersonalizableSection
                                onPersonalizeClick={handlePersonalizeClick}
                            />
                        )}

                        {/* Overlay de loading para cuando ya se cargó una vez pero se está recargando */}
                        {isLoading && hasLoadedOnce && (
                            <div className="absolute inset-0 bg-white/30 backdrop-blur-[0.5px] z-10 pointer-events-none">
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <div className="flex flex-col items-center space-y-3">
                                        {/* Spinner personalizado */}
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

                        {/* Renderizar secciones de productos por categoría */}
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
                                    
                                    {/* Botón 'Ver todos' solo en vista general con más de 4 productos */}
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

                                {/* Renderizar grid de productos */}
                                {renderProductGrid(
                                    activeCategory === 'todos'
                                        ? categoryData.products.slice(0, 4) // Mostrar solo 4 en vista general
                                        : categoryData.products // Mostrar todos en vista específica
                                )}
                            </section>
                        ))}

                        {/* Mostrar mensaje cuando no hay productos y ya se cargó una vez */}
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
                                {/* Botón para volver a vista general si está en categoría específica */}
                                {activeCategory !== 'todos' && (
                                    <button
                                        onClick={() => handleCategoryChange('todos')}
                                        className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
                                    >
                                        Ver todos los productos
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </Container>
            </main>

            <Footer />

            {/* Estilos CSS personalizados para animaciones */}
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

// Exportar componente como default
export default CategoryProductsPage;
// Importación de React y hooks necesarios
import React, { useState, useEffect, useCallback, useMemo } from "react";
// Importación de hooks de navegación de React Router
import { useNavigate, useLocation, useParams } from "react-router-dom";
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
 
// Variable global para controlar fetch activo y evitar múltiples peticiones
let currentFetch = null;
 
// Componente principal para mostrar productos por categoría
const CategoryProducts = () => {
    // Hook para navegación programática
    const navigate = useNavigate();
    // Hook para obtener información de ubicación actual
    const location = useLocation();
    // Hook para obtener parámetros de la URL
    const params = useParams();
 
    // URL base del API para realizar peticiones
    const API_BASE_URL = 'https://marquesa.onrender.com/api';
   
    // Obtener estado de autenticación del contexto
    const { isAuthenticated } = useAuth();
 
    // Definir categorías disponibles usando useMemo para optimización
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
        // Dividir pathname en partes para analizar estructura
        const pathParts = location.pathname.split('/');
       
        // Verificar si está en la ruta base de productos por categoría
        if (location.pathname === '/categoryProducts') {
            return 'todos';
        }
       
        // Verificar si está en ruta específica de categoría
        if (pathParts[1] === 'categoria' && pathParts[2]) {
            return pathParts[2];
        }
       
        // Verificar si hay categoryId en los parámetros
        if (params.categoryId) {
            return params.categoryId;
        }
       
        // Retornar 'todos' como valor por defecto
        return 'todos';
    }, [location.pathname, params.categoryId]);
 
    // Estados del componente
    const [activeCategory, setActiveCategory] = useState(getCurrentCategory());
    // Lista de productos obtenidos del servidor
    const [products, setProducts] = useState([]);
    // Estado de carga para mostrar spinner
    const [isLoading, setIsLoading] = useState(false);
    // Estado de error para mostrar mensajes de error
    const [error, setError] = useState(null);
    // Set para controlar qué favoritos están siendo procesados
    const [favoriteToggling, setFavoriteToggling] = useState(new Set());
 
    // Desestructurar funciones del contexto de favoritos
    const { isFavorite, toggleFavorite } = useFavorites();
 
    // Función para cargar productos desde el servidor
    const loadProducts = useCallback(async (categoryId) => {
        // Log del inicio de carga de productos
        console.log(`Cargando productos desde servidor para: ${categoryId}`);
 
        // Cancelar fetch anterior si existe
        if (currentFetch) {
            console.log(`Cancelando fetch anterior: ${currentFetch.categoryId}`);
            currentFetch.controller.abort();
            currentFetch = null;
        }
 
        try {
            // Log del inicio de carga fresca
            console.log(`Iniciando carga fresca para: ${categoryId}`);
            // Activar estado de carga
            setIsLoading(true);
            // Limpiar errores previos
            setError(null);
 
            // Crear controlador para cancelar petición si es necesario
            const controller = new AbortController();
            // Almacenar referencia del fetch actual
            currentFetch = { categoryId, controller };
 
            // Determinar endpoint según categoría
            const endpoint = categoryId === 'todos'
                ? `${API_BASE_URL}/products`
                : `${API_BASE_URL}/products/by-category/${categoryId}`;
 
            // Log del endpoint que se va a consultar
            console.log(`Fetching desde: ${endpoint}`);
 
            // Realizar petición HTTP con configuración completa
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
 
            // Verificar si la respuesta es exitosa
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
 
            // Parsear respuesta JSON
            const data = await response.json();
            // Inicializar array para productos
            let productsData = [];
 
            // Extraer productos de diferentes estructuras de respuesta
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
            console.log(`${productsData.length} productos cargados desde servidor para: ${categoryId}`);
 
            // Verificar que la categoría actual siga siendo la misma
            const currentCat = getCurrentCategory();
            if (categoryId === currentCat) {
                // Log de actualización de UI
                console.log(`Actualizando UI para: ${categoryId}`);
                // Actualizar estados con productos obtenidos
                setProducts(productsData);
                setError(null);
            } else {
                // Log de cambio de categoría durante fetch
                console.log(`Categoría cambió durante fetch: ${categoryId} → ${currentCat}`);
            }
 
        } catch (error) {
            // Verificar si el error es por cancelación
            if (error.name === 'AbortError') {
                console.log(`Fetch cancelado para: ${categoryId}`);
                return;
            }
 
            // Log de error al cargar productos
            console.error(`Error al cargar ${categoryId}:`, error);
           
            // Crear mensaje de error personalizado según categoría
            const errorMsg = `Error al cargar ${categoryMap[categoryId] || 'productos'}`;
           
            // Verificar que la categoría actual siga siendo la misma antes de actualizar estado
            const currentCat = getCurrentCategory();
            if (categoryId === currentCat) {
                // Establecer error en el estado
                setError(errorMsg);
                // Limpiar productos
                setProducts([]);
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
 
    // Effect para mantener carga de categorías constante
    useEffect(() => {
        // Obtener categoría actual de la URL
        const urlCategory = getCurrentCategory();
       
        // Log del effect principal
        console.log(`Effect principal - URL: ${location.pathname}, Categoría: ${urlCategory}`);
 
        // Actualizar categoría activa si cambió
        if (urlCategory !== activeCategory) {
            console.log(`Actualizando categoría activa: ${activeCategory} → ${urlCategory}`);
            setActiveCategory(urlCategory);
        }
 
        // Log de carga de productos
        console.log(`Cargando productos desde servidor para: ${urlCategory}`);
        // Cargar productos para la categoría actual
        loadProducts(urlCategory);
 
        // Función de limpieza para cancelar fetch al desmontar
        return () => {
            if (currentFetch) {
                console.log(`Cleanup: cancelando fetch para ${currentFetch.categoryId}`);
                currentFetch.controller.abort();
                currentFetch = null;
            }
        };
    }, [location.pathname, getCurrentCategory, loadProducts, activeCategory]);
 
    // Función para manejar cambio de categoría
    const handleCategoryChange = useCallback((categoryId) => {
        // Log del cambio solicitado
        console.log(`Cambio de categoría solicitado: ${activeCategory} → ${categoryId}`);
 
        // Verificar si ya está en la categoría solicitada
        if (categoryId === activeCategory) {
            console.log(`Ya estamos en la categoría: ${categoryId}`);
            return;
        }
 
        // Activar loading y limpiar estados
        setIsLoading(true);
        setError(null);
        setProducts([]);
 
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
 
    // Función para manejar clic en productos personalizables
    const handlePersonalizeClick = useCallback((categoryId) => {
        // Log de navegación a personalización
        console.log('Navegando a personalización:', categoryId);
        // Navegar a página de personalización
        navigate(`/personalizar/${categoryId}`);
    }, [navigate]);
 
    // Función para obtener ID de producto de manera consistente
    const getProductId = useCallback((product) => {
        // Retornar _id o id según disponibilidad
        return product?._id || product?.id || null;
    }, []);
 
    // Función para normalizar producto para favoritos
    const normalizeProductForFavorites = useCallback((product) => {
        // Verificar que el producto exista
        if (!product) return null;
 
        // Obtener ID del producto
        const productId = getProductId(product);
        // Verificar que tenga ID válido
        if (!productId) return null;
 
        // Inicializar variables para categoría
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
 
        // Retornar producto normalizado
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
                icon: '🔒',
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
                    icon: '💔',
                    style: {
                        background: '#6B7280',
                        color: '#fff',
                    },
                });
                console.log('Producto removido de favoritos');
            } else {
                // Notificación para adición a favoritos
                toast.success(`¡${normalizedProduct.name} agregado a favoritos!`, {
                    duration: 3000,
                    position: 'top-center',
                    icon: '❤️',
                    style: {
                        background: '#EC4899',
                        color: '#fff',
                    },
                });
                console.log('Producto agregado a favoritos');
            }
 
        } catch (error) {
            // Log de error al manejar favoritos
            console.error('Error al manejar favoritos:', error);
           
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
                position: 'top-center',
                icon: '⚠'
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
 
        // Retornar producto formateado
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
                            key={`product-${productId}-${activeCategory}`}
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
        console.log('Retry solicitado - Recargando desde servidor');
        // Limpiar error
        setError(null);
       
        // Cancelar fetch actual si existe
        if (currentFetch) {
            currentFetch.controller.abort();
            currentFetch = null;
        }
       
        // Recargar productos para categoría activa
        loadProducts(activeCategory);
    }, [activeCategory, loadProducts]);
 

    // Renderizar estado de carga
    if (isLoading) {
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
 
    // Renderizar estado de error
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
 
            {/* Contenido principal */}
            <main className="py-4 sm:py-8">
                <Container>
                    <div className="space-y-8 sm:space-y-12">
 
                        {/* Mostrar sección de personalizables solo en vista 'todos' */}
                        {activeCategory === 'todos' && (
                            <PersonalizableSection
                                onPersonalizeClick={handlePersonalizeClick}
                            />
                        )}
 
                        {/* Renderizar secciones de productos por categoría */}
                        {Object.entries(productsByCategory).map(([categoryId, categoryData]) => (
                            <section
                                key={`section-${categoryId}-${activeCategory}`}
                                className="space-y-4 sm:space-y-6"
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
 
                        {/* Mostrar mensaje cuando no hay productos */}
                        {Object.keys(productsByCategory).length === 0 && !isLoading && (
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
 
// Exportar componente como default
export default CategoryProducts;
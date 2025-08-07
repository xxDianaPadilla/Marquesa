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
    const [imageLoadingStates, setImageLoadingStates] = useState({});
    const [favoriteToggling, setFavoriteToggling] = useState(new Set()); // Para manejar múltiples toggles

    // Hook de favoritos
    const {
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        toggleFavorite,
        getFavoriteProduct // Nueva función para debugging
    } = useFavorites();

    // URL base de la API
    const API_BASE_URL = process.env.NODE_ENV === 'production'
        ? '/api'
        : 'http://localhost:4000/api';

    /**
     * Configuración de categorías disponibles - Memoizado para evitar re-creación
     */
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
     * Función helper para obtener ID del producto de forma consistente
     */
    const getProductId = useCallback((product) => {
        if (!product) return null;
        return product._id || product.id || null;
    }, []);

    /**
     * Función para normalizar producto antes de enviarlo a favoritos
     */
    const normalizeProductForFavorites = useCallback((product) => {
        if (!product) return null;

        const productId = getProductId(product);
        if (!productId) {
            console.error('Product has no valid ID:', product);
            return null;
        }

        // Extraer información de la categoría
        let categoryName = 'Sin categoría';
        let categoryId = null;

        if (typeof product.categoryId === 'object' && product.categoryId) {
            categoryId = product.categoryId._id || product.categoryId.id;
            categoryName = product.categoryId.name || categoryMap[categoryId] || 'Sin categoría';
        } else if (product.categoryId && categoryMap[product.categoryId]) {
            categoryId = product.categoryId;
            categoryName = categoryMap[product.categoryId];
        }

        // Extraer imagen
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

        // Crear producto normalizado con todos los campos necesarios
        const normalizedProduct = {
            // IDs - asegurar consistencia
            id: productId,
            _id: productId,

            // Información básica
            name: product.name || 'Producto sin nombre',
            description: product.description || '',

            // Categoría normalizada
            category: categoryName,
            categoryId: categoryId,

            // Precio
            price: product.price || 0,

            // Stock (si está disponible)
            ...(product.stock !== undefined && { stock: Number(product.stock) }),

            // Imágenes
            image: image,
            images: Array.isArray(product.images) ? product.images : (product.images ? [product.images] : []),

            // Personalización
            isPersonalizable: Boolean(product.isPersonalizable),

            // Metadatos
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,

            // Preservar cualquier otro campo importante
            ...Object.keys(product).reduce((acc, key) => {
                if (!['id', '_id', 'name', 'description', 'category', 'categoryId', 'price', 'stock', 'image', 'images', 'isPersonalizable'].includes(key)) {
                    acc[key] = product[key];
                }
                return acc;
            }, {})
        };

        console.log('🔄 Product normalized for favorites:', {
            original: product,
            normalized: normalizedProduct,
            id: productId
        });

        return normalizedProduct;
    }, [getProductId, categoryMap]);

    /**
     * Función para obtener todos los productos - Memoizada con useCallback
     */
    const fetchAllProducts = useCallback(async () => {
        try {
            setIsLoading(true);
            console.log('🔄 Fetching all products...');

            const response = await fetch(`${API_BASE_URL}/products`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📦 All products response:', data);

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
    }, [API_BASE_URL]);

    /**
     * Función para obtener productos por categoría específica - Memoizada
     */
    const fetchProductsByCategory = useCallback(async (categoryId) => {
        try {
            setIsLoading(true);
            console.log('🔄 Fetching products for category:', categoryId);

            const response = await fetch(`${API_BASE_URL}/products/by-category/${categoryId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(`📦 Products for category ${categoryId}:`, data);

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
    }, [API_BASE_URL]);

    /**
     * Determina la categoría inicial basada en la URL - Memoizada
     */
    const getInitialCategory = useCallback(() => {
        const pathParts = location.pathname.split('/');
        if (pathParts[1] === 'categoria' && pathParts[2]) {
            return pathParts[2];
        }
        return 'todos';
    }, [location.pathname]);

    /**
     * Maneja el toggle de favorito - MEJORADA con validación robusta
     */
    const handleToggleFavorite = useCallback(async (product) => {
        const productId = getProductId(product);

        // Validaciones previas
        if (!product || !productId) {
            console.error('❌ Invalid product for favorites:', product);
            toast.error('Error: Producto inválido', {
                duration: 2000,
                position: 'top-center',
                icon: '❌'
            });
            return;
        }

        // Evitar toggles múltiples del mismo producto
        if (favoriteToggling.has(productId)) {
            console.log('⏳ Toggle already in progress for product:', productId);
            return;
        }

        try {
            // Marcar como procesando
            setFavoriteToggling(prev => new Set([...prev, productId]));

            console.log('❤️ Toggle favorite for product:', {
                id: productId,
                name: product.name,
                currentStatus: isFavorite(productId)
            });

            // Normalizar producto antes de enviarlo al contexto
            const normalizedProduct = normalizeProductForFavorites(product);

            if (!normalizedProduct) {
                throw new Error('No se pudo normalizar el producto');
            }

            const wasAdded = toggleFavorite(normalizedProduct);

            // Verificar que se guardó correctamente
            setTimeout(() => {
                const savedProduct = getFavoriteProduct(productId);
                console.log('✅ Verification after toggle:', {
                    expected: wasAdded,
                    inFavorites: !!savedProduct,
                    productData: savedProduct
                });

                if (!wasAdded && savedProduct) {
                    console.error('❌ Product was not removed correctly!');
                    toast.error('Error al eliminar de favoritos', {
                        duration: 3000,
                        position: 'top-center',
                        icon: '❌'
                    });
                }
            }, 100);

            // Mostrar toast según la acción realizada
            if (wasAdded) {
                toast.success(`¡${normalizedProduct.name} agregado a favoritos!`, {
                    duration: 2000,
                    position: 'top-center',
                    icon: '❤️',
                    style: {
                        background: '#EC4899',
                        color: '#fff',
                    },
                });
                console.log('✅ Producto agregado a favoritos exitosamente');
            } else {
                toast.success(`${normalizedProduct.name} eliminado de favoritos`, {
                    duration: 2000,
                    position: 'top-center',
                    icon: '💔',
                    style: {
                        background: '#6B7280',
                        color: '#fff',
                    },
                });
                console.log('❌ Producto removido de favoritos exitosamente');
            }

        } catch (error) {
            console.error('❌ Error al manejar favoritos:', error);
            toast.error('Error al actualizar favoritos', {
                duration: 3000,
                position: 'top-center',
                icon: '❌'
            });
        } finally {
            // Remover del estado de procesando
            setFavoriteToggling(prev => {
                const newSet = new Set(prev);
                newSet.delete(productId);
                return newSet;
            });
        }
    }, [getProductId, normalizeProductForFavorites, isFavorite, toggleFavorite, getFavoriteProduct, favoriteToggling]);

    /**
     * Maneja la carga de imágenes para evitar parpadeo
     */
    const handleImageLoad = useCallback((productId) => {
        setImageLoadingStates(prev => ({
            ...prev,
            [productId]: true
        }));
    }, []);

    /**
     * useEffect ÚNICO para manejar la carga inicial y cambios de URL
     */
    useEffect(() => {
        console.log('🚀 Loading data based on URL...');

        const initialCategory = getInitialCategory();
        console.log('🎯 Initial category from URL:', initialCategory);

        // Solo actualizar si la categoría cambió
        if (initialCategory !== activeCategory) {
            setActiveCategory(initialCategory);
        }

        if (initialCategory === 'todos') {
            fetchAllProducts();
        } else {
            fetchProductsByCategory(initialCategory);
        }
    }, [location.pathname, getInitialCategory, fetchAllProducts, fetchProductsByCategory, activeCategory]);

    /**
     * Maneja el cambio de categoría en la navegación - Optimizada
     */
    const handleCategoryChange = useCallback(async (categoryId) => {
        // Prevenir cambios innecesarios
        if (categoryId === activeCategory || isLoading) {
            return;
        }

        console.log('🎯 Category changed to:', categoryId);
        setActiveCategory(categoryId);

        if (categoryId === 'todos') {
            await fetchAllProducts();
            navigate('/categoryProducts', { replace: true });
        } else {
            await fetchProductsByCategory(categoryId);
            navigate(`/categoria/${categoryId}`, { replace: true });
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeCategory, isLoading, fetchAllProducts, fetchProductsByCategory, navigate]);

    /**
     * Maneja el click en "Ver todos" - Optimizada
     */
    const handleViewAll = useCallback((categoryId) => {
        console.log('👀 View all clicked for category:', categoryId);
        handleCategoryChange(categoryId);
    }, [handleCategoryChange]);

    /**
     * Maneja la navegación al detalle del producto - Optimizada
     */
    const handleProductDetailClick = useCallback((productId) => {
        console.log('🔗 Navigating to product detail:', productId);
        navigate(`/ProductDetail/${productId}`);
    }, [navigate]);

    /**
     * Maneja la navegación a la página de personalización - Optimizada
     */
    const handlePersonalizeClick = useCallback((categoryId) => {
        console.log('🎨 Navigating to personalize category:', categoryId);
        navigate(`/personalizar/${categoryId}`);
    }, [navigate]);

    /**
     * Agrupa los productos por categoría - Memoizada para evitar recálculos
     */
    const getProductsByCategory = useMemo(() => {
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
            const categoryName = categoryMap[activeCategory] || categories.find(cat => cat._id === activeCategory)?.name || 'Categoría';
            return {
                [activeCategory]: {
                    name: categoryName,
                    products: safeProducts
                }
            };
        }
    }, [products, activeCategory, categoryMap, categories]);

    /**
     * Formatea los productos para ProductCard - MEJORADA
     */
    const formatProductForCard = useCallback((product) => {
        console.log("🎨 Formateando producto para ProductCard:", product);

        const productId = getProductId(product);

        if (!productId) {
            console.error('❌ Product has no valid ID:', product);
            return null;
        }

        const fallbackImage = '/placeholder-image.jpg';
        let image = fallbackImage;

        // Extraer la imagen del producto
        if (product.image) {
            image = product.image;
        } else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            if (product.images[0]?.image) {
                image = product.images[0].image;
            } else if (typeof product.images[0] === 'string') {
                image = product.images[0];
            }
        }

        // Extraer información de la categoría
        let categoryName = 'Sin categoría';
        if (typeof product.categoryId === 'object' && product.categoryId.name) {
            categoryName = product.categoryId.name;
        } else if (product.categoryId && categoryMap[product.categoryId]) {
            categoryName = categoryMap[product.categoryId];
        }

        const formattedProduct = {
            ...product,
            id: productId,
            _id: productId,
            name: product.name || 'Producto sin nombre',
            description: product.description || '',
            price: product.price || 0,
            image: image,
            images: Array.isArray(product.images) ? product.images : (product.images ? [product.images] : []),
            stock: product.stock !== undefined ? Number(product.stock) : undefined,
            category: categoryName,
            isPersonalizable: Boolean(product.isPersonalizable)
        };

        console.log("✅ Producto formateado:", {
            original: product,
            formatted: formattedProduct
        });

        return formattedProduct;
    }, [getProductId, categoryMap]);

    /**
     * Función para reintentar la carga - Optimizada
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
     * Renderiza la grilla de productos - MEJORADA con mejor manejo de errores
     */
    const renderProductGrid = useCallback((products, categoryId) => {
        if (!products || products.length === 0) {
            return (
                <div className="text-center py-8">
                    <p className="text-white-500">No hay productos disponibles en esta categoría</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => {
                    const formattedProduct = formatProductForCard(product);

                    // Skip productos que no se pudieron formatear
                    if (!formattedProduct) {
                        console.error('❌ Skipping invalid product:', product);
                        return null;
                    }

                    const productId = formattedProduct._id || formattedProduct.id;
                    const isProductFavorite = isFavorite(productId);
                    const isToggling = favoriteToggling.has(productId);

                    return (
                        <div
                            key={productId}
                            className={`transition-opacity duration-300 ${imageLoadingStates[productId] ? 'opacity-100' : 'opacity-0'
                                } ${isToggling ? 'pointer-events-none opacity-75' : ''}`}
                            style={{ minHeight: '300px' }} // Altura mínima para evitar layout shift
                        >
                            <ProductCard
                                key={productId}
                                product={formattedProduct}
                                showFavoriteButton={true}
                                showRemoveButton={false}
                                isFavorite={isProductFavorite}
                                onToggleFavorite={() => handleToggleFavorite(formattedProduct)}
                                onImageLoad={handleImageLoad}
                            />

                            {/* Overlay de loading durante toggle */}
                            {isToggling && (
                                <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                                </div>
                            )}
                        </div>
                    );
                }).filter(Boolean)} {/* Filtrar elementos null */}
            </div>
        );
    }, [formatProductForCard, isFavorite, favoriteToggling, handleToggleFavorite, handleImageLoad, imageLoadingStates]);

    // Debug effect para monitorear favoritos
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('🔍 Favorites debug:', {
                favoritesCount: favorites.length,
                favoriteIds: favorites.map(f => getProductId(f)),
                products: products.map(p => ({
                    id: getProductId(p),
                    name: p.name,
                    isFavorite: isFavorite(getProductId(p))
                }))
            });
        }
    }, [favorites, products, getProductId, isFavorite]);

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
            <Header />

            <section className="bg-white pt-2 sm:pt-4 pb-4 sm:pb-6">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                    <CategoryNavigation
                        categories={categories}
                        activeCategory={activeCategory}
                        onCategoryChange={handleCategoryChange}
                    />
                </div>
            </section>

            <main className="py-4 sm:py-8">
                <Container>
                    {isLoading ? (
                        <LoadingSpinner
                            text="Cargando productos..."
                            className="min-h-[300px] sm:min-h-[400px]"
                        />
                    ) : (
                        <div className="space-y-8 sm:space-y-12">
                            {activeCategory === 'todos' && (
                                <PersonalizableSection
                                    onPersonalizeClick={handlePersonalizeClick}
                                />
                            )}

                            {Object.entries(getProductsByCategory).map(([categoryId, categoryData]) => (
                                <section key={categoryId} id={`section-${categoryId}`} className="space-y-4 sm:space-y-6">
                                    {/* Título de la categoría */}
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-white-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            {categoryData.name}
                                        </h2>
                                        {activeCategory === 'todos' && categoryData.products.length > 4 && (
                                            <button
                                                onClick={() => handleViewAll(categoryId)}
                                                className="text-pink-500 hover:text-pink-600 font-medium transition-colors duration-200"
                                                style={{ fontFamily: 'Poppins, sans-serif' }}
                                            >
                                                Ver todos
                                            </button>
                                        )}
                                    </div>

                                    {/* Grilla de productos usando ProductCard */}
                                    {renderProductGrid(
                                        activeCategory === 'todos'
                                            ? categoryData.products.slice(0, 4)
                                            : categoryData.products,
                                        categoryId
                                    )}
                                </section>
                            ))}

                            {products.length === 0 && !isLoading && (
                                <div className="text-center py-12">
                                    <div className="text-white-500 text-lg">
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

            <Footer />
        </div>
    );
};

export default CategoryProducts;
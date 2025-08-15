import React, { useState, useEffect, useCallback } from "react";
import useFeaturedProductsService from './Products/Hooks/useFeaturedProductsService';
import Container from "./Container";
import ActionButton from "./ActionButton";
import PriceDisplay from "./PriceDisplay";
import iconFavorites from '../assets/favoritesIcon.png';
import { useNavigate } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
// ✅ AGREGAR: Importar contexto de autenticación
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
 
const FeaturedProductsCarousel = ({
    autoSlideInterval = 5000,
    showArrows = true,
    showDots = true,
    className = ""
}) => {
    const navigate = useNavigate();
    const { toggleFavorite, isFavorite } = useFavorites();
    // ✅ AGREGAR: Obtener estado de autenticación
    const { isAuthenticated } = useAuth();
 
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [cart, setCart] = useState([]);
    const [isAutoSliding, setIsAutoSliding] = useState(true);
    const [favoriteToggling, setFavoriteToggling] = useState(new Set());
 
    const loadFeaturedProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
 
            const fetchedProducts = await useFeaturedProductsService.getFeaturedProducts();
 
            if (fetchedProducts && fetchedProducts.length > 0) {
                setProducts(fetchedProducts);
                setCurrentSlide(0);
            } else {
                setProducts([]);
                setError('No hay productos destacados disponibles');
            }
        } catch (error) {
            console.error('Error loading featured products: ', error);
            setError('Error al cargar los products destacados');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, []);
 
    useEffect(() => {
        loadFeaturedProducts();
    }, [loadFeaturedProducts]);
 
    useEffect(() => {
        if (!isAutoSliding || products.length <= 1) return;
 
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % Math.ceil(products.length / getProductsPerSlide()));
        }, autoSlideInterval);
 
        return () => clearInterval(interval);
    }, [isAutoSliding, products.length, autoSlideInterval]);
 
    const getProductsPerSlide = () => {
        if (typeof window === 'undefined') return 3;
        if (window.innerWidth >= 1024) return 3;
        if (window.innerWidth >= 640) return 2;
        return 1;
    };
 
    const goToSlide = (slideIndex) => {
        setCurrentSlide(slideIndex);
        setIsAutoSliding(false);
        setTimeout(() => setIsAutoSliding(true), 3000);
    };
 
    const nextSlide = () => {
        const maxSlides = Math.ceil(products.length / getProductsPerSlide());
        setCurrentSlide((prev) => (prev + 1) % maxSlides);
        setIsAutoSliding(false);
        setTimeout(() => setIsAutoSliding(true), 3000);
    };
 
    const prevSlide = () => {
        const maxSlides = Math.ceil(products.length / getProductsPerSlide());
        setCurrentSlide((prev) => (prev - 1 + maxSlides) % maxSlides);
        setIsAutoSliding(false);
        setTimeout(() => setIsAutoSliding(true), 3000);
    };
 
    const normalizeProductForFavorites = useCallback((product) => {
        if (!product) return null;
 
        const productId = product._id || product.id;
        if (!productId) return null;
 
        let productImage = '/placeholder-image.jpg';
       
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            if (product.images[0]?.image) {
                productImage = product.images[0].image;
            } else if (typeof product.images[0] === 'string') {
                productImage = product.images[0];
            }
        } else if (product.image) {
            productImage = product.image;
        }
 
        let categoryName = 'Sin categoría';
        let categoryId = null;
 
        if (typeof product.categoryId === 'object' && product.categoryId) {
            categoryId = product.categoryId._id || product.categoryId.id;
            categoryName = product.categoryId.name || 'Sin categoría';
        } else if (product.categoryId) {
            categoryId = product.categoryId;
        }
 
        return {
            _id: productId,
            id: productId,
            name: product.name || 'Producto sin nombre',
            description: product.description || '',
            price: product.price || 0,
            category: categoryName,
            categoryId: categoryId,
            image: productImage,
            images: product.images || [],
            stock: product.stock,
            isPersonalizable: product.isPersonalizable || false,
            ...Object.keys(product).reduce((acc, key) => {
                if (!['_id', 'id', 'name', 'description', 'price', 'category', 'image', 'images', 'stock', 'isPersonalizable', 'categoryId'].includes(key)) {
                    acc[key] = product[key];
                }
                return acc;
            }, {})
        };
    }, []);
 
    // ✅ MODIFICAR: handleToggleFavorite con validación de autenticación
    const handleToggleFavorite = useCallback(async (product) => {
        const productId = product._id || product.id;
 
        if (!product || !productId || favoriteToggling.has(productId)) {
            return;
        }
 
        // ✅ NUEVA VALIDACIÓN: Verificar autenticación
        if (!isAuthenticated) {
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
            setFavoriteToggling(prev => new Set([...prev, productId]));
 
            const normalizedProduct = normalizeProductForFavorites(product);
            if (!normalizedProduct) {
                throw new Error('No se pudo normalizar el producto');
            }
 
            const wasCurrentlyFavorite = isFavorite(productId);
 
            console.log('❤️ FeaturedCarousel - Toggle favorite for product:', {
                id: normalizedProduct._id,
                name: normalizedProduct.name,
                wasCurrentlyFavorite: wasCurrentlyFavorite
            });
 
            const wasAdded = await toggleFavorite(normalizedProduct);
 
            if (wasCurrentlyFavorite) {
                toast.success(`${normalizedProduct.name} eliminado de favoritos`, {
                    duration: 3000,
                    position: 'top-center',
                    icon: '💔',
                    style: {
                        background: '#6B7280',
                        color: '#fff',
                    },
                });
                console.log('❌ FeaturedCarousel - Producto removido de favoritos');
            } else {
                toast.success(`¡${normalizedProduct.name} agregado a favoritos!`, {
                    duration: 3000,
                    position: 'top-center',
                    icon: '❤️',
                    style: {
                        background: '#EC4899',
                        color: '#fff',
                    },
                });
                console.log('✅ FeaturedCarousel - Producto agregado a favoritos');
            }
 
        } catch (error) {
            console.error('❌ FeaturedCarousel - Error al manejar favoritos:', error);
           
            let errorMessage = 'Error al actualizar favoritos';
            if (error.message?.includes('storage')) {
                errorMessage = 'Error de almacenamiento. Verifica el espacio disponible';
            } else if (error.message) {
                errorMessage = error.message;
            }
 
            toast.error(errorMessage, {
                duration: 3000,
                position: 'top-center',
                icon: '❌'
            });
        } finally {
            setFavoriteToggling(prev => {
                const newSet = new Set(prev);
                newSet.delete(productId);
                return newSet;
            });
        }
    }, [normalizeProductForFavorites, toggleFavorite, favoriteToggling, isFavorite, isAuthenticated]);
 
    const handleAddToCart = (product) => {
        const existingItem = cart.find(item => item._id === product._id);
        if (existingItem) {
            setCart(cart.map(item =>
                item._id === product._id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
 
        toast.success(`¡${product.name} agregado al carrito!`, {
            duration: 2000,
            position: 'top-center',
            icon: '🛒',
            style: {
                background: '#10B981',
                color: '#FFFFFF',
            },
        });
    };
 
    const handleProductClick = (product) => {
        if (product.categoryId) {
            navigate(`/categoria/${product.categoryId}`);
        }
    };
 
    const handleRefreshProducts = () => {
        loadFeaturedProducts();
    };
 
    const getCurrentSlideProducts = () => {
        const productsPerSlide = getProductsPerSlide();
        const startIndex = currentSlide * productsPerSlide;
        return products.slice(startIndex, startIndex + productsPerSlide);
    };
 
    if (loading) {
        return (
            <section className={`bg-pink-50 py-8 sm:py-14 ${className}`}>
                <Container>
                    <div className="text-center">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 mb-8" style={{ fontFamily: "Poppins" }}>
                            Productos destacados
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-lg shadow-md animate-pulse">
                                    <div className="h-64 bg-gray-200 rounded-t-lg"></div>
                                    <div className="p-4">
                                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded mb-4"></div>
                                        <div className="h-8 bg-gray-200 rounded"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Container>
            </section>
        );
    }
 
    if (error || products.length === 0) {
        return (
            <section className={`bg-pink-50 py-8 sm:py-14 ${className}`}>
                <Container>
                    <div className="text-center">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 mb-4" style={{ fontFamily: "Poppins" }}>
                            Productos destacados
                        </h2>
                        <p className="text-gray-600 mb-6">{error || 'No hay productos disponibles'}</p>
                        <ActionButton onClick={handleRefreshProducts} variant="primary">
                            Recargar productos
                        </ActionButton>
                    </div>
                </Container>
            </section>
        );
    }
 
    const maxSlides = Math.ceil(products.length / getProductsPerSlide());
    const currentProducts = getCurrentSlideProducts();
 
    return (
        <section className={`bg-pink-50 py-8 sm:py-14 ${className}`}>
            <Container>
                <div className="text-center mb-8 sm:mb-10 relative">
                    <h2
                        className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 mb-2"
                        style={{ fontFamily: "Poppins" }}
                    >
                        Productos destacados
                    </h2>
                    <p className="text-center text-gray-600 mb-4 text-base sm:text-lg max-w-2xl mx-auto" style={{ fontFamily: "Poppins" }}>
                        Descubre nuestros productos más populares, actualizados aleatoriamente.
                    </p>
 
                    <button
                        onClick={handleRefreshProducts}
                        className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Actualizar productos"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
 
                <div className="relative">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {currentProducts.map((product) => {
                            const productId = product._id || product.id;
                            const isProductFavorite = isFavorite(productId);
                            const isToggling = favoriteToggling.has(productId);
 
                            return (
                                <div
                                    key={productId}
                                    className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 cursor-pointer ${
                                        isToggling ? 'pointer-events-none opacity-75' : ''
                                    }`}
                                    onClick={() => handleProductClick(product)}
                                >
                                    <div className="relative">
                                        <img
                                            src={product.image || '/placeholder-product.jpg'}
                                            alt={product.name}
                                            className="w-full h-48 sm:h-64 lg:h-80 object-cover rounded-t-lg"
                                            onError={(e) => {
                                                e.target.src = '/placeholder-product.jpg';
                                            }}
                                        />
 
                                        <div className="absolute top-3 right-3 bg-white bg-opacity-90 rounded-full px-3 py-1 shadow-md">
                                            <PriceDisplay price={product.price} size="sm" />
                                        </div>
 
                                        {/* ✅ MODIFICAR: Botón de favorito con estado de bloqueo */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleFavorite(product);
                                            }}
                                            disabled={isToggling}
                                            className={`absolute top-3 left-3 p-2 rounded-full transition-all duration-200 transform hover:scale-110 shadow-md
                                                disabled:cursor-not-allowed disabled:transform-none disabled:opacity-75
                                                ${isProductFavorite
                                                    ? 'bg-pink-500 bg-opacity-90 hover:bg-opacity-100'
                                                    : isAuthenticated
                                                        ? 'bg-white bg-opacity-80 hover:bg-opacity-100'
                                                        : 'bg-gray-300 bg-opacity-80 cursor-not-allowed'
                                                }`}
                                            title={!isAuthenticated ? 'Inicia sesión para agregar a favoritos' : (isProductFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos')}
                                        >
                                            {isProductFavorite ? (
                                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                            ) : (
                                                <img
                                                    src={iconFavorites}
                                                    alt="Agregar a favoritos"
                                                    className={`w-5 h-6 transition-all duration-200 ${!isAuthenticated ? 'opacity-50' : ''}`}
                                                />
                                            )}
                                        </button>
                                    </div>
 
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: "Poppins" }}>
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: "Poppins" }}>
                                            {product.description}
                                        </p>
 
                                        <div className="flex items-center justify-between mb-3">
                                            <PriceDisplay price={product.price} />
                                            {/* ✅ MODIFICAR: Indicador de favorito con estado de autenticación */}
                                            <div className={`flex items-center gap-2 ${isProductFavorite ? 'text-pink-500' : !isAuthenticated ? 'text-gray-300' : 'text-gray-400'}`}>
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                                <span className="text-xs font-medium">
                                                    {!isAuthenticated ? 'Inicia sesión' : (isProductFavorite ? 'En favoritos' : 'Guardar')}
                                                </span>
                                            </div>
                                        </div>
 
                                        <ActionButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddToCart(product);
                                            }}
                                            variant="primary"
                                            size="md"
                                            className="w-full"
                                        >
                                            Añadir al carrito
                                        </ActionButton>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
 
                    {showArrows && maxSlides > 1 && (
                        <>
                            <button
                                onClick={prevSlide}
                                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors z-10"
                            >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
 
                            <button
                                onClick={nextSlide}
                                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors z-10"
                            >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>
 
                {showDots && maxSlides > 1 && (
                    <div className="flex justify-center mt-6 space-x-2">
                        {Array.from({ length: maxSlides }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? 'bg-pink-500' : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                            />
                        ))}
                    </div>
                )}
 
                <div className="flex justify-center mt-8 sm:mt-10">
                    <ActionButton
                        onClick={() => navigate('/categoryProducts')}
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        Ver todos los productos 🡢
                    </ActionButton>
                </div>
            </Container>
        </section>
    );
};
 
export default FeaturedProductsCarousel;
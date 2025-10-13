import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useFavorites } from "../context/FavoritesContext";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import Container from "../components/Container";
import ProductCard from "../components/ProductCard";

const SearchResults = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    // URL base del API
    const API_BASE_URL = 'https://marquesa.onrender.com/api';

    // Mapeo de categorías
    const categoryMap = useMemo(() => ({
        '688175a69579a7cde1657aaa': 'Arreglos con flores naturales',
        '688175d89579a7cde1657ac2': 'Arreglos con flores secas',
        '688175fd9579a7cde1657aca': 'Cuadros decorativos',
        '688176179579a7cde1657ace': 'Giftboxes',
        '688175e79579a7cde1657ac6': 'Tarjetas'
    }), []);

    // Estados del componente
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [favoriteToggling, setFavoriteToggling] = useState(new Set());

    // Desestructurar funciones del contexto de favoritos
    const { isFavorite, toggleFavorite } = useFavorites();

    // Función para obtener el término de búsqueda desde la URL
    const getSearchTermFromURL = useCallback(() => {
        const urlParams = new URLSearchParams(location.search);
        return urlParams.get('q') || '';
    }, [location.search]);

    // Función para buscar productos
    const searchProducts = useCallback(async (term) => {
        if (!term.trim()) {
            setProducts([]);
            setIsLoading(false);
            return;
        }

        console.log(`SearchResults - Buscando productos para: "${term}"`);
        setIsLoading(true);
        setError(null);

        try {
            // Realizar búsqueda en todos los productos
            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
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

            // Filtrar productos por nombre y categoría
            const filteredProducts = productsData.filter(product => {
                const productName = (product.name || '').toLowerCase();
                const productDescription = (product.description || '').toLowerCase();
                const searchLower = term.toLowerCase();
                
                // Buscar por nombre del producto
                const nameMatch = productName.includes(searchLower);
                
                // Buscar por descripción del producto
                const descriptionMatch = productDescription.includes(searchLower);
                
                // Buscar por categoría
                let categoryMatch = false;
                if (typeof product.categoryId === 'object' && product.categoryId?.name) {
                    categoryMatch = product.categoryId.name.toLowerCase().includes(searchLower);
                } else if (product.categoryId && categoryMap[product.categoryId]) {
                    categoryMatch = categoryMap[product.categoryId].toLowerCase().includes(searchLower);
                }

                return nameMatch || descriptionMatch || categoryMatch;
            });

            console.log(`SearchResults - Encontrados ${filteredProducts.length} productos para: "${term}"`);
            setProducts(filteredProducts);
        } catch (error) {
            console.error('SearchResults - Error al buscar productos:', error);
            setError('Error al buscar productos. Intenta nuevamente.');
            setProducts([]);
            toast.error('Error al buscar productos', { duration: 3000, position: 'top-center' });
        } finally {
            setIsLoading(false);
        }
    }, [API_BASE_URL, categoryMap]);

    // Effect para obtener término de búsqueda y realizar búsqueda
    useEffect(() => {
        const term = getSearchTermFromURL();
        setSearchTerm(term);
        
        if (term.trim()) {
            searchProducts(term);
        } else {
            setProducts([]);
            setIsLoading(false);
        }
    }, [location.search, getSearchTermFromURL, searchProducts]);

    // Función para obtener ID de producto
    const getProductId = useCallback((product) => {
        return product?._id || product?.id || null;
    }, []);

    // Función para normalizar producto para favoritos
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

    // Función para manejar toggle de favoritos
    const handleToggleFavorite = useCallback(async (product) => {
        const productId = getProductId(product);

        if (!product || !productId || favoriteToggling.has(productId)) {
            return;
        }

        if (!isAuthenticated) {
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
            setFavoriteToggling(prev => new Set([...prev, productId]));

            const normalizedProduct = normalizeProductForFavorites(product);
            if (!normalizedProduct) {
                throw new Error('No se pudo normalizar el producto');
            }

            const wasCurrentlyFavorite = isFavorite(productId);

            console.log('SearchResults - Toggle favorite for product:', {
                id: normalizedProduct._id,
                name: normalizedProduct.name,
                wasCurrentlyFavorite: wasCurrentlyFavorite
            });

            await toggleFavorite(normalizedProduct);

            if (wasCurrentlyFavorite) {
                toast.success(`${normalizedProduct.name} eliminado de favoritos`, {
                    duration: 3000,
                    position: 'top-center',
                    style: {
                        background: '#6B7280',
                        color: '#fff',
                    },
                });
            } else {
                toast.success(`¡${normalizedProduct.name} agregado a favoritos!`, {
                    duration: 3000,
                    position: 'top-center',
                    style: {
                        background: '#EC4899',
                        color: '#fff',
                    },
                });
            }

        } catch (error) {
            console.error('SearchResults - Error al manejar favoritos:', error);
            
            let errorMessage = 'Error al actualizar favoritos';
            if (error.message?.includes('storage')) {
                errorMessage = 'Error de almacenamiento. Verifica el espacio disponible';
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage, {
                duration: 3000,
                position: 'top-center'
            });
        } finally {
            setFavoriteToggling(prev => {
                const newSet = new Set(prev);
                newSet.delete(productId);
                return newSet;
            });
        }
    }, [getProductId, normalizeProductForFavorites, toggleFavorite, favoriteToggling, isFavorite, isAuthenticated]);

    // Función para formatear producto para ProductCard
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

    // Función para manejar clic en producto (navegar a detalles)
    const handleProductClick = useCallback((product) => {
        const productId = product._id || product.id;
        if (productId) {
            navigate(`/ProductDetail/${productId}`);
        }
    }, [navigate]);

    // Función para manejar reintento
    const handleRetry = useCallback(() => {
        console.log('SearchResults - Retry solicitado');
        setError(null);
        const term = getSearchTermFromURL();
        if (term.trim()) {
            searchProducts(term);
        }
    }, [getSearchTermFromURL, searchProducts]);

    // Función para volver al inicio
    const handleBackToHome = () => {
        navigate('/');
    };

    // Renderizar estado de carga
    if (isLoading) {
        return (
            <div className="min-h-screen bg-white-50">
                <Header />
                <Container>
                    <LoadingSpinner
                        text={`Buscando "${searchTerm}"...`}
                        className="min-h-[400px]"
                    />
                </Container>
                <Footer />
            </div>
        );
    }

    // Renderizar estado de error
    if (error) {
        return (
            <div className="min-h-screen bg-white-50">
                <Header />
                <Container>
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="text-6xl mb-4"></div>
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

    // Renderizar contenido principal
    return (
        <div className="min-h-screen bg-white-50">
            <Header />
            
            <main className="py-4 sm:py-8">
                <Container>
                    <div className="space-y-6">
                        {/* Header de resultados de búsqueda */}
                        <div className="border-b border-gray-200 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                        Resultados de búsqueda
                                    </h1>
                                    {searchTerm && (
                                        <p className="text-gray-600 mt-1">
                                            Búsqueda: "<span className="font-medium">{searchTerm}</span>"
                                        </p>
                                    )}
                                    <p className="text-sm text-gray-500 mt-1">
                                        {products.length} producto{products.length === 1 ? '' : 's'} encontrado{products.length === 1 ? '' : 's'}
                                    </p>
                                </div>
                                
                                <button
                                    onClick={handleBackToHome}
                                    className="text-pink-500 hover:text-pink-600 font-medium transition-colors"
                                >
                                    ← Volver al inicio
                                </button>
                            </div>
                        </div>

                        {/* Grid de productos */}
                        {products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                {products.map((product) => {
                                    const formattedProduct = formatProductForCard(product);
                                    
                                    if (!formattedProduct) return null;

                                    const productId = formattedProduct._id || formattedProduct.id;
                                    const isProductFavorite = isFavorite(productId);
                                    const isToggling = favoriteToggling.has(productId);

                                    return (
                                        <div
                                            key={`search-product-${productId}`}
                                            className={isToggling ? 'pointer-events-none opacity-75' : ''}
                                        >
                                            <ProductCard
                                                product={formattedProduct}
                                                showFavoriteButton={true}
                                                showRemoveButton={false}
                                                isFavorite={isProductFavorite}
                                                onToggleFavorite={() => handleToggleFavorite(formattedProduct)}
                                                onClick={() => handleProductClick(formattedProduct)}
                                            />
                                        </div>
                                    );
                                }).filter(Boolean)}
                            </div>
                        ) : (
                            // Estado cuando no hay resultados
                            <div className="text-center py-16">
                                <div className="text-6xl mb-4"></div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    No se encontraron productos
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {searchTerm 
                                        ? `No encontramos productos para "${searchTerm}"`
                                        : 'Ingresa un término de búsqueda'
                                    }
                                </p>
                                <button
                                    onClick={handleBackToHome}
                                    className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
                                >
                                     Explorar productos
                                </button>
                            </div>
                        )}
                    </div>
                </Container>
            </main>

            <Footer />
        </div>
    );
};

export default SearchResults;
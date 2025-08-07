import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";

const ProductCard = ({
    product,
    onRemove,
    showFavoriteButton = false,
    isFavorite = false,
    onToggleFavorite,
    showRemoveButton = true,
    onImageLoad // Nueva prop para manejar la carga de imagen
}) => {
    const navigate = useNavigate();
    const { isFavorite: contextIsFavorite } = useFavorites();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // ========== FUNCIONES DE VALIDACIÓN DEFENSIVA ==========

    /**
     * Convierte cualquier valor a string de forma segura para renderizar
     */
    const safeToString = useCallback((value) => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'number') return value.toString();
        if (typeof value === 'boolean') return value.toString();
        if (Array.isArray(value)) return value.join(', ');
        if (typeof value === 'object') {
            // Si es un objeto con una propiedad 'name', usarla
            if (value.name) return safeToString(value.name);
            // Si es un objeto con una propiedad 'value', usarla
            if (value.value !== undefined) return safeToString(value.value);
            // En último caso, convertir a JSON
            try {
                return JSON.stringify(value);
            } catch (error) {
                return '[Objeto]';
            }
        }
        return String(value);
    }, []);

    /**
     * Convierte valor a número de forma segura - VERSIÓN CORREGIDA
     */
    const safeToNumber = useCallback((value, defaultValue = 0) => {
        // Si el valor es null o undefined, usar el valor por defecto
        if (value === null || value === undefined) return defaultValue;

        if (typeof value === 'number') {
            return isNaN(value) ? defaultValue : value;
        }

        if (typeof value === 'string') {
            // Limpiar la cadena de caracteres no numéricos excepto punto y signo negativo
            const cleanedValue = value.replace(/[^\d.-]/g, '');
            const parsed = parseFloat(cleanedValue);
            return isNaN(parsed) ? defaultValue : parsed;
        }

        if (typeof value === 'object' && value !== null) {
            if (value.value !== undefined) return safeToNumber(value.value, defaultValue);
            if (value.amount !== undefined) return safeToNumber(value.amount, defaultValue);
        }

        return defaultValue;
    }, []);

    // ========== VALORES SEGUROS PARA RENDERIZAR - VERSIÓN CORREGIDA ==========

    // Función para determinar el stock real
    const getProductStock = (product) => {
        // Primero verificar la propiedad 'stock' directa
        if (product.stock !== undefined && product.stock !== null) {
            return safeToNumber(product.stock, 0);
        }

        // Si no existe 'stock', asumir que hay stock disponible (no mostrar como sin stock)
        // Esto evita mostrar "Sin stock" cuando simplemente no tenemos la información
        return null; // null significa "stock desconocido"
    };

    const productStock = getProductStock(product);

    const safeProduct = {
        id: product._id || product.id || 'unknown',
        name: safeToString(product.name) || 'Producto sin nombre',
        description: safeToString(product.description) || '',
        category: safeToString(product.category) || '',
        price: safeToNumber(product.price, 0),
        stock: productStock,
        image: product.image || '',
        images: product.images || []
    };

    // Debug log para verificar el stock - VERSIÓN MEJORADA
    console.log('Product stock debug:', {
        originalStock: product.stock,
        safeStock: safeProduct.stock,
        productName: safeProduct.name,
        hasStockProperty: product.hasOwnProperty('stock'),
        allProductKeys: Object.keys(product)
    });

    // ========== HANDLERS ==========

    /**
     * Maneja el click del botón eliminar
     */
    const handleRemoveClick = useCallback(() => {
        if (onRemove) {
            const productId = product._id || product.id;
            onRemove(productId);
        }
    }, [onRemove, product._id, product.id]);

    /**
     * Maneja el click en "Ver producto" para navegar al detalle
     */
    const handleViewProduct = useCallback(() => {
        const productId = product._id || product.id;
        navigate(`/ProductDetail/${productId}`);
    }, [navigate, product._id, product.id]);

    /**
     * Maneja el click en toda la tarjeta para navegar al detalle
     */
    const handleCardClick = useCallback(() => {
        handleViewProduct();
    }, [handleViewProduct]);

    /**
     * Maneja el toggle de favorito
     */
    const handleToggleFavorite = useCallback((e) => {
        e.stopPropagation();

        if (onToggleFavorite) {
            onToggleFavorite();
        }
    }, [onToggleFavorite]);

    /**
     * Maneja la carga exitosa de la imagen
     */
    const handleImageLoad = useCallback(() => {
        setImageLoaded(true);
        setImageError(false);

        if (onImageLoad) {
            const productId = product._id || product.id;
            onImageLoad(productId);
        }
    }, [onImageLoad, product._id, product.id]);

    /**
     * Maneja el error de carga de imagen
     */
    const handleImageError = useCallback((e) => {
        setImageError(true);
        e.target.src = '/placeholder-image.jpg';

        if (onImageLoad) {
            const productId = product._id || product.id;
            onImageLoad(productId);
        }
    }, [onImageLoad, product._id, product.id]);

    /**
     * Formatea el precio del producto a formato de moneda
     */
    const formatPrice = useCallback((price) => {
        try {
            const numericPrice = safeToNumber(price, 0);

            if (typeof price === 'string' && price.includes('$')) {
                return price;
            }

            return `$${numericPrice.toFixed(2)}`;
        } catch (error) {
            console.error('Error formatting price:', error, price);
            return '$0.00';
        }
    }, [safeToNumber]);

    /**
     * Obtiene la imagen del producto con fallback mejorado - VERSIÓN CORREGIDA
     */
    const getProductImage = useCallback((product) => {
        // Primero verificar si hay un array de imágenes
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            const firstImage = product.images[0];

            // Si el primer elemento del array es un objeto con propiedad 'image'
            if (firstImage && typeof firstImage === 'object' && firstImage.image) {
                return firstImage.image;
            }

            // Si el primer elemento es directamente una URL string
            if (typeof firstImage === 'string') {
                return firstImage;
            }
        }

        // Luego verificar la propiedad image directa
        if (product.image && typeof product.image === 'string') {
            return product.image;
        }

        return '/placeholder-image.jpg';
    }, []);

    // Obtener el ID del producto de manera segura
    const productId = product._id || product.id;

    // Determinar si es favorito usando el prop o el contexto como fallback
    const isProductFavorite = isFavorite !== undefined ? isFavorite : (productId ? contextIsFavorite(productId) : false);

    return (
        <div
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group h-full flex flex-col"
            onClick={handleCardClick}
        >
            {/* Contenedor de la imagen del producto */}
            <div className="relative flex-shrink-0">
                {/* Placeholder mientras carga la imagen */}
                {!imageLoaded && !imageError && (
                    <div className="w-full h-48 bg-gray-200 animate-pulse flex items-center justify-center">
                        <div className="text-gray-400 text-sm">Cargando...</div>
                    </div>
                )}

                <img
                    src={getProductImage(product)}
                    alt={safeProduct.name}
                    className={`w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0 absolute'
                        }`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    loading="lazy"
                />

                {/* Botón de eliminar */}
                {showRemoveButton && onRemove && (
                    <button
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveClick();
                        }}
                        className="absolute top-2 right-2 bg-white bg-opacity-80 hover:bg-opacity-100 
                                 rounded-full p-2 transition-all duration-200 shadow-md
                                 hover:shadow-lg transform hover:scale-105 z-10"
                        aria-label="Eliminar de guardados"
                    >
                        <svg
                            className="w-5 h-5 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                )}

                {/* Botón de favorito */}
                {showFavoriteButton && onToggleFavorite && (
                    <button
                        onClick={handleToggleFavorite}
                        className={`absolute top-2 sm:top-3 left-2 sm:left-3 rounded-full p-1.5 sm:p-2 
                                   transition-all duration-200 shadow-md hover:shadow-lg 
                                   transform hover:scale-105 cursor-pointer z-10
                                   ${isProductFavorite
                                ? 'bg-pink-500 bg-opacity-90 hover:bg-opacity-100'
                                : 'bg-white bg-opacity-80 hover:bg-opacity-100'
                            }`}
                        aria-label={isProductFavorite ? "Eliminar de favoritos" : "Añadir a favoritos"}
                    >
                        {isProductFavorite ? (
                            <svg
                                className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                                fill="currentColor"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 hover:text-red-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                        )}
                    </button>
                )}

                {/* Indicador de favorito (solo visual) */}
                {!showFavoriteButton && isProductFavorite && (
                    <div className="absolute top-2 left-2 bg-pink-500 bg-opacity-90 rounded-full p-2 shadow-md z-10">
                        <svg
                            className="w-4 h-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                        </svg>
                    </div>
                )}

                {/* Badge de stock - LÓGICA CORREGIDA PARA MANEJAR STOCK DESCONOCIDO */}
                {safeProduct.stock !== null && (
                    <>
                        {/* Advertencia de stock bajo (solo si hay stock > 0) */}
                        {safeProduct.stock <= 5 && safeProduct.stock > 0 && (
                            <div className="absolute bottom-2 right-2 z-10">
                                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-md">
                                    ¡Solo {safeProduct.stock}!
                                </span>
                            </div>
                        )}
                        {/* Overlay de sin stock (solo si stock es exactamente 0) */}
                        {safeProduct.stock === 0 && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                                <span className="bg-red-500 text-white px-3 py-1 rounded-full font-medium">
                                    Sin stock
                                </span>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Contenido de información del producto */}
            <div className="p-4 flex flex-col flex-grow">
                {/* Categoría del producto */}
                {safeProduct.category && (
                    <p
                        className="text-xs text-gray-500 uppercase tracking-wide mb-1"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                        {safeProduct.category}
                    </p>
                )}

                {/* Nombre del producto */}
                <h3
                    className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 flex-grow"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    {safeProduct.name}
                </h3>

                {/* Descripción del producto */}
                {safeProduct.description && (
                    <p
                        className="text-sm text-gray-600 mb-3 line-clamp-2"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                        {safeProduct.description}
                    </p>
                )}

                {/* Precio y stock info */}
                <div className="flex justify-between items-start mb-3 mt-auto">
                    <span
                        className="text-xl font-bold text-gray-900"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                        {formatPrice(safeProduct.price)}
                    </span>

                    {/* Mostrar stock solo si tenemos información de stock y es mayor a 0 */}
                    {safeProduct.stock !== null && safeProduct.stock > 0 && (
                        <span className="text-xs text-gray-500">
                            Stock: {safeProduct.stock}
                        </span>
                    )}
                </div>

                {/* Botón de acción - LÓGICA CORREGIDA PARA STOCK DESCONOCIDO */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleViewProduct();
                    }}
                    disabled={safeProduct.stock === 0}
                    className={`w-full px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium
                             hover:scale-105 transform transition-transform mt-auto
                             ${safeProduct.stock === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed hover:scale-100'
                            : 'bg-[#FDB4B7] hover:bg-[#FCA5A9] text-white cursor-pointer'
                        }`}
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    {safeProduct.stock === 0 ? 'Sin stock' : 'Ver producto'}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
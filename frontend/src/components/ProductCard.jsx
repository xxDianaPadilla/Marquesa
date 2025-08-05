import React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast"; // Importar react-hot-toast
import { useFavorites } from "../context/FavoritesContext"; // Importar el contexto de favoritos

const ProductCard = ({
    product,
    onRemove,
    showFavoriteButton = false, // Nueva prop para controlar si mostrar el botón de favoritos
    isFavorite = false, // Estado de favorito pasado desde el padre
    onToggleFavorite, // Función de toggle pasada desde el padre
    showRemoveButton = true // Nueva prop para controlar el botón de remover
}) => {
    const navigate = useNavigate();
    const { isFavorite: contextIsFavorite } = useFavorites(); // Usar el contexto de favoritos como fallback

    /**
     * Maneja el click del botón eliminar
     * Llama a la función onRemove pasada como prop
     */
    const handleRemoveClick = () => {
        if (onRemove) {
            // Usar el ID correcto del producto
            const productId = product._id || product.id;
            onRemove(productId);
        }
    };

    /**
     * Maneja el click en "Ver producto" para navegar al detalle
     */
    const handleViewProduct = () => {
        const productId = product._id || product.id;
        navigate(`/ProductDetail/${productId}`);
    };

    /**
     * Maneja el click en toda la tarjeta para navegar al detalle
     */
    const handleCardClick = () => {
        handleViewProduct();
    };

    /**
     * Maneja el toggle de favorito mejorado
     */
    const handleToggleFavorite = (e) => {
        e.stopPropagation();

        try {
            if (onToggleFavorite) {
                // Ejecutar la función de toggle pasada como prop
                onToggleFavorite();

                // Determinar si fue agregado o eliminado
                // Como el estado cambia después del toggle, verificamos el estado contrario
                const wasAdded = !isProductFavorite;

                // Mostrar toast según la acción realizada
                if (wasAdded) {
                    toast.success(`¡${product.name} agregado a favoritos!`, {
                        duration: 2000,
                        position: 'top-center',
                        icon: '❤️',
                        style: {
                            background: '#EC4899',
                            color: '#fff',
                        },
                    });
                } else {
                    toast.success(`${product.name} eliminado de favoritos`, {
                        duration: 2000,
                        position: 'top-center',
                        icon: '💔',
                        style: {
                            background: '#6B7280',
                            color: '#fff',
                        },
                    });
                }
            }
        } catch (error) {
            console.error('Error al manejar favoritos:', error);
            toast.error('Error al actualizar favoritos', {
                duration: 2000,
                position: 'top-center',
                icon: '❌'
            });
        }
    };

    /**
     * Formatea el precio del producto a formato de moneda
     * @param {number|string} price - Precio a formatear
     * @returns {string} Precio formateado
     */
    const formatPrice = (price) => {
        // Si el precio ya es un string con formato, devolverlo tal como está
        if (typeof price === 'string' && price.includes('$')) {
            return price;
        }

        // Si es un número, formatearlo
        if (typeof price === 'number') {
            return `$${price.toFixed(2)}`;
        }

        // Si es un string numérico, convertirlo y formatearlo
        const numericPrice = parseFloat(price);
        if (!isNaN(numericPrice)) {
            return `$${numericPrice.toFixed(2)}`;
        }

        // Fallback
        return `$${price}`;
    };

    const getProductImage = (product) => {
        if (product.image) {
            return product.image;
        }

        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            if (product.images[0] && typeof product.images[0] === 'object' && product.images[0].image) {
                return product.images[0].image;
            }

            if (typeof product.images[0] === 'string') {
                return product.images[0];
            }
        }

        return null;
    };

    // Obtener el ID del producto de manera segura
    const productId = product._id || product.id;

    // Determinar si es favorito usando el prop o el contexto como fallback
    const isProductFavorite = isFavorite !== undefined ? isFavorite : (productId ? contextIsFavorite(productId) : false);

    return (
        <div
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
            onClick={handleCardClick}
        >
            {/* Contenedor de la imagen del producto */}
            <div className="relative">
                <img
                    src={getProductImage(product)}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                    }}
                />

                {/* Botón de eliminar - Solo mostrar si showRemoveButton es true */}
                {showRemoveButton && onRemove && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Prevenir que se active el click de la tarjeta
                            handleRemoveClick();
                        }}
                        className="absolute top-2 right-2 bg-white bg-opacity-80 hover:bg-opacity-100 
                                 rounded-full p-2 transition-all duration-200 shadow-md
                                 hover:shadow-lg transform hover:scale-105"
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

                {/* Botón de favorito mejorado - Solo mostrar si showFavoriteButton es true */}
                {showFavoriteButton && onToggleFavorite && (
                    <button
                        onClick={handleToggleFavorite}
                        className={`absolute top-2 sm:top-3 left-2 sm:left-3 rounded-full p-1.5 sm:p-2 
                                   transition-all duration-200 shadow-md hover:shadow-lg 
                                   transform hover:scale-105 cursor-pointer
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

                {/* Indicador de favorito (solo visual cuando no hay botón interactivo) */}
                {!showFavoriteButton && isProductFavorite && (
                    <div className="absolute top-2 left-2 bg-pink-500 bg-opacity-90 rounded-full p-2 shadow-md">
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

                {/* Badge de stock */}
                {product.stock !== undefined && (
                    <>
                        {product.stock <= 5 && product.stock > 0 && (
                            <div className="absolute bottom-2 right-2">
                                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-md">
                                    ¡Solo {product.stock}!
                                </span>
                            </div>
                        )}
                        {product.stock === 0 && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <span className="bg-red-500 text-white px-3 py-1 rounded-full font-medium">
                                    Sin stock
                                </span>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Contenido de información del producto */}
            <div className="p-4">
                {/* Categoría del producto */}
                {product.category && (
                    <p
                        className="text-xs text-gray-500 uppercase tracking-wide mb-1"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                        {product.category}
                    </p>
                )}

                {/* Nombre del producto */}
                <h3
                    className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    {product.name}
                </h3>

                {/* Descripción del producto */}
                {product.description && (
                    <p
                        className="text-sm text-gray-600 mb-3 line-clamp-2"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                        {product.description}
                    </p>
                )}

                {/* Precio y stock info */}
                <div className="flex justify-between items-start mb-3">
                    <span
                        className="text-xl font-bold text-gray-900"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                        {formatPrice(product.price)}
                    </span>

                    {product.stock !== undefined && product.stock > 0 && (
                        <span className="text-xs text-gray-500">
                            Stock: {product.stock}
                        </span>
                    )}
                </div>

                {/* Botón de acción */}
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevenir que se active el click de la tarjeta
                        handleViewProduct();
                    }}
                    disabled={product.stock === 0}
                    className={`w-full px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium
                             hover:scale-105 transform transition-transform
                             ${product.stock === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed hover:scale-100'
                            : 'bg-[#FDB4B7] hover:bg-[#FCA5A9] text-white cursor-pointer'
                        }`}
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    {product.stock === 0 ? 'Sin stock' : 'Ver producto'}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
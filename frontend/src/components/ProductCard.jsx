import React from "react";

const ProductCard = ({ product, onRemove }) => {
    /**
     * Maneja el click del botón eliminar
     * Llama a la función onRemove pasada como prop
     */
    const handleRemoveClick = () => {
        if (onRemove) {
            onRemove(product.id);
        }
    };

    /**
     * Formatea el precio del producto a formato de moneda
     * @param {number} price - Precio a formatear
     * @returns {string} Precio formateado
     */
    const formatPrice = (price) => {
        return `${price.toFixed(2)}$`;
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            {/* Contenedor de la imagen del producto */}
            <div className="relative">
                <img
                    src={product.image || "/api/placeholder/280/200"}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                />

                {/* Botón de eliminar - posicionado en la esquina superior derecha */}
                <button
                    style={{ cursor: 'pointer' }}
                    onClick={handleRemoveClick}
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
            </div>

            {/* Contenido de información del producto */}
            <div className="p-4">
                {/* Categoría del producto */}
                <p
                    className="text-xs text-gray-500 uppercase tracking-wide mb-1"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    {product.category}
                </p>

                {/* Nombre del producto */}
                <h3
                    className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    {product.name}
                </h3>

                {/* Descripción del producto */}
                <p
                    className="text-sm text-gray-600 mb-3 line-clamp-2"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    {product.description}
                </p>

                {/* Precio del producto */}
                <div className="flex justify-between items-center">
                    <span
                        className="text-xl font-bold text-gray-900"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                        {formatPrice(product.price)}
                    </span>

                    {/* Botón de acción adicional (ej: añadir al carrito) */}
                    <button
                        className="bg-[#FDB4B7] hover:bg-[#FCA5A9] text-white px-4 py-2 
                                 rounded-lg transition-colors duration-200 text-sm font-medium"
                        style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                    >
                        Ver producto
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
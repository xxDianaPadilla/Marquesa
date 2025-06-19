import React from "react";

const CategorySection = ({ 
    title, 
    products = [], 
    categoryId, 
    onProductClick, 
    onViewAll 
}) => {

    /**
     * Maneja el click en un producto individual
     * @param {Object} product - Objeto del producto clickeado
     */
    const handleProductClick = (product) => {
        if (onProductClick) {
            onProductClick(product, categoryId);
        }
    };

    /**
     * Maneja el click en "Ver todos"
     */
    const handleViewAllClick = () => {
        if (onViewAll) {
            onViewAll(categoryId);
        }
    };

    /**
     * Formatea el precio del producto
     * @param {number} price - Precio a formatear
     * @returns {string} Precio formateado
     */
    const formatPrice = (price) => {
        return `${price.toFixed(2)}$`;
    };

    return (
        <section className="mb-12">
            {/* Header de la sección */}
            <div className="flex justify-between items-center mb-6">
                {/* Título y contador de productos */}
                <div>
                    <h2 
                        className="text-2xl font-bold text-gray-800 mb-1"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                        {title}
                    </h2>
                    <p 
                        className="text-sm text-gray-500"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                        {products.length} productos
                    </p>
                </div>

                {/* Botón Ver todos */}
                <button
                    onClick={handleViewAllClick}
                    className="text-[#CD5277] hover:text-[#B8476A] font-medium text-sm
                             transition-colors duration-200 flex items-center space-x-1"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    <span>Ver todos</span>
                    <svg 
                        className="w-4 h-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M9 5l7 7-7 7" 
                        />
                    </svg>
                </button>
            </div>

            {/* Scroll horizontal de productos */}
            <div className="relative">
                {/* Contenedor con scroll horizontal */}
                <div className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4 px-1">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            onClick={() => handleProductClick(product)}
                            className="flex-shrink-0 w-72 bg-white rounded-lg shadow-md overflow-hidden 
                                     hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105"
                        >
                            {/* Imagen del producto */}
                            <div className="relative">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-48 object-cover"
                                />
                                
                                {/* Badge de precio */}
                                <div className="absolute top-3 right-3 bg-white bg-opacity-90 
                                              rounded-full px-3 py-1 shadow-md">
                                    <span 
                                        className="text-sm font-bold text-gray-800"
                                        style={{ fontFamily: 'Poppins, sans-serif' }}
                                    >
                                        {formatPrice(product.price)}
                                    </span>
                                </div>

                                {/* Botón de favorito en la esquina superior izquierda */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        console.log('Añadir a favoritos:', product.id);
                                    }}
                                    className="absolute top-3 left-3 bg-white bg-opacity-80 hover:bg-opacity-100 
                                             rounded-full p-2 transition-all duration-200 shadow-md
                                             hover:shadow-lg transform hover:scale-105"
                                    aria-label="Añadir a favoritos"
                                >
                                    <svg 
                                        className="w-4 h-4 text-gray-600 hover:text-red-500" 
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
                                </button>
                            </div>

                            {/* Información del producto */}
                            <div className="p-4">
                                <h3 
                                    className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                >
                                    {product.name}
                                </h3>
                                
                                <p 
                                    className="text-sm text-gray-600 line-clamp-2 mb-3"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                >
                                    {product.description}
                                </p>

                                {/* Botón de acción */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        console.log('Añadir al carrito:', product.id);
                                    }}
                                    className="w-full bg-[#E8ACD2] hover:bg-[#E096C8] text-white py-2 px-4 
                                             rounded-lg transition-colors duration-200 text-sm font-medium"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                >
                                    Añadir al carrito
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Indicadores de scroll (gradientes en los bordes) */}
                <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-gray-50 to-transparent pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-gray-50 to-transparent pointer-events-none"></div>
            </div>

            {/* Mensaje si no hay productos */}
            {products.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <svg 
                            className="w-16 h-16 mx-auto" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={1} 
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" 
                            />
                        </svg>
                    </div>
                    <p 
                        className="text-gray-500"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                        No hay productos disponibles en esta categoría
                    </p>
                </div>
            )}
        </section>
    );
};

export default CategorySection;
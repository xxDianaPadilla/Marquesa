import React, { useState } from 'react';

const CustomCategorySection = ({
    title,
    products,
    onAddToCart,
    onCustomize,
    selectedProducts = []
}) => {
    const [hoveredProduct, setHoveredProduct] = useState(null);

    // Verificar si un producto está seleccionado
    const isProductSelected = (product) => {
        return selectedProducts.some(p => p._id === product._id);
    };

    // Manejar clic en personalizar
    const handleCustomizeClick = (product, event) => {
        // Prevenir propagación del evento para evitar doble clic
        if (event) {
            event.stopPropagation();
        }

        const isSelected = isProductSelected(product);
        console.log('CustomCategorySection - handleCustomizeClick:', {
            productName: product.name,
            currentlySelected: isSelected,
            willBeSelected: !isSelected
        });

        onCustomize(product, !isSelected);
    };

    // Mostrar mensaje si no hay productos
    if (!products || products.length === 0) {
        return (
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="text-gray-400 text-3xl mb-2">📦</div>
                    <p className="text-gray-500">No hay productos disponibles en esta categoría</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-8">
            {/* Título de la sección */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {products.length} opciones
                </span>
            </div>

            {/* Grid de productos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                    <ProductCard
                        key={product._id}
                        product={product}
                        isSelected={isProductSelected(product)}
                        isHovered={hoveredProduct === product._id}
                        onMouseEnter={() => setHoveredProduct(product._id)}
                        onMouseLeave={() => setHoveredProduct(null)}
                        onAddToCart={() => onAddToCart(product)}
                        onCustomize={(event) => handleCustomizeClick(product, event)}
                    />
                ))}
            </div>
        </div>
    );
};

const ProductCard = ({
    product,
    isSelected,
    isHovered,
    onMouseEnter,
    onMouseLeave,
    onAddToCart,
    onCustomize
}) => {
    // Determinar clases CSS basadas en el estado
    const cardClasses = `
        relative bg-white rounded-lg border-2 transition-all duration-300
        ${isSelected
            ? 'border-pink-500 shadow-lg ring-2 ring-pink-200'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }
        ${!product.inStock ? 'opacity-60' : ''}
    `;

    const buttonClasses = `
        w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 text-sm
        ${isSelected
            ? 'bg-pink-500 text-white hover:bg-pink-600'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
        ${!product.inStock ? 'opacity-50 cursor-not-allowed' : ''}
    `;

    return (
        <div
            className={cardClasses}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        // REMOVIDO: onClick del div contenedor para evitar doble evento
        >
            {/* Badge de seleccionado */}
            {isSelected && (
                <div className="absolute top-2 right-2 z-10">
                    <div className="bg-pink-500 text-white rounded-full p-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            )}

            {/* Badge de sin stock */}
            {!product.inStock && (
                <div className="absolute top-2 left-2 z-10">
                    <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        Sin stock
                    </span>
                </div>
            )}

            {/* Imagen del producto */}
            <div className="relative h-32 overflow-hidden rounded-t-lg">
                <img
                    src={product.image}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'
                        }`}
                    onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                    }}
                />

                {/* Overlay con botones en hover */}
                {isHovered && product.inStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart();
                            }}
                            className="bg-white text-gray-800 px-3 py-1 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors mr-2"
                        >
                            + Carrito
                        </button>
                    </div>
                )}
            </div>

            {/* Información del producto */}
            <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-900 truncate flex-1">
                        {product.name}
                    </h3>
                    <span className="text-sm font-bold text-pink-600 ml-2">
                        ${product.price.toFixed(2)}
                    </span>
                </div>

                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                </p>

                {/* Información de stock */}
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500">
                        Stock: {product.stock || 0}
                    </span>
                    <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-400' : 'bg-red-400'
                            }`}></div>
                        <span className={`text-xs ${product.inStock ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {product.inStock ? 'Disponible' : 'Agotado'}
                        </span>
                    </div>
                </div>

                {/* Botón de personalizar - ÚNICO punto de clic */}
                <button
                    onClick={product.inStock ? onCustomize : undefined}
                    disabled={!product.inStock}
                    className={buttonClasses}
                >
                    {isSelected ? (
                        <>
                            <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Seleccionado
                        </>
                    ) : (
                        product.inStock ? 'Personalizar' : 'No disponible'
                    )}
                </button>
            </div>
        </div>
    );
};

export default CustomCategorySection;
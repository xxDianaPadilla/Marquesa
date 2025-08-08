import React from "react";
import ProductCard from "./ProductCard"; // Asegúrate de que la ruta sea correcta

const CategorySection = ({ 
    title, 
    products = [], 
    categoryId, 
    onProductClick, 
    onViewAll,
    onToggleFavorite // Nueva prop que viene desde CategoryProducts
}) => {

    /**
     * Maneja el click en "Ver todos"
     */
    const handleViewAllClick = () => {
        if (onViewAll) {
            onViewAll(categoryId);
        }
    };

    /**
     * Adapta el producto para que funcione con ProductCard
     * ProductCard espera ciertos campos específicos
     */
    const adaptProductForCard = (product) => {
        return {
            _id: product.id, // ProductCard usa _id
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image,
            stock: product.stock,
            isPersonalizable: product.isPersonalizable,
            category: getCategoryName(categoryId), // ProductCard muestra la categoría
            // Mantener los datos originales para el toggle de favoritos
            originalProduct: product.originalProduct
        };
    };

    /**
     * Obtiene el nombre de la categoría basado en el ID
     */
    const getCategoryName = (catId) => {
        const categoryMap = {
            '688175a69579a7cde1657aaa': 'Arreglos con flores naturales',
            '688175d89579a7cde1657ac2': 'Arreglos con flores secas',
            '688175fd9579a7cde1657aca': 'Cuadros decorativos',
            '688176179579a7cde1657ace': 'Giftboxes',
            '688175e79579a7cde1657ac6': 'Tarjetas'
        };
        return categoryMap[catId] || 'Producto';
    };

    /**
     * Maneja el toggle de favorito desde ProductCard
     */
    const handleToggleFavoriteFromCard = (productId) => {
        console.log('❤️ Toggle favorite from ProductCard:', productId);
        
        // Encontrar el producto original para poder hacer el toggle
        const product = products.find(p => p.id === productId);
        if (product && product.originalProduct && onToggleFavorite) {
            onToggleFavorite(product.originalProduct);
        } else {
            console.warn('⚠️ No se pudo encontrar el producto original para toggle favorite');
        }
    };

    return (
        <section className="mb-8 sm:mb-12">
            {/* Header de la sección */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
                {/* Título y contador de productos */}
                <div className="mb-3 sm:mb-0">
                    <h2 
                        className="text-xl sm:text-2xl font-bold text-gray-800 mb-1"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                        {title}
                    </h2>
                    <p 
                        className="text-xs sm:text-sm text-gray-500"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                        {products.length} productos
                    </p>
                </div>

                {/* Botón Ver todos */}
                <button
                    onClick={handleViewAllClick}
                    className="text-[#CD5277] hover:text-[#B8476A] font-medium text-sm
                             transition-colors duration-200 flex items-center justify-start sm:justify-center space-x-1
                             cursor-pointer hover:scale-105 self-start sm:self-center"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    <span>Ver todos</span>
                    <svg 
                        className="w-3 h-3 sm:w-4 sm:h-4" 
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

            {/* Grid de productos usando ProductCard */}
            <div className="relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {products.slice(0, 8).map((product) => {
                        const adaptedProduct = adaptProductForCard(product);
                        
                        return (
                            <ProductCard
                                key={product.id}
                                product={adaptedProduct}
                                onRemove={null} // No necesitamos remover en esta vista
                                showFavoriteButton={true} // Mostrar botón de favoritos
                                showRemoveButton={false} // No mostrar botón de remover
                                isFavorite={product.isFavorite} // Estado de favorito
                                onToggleFavorite={() => handleToggleFavoriteFromCard(product.id)} // Toggle function
                            />
                        );
                    })}
                </div>
            </div>

            {/* Mensaje si hay más productos */}
            {products.length > 8 && (
                <div className="text-center mt-6">
                    <button
                        onClick={handleViewAllClick}
                        className="bg-[#CD5277] text-white px-6 py-3 rounded-lg hover:bg-[#B8476A] transition-colors font-medium"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                        Ver todos los {products.length} productos
                    </button>
                </div>
            )}

            {/* Mensaje si no hay productos */}
            {products.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                    <div className="text-gray-400 mb-4">
                        <svg 
                            className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" 
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
                        className="text-gray-500 text-sm sm:text-base"
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
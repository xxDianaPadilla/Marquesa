import React from 'react';
import { useNavigate } from 'react-router-dom';

const SearchDropdown = ({ 
    searchResults, 
    isVisible, 
    onClose, 
    onProductSelect, 
    searchTerm,
    isLoading 
}) => {
    const navigate = useNavigate();

    // Función para manejar clic en un producto específico
    const handleProductClick = (product) => {
        onProductSelect(product);
        onClose();
        // Navegar al detalle del producto si tienes esa ruta
        // navigate(`/producto/${product._id}`);
    };

    // Función para ver todos los resultados de búsqueda
    const handleViewAllResults = () => {
        onClose();
        // Navegar a página de resultados de búsqueda
        navigate(`/buscar?q=${encodeURIComponent(searchTerm)}`);
    };

    // No mostrar dropdown si no es visible o no hay término de búsqueda
    if (!isVisible || !searchTerm.trim()) {
        return null;
    }

    return (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50 max-h-96 overflow-y-auto">
            {/* Estado de carga */}
            {isLoading && (
                <div className="p-4 text-center">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-500"></div>
                        <span className="ml-2 text-gray-600">Buscando...</span>
                    </div>
                </div>
            )}

            {/* Resultados de búsqueda */}
            {!isLoading && searchResults.length > 0 && (
                <>
                    {/* Lista de productos encontrados */}
                    <div className="max-h-80 overflow-y-auto">
                        {searchResults.slice(0, 5).map((product) => (
                            <div
                                key={product._id || product.id}
                                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                onClick={() => handleProductClick(product)}
                            >
                                <div className="flex items-center space-x-3">
                                    {/* Imagen del producto */}
                                    <div className="flex-shrink-0">
                                        <img
                                            src={product.image || '/placeholder-image.jpg'}
                                            alt={product.name}
                                            className="w-12 h-12 rounded-md object-cover"
                                            onError={(e) => {
                                                e.target.src = '/placeholder-image.jpg';
                                            }}
                                        />
                                    </div>
                                    
                                    {/* Información del producto */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {product.name}
                                        </p>
                                        <p className="text-sm text-gray-500 truncate">
                                            {product.category || 'Sin categoría'}
                                        </p>
                                    </div>
                                    
                                    {/* Precio del producto */}
                                    <div className="flex-shrink-0">
                                        <p className="text-sm font-semibold text-pink-600">
                                            ${product.price || '0.00'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Botón para ver todos los resultados si hay más de 5 */}
                    {searchResults.length > 5 && (
                        <div className="p-3 border-t border-gray-200">
                            <button
                                onClick={handleViewAllResults}
                                className="w-full text-center text-sm text-pink-600 hover:text-pink-700 font-medium"
                            >
                                Ver todos los {searchResults.length} resultados
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Estado cuando no hay resultados */}
            {!isLoading && searchResults.length === 0 && searchTerm.trim() && (
                <div className="p-4 text-center">
                    <div className="text-gray-500">
                        <p className="text-sm">No se encontraron productos</p>
                        <p className="text-xs mt-1">
                            Intenta con otros términos de búsqueda
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchDropdown;
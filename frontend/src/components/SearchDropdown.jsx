import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

const SearchDropdown = ({
    searchResults,
    isVisible,
    onClose,
    onProductSelect,
    searchTerm,
    isLoading,
    searchContainerRef // Nueva prop para calcular posición
}) => {
    const navigate = useNavigate();
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

    // Calcular posición del dropdown basado en el input de búsqueda
    useEffect(() => {
        if (isVisible && searchContainerRef?.current) {
            const rect = searchContainerRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + window.scrollY + 4, // 4px de margen
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    }, [isVisible, searchContainerRef, searchTerm]);

    // Función para manejar clic en un producto específico
    const handleProductClick = (product, event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        console.log('SearchDropdown - Product clicked:', product._id);

        if (onProductSelect) {
            onProductSelect(product);
        }

        if (onClose) {
            onClose();
        }

        setTimeout(() => {
            console.log('SearchDropdown - Navigating to product:', product._id);
            navigate(`/ProductDetail/${product._id}`);
        }, 50);
    };

    // Función para ver todos los resultados de búsqueda
    const handleViewAllResults = (event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (onClose) {
            onClose();
        }

        navigate(`/buscar?q=${encodeURIComponent(searchTerm)}`);
    };

    // No mostrar dropdown si no es visible o no hay término de búsqueda
    if (!isVisible || !searchTerm.trim()) {
        return null;
    }

    const dropdownContent = (
        <div
            className="search-dropdown-portal"
            style={{
                position: 'absolute',
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
                zIndex: 999999, // Z-index muy alto para portal
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                maxHeight: '384px', // max-h-96
                overflowY: 'auto',
                pointerEvents: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
        >
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
                                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                onClick={(e) => handleProductClick(product, e)}
                                onMouseDown={(e) => e.preventDefault()}
                                style={{
                                    userSelect: 'none',
                                    pointerEvents: 'auto'
                                }}
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
                                            draggable={false}
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
                                onMouseDown={(e) => e.preventDefault()}
                                className="w-full text-center text-sm text-pink-600 hover:text-pink-700 font-medium transition-colors"
                                style={{ pointerEvents: 'auto' }}
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

    // Renderizar usando portal en el body para escapar del stacking context
    return createPortal(dropdownContent, document.body);
};

export default SearchDropdown;
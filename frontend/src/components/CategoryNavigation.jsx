import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";

/**
 * Componente de navegación por categorías optimizado
 * Diseño responsive con indicadores visuales y prevención de re-renderizados
 */
const CategoryNavigation = ({ categories, activeCategory, onCategoryChange }) => {
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollTimeoutRef = useRef(null);
    const containerRef = useRef(null);

    /**
     * Maneja el click en una categoría de forma optimizada
     * Previene clicks múltiples durante el cambio
     */
    const handleCategoryClick = useCallback((categoryId) => {
        // Prevenir clicks si ya estamos en esa categoría
        if (categoryId === activeCategory || isScrolling) {
            return;
        }

        console.log('🎯 CategoryNavigation: Click en categoría:', categoryId);
        
        // Marcar como scrolling para prevenir clicks múltiples
        setIsScrolling(true);
        
        if (onCategoryChange) {
            onCategoryChange(categoryId);
        }

        // Reset del estado de scrolling después de un breve delay
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }
        
        scrollTimeoutRef.current = setTimeout(() => {
            setIsScrolling(false);
        }, 300);
    }, [activeCategory, onCategoryChange, isScrolling]);

    /**
     * Cleanup del timeout al desmontar el componente
     */
    useEffect(() => {
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    /**
     * Scroll automático al elemento activo
     */
    useEffect(() => {
        if (containerRef.current && activeCategory) {
            const activeButton = containerRef.current.querySelector(`[data-category="${activeCategory}"]`);
            if (activeButton) {
                activeButton.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        }
    }, [activeCategory]);

    /**
     * Validación y normalización de categorías - Memoizada
     */
    const validCategories = useMemo(() => {
        if (!categories || !Array.isArray(categories) || categories.length === 0) {
            return [];
        }

        return categories.filter(category => {
            if (!category.name) {
                console.warn('Categoría sin nombre encontrada:', category);
                return false;
            }
            return true;
        }).map((category, index) => ({
            ...category,
            uniqueKey: category._id || category.id || `category-${index}`,
            categoryId: category._id || category.id
        }));
    }, [categories]);

    /**
     * Estilos dinámicos memoizados para mejor rendimiento
     */
    const getButtonStyles = useMemo(() => {
        return (categoryId, isActive) => ({
            fontFamily: 'Poppins, sans-serif',
            fontStyle: 'italic',
            fontWeight: isActive ? '500' : '400',
            fontSize: typeof window !== 'undefined' && window.innerWidth < 640 ? '12px' : '14px',
            backgroundColor: isActive ? '#E8ACD2' : 'white',
            color: isActive ? '#FFFFFF' : '#CD5277',
            minWidth: 'max-content',
            transition: 'all 0.2s ease-in-out',
            opacity: isScrolling ? 0.7 : 1,
            pointerEvents: isScrolling ? 'none' : 'auto'
        });
    }, [isScrolling]);

    /**
     * Maneja el scroll del contenedor para mostrar indicadores
     */
    const handleScroll = useCallback(() => {
        // Aquí podrías agregar lógica para mostrar indicadores de scroll
        // Por ahora, solo limpiamos el estado si es necesario
    }, []);

    // Si no hay categorías válidas, mostrar mensaje
    if (validCategories.length === 0) {
        return (
            <div className="w-full bg-white-50 py-2 sm:py-4">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                    <div 
                        className="rounded-xl sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-4 shadow-sm"
                        style={{ backgroundColor: '#FDF2F8' }}
                    >
                        <p className="text-center text-white-500 text-sm">No hay categorías disponibles</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-white-50 py-2 sm:py-4">
            {/* Container responsive */}
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                
                {/* Contenedor con fondo rosa claro redondeado */}
                <div 
                    className="rounded-xl sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-4 shadow-sm"
                    style={{ backgroundColor: '#FDF2F8' }}
                >
                    {/* Navegación horizontal con scroll automático */}
                    <div 
                        ref={containerRef}
                        className="flex space-x-2 sm:space-x-4 overflow-x-auto scrollbar-hide scroll-smooth"
                        onScroll={handleScroll}
                        style={{ 
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitScrollbar: { display: 'none' }
                        }}
                    >
                        {validCategories.map((category) => {
                            const isActive = activeCategory === category.categoryId;
                            
                            return (
                                <button
                                    key={category.uniqueKey}
                                    data-category={category.categoryId}
                                    onClick={() => handleCategoryClick(category.categoryId)}
                                    disabled={isScrolling || isActive}
                                    className={`
                                        category-button flex-shrink-0 px-3 sm:px-6 py-2 sm:py-3
                                        rounded-full text-xs sm:text-sm
                                        transition-all duration-200 whitespace-nowrap border
                                        transform hover:scale-105 active:scale-95
                                        focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-opacity-50
                                        disabled:cursor-not-allowed
                                        ${isActive
                                            ? 'border-transparent shadow-md ring-2 ring-pink-200 ring-opacity-50'
                                            : 'bg-white border-white-200 hover:border-white-300 hover:bg-white-50 hover:shadow-sm'
                                        }
                                        ${isScrolling ? 'pointer-events-none' : 'cursor-pointer'}
                                    `}
                                    style={getButtonStyles(category.categoryId, isActive)}
                                    aria-pressed={isActive}
                                    aria-label={`Filtrar por categoría: ${category.name}`}
                                >
                                    {category.name}
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* Indicadores de scroll para móvil (solo si hay overflow) */}
                    <div className="block sm:hidden mt-2">
                        <div className="flex justify-center space-x-1">
                            {[0, 1, 2].map((dot) => (
                                <div 
                                    key={`scroll-indicator-${dot}`}
                                    className="w-1 h-1 bg-white-300 rounded-full transition-colors duration-200"
                                    style={{
                                        backgroundColor: isScrolling ? '#E8ACD2' : '#D1D5DB'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS en línea para ocultar scrollbar en todos los navegadores */}
            <style jsx>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scroll-smooth {
                    scroll-behavior: smooth;
                }
            `}</style>
        </div>
    );
};

export default CategoryNavigation;
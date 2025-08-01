import React, { useState } from "react";

/**
 * Componente de navegación por categorías con scroll horizontal en móviles
 * Diseño responsive con indicadores visuales
 * CORREGIDO: Usa _id en lugar de id para consistencia
 */
const CategoryNavigation = ({ categories, activeCategory, onCategoryChange }) => {

    /**
     * Maneja el click en una categoría y notifica al componente padre
     */
    const handleCategoryClick = (categoryId) => {
        console.log('🎯 CategoryNavigation: Click en categoría:', categoryId);
        if (onCategoryChange) {
            onCategoryChange(categoryId);
        }
    };

    // Validar que categories existe y es un array
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
        return (
            <div className="w-full bg-white-50 py-2 sm:py-4">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                    <div 
                        className="rounded-xl sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-4 shadow-sm"
                        style={{ backgroundColor: '#FDF2F8' }}
                    >
                        <p className="text-center text-gray-500 text-sm">No hay categorías disponibles</p>
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
                    {/* Navegación horizontal con scroll automático en móviles */}
                    <div className="flex space-x-2 sm:space-x-4 overflow-x-auto scrollbar-hide">
                        {categories.map((category, index) => {
                            // Crear una key única combinando _id e index como fallback
                            const uniqueKey = category._id || category.id || `category-${index}`;
                            const categoryId = category._id || category.id;
                            
                            // Validar que la categoría tiene los datos necesarios
                            if (!category.name) {
                                console.warn('Categoría sin nombre encontrada:', category);
                                return null;
                            }

                            return (
                                <button
                                    key={uniqueKey}
                                    onClick={() => handleCategoryClick(categoryId)}
                                    className={`
                                        category-button flex-shrink-0 px-3 sm:px-6 py-2 sm:py-3
                                        rounded-full text-xs sm:text-sm
                                        transition-all duration-200 whitespace-nowrap border
                                        cursor-pointer hover:scale-105
                                        ${activeCategory === categoryId
                                            ? 'border-transparent shadow-sm'
                                            : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }
                                    `}
                                    style={{
                                        fontFamily: 'Poppins, sans-serif',
                                        fontStyle: 'italic',
                                        fontWeight: activeCategory === categoryId ? '500' : '400',
                                        fontSize: typeof window !== 'undefined' && window.innerWidth < 640 ? '12px' : '14px',
                                        // Colores dinámicos según estado activo
                                        backgroundColor: activeCategory === categoryId ? '#E8ACD2' : 'white',
                                        color: activeCategory === categoryId ? '#FFFFFF' : '#CD5277',
                                        minWidth: 'max-content'
                                    }}
                                >
                                    {category.name}
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* Indicadores de scroll para móvil (decorativos) */}
                    <div className="block sm:hidden">
                        <div className="flex justify-center mt-2 space-x-1">
                            {[0, 1, 2].map((dot) => (
                                <div 
                                    key={`scroll-indicator-${dot}`}
                                    className="w-1 h-1 bg-gray-300 rounded-full"
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryNavigation;
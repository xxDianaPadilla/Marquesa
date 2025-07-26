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
                        {categories?.map((category) => (
                            <button
                                key={category._id} // CORREGIDO: era category.id
                                onClick={() => handleCategoryClick(category._id)} // CORREGIDO: era category.id
                                className={`
                                    category-button flex-shrink-0 px-3 sm:px-6 py-2 sm:py-3
                                    rounded-full text-xs sm:text-sm
                                    transition-all duration-200 whitespace-nowrap border
                                    cursor-pointer hover:scale-105
                                    ${activeCategory === category._id // CORREGIDO: era category.id
                                        ? 'border-transparent shadow-sm'
                                        : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }
                                `}
                                style={{
                                    fontFamily: 'Poppins, sans-serif',
                                    fontStyle: 'italic',
                                    fontWeight: activeCategory === category._id ? '500' : '400', // CORREGIDO
                                    fontSize: window.innerWidth < 640 ? '12px' : '14px',
                                    // Colores dinámicos según estado activo
                                    backgroundColor: activeCategory === category._id ? '#E8ACD2' : 'white', // CORREGIDO
                                    color: activeCategory === category._id ? '#FFFFFF' : '#CD5277', // CORREGIDO
                                    minWidth: 'max-content'
                                }}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                    
                    {/* Indicadores de scroll para móvil (decorativos) */}
                    <div className="block sm:hidden">
                        <div className="flex justify-center mt-2 space-x-1">
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryNavigation;
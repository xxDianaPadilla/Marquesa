import React, { useState } from "react";

const CategoryNavigation = ({ categories, activeCategory, onCategoryChange }) => {

    /**
     * Maneja el click en una categoría
     * @param {string} categoryId - ID de la categoría seleccionada
     */
    const handleCategoryClick = (categoryId) => {
        if (onCategoryChange) {
            onCategoryChange(categoryId);
        }
    };

    return (
        <div className="w-full bg-white-50 py-2 sm:py-4">
            {/* Container responsive para las categorías */}
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                
                {/* Contenedor con fondo redondeado */}
                <div 
                    className="rounded-xl sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-4 shadow-sm"
                    style={{ backgroundColor: '#FDF2F8' }}
                >
                    {/* Navegación horizontal con scroll en móviles */}
                    <div className="flex space-x-2 sm:space-x-4 overflow-x-auto scrollbar-hide">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => handleCategoryClick(category.id)}
                                className={`
                                    category-button flex-shrink-0 px-3 sm:px-6 py-2 sm:py-3 
                                    rounded-full text-xs sm:text-sm
                                    transition-all duration-200 whitespace-nowrap border
                                    cursor-pointer hover:scale-105
                                    ${activeCategory === category.id
                                        ? 'border-transparent shadow-sm'
                                        : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }
                                `}
                                style={{ 
                                    fontFamily: 'Poppins, sans-serif',
                                    fontStyle: 'italic',
                                    fontWeight: activeCategory === category.id ? '500' : '400',
                                    fontSize: window.innerWidth < 640 ? '12px' : '14px',
                                    backgroundColor: activeCategory === category.id ? '#E8ACD2' : 'white',
                                    color: activeCategory === category.id ? '#FFFFFF' : '#CD5277',
                                    minWidth: 'max-content'
                                }}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>

                    {/* Indicadores de scroll para móvil */}
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
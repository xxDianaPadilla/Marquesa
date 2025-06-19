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
        <div className="w-full bg-gray-50 py-4">
            {/* Container responsive para las categorías */}
            <div className="max-w-7xl mx-auto px-4">
                
                {/* Contenedor con fondo redondeado */}
                <div 
                    className="rounded-2xl px-6 py-4 shadow-sm"
                    style={{ backgroundColor: '#FDF2F8' }}
                >
                    {/* Navegación horizontal con scroll en móviles */}
                    <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => handleCategoryClick(category.id)}
                                className={`
                                    category-button flex-shrink-0 px-6 py-3 rounded-full text-sm
                                    transition-all duration-200 whitespace-nowrap border
                                    ${activeCategory === category.id
                                        ? 'border-transparent shadow-sm'
                                        : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }
                                `}
                                style={{ 
                                    fontFamily: 'Poppins, sans-serif',
                                    fontStyle: 'italic',
                                    fontWeight: activeCategory === category.id ? '500' : '400',
                                    fontSize: '14px',
                                    backgroundColor: activeCategory === category.id ? '#E8ACD2' : 'white',
                                    color: activeCategory === category.id ? '#FFFFFF' : '#CD5277'
                                }}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryNavigation;
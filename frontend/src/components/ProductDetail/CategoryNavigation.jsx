// src/components/ProductDetail/CategoryNavigation.jsx

import React from 'react';

// Componente para la navegación de categorías
// Permite seleccionar una categoría para filtrar productos
const CategoryNavigation = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="overflow-x-auto whitespace-nowrap px-4 py-3 bg-white shadow-sm border-b">
      <div className="inline-flex space-x-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat.id
                ? 'bg-[#F7E8F2] text-[#CD5277]'
                : 'bg-gray-100 text-gray-600 hover:bg-pink-100'
            }`}
            onClick={() => onCategoryChange(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryNavigation;

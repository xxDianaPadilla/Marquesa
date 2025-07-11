import React from "react";

// Componente para los botones de filtro
// Permite seleccionar diferentes categorías de contenido
const FilterButtons = ({ activeFilter, onFilterChange }) => {
    const filters = [
        { id: "all", label: "Todos" },
        { id: "blog", label: "Blog" },
        { id: "tips", label: "Tips" },
        { id: "datos-curiosos", label: "Datos curiosos" }
    ];

    return (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
                {filters.map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => onFilterChange(filter.id)}
                        className={`
                            px-4 py-2 sm:px-6 sm:py-3 rounded-full font-medium text-xs sm:text-sm transition-all duration-300
                            ${activeFilter === filter.id 
                                ? 'bg-pink-200 text-pink-800 shadow-md' 
                                : 'bg-white text-pink-500 border border-pink-200 hover:bg-pink-50 hover:border-pink-300'
                            }
                        `}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FilterButtons;
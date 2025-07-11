import React from "react";

// Componente para los botones de filtrado
// Permite filtrar el contenido por categorías
const FilterButtons = ({ activeFilter, onFilterChange }) => {
    const filters = [
        { id: 'all', label: 'Todos', icon: '📚', description: 'Todo el contenido' },
        { id: 'blog', label: 'Blog', icon: '📝', description: 'Artículos del blog' },
        { id: 'tips', label: 'Tips', icon: '💡', description: 'Consejos útiles' },
        { id: 'datos-curiosos', label: 'Datos Curiosos', icon: '🌟', description: 'Información interesante' }
    ];

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Mobile: Dropdown selector */}
            <div className="block sm:hidden">
                <label htmlFor="filter-select" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Filtrar contenido:
                </label>
                <select
                    id="filter-select"
                    value={activeFilter}
                    onChange={(e) => onFilterChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-gray-900"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    {filters.map((filter) => (
                        <option key={filter.id} value={filter.id}>
                            {filter.icon} {filter.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Tablet and Desktop: Button grid */}
            <div className="hidden sm:block">
                {/* Filter description */}
                <div className="text-center mb-6 lg:mb-8">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Explora nuestro contenido
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Encuentra exactamente lo que buscas con nuestros filtros especializados
                    </p>
                </div>

                {/* Filter buttons grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {filters.map((filter) => {
                        const isActive = activeFilter === filter.id;
                        return (
                            <button
                                key={filter.id}
                                onClick={() => onFilterChange(filter.id)}
                                className={`
                                    group relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 
                                    transition-all duration-300 transform hover:scale-105 hover:shadow-xl
                                    border-2 focus:outline-none focus:ring-4 focus:ring-pink-300
                                    ${isActive 
                                        ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white border-pink-500 shadow-lg scale-105' 
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-pink-300 hover:bg-pink-50 shadow-md'
                                    }
                                `}
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                {/* Background pattern for active state */}
                                {isActive && (
                                    <div className="absolute inset-0 opacity-10">
                                        <div className="absolute -top-2 -right-2 w-20 h-20 bg-white rounded-full"></div>
                                        <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white rounded-full"></div>
                                    </div>
                                )}

                                {/* Content */}
                                <div className="relative z-10 text-center">
                                    {/* Icon */}
                                    <div className="text-2xl sm:text-3xl lg:text-4xl mb-2 sm:mb-3 lg:mb-4 transform transition-transform group-hover:scale-110">
                                        {filter.icon}
                                    </div>
                                    
                                    {/* Label */}
                                    <div className={`font-semibold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2 ${isActive ? 'text-white' : 'text-gray-800'}`}>
                                        {filter.label}
                                    </div>
                                    
                                    {/* Description */}
                                    <div className={`text-xs sm:text-sm lg:text-base opacity-90 ${isActive ? 'text-white' : 'text-gray-600'}`}>
                                        {filter.description}
                                    </div>

                                    {/* Active indicator */}
                                    {isActive && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full flex items-center justify-center">
                                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-pink-500 rounded-full"></div>
                                        </div>
                                    )}
                                </div>

                                {/* Hover effect */}
                                <div className={`absolute inset-0 rounded-xl sm:rounded-2xl transition-opacity duration-300 ${isActive ? 'opacity-0' : 'opacity-0 group-hover:opacity-5 bg-gradient-to-br from-pink-500 to-purple-600'}`}></div>
                            </button>
                        );
                    })}
                </div>

                {/* Filter stats */}
                <div className="mt-6 lg:mt-8 text-center">
                    <p className="text-xs sm:text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {activeFilter === 'all' ? (
                            'Mostrando todo el contenido disponible'
                        ) : (
                            `Filtrando por: ${filters.find(f => f.id === activeFilter)?.label || 'Desconocido'}`
                        )}
                    </p>
                </div>
            </div>

            {/* Decorative separator */}
            <div className="mt-8 sm:mt-10 lg:mt-12 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-pink-300 rounded-full animate-pulse"></div>
                    <div className="w-16 sm:w-24 lg:w-32 h-px bg-gradient-to-r from-pink-200 to-purple-200"></div>
                    <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <div className="w-16 sm:w-24 lg:w-32 h-px bg-gradient-to-r from-purple-200 to-pink-200"></div>
                    <div className="w-2 h-2 bg-pink-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>
            </div>
        </div>
    );
};

export default FilterButtons;
// Ruta: frontend/src/components/Reviews/ReviewsFilters.jsx
import React, { useState } from 'react';

// Componente para los filtros de reseñas
// Permite filtrar por calificación, estado, fecha y producto
const ReviewsFilters = ({ 
    filters, 
    onFiltersChange, 
    onClearFilters,
    isVisible,
    onToggleVisibility,
    sortBy,
    sortOrder,
    onSortChange,
    availableProducts = []
}) => {
    // Estado local para manejar los filtros
    // Esto permite que los cambios se reflejen inmediatamente en la UI
    const [localFilters, setLocalFilters] = useState(filters);
// Inicializa los filtros locales con los valores recibidos
    // Maneja el cambio de filtros
    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };
// Maneja el cambio de ordenamiento
// Permite alternar entre ascendente y descendente
    const handleSortChange = (field) => {
        const newOrder = sortBy === field && sortOrder === 'desc' ? 'asc' : 'desc';
        onSortChange(field, newOrder);
    };
// Maneja el borrado de todos los filtros
// Resetea los filtros a sus valores por defecto
    const handleClearAll = () => {
        const clearedFilters = {
            rating: 'todos',
            status: 'todos',
            dateFrom: '',
            dateTo: '',
            product: 'todos'
        };
        setLocalFilters(clearedFilters);
        onFiltersChange(clearedFilters);
        onClearFilters();
    };
// Verifica si hay filtros activos
// Esto se usa para mostrar un indicador visual si hay filtros aplicados    
    const hasActiveFilters = localFilters.rating !== 'todos' || 
                            localFilters.status !== 'todos' ||
                            localFilters.product !== 'todos' ||
                            localFilters.dateFrom || 
                            localFilters.dateTo || 
                            sortBy !== 'fecha' || 
                            sortOrder !== 'desc';

    // Opciones de calificación
    const ratingOptions = [
        { value: 'todos', label: 'Todas las calificaciones' },
        { value: '5', label: '⭐⭐⭐⭐⭐ (5 estrellas)' },
        { value: '4', label: '⭐⭐⭐⭐ (4 estrellas)' },
        { value: '3', label: '⭐⭐⭐ (3 estrellas)' },
        { value: '2', label: '⭐⭐ (2 estrellas)' },
        { value: '1', label: '⭐ (1 estrella)' }
    ];

    // Opciones de estado
    const statusOptions = [
        { value: 'todos', label: 'Todos los estados' },
        { value: 'pending', label: '⏳ Pendientes' },
        { value: 'replied', label: '💬 Respondidas' }
    ];

    // Opciones de ordenamiento
    const sortOptions = [
        { value: 'fecha', label: 'Fecha', icon: '📅' },
        { value: 'calificacion', label: 'Calificación', icon: '⭐' },
        { value: 'producto', label: 'Producto', icon: '📦' },
        { value: 'cliente', label: 'Cliente', icon: '👤' },
        { value: 'estado', label: 'Estado', icon: '🏷️' }
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6">
            {/* Header del panel de filtros */}
            <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Filtros y ordenamiento
                        </h3>
                        {hasActiveFilters && (
                            <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FF7260] text-white">
                                Filtros activos
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                        {hasActiveFilters && (
                            <button
                                onClick={handleClearAll}
                                className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 underline hidden sm:block"
                                style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                            >
                                Limpiar todo
                            </button>
                        )}
                        <button
                            onClick={onToggleVisibility}
                            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                            style={{ cursor: 'pointer' }}
                        >
                            <svg 
                                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 ${isVisible ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenido de filtros */}
            {isVisible && (
                <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                    {/* Botón limpiar móvil */}
                    {hasActiveFilters && (
                        <div className="sm:hidden mb-3">
                            <button
                                onClick={handleClearAll}
                                className="text-xs text-gray-600 hover:text-gray-800 underline"
                                style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                            >
                                Limpiar todos los filtros
                            </button>
                        </div>
                    )}

                    {/* Primera fila: Filtros principales */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                        {/* Filtro por calificación */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Calificación
                            </label>
                            <select
                                value={localFilters.rating || 'todos'}
                                onChange={(e) => handleFilterChange('rating', e.target.value)}
                                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-2 focus:ring-[#FF7260] focus:border-transparent"
                                style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                            >
                                {ratingOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro por estado */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Estado
                            </label>
                            <select
                                value={localFilters.status || 'todos'}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-2 focus:ring-[#FF7260] focus:border-transparent"
                                style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                            >
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro por producto */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Producto
                            </label>
                            <select
                                value={localFilters.product || 'todos'}
                                onChange={(e) => handleFilterChange('product', e.target.value)}
                                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-2 focus:ring-[#FF7260] focus:border-transparent"
                                style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                            >
                                <option value="todos">Todos los productos</option>
                                {availableProducts.map((product) => (
                                    <option key={product} value={product}>
                                        {product}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Ordenamiento responsivo */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Ordenar por
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-1">
                                {sortOptions.slice(0, 4).map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleSortChange(option.value)}
                                        className={`text-left px-1.5 sm:px-2 py-1 text-xs rounded-md transition-colors flex items-center justify-between ${
                                            sortBy === option.value
                                                ? 'bg-[#FF7260] text-white'
                                                : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
                                        }`}
                                        style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                                    >
                                        <span className="flex items-center gap-1 truncate">
                                            <span className="text-xs">{option.icon}</span>
                                            <span className="truncate">{option.label}</span>
                                        </span>
                                        {sortBy === option.value && (
                                            <svg 
                                                className={`w-3 h-3 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Segunda fila: Filtros por fecha */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {/* Filtro por fecha desde */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Fecha desde
                            </label>
                            <input
                                type="date"
                                value={localFilters.dateFrom || ''}
                                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-2 focus:ring-[#FF7260] focus:border-transparent"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            />
                        </div>

                        {/* Filtro por fecha hasta */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Fecha hasta
                            </label>
                            <input
                                type="date"
                                value={localFilters.dateTo || ''}
                                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-2 focus:ring-[#FF7260] focus:border-transparent"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewsFilters;
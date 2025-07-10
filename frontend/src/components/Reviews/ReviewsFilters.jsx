import React, { useState } from 'react';

const ReviewsFilters = ({ 
    filters, 
    onFiltersChange, 
    onClearFilters,
    isVisible,
    onToggleVisibility,
    sortBy,
    sortOrder,
    onSortChange
}) => {
    const [localFilters, setLocalFilters] = useState(filters);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const handleSortChange = (field) => {
        const newOrder = sortBy === field && sortOrder === 'desc' ? 'asc' : 'desc';
        onSortChange(field, newOrder);
    };

    const handleClearAll = () => {
        const clearedFilters = {
            dateFrom: '',
            dateTo: '',
            verified: false,
            hasImages: false,
            sortBy: 'fecha',
            sortOrder: 'desc'
        };
        setLocalFilters(clearedFilters);
        onFiltersChange(clearedFilters);
        onClearFilters();
    };

    const hasActiveFilters = localFilters.dateFrom || localFilters.dateTo || 
                            localFilters.verified || localFilters.hasImages ||
                            sortBy !== 'fecha' || sortOrder !== 'desc';

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            {/* Header del panel de filtros */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Filtros avanzados
                        </h3>
                        {hasActiveFilters && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Filtros activos
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {hasActiveFilters && (
                            <button
                                onClick={handleClearAll}
                                className="text-sm text-gray-600 hover:text-gray-800 underline"
                                style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                            >
                                Limpiar filtros
                            </button>
                        )}
                        <button
                            onClick={onToggleVisibility}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                            style={{ cursor: 'pointer' }}
                        >
                            <svg 
                                className={`w-5 h-5 transition-transform duration-200 ${isVisible ? 'rotate-180' : ''}`} 
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
                <div className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Filtro por fecha */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Rango de fechas
                            </h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Desde
                                    </label>
                                    <input
                                        type="date"
                                        value={localFilters.dateFrom}
                                        onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#FF7260] focus:border-transparent"
                                        style={{ fontFamily: 'Poppins, sans-serif' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Hasta
                                    </label>
                                    <input
                                        type="date"
                                        value={localFilters.dateTo}
                                        onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#FF7260] focus:border-transparent"
                                        style={{ fontFamily: 'Poppins, sans-serif' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Filtro por tipo de reseña */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Tipo de reseña
                            </h4>
                            <div className="space-y-3">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={localFilters.verified}
                                        onChange={(e) => handleFilterChange('verified', e.target.checked)}
                                        className="rounded border-gray-300 text-[#FF7260] focus:ring-[#FF7260] focus:ring-offset-0"
                                    />
                                    <span className="ml-2 text-sm text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Solo verificadas
                                    </span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={localFilters.hasImages}
                                        onChange={(e) => handleFilterChange('hasImages', e.target.checked)}
                                        className="rounded border-gray-300 text-[#FF7260] focus:ring-[#FF7260] focus:ring-offset-0"
                                    />
                                    <span className="ml-2 text-sm text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Con imágenes
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Ordenamiento */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Ordenar por
                            </h4>
                            <div className="space-y-2">
                                {[
                                    { value: 'fecha', label: 'Fecha' },
                                    { value: 'calificacion', label: 'Calificación' },
                                    { value: 'producto', label: 'Producto' },
                                    { value: 'cliente', label: 'Cliente' }
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleSortChange(option.value)}
                                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between ${
                                            sortBy === option.value
                                                ? 'bg-[#FF7260] text-white'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                        style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                                    >
                                        <span>{option.label}</span>
                                        {sortBy === option.value && (
                                            <svg 
                                                className={`w-4 h-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} 
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

                        {/* Acciones rápidas */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Acciones rápidas
                            </h4>
                            <div className="space-y-2">
                                <button
                                    onClick={() => {
                                        const today = new Date().toISOString().split('T')[0];
                                        handleFilterChange('dateFrom', today);
                                        handleFilterChange('dateTo', today);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                                    style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                                >
                                    Solo hoy
                                </button>
                                <button
                                    onClick={() => {
                                        const today = new Date();
                                        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                                        handleFilterChange('dateFrom', weekAgo.toISOString().split('T')[0]);
                                        handleFilterChange('dateTo', today.toISOString().split('T')[0]);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                                    style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                                >
                                    Última semana
                                </button>
                                <button
                                    onClick={() => {
                                        const today = new Date();
                                        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                                        handleFilterChange('dateFrom', monthAgo.toISOString().split('T')[0]);
                                        handleFilterChange('dateTo', today.toISOString().split('T')[0]);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                                    style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                                >
                                    Último mes
                                </button>
                                <button
                                    onClick={() => {
                                        handleFilterChange('verified', true);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                                    style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                                >
                                    Solo verificadas
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewsFilters;
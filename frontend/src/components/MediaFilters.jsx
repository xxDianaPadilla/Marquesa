import React, { useState } from 'react';

// Componente para los filtros avanzados de medios
// Permite filtrar por fecha, tipo de archivo y ordenamiento
const MediaFilters = ({ 
    filters, 
    onFiltersChange, 
    onClearFilters,
    isVisible,
    onToggleVisibility
}) => {
    // Estado local para manejar los filtros
    // Esto permite que los cambios se reflejen en el componente sin afectar directamente al estado global
    const [localFilters, setLocalFilters] = useState(filters);
    // Funciones para manejar los cambios en los filtros
    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };
    // Función para limpiar todos los filtros
    const handleClearAll = () => {
        const clearedFilters = {
            dateFrom: '',
            dateTo: '',
            hasImage: false,
            hasVideo: false,
            sortBy: 'createdAt',
            sortOrder: 'desc'
        };
        setLocalFilters(clearedFilters);
        onFiltersChange(clearedFilters);
        onClearFilters();
    };
    // Verificar si hay filtros activos para mostrar el botón de limpiar
    const hasActiveFilters = localFilters.dateFrom || localFilters.dateTo || 
                            localFilters.hasImage || localFilters.hasVideo ||
                            localFilters.sortBy !== 'createdAt' || localFilters.sortOrder !== 'desc';

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
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                Limpiar filtros
                            </button>
                        )}
                        <button
                            onClick={onToggleVisibility}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
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

                        {/* Filtro por tipo de archivo */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Tipo de archivo
                            </h4>
                            <div className="space-y-3">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={localFilters.hasImage}
                                        onChange={(e) => handleFilterChange('hasImage', e.target.checked)}
                                        className="rounded border-gray-300 text-[#FF7260] focus:ring-[#FF7260] focus:ring-offset-0"
                                    />
                                    <span className="ml-2 text-sm text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Tiene imagen
                                    </span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={localFilters.hasVideo}
                                        onChange={(e) => handleFilterChange('hasVideo', e.target.checked)}
                                        className="rounded border-gray-300 text-[#FF7260] focus:ring-[#FF7260] focus:ring-offset-0"
                                    />
                                    <span className="ml-2 text-sm text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Tiene video
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Ordenamiento */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Ordenar por
                            </h4>
                            <div className="space-y-3">
                                <select
                                    value={localFilters.sortBy}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#FF7260] focus:border-transparent"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                >
                                    <option value="createdAt">Fecha de creación</option>
                                    <option value="title">Título</option>
                                    <option value="type">Tipo</option>
                                </select>
                                <select
                                    value={localFilters.sortOrder}
                                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#FF7260] focus:border-transparent"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                >
                                    <option value="desc">Más reciente primero</option>
                                    <option value="asc">Más antiguo primero</option>
                                </select>
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
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
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
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
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
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                >
                                    Último mes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaFilters;
// Ruta: frontend/src/components/Reviews/ReviewsHeader.jsx
import React from 'react';

// Componente para el encabezado de reseñas
// Incluye título, descripción, buscador y estadísticas responsivas
const ReviewsHeader = ({ 
    searchTerm, 
    onSearchChange, 
    stats,
    loading,
    error
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
            {/* Título, descripción y búsqueda responsivos */}
            <div className="flex flex-col space-y-3 lg:flex-row lg:justify-between lg:items-start lg:space-y-0 mb-4 sm:mb-6">
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Reseñas de Marquesa
                    </h1>
                    <p className="text-gray-600 mt-1 text-xs sm:text-sm lg:text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Gestiona y responde a las reseñas de tus productos
                    </p>
                </div>
                
                {/* Buscador optimizado para responsive */}
                <div className="w-full lg:w-auto lg:min-w-[280px] xl:min-w-[320px]">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar por cliente, producto o comentario..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-8 sm:pl-10 pr-10 sm:pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent text-xs sm:text-sm lg:text-base"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        />
                        <svg className="absolute left-2 sm:left-3 top-2.5 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {searchTerm && (
                            <button
                                onClick={() => onSearchChange('')}
                                className="absolute right-2 sm:right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                                style={{ cursor: 'pointer' }}
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Estadísticas completamente responsivas */}
            {stats && !loading && !error && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
                    <div className="bg-gray-50 p-2 sm:p-3 lg:p-4 rounded-lg border border-gray-100">
                        <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {stats.total || 0}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Total
                        </div>
                    </div>
                    
                    <div className="bg-blue-50 p-2 sm:p-3 lg:p-4 rounded-lg border border-blue-100">
                        <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-blue-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {stats.averageRating || 0}
                        </div>
                        <div className="text-xs sm:text-sm text-blue-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Promedio
                        </div>
                    </div>
                    
                    <div className="bg-green-50 p-2 sm:p-3 lg:p-4 rounded-lg border border-green-100">
                        <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-green-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {stats.positiveReviews || 0}
                        </div>
                        <div className="text-xs sm:text-sm text-green-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Positivas
                        </div>
                    </div>
                    
                    <div className="bg-yellow-50 p-2 sm:p-3 lg:p-4 rounded-lg border border-yellow-100">
                        <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-yellow-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {stats.pending || 0}
                        </div>
                        <div className="text-xs sm:text-sm text-yellow-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Pendientes
                        </div>
                    </div>
                    
                    <div className="bg-purple-50 p-2 sm:p-3 lg:p-4 rounded-lg border border-purple-100">
                        <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-purple-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {stats.replied || 0}
                        </div>
                        <div className="text-xs sm:text-sm text-purple-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Respondidas
                        </div>
                    </div>
                    
                    <div className="bg-red-50 p-2 sm:p-3 lg:p-4 rounded-lg border border-red-100">
                        <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-red-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {stats.negativeReviews || 0}
                        </div>
                        <div className="text-xs sm:text-sm text-red-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Negativas
                        </div>
                    </div>
                </div>
            )}

            {/* Estado de carga responsivo */}
            {loading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-gray-50 p-2 sm:p-3 lg:p-4 rounded-lg border border-gray-100 animate-pulse">
                            <div className="h-6 sm:h-8 bg-gray-200 rounded mb-1 sm:mb-2"></div>
                            <div className="h-3 sm:h-4 bg-gray-200 rounded w-12 sm:w-16"></div>
                        </div>
                    ))}
                </div>
            )}

            {/* Error responsivo */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                            <p className="text-red-600 text-xs sm:text-sm break-words" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Error al cargar estadísticas: {error}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewsHeader;
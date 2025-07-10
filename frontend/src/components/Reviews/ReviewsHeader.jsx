import React from 'react';

const ReviewsHeader = ({ 
    searchTerm, 
    onSearchChange, 
    selectedRating, 
    onRatingChange,
    selectedProduct,
    onProductChange,
    stats,
    loading,
    error
}) => {
    // Opciones de calificación
    const ratingOptions = [
        { value: 'todos', label: 'Todas las calificaciones' },
        { value: '5', label: '5 estrellas' },
        { value: '4', label: '4 estrellas' },
        { value: '3', label: '3 estrellas' },
        { value: '2', label: '2 estrellas' },
        { value: '1', label: '1 estrella' }
    ];

    // Opciones de productos (mockup - en un caso real vendría de la API)
    const productOptions = [
        { value: 'todos', label: 'Todos los productos' },
        { value: 'ramo-flores-secas', label: 'Ramo de flores secas lavanda' },
        { value: 'cuadro-sencillo', label: 'Cuadro sencillo de hogar' },
        { value: 'ramo-rosas-frescas', label: 'Ramo de rosas frescas' },
        { value: 'arreglo-primaveral', label: 'Arreglo floral primaveral' }
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
            {/* Título y descripción */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Reseñas de Marquesa
                    </h1>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Gestiona y responde a las reseñas de tus productos
                    </p>
                </div>
            </div>

            {/* Filtros y búsqueda */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
                {/* Buscador */}
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Buscar por cliente, producto o comentario..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent text-sm sm:text-base"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    />
                    <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Filtro por calificación */}
                <select
                    value={selectedRating}
                    onChange={(e) => onRatingChange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent text-sm sm:text-base"
                    style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                >
                    {ratingOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                {/* Filtro por producto */}
                <select
                    value={selectedProduct}
                    onChange={(e) => onProductChange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent text-sm sm:text-base"
                    style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                >
                    {productOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Estadísticas */}
            {stats && !loading && !error && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-100">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {stats.totalReviews || 0}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Total de reseñas
                        </div>
                    </div>
                    <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-100">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {stats.averageRating || 0}
                        </div>
                        <div className="text-xs sm:text-sm text-green-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Promedio
                        </div>
                    </div>
                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {stats.positiveReviews || 0}
                        </div>
                        <div className="text-xs sm:text-sm text-blue-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Positivas (4-5★)
                        </div>
                    </div>
                    <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg border border-yellow-100">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {stats.neutralReviews || 0}
                        </div>
                        <div className="text-xs sm:text-sm text-yellow-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Neutras (3★)
                        </div>
                    </div>
                    <div className="bg-red-50 p-3 sm:p-4 rounded-lg border border-red-100">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {stats.negativeReviews || 0}
                        </div>
                        <div className="text-xs sm:text-sm text-red-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Negativas (1-2★)
                        </div>
                    </div>
                </div>
            )}

            {/* Estado de carga de estadísticas */}
            {loading && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-100 animate-pulse">
                            <div className="h-8 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </div>
                    ))}
                </div>
            )}

            {/* Error en estadísticas */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Error al cargar estadísticas: {error}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ReviewsHeader;
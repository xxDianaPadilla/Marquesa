import React from 'react';

// Componente para el encabezado de la sección de medios
// Incluye título, filtros, buscador y estadísticas
const MediaHeader = ({ 
    searchTerm, 
    onSearchChange, 
    selectedType, 
    onTypeChange, 
    mediaTypes, 
    onAddClick,
    stats 
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
            {/* Título y botón de acción */}
            <div className="flex flex-col space-y-3 sm:space-y-4 lg:flex-row lg:justify-between lg:items-start lg:space-y-0 mb-4 sm:mb-6">
                <div className="flex-1">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Multimedia de Marquesa
                    </h1>
                    <p className="text-gray-600 mt-1 text-xs sm:text-sm lg:text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Gestiona tus imágenes, videos y contenido multimedia
                    </p>
                </div>
                <button
                    onClick={onAddClick}
                    className="w-full sm:w-auto lg:w-auto bg-[#FDB4B7] hover:bg-[#F2C6C2] text-white px-3 sm:px-4 lg:px-6 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm lg:text-base shrink-0"
                    style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="hidden sm:inline lg:inline">Añadir Multimedia</span>
                    <span className="sm:hidden lg:hidden">Añadir</span>
                </button>
            </div>

            {/* Filtros y búsqueda */}
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
                {/* Buscador */}
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Buscar por título o descripción..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent text-xs sm:text-sm lg:text-base"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    />
                    <svg className="absolute left-2 sm:left-3 top-2.5 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Filtro por tipo */}
                <select
                    value={selectedType}
                    onChange={(e) => onTypeChange(e.target.value)}
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent text-xs sm:text-sm lg:text-base min-w-[140px] sm:min-w-[160px]"
                    style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                >
                    {mediaTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Estadísticas */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                    <div className="bg-gray-50 p-2 sm:p-3 lg:p-4 rounded-lg border border-gray-100">
                        <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {stats.total}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Total elementos
                        </div>
                    </div>
                    <div className="bg-blue-50 p-2 sm:p-3 lg:p-4 rounded-lg border border-blue-100">
                        <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-blue-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {stats.datoCurioso}
                        </div>
                        <div className="text-xs sm:text-sm text-blue-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Datos curiosos
                        </div>
                    </div>
                    <div className="bg-green-50 p-2 sm:p-3 lg:p-4 rounded-lg border border-green-100">
                        <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-green-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {stats.tip}
                        </div>
                        <div className="text-xs sm:text-sm text-green-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Tips
                        </div>
                    </div>
                    <div className="bg-purple-50 p-2 sm:p-3 lg:p-4 rounded-lg border border-purple-100">
                        <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-purple-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {stats.blog}
                        </div>
                        <div className="text-xs sm:text-sm text-purple-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Blogs
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaHeader;
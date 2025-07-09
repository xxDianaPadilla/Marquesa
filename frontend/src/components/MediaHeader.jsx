import React from 'react';

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
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
            {/* Título y botón de acción */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Multimedia de Marquesa
                    </h1>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Gestiona tus imágenes, videos y contenido multimedia
                    </p>
                </div>
                <button
                    onClick={onAddClick}
                    className="w-full sm:w-auto bg-[#FDB4B7] hover:bg-[#F2C6C2] text-white px-4 sm:px-6 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                    style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="hidden sm:inline">Añadir Multimedia</span>
                    <span className="sm:hidden">Añadir</span>
                </button>
            </div>

            {/* Filtros y búsqueda */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {/* Buscador */}
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Buscar por título o descripción..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent text-sm sm:text-base"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    />
                    <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Filtro por tipo */}
                <select
                    value={selectedType}
                    onChange={(e) => onTypeChange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent text-sm sm:text-base"
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-100">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {stats.total}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Total de elementos
                        </div>
                    </div>
                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {stats.datoCurioso}
                        </div>
                        <div className="text-xs sm:text-sm text-blue-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Datos curiosos
                        </div>
                    </div>
                    <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-100">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {stats.tip}
                        </div>
                        <div className="text-xs sm:text-sm text-green-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Tips
                        </div>
                    </div>
                    <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border border-purple-100">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
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
import React from "react";
import MediaContentCards from "./MediaContentCards";

// Componente para mostrar una cuadrícula de elementos multimedia
// Utiliza MediaContentCards para renderizar cada elemento
const MediaGrid = ({ mediaItems }) => {
    if (!mediaItems || mediaItems.length === 0) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 lg:p-16 text-center">
                    {/* Empty state illustration */}
                    <div className="text-gray-400 mb-6">
                        <svg className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        No hay contenido disponible
                    </h3>
                    
                    <p className="text-gray-500 text-sm sm:text-base lg:text-lg mb-8 max-w-md mx-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        No se encontraron artículos que coincidan con los filtros seleccionados. Intenta con otros criterios de búsqueda.
                    </p>

                    {/* Suggestions */}
                    <div className="bg-gray-50 rounded-lg p-6 max-w-lg mx-auto">
                        <h4 className="text-lg font-semibold text-gray-700 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Sugerencias:
                        </h4>
                        <ul className="text-left text-sm text-gray-600 space-y-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                                Verifica que no hay filtros activos
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                                Intenta con diferentes categorías
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                                Regresa más tarde para nuevo contenido
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Grid header with count */}
            <div className="mb-6 sm:mb-8 lg:mb-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Artículos encontrados
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {mediaItems.length} {mediaItems.length === 1 ? 'artículo' : 'artículos'} disponibles
                        </p>
                    </div>

                    {/* Sort options (future enhancement) */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Ordenar por:
                        </span>
                        <select className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            <option value="recent">Más reciente</option>
                            <option value="popular">Más popular</option>
                            <option value="alphabetical">A-Z</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
                {mediaItems.map((item, index) => (
                    <div 
                        key={item.id} 
                        className="w-full"
                        style={{
                            animationDelay: `${index * 0.1}s`
                        }}
                    >
                        <MediaContentCards item={item} />
                    </div>
                ))}
            </div>

            {/* Grid footer */}
            <div className="mt-12 sm:mt-16 lg:mt-20 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Has visto {mediaItems.length} {mediaItems.length === 1 ? 'artículo' : 'artículos'}
                </div>
            </div>
        </div>
    );
};

export default MediaGrid;
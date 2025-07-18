import React from 'react';
import ReviewsTable from './ReviewsTable';
import ReviewsList from './ReviewsList';

/**
 * Componente ReviewsContent - Contenedor principal para mostrar reseñas
 * 
 * Maneja la presentación de reseñas en diferentes formatos según el dispositivo:
 * - Vista de tabla para desktop (ReviewsTable)
 * - Vista de lista/tarjetas para móvil y tablet (ReviewsList)
 * También gestiona los estados de carga y error con sus respectivas interfaces.
 * 
 * @param {Object} props - Props del componente
 * @param {Array} props.reviews - Array de reseñas a mostrar
 * @param {boolean} props.loading - Estado de carga
 * @param {string} props.error - Mensaje de error si existe
 * @param {number} props.totalItems - Total de reseñas disponibles
 * @param {Function} props.onReply - Función callback para responder reseñas
 * @param {Function} props.onModerate - Función callback para moderar reseñas
 * @param {Function} props.onDelete - Función callback para eliminar reseñas
 * @param {Function} props.onReviewUpdate - Función callback para actualizar reseñas
 */
const ReviewsContent = ({
    reviews,
    loading,
    error,
    totalItems,
    onReply,
    onModerate,
    onDelete,
    onReviewUpdate
}) => {
    
    /**
     * Estado de carga - Muestra skeletons responsivos
     * Diferentes layouts de loading para desktop y móvil
     */
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Loading skeleton para vista desktop (tabla) */}
                <div className="hidden lg:block">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            {/* Header de la tabla */}
                            <thead className="bg-gray-50">
                                <tr>
                                    {['Cliente', 'Producto', 'Calificación', 'Comentario', 'Estado', 'Fecha', 'Acciones'].map((header) => (
                                        <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            {/* Filas de loading */}
                            <tbody className="bg-white divide-y divide-gray-200">
                                {[...Array(5)].map((_, index) => (
                                    <tr key={index} className="animate-pulse">
                                        {/* Columna Cliente */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 bg-gray-200 rounded-full mr-3"></div>
                                                <div className="space-y-2">
                                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Columna Producto */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-12 w-12 bg-gray-200 rounded-lg mr-3"></div>
                                                <div className="space-y-2">
                                                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Columna Calificación */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <div key={i} className="h-4 w-4 bg-gray-200 rounded"></div>
                                                ))}
                                            </div>
                                        </td>
                                        {/* Columna Comentario */}
                                        <td className="px-6 py-4">
                                            <div className="space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                                            </div>
                                        </td>
                                        {/* Columna Estado */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                                        </td>
                                        {/* Columna Fecha */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                                        </td>
                                        {/* Columna Acciones */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2 justify-end">
                                                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                                                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Loading skeleton para vista móvil (tarjetas) */}
                <div className="lg:hidden px-2 sm:px-4">
                    <div className="space-y-3 sm:space-y-4">
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 animate-pulse">
                                {/* Header de la tarjeta */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center flex-1">
                                        <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 rounded-full mr-2 sm:mr-3"></div>
                                        <div className="space-y-2 flex-1">
                                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                                        </div>
                                    </div>
                                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                                </div>
                                
                                {/* Sección producto */}
                                <div className="flex items-center mb-3 p-2 bg-gray-50 rounded-lg">
                                    <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 rounded-lg mr-2"></div>
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 bg-gray-200 rounded w-28"></div>
                                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                                    </div>
                                </div>
                                
                                {/* Calificación */}
                                <div className="flex items-center mb-3">
                                    <div className="flex space-x-1 mr-2">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="h-3 w-3 sm:h-4 sm:w-4 bg-gray-200 rounded"></div>
                                        ))}
                                    </div>
                                    <div className="h-4 bg-gray-200 rounded w-8"></div>
                                </div>
                                
                                {/* Comentario */}
                                <div className="space-y-2 mb-3">
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                </div>
                                
                                {/* Footer con acciones */}
                                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                                    <div className="flex space-x-1">
                                        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                                        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Estado de error - Muestra mensaje de error con opción de reintento
     * Interface de error responsiva con botón para recargar
     */
    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 sm:p-8 text-center">
                    {/* Ícono de error */}
                    <div className="text-red-500 mb-4">
                        <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-red-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Error al cargar las reseñas
                    </h3>
                    {/* Mensaje de error */}
                    <p className="text-red-600 text-sm break-words px-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {error}
                    </p>
                    {/* Botón de reintento */}
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                        style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                    >
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        );
    }

    /**
     * Estado normal - Renderiza las reseñas
     * Utiliza componentes separados para desktop y móvil
     */
    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Vista Desktop - Tabla completa (solo visible en lg+) */}
            <div className="hidden lg:block">
                <ReviewsTable 
                    reviews={reviews}
                    onReply={onReply}
                    onModerate={onModerate}
                    onDelete={onDelete}
                    onReviewUpdate={onReviewUpdate}
                />
            </div>

            {/* Vista Mobile y Tablet - Lista de tarjetas (oculto en lg+) */}
            <div className="lg:hidden">
                <ReviewsList 
                    reviews={reviews}
                    onReply={onReply}
                    onModerate={onModerate}
                    onDelete={onDelete}
                    onReviewUpdate={onReviewUpdate}
                />
            </div>

            {/* Footer con información del total - Solo desktop */}
            {reviews.length > 0 && (
                <div className="hidden lg:block border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50">
                    <div className="text-center text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Mostrando {reviews.length} de {totalItems || reviews.length} reseñas
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewsContent;
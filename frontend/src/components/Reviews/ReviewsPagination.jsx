import React from 'react';

/**
 * Componente ReviewsPagination - Sistema de paginación para las reseñas
 * 
 * Proporciona controles de navegación entre páginas con información detallada
 * del estado actual. Incluye botones anterior/siguiente y números de página.
 * Responsive y accesible con estados disabled apropiados.
 * 
 * @param {Object} props - Props del componente
 * @param {Object} props.paginationInfo - Información de paginación
 * @param {Function} props.onPageChange - Función para cambiar a una página específica
 * @param {Function} props.onNextPage - Función para ir a la página siguiente
 * @param {Function} props.onPreviousPage - Función para ir a la página anterior
 * @param {Function} props.getPageNumbers - Función para obtener números de página a mostrar
 */
const ReviewsPagination = ({ 
    paginationInfo, 
    onPageChange, 
    onNextPage, 
    onPreviousPage, 
    getPageNumbers 
}) => {
    
    /**
     * Extracción de información de paginación
     * Destructuring para obtener todos los datos necesarios
     */
    const { 
        startItem,       // Primer elemento mostrado en la página actual
        endItem,         // Último elemento mostrado en la página actual
        totalItems,      // Total de elementos en toda la colección
        currentPage,     // Página actual
        totalPages,      // Total de páginas disponibles
        hasNextPage,     // Si existe una página siguiente
        hasPreviousPage  // Si existe una página anterior
    } = paginationInfo;

    /**
     * No mostrar paginación si solo hay una página
     * Evita renderizar controles innecesarios
     */
    if (totalPages <= 1) {
        return null;
    }

    /**
     * Obtener números de página a mostrar
     * Limita a 5 páginas visibles para no saturar la interfaz
     */
    const pageNumbers = getPageNumbers(5);

    return (
        <div className="bg-white border-t border-gray-200 px-4 py-3 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Información de elementos mostrados */}
                <div className="text-sm text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Mostrando{' '}
                    <span className="font-medium">{startItem}</span>
                    {' '}-{' '}
                    <span className="font-medium">{endItem}</span>
                    {' '}de{' '}
                    <span className="font-medium">{totalItems}</span>
                    {' '}reseñas
                </div>

                {/* Controles de navegación */}
                <div className="flex items-center space-x-2">
                    
                    {/* Botón página anterior */}
                    <button
                        onClick={onPreviousPage}
                        disabled={!hasPreviousPage}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium ${
                            hasPreviousPage
                                ? 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50 cursor-pointer'
                                : 'border-gray-300 bg-gray-100 text-gray-300 cursor-not-allowed'
                        }`}
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                        aria-label="Página anterior"
                    >
                        <span className="sr-only">Anterior</span>
                        {/* Ícono flecha izquierda */}
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>

                    {/* Números de página */}
                    <div className="flex">
                        {pageNumbers.map((pageNum) => (
                            <button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                    pageNum === currentPage
                                        ? 'border-[#FF7260] bg-[#FF7260] text-white'
                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
                                }`}
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                                aria-label={`Página ${pageNum}`}
                                aria-current={pageNum === currentPage ? 'page' : undefined}
                            >
                                {pageNum}
                            </button>
                        ))}
                    </div>

                    {/* Botón página siguiente */}
                    <button
                        onClick={onNextPage}
                        disabled={!hasNextPage}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium ${
                            hasNextPage
                                ? 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50 cursor-pointer'
                                : 'border-gray-300 bg-gray-100 text-gray-300 cursor-not-allowed'
                        }`}
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                        aria-label="Página siguiente"
                    >
                        <span className="sr-only">Siguiente</span>
                        {/* Ícono flecha derecha */}
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Información adicional para pantallas pequeñas */}
            <div className="sm:hidden mt-3 text-center">
                <span className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Página {currentPage} de {totalPages}
                </span>
            </div>
        </div>
    );
};

export default ReviewsPagination;
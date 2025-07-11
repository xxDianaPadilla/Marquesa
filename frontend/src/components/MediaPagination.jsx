import React from 'react';

// Componente para mostrar una tabla de elementos multimedia
// Permite editar, eliminar y copiar URLs de imágenes y videos
const MediaPagination = ({ 
    paginationInfo, 
    onPageChange, 
    onNextPage, 
    onPreviousPage, 
    getPageNumbers 
}) => {
    const { 
        startItem, 
        endItem, 
        totalItems, 
        currentPage, 
        totalPages, 
        hasNextPage, 
        hasPreviousPage 
    } = paginationInfo;

    if (totalPages <= 1) {
        return null; // No mostrar paginación si solo hay una página
    }
   // Generar números de página para mostrar
    const pageNumbers = getPageNumbers(5);

    return (
        <div className="bg-white border-t border-gray-200 px-4 py-3 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Información de elementos */}
                <div className="text-sm text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Mostrando{' '}
                    <span className="font-medium">{startItem}</span>
                    {' '}-{' '}
                    <span className="font-medium">{endItem}</span>
                    {' '}de{' '}
                    <span className="font-medium">{totalItems}</span>
                    {' '}elementos
                </div>

                {/* Controles de paginación */}
                <div className="flex items-center space-x-2">
                    {/* Botón anterior */}
                    <button
                        onClick={onPreviousPage}
                        disabled={!hasPreviousPage}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium ${
                            hasPreviousPage
                                ? 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50 cursor-pointer'
                                : 'border-gray-300 bg-gray-100 text-gray-300 cursor-not-allowed'
                        }`}
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                        <span className="sr-only">Anterior</span>
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
                            >
                                {pageNum}
                            </button>
                        ))}
                    </div>

                    {/* Botón siguiente */}
                    <button
                        onClick={onNextPage}
                        disabled={!hasNextPage}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium ${
                            hasNextPage
                                ? 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50 cursor-pointer'
                                : 'border-gray-300 bg-gray-100 text-gray-300 cursor-not-allowed'
                        }`}
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                        <span className="sr-only">Siguiente</span>
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

export default MediaPagination;
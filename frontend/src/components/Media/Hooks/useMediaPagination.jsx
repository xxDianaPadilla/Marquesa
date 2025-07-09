import { useState, useMemo, useCallback } from 'react';

export const useMediaPagination = (items = [], itemsPerPage = 12) => {
    const [currentPage, setCurrentPage] = useState(1);

    // Calcular total de páginas
    const totalPages = useMemo(() => {
        return Math.ceil(items.length / itemsPerPage);
    }, [items.length, itemsPerPage]);

    // Obtener elementos de la página actual
    const currentItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return items.slice(startIndex, endIndex);
    }, [items, currentPage, itemsPerPage]);

    // Información de paginación
    const paginationInfo = useMemo(() => {
        const startItem = (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, items.length);
        
        return {
            startItem,
            endItem,
            totalItems: items.length,
            currentPage,
            totalPages,
            hasNextPage: currentPage < totalPages,
            hasPreviousPage: currentPage > 1
        };
    }, [currentPage, itemsPerPage, items.length, totalPages]);

    // Cambiar página
    const goToPage = useCallback((page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    }, [totalPages]);

    // Página siguiente
    const nextPage = useCallback(() => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    }, [currentPage, totalPages]);

    // Página anterior
    const previousPage = useCallback(() => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    }, [currentPage]);

    // Primera página
    const firstPage = useCallback(() => {
        setCurrentPage(1);
    }, []);

    // Última página
    const lastPage = useCallback(() => {
        setCurrentPage(totalPages);
    }, [totalPages]);

    // Resetear a primera página (útil cuando cambian los filtros)
    const resetToFirstPage = useCallback(() => {
        setCurrentPage(1);
    }, []);

    // Generar números de página para mostrar
    const getPageNumbers = useCallback((maxVisible = 5) => {
        const pages = [];
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        // Ajustar si estamos cerca del final
        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    }, [currentPage, totalPages]);

    return {
        // Datos
        currentItems,
        paginationInfo,
        
        // Acciones
        goToPage,
        nextPage,
        previousPage,
        firstPage,
        lastPage,
        resetToFirstPage,
        
        // Utilidades
        getPageNumbers
    };
};
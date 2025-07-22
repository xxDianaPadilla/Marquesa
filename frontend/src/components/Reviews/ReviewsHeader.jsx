// Ruta: frontend/src/components/Reviews/ReviewsHeader.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useReviewValidation } from './Hooks/useReviewValidation';

/**
 * Componente para el encabezado de reseñas con validaciones
 * Incluye título, descripción, buscador con validación y estadísticas responsivas
 */
const ReviewsHeader = ({ 
    searchTerm, 
    onSearchChange, 
    stats,
    loading,
    error
}) => {
    // Estado local para el término de búsqueda
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || '');
    
    // Hook de validaciones
    const {
        validateSearchTerm,
        getFieldError,
        hasFieldError,
        clearFieldError
    } = useReviewValidation();

    /**
     * Efecto para sincronizar el término de búsqueda local con props
     */
    useEffect(() => {
        setLocalSearchTerm(searchTerm || '');
    }, [searchTerm]);

    /**
     * Debounce función para retrasar la búsqueda
     * Evita hacer búsquedas en cada keystroke
     */
    const debounce = useCallback((func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(null, args), delay);
        };
    }, []);

    /**
     * Función debounceda para ejecutar la búsqueda
     * Se ejecuta 300ms después del último cambio
     */
    const debouncedSearch = useCallback(
        debounce((term) => {
            // Validar el término antes de enviarlo
            const validation = validateSearchTerm(term, false);
            if (validation.isValid) {
                onSearchChange(term);
            }
        }, 300),
        [onSearchChange, validateSearchTerm]
    );

    /**
     * Maneja el cambio del término de búsqueda con validación en tiempo real
     * 
     * @param {Event} e - Evento del input
     */
    const handleSearchChange = (e) => {
        const newTerm = e.target.value;
        
        // Actualizar estado local inmediatamente
        setLocalSearchTerm(newTerm);
        
        // Limpiar error previo si existe
        if (hasFieldError('searchTerm')) {
            clearFieldError('searchTerm');
        }

        // Validar en tiempo real
        const validation = validateSearchTerm(newTerm, true);
        
        // Si es válido o está vacío, proceder con la búsqueda debounceda
        if (validation.isValid || newTerm.trim() === '') {
            debouncedSearch(newTerm);
        }
    };

    /**
     * Maneja el blur del campo de búsqueda
     * Ejecuta validación completa cuando el usuario sale del campo
     */
    const handleSearchBlur = () => {
        if (localSearchTerm.trim().length > 0) {
            validateSearchTerm(localSearchTerm, false);
        }
    };

    /**
     * Maneja la limpieza del campo de búsqueda
     * Limpia el término y los errores de validación
     */
    const handleClearSearch = () => {
        setLocalSearchTerm('');
        clearFieldError('searchTerm');
        onSearchChange('');
    };

    /**
     * Maneja el envío del formulario de búsqueda
     * Valida antes de ejecutar la búsqueda
     * 
     * @param {Event} e - Evento del formulario
     */
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        
        // Validar antes de enviar
        const validation = validateSearchTerm(localSearchTerm, false);
        if (validation.isValid) {
            onSearchChange(localSearchTerm);
        }
    };

    // Obtener errores de validación
    const searchTermError = getFieldError('searchTerm');
    const hasSearchError = hasFieldError('searchTerm');

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
                
                {/* Buscador optimizado para responsive con validación */}
                <div className="w-full lg:w-auto lg:min-w-[280px] xl:min-w-[320px]">
                    <form onSubmit={handleSearchSubmit}>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar por cliente, producto o comentario..."
                                value={localSearchTerm}
                                onChange={handleSearchChange}
                                onBlur={handleSearchBlur}
                                className={`w-full pl-8 sm:pl-10 pr-10 sm:pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF7260] focus:border-transparent text-xs sm:text-sm lg:text-base ${
                                    hasSearchError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                                maxLength={100}
                            />
                            {/* Ícono de búsqueda */}
                            <svg className="absolute left-2 sm:left-3 top-2.5 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {/* Botón limpiar búsqueda */}
                            {localSearchTerm && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute right-2 sm:right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                                    style={{ cursor: 'pointer' }}
                                    title="Limpiar búsqueda"
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </form>
                    
                    {/* Error de validación para búsqueda */}
                    {searchTermError && (
                        <div className="mt-1 flex items-center text-red-600">
                            <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {searchTermError}
                            </span>
                        </div>
                    )}
                    
                    {/* Contador de caracteres si se está escribiendo */}
                    {localSearchTerm && (
                        <div className="mt-1 text-right">
                            <span className={`text-xs ${localSearchTerm.length > 90 ? 'text-orange-600' : 'text-gray-500'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {localSearchTerm.length}/100
                            </span>
                        </div>
                    )}
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
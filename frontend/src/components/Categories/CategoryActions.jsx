import React, { useState, useCallback } from 'react';

/**
 * Componente que renderiza las acciones disponibles para una categoría
 * Incluye botones para editar y eliminar con modal de confirmación
 * Diseño completamente responsivo para mobile y desktop
 * Optimizado con React.memo y callbacks para mejor rendimiento
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.category - Objeto de categoría con datos (_id, name, etc.)
 * @param {Function} props.onEdit - Función callback para editar categoría
 * @param {Function} props.onDelete - Función callback para eliminar categoría
 * @returns {JSX.Element} Componente con botones de acción y modal de confirmación
 */
const CategoryActions = ({ category, onEdit, onDelete }) => {
    
    // ============ VALIDACIÓN DE PROPS ============
    
    // Validar que se proporcione una categoría válida
    if (!category || !category._id) {
        console.error('❌ CategoryActions: categoría inválida o sin ID:', category);
        return null;
    }

    // ============ ESTADO LOCAL ============
    
    /**
     * Estado para controlar la visibilidad del modal de confirmación
     * Se activa cuando el usuario hace clic en eliminar
     */
    const [showConfirm, setShowConfirm] = useState(false);

    /**
     * Estado para controlar si hay una operación de eliminación en progreso
     * Previene múltiples clics accidentales
     */
    const [isDeleting, setIsDeleting] = useState(false);

    // ============ MANEJADORES DE EVENTOS OPTIMIZADOS ============
    
    /**
     * Maneja el clic en el botón de editar
     * Optimizado con useCallback para evitar re-renders innecesarios
     */
    const handleEdit = useCallback(() => {
        // Validar que la función onEdit esté disponible
        if (!onEdit || typeof onEdit !== 'function') {
            console.error('❌ CategoryActions: onEdit no es una función válida');
            return;
        }

        console.log('✏️ Iniciando edición de categoría:', category.name);
        
        try {
            // Ejecutar callback de edición con los datos de la categoría
            onEdit(category);
        } catch (error) {
            console.error('❌ Error al ejecutar onEdit:', error);
        }
    }, [category, onEdit]);

    /**
     * Maneja el clic en el botón de eliminar
     * Muestra el modal de confirmación en lugar de eliminar directamente
     * Optimizado con useCallback
     */
    const handleDelete = useCallback(() => {
        // Prevenir apertura si ya está eliminando
        if (isDeleting) {
            console.log('⏳ Eliminación en progreso, ignorando clic');
            return;
        }

        console.log('🗑️ Solicitando confirmación para eliminar categoría:', category.name);
        setShowConfirm(true);
    }, [category.name, isDeleting]);

    /**
     * Confirma la eliminación y ejecuta la función callback
     * Se ejecuta cuando el usuario confirma en el modal
     * Incluye manejo de estado de carga
     */
    const confirmDelete = useCallback(async () => {
        // Validar que la función onDelete esté disponible
        if (!onDelete || typeof onDelete !== 'function') {
            console.error('❌ CategoryActions: onDelete no es una función válida');
            setShowConfirm(false);
            return;
        }

        // Prevenir múltiples eliminaciones
        if (isDeleting) {
            console.log('⏳ Eliminación ya en progreso');
            return;
        }

        console.log('✅ Confirmando eliminación de categoría:', category._id);
        
        try {
            // Indicar que la eliminación está en progreso
            setIsDeleting(true);
            
            // Ejecutar callback de eliminación con el ID de la categoría
            await onDelete(category._id);
            
            // Cerrar modal (solo si la eliminación fue exitosa)
            setShowConfirm(false);
            
        } catch (error) {
            console.error('❌ Error durante la eliminación:', error);
            // No cerrar el modal en caso de error para que el usuario pueda reintentar
        } finally {
            // Restablecer estado de eliminación
            setIsDeleting(false);
        }
    }, [category._id, onDelete, isDeleting]);

    /**
     * Cancela la eliminación y cierra el modal
     * Se ejecuta cuando el usuario cancela o cierra el modal
     * Optimizado con useCallback
     */
    const cancelDelete = useCallback(() => {
        // No permitir cancelar si ya está eliminando
        if (isDeleting) {
            console.log('⏳ No se puede cancelar, eliminación en progreso');
            return;
        }

        console.log('❌ Cancelando eliminación de categoría');
        setShowConfirm(false);
    }, [isDeleting]);

    /**
     * Maneja el clic en el overlay del modal para cerrarlo
     * Optimizado con useCallback
     */
    const handleOverlayClick = useCallback((e) => {
        // Solo cerrar si se hace clic en el overlay, no en el contenido del modal
        if (e.target === e.currentTarget) {
            cancelDelete();
        }
    }, [cancelDelete]);

    /**
     * Maneja el escape key para cerrar el modal
     * Optimizado con useCallback
     */
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            cancelDelete();
        }
    }, [cancelDelete]);

    // ============ EFECTOS ============
    
    // Agregar listener para tecla Escape cuando el modal está abierto
    React.useEffect(() => {
        if (showConfirm) {
            document.addEventListener('keydown', handleKeyDown);
            return () => {
                document.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [showConfirm, handleKeyDown]);

    // ============ RENDERIZADO DEL COMPONENTE ============
    
    return (
        <div className="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2">
            
            {/* ============ BOTÓN EDITAR ============ */}
            <button
                onClick={handleEdit}
                disabled={isDeleting} // Deshabilitar durante eliminación
                className="p-1.5 sm:p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md sm:rounded-lg transition-colors duration-150 group disabled:opacity-50 disabled:cursor-not-allowed"
                title={`Editar categoría ${category.name}`}
                aria-label={`Editar categoría ${category.name}`}
            >
                {/* Ícono de lápiz para editar */}
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                    />
                </svg>
            </button>

            {/* ============ BOTÓN ELIMINAR ============ */}
            <button
                onClick={handleDelete}
                disabled={isDeleting} // Deshabilitar durante eliminación
                className="p-1.5 sm:p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md sm:rounded-lg transition-colors duration-150 group disabled:opacity-50 disabled:cursor-not-allowed relative"
                title={`Eliminar categoría ${category.name}`}
                aria-label={`Eliminar categoría ${category.name}`}
            >
                {/* Mostrar spinner si está eliminando, sino mostrar ícono de papelera */}
                {isDeleting ? (
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                ) : (
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                        />
                    </svg>
                )}
            </button>

            {/* ============ MODAL DE CONFIRMACIÓN ============ */}
            {showConfirm && (
                <div 
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={handleOverlayClick}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-modal-title"
                    aria-describedby="delete-modal-description"
                >
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs sm:max-w-md mx-4 transform transition-all duration-300 ease-out">
                        
                        {/* ---- Header del Modal ---- */}
                        <div className="p-4 sm:p-6">
                            
                            {/* Encabezado con ícono de advertencia */}
                            <div className="flex items-start mb-3 sm:mb-4">
                                
                                {/* Ícono de advertencia en círculo rojo */}
                                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                                        />
                                    </svg>
                                </div>
                                
                                {/* Título y mensaje de confirmación */}
                                <div className="ml-3 sm:ml-4 flex-1">
                                    <h3 
                                        id="delete-modal-title"
                                        className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2" 
                                        style={{ fontFamily: 'Poppins, sans-serif' }}
                                    >
                                        Confirmar eliminación
                                    </h3>
                                    
                                    {/* Mensaje explicativo */}
                                    <div id="delete-modal-description">
                                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            ¿Estás seguro de que deseas eliminar la categoría
                                        </p>
                                        
                                        {/* Nombre de la categoría destacado */}
                                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed break-words" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            "<span className="font-medium text-gray-900">{category.name}</span>"?
                                        </p>
                                        
                                        {/* Advertencia adicional */}
                                        <p className="text-xs text-red-600 mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            Esta acción no se puede deshacer.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* ---- Botones de Acción ---- */}
                            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-6">
                                
                                {/* Botón Cancelar */}
                                <button
                                    onClick={cancelDelete}
                                    disabled={isDeleting}
                                    className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                    aria-label="Cancelar eliminación"
                                >
                                    Cancelar
                                </button>
                                
                                {/* Botón Eliminar */}
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    style={{
                                        fontFamily: 'Poppins, sans-serif',
                                        backgroundColor: isDeleting ? '#FCA5A5' : '#FDB4B7', // Color más claro cuando está deshabilitado
                                    }}
                                    // Efectos hover dinámicos solo cuando no está deshabilitado
                                    onMouseEnter={(e) => {
                                        if (!isDeleting) {
                                            e.target.style.backgroundColor = '#fc9ca0';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isDeleting) {
                                            e.target.style.backgroundColor = '#FDB4B7';
                                        }
                                    }}
                                    aria-label="Confirmar eliminación"
                                >
                                    {/* Mostrar spinner o texto según el estado */}
                                    {isDeleting ? (
                                        <>
                                            <div className="w-3 h-3 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            Eliminando...
                                        </>
                                    ) : (
                                        'Eliminar'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Exportar el componente optimizado con React.memo para evitar re-renders innecesarios
// Solo se re-renderizará si las props cambian
export default React.memo(CategoryActions);
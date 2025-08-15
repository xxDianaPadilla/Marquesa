import React, { useState, useCallback } from 'react';
import DeleteConfirmModal from '../DeleteConfirmModal';

/**
 * Componente que renderiza las acciones disponibles para una categoría
 * Incluye botones para editar y eliminar con modal de confirmación usando OverlayBackdrop
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
    const [showDeleteModal, setShowDeleteModal] = useState(false);

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

        console.log('🗑️ Abriendo modal de confirmación para categoría:', category.name);
        setShowDeleteModal(true);
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
            setShowDeleteModal(false);
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
            setShowDeleteModal(false);
            
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
        setShowDeleteModal(false);
    }, [isDeleting]);

    // ============ RENDERIZADO DEL COMPONENTE ============
    
    return (
        <>
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
            </div>

            {/* ============ MODAL DE CONFIRMACIÓN CON OVERLAYBACKDROP ============ */}
            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={cancelDelete}
                onConfirm={confirmDelete}
                title={category.name}
                type="categoría"
                isDeleting={isDeleting}
            />
        </>
    );
};

// Exportar el componente optimizado con React.memo para evitar re-renders innecesarios
// Solo se re-renderizará si las props cambian
export default React.memo(CategoryActions);
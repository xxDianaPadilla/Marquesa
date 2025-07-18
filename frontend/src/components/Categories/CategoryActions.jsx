import React, { useState } from 'react';

/**
 * Componente que renderiza las acciones disponibles para una categoría
 * Incluye botones para editar y eliminar con modal de confirmación
 * Diseño completamente responsivo para mobile y desktop
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.category - Objeto de categoría con datos (_id, name, etc.)
 * @param {Function} props.onEdit - Función callback para editar categoría
 * @param {Function} props.onDelete - Función callback para eliminar categoría
 * @returns {JSX.Element} Componente con botones de acción y modal de confirmación
 */
const CategoryActions = ({ category, onEdit, onDelete }) => {
    // ============ ESTADO LOCAL ============
    
    /**
     * Estado para controlar la visibilidad del modal de confirmación
     * Se activa cuando el usuario hace clic en eliminar
     */
    const [showConfirm, setShowConfirm] = useState(false);

    // ============ MANEJADORES DE EVENTOS ============
    
    /**
     * Maneja el clic en el botón de eliminar
     * Muestra el modal de confirmación en lugar de eliminar directamente
     */
    const handleDelete = () => {
        console.log('🗑️ Solicitando eliminación de categoría:', category.name);
        setShowConfirm(true);
    };

    /**
     * Confirma la eliminación y ejecuta la función callback
     * Se ejecuta cuando el usuario confirma en el modal
     */
    const confirmDelete = () => {
        console.log('✅ Confirmando eliminación de categoría:', category._id);
        onDelete(category._id); // Ejecutar callback con el ID de la categoría
        setShowConfirm(false); // Cerrar modal
    };

    /**
     * Cancela la eliminación y cierra el modal
     * Se ejecuta cuando el usuario cancela o cierra el modal
     */
    const cancelDelete = () => {
        console.log('❌ Cancelando eliminación de categoría');
        setShowConfirm(false);
    };

    // ============ RENDERIZADO DEL COMPONENTE ============
    
    return (
        <div className="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2">
            
            {/* ============ BOTÓN EDITAR ============ */}
            <button
                onClick={() => onEdit(category)}
                className="p-1.5 sm:p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md sm:rounded-lg transition-colors duration-150 group"
                title="Editar categoría"
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
                className="p-1.5 sm:p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md sm:rounded-lg transition-colors duration-150 group"
                title="Eliminar categoría"
                aria-label={`Eliminar categoría ${category.name}`}
            >
                {/* Ícono de papelera para eliminar */}
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                    />
                </svg>
            </button>

            {/* ============ MODAL DE CONFIRMACIÓN ============ */}
            {showConfirm && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
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
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Confirmar eliminación
                                    </h3>
                                    
                                    {/* Mensaje explicativo */}
                                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        ¿Estás seguro de que deseas eliminar la categoría
                                    </p>
                                    
                                    {/* Nombre de la categoría destacado */}
                                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed break-words" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        "<span className="font-medium text-gray-900">{category.name}</span>"?
                                    </p>
                                </div>
                            </div>

                            {/* ---- Botones de Acción ---- */}
                            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-6">
                                
                                {/* Botón Cancelar */}
                                <button
                                    onClick={cancelDelete}
                                    className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                    aria-label="Cancelar eliminación"
                                >
                                    Cancelar
                                </button>
                                
                                {/* Botón Eliminar */}
                                <button
                                    onClick={confirmDelete}
                                    className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
                                    style={{
                                        fontFamily: 'Poppins, sans-serif',
                                        backgroundColor: '#FDB4B7', // Color rosa personalizado
                                    }}
                                    // Efectos hover dinámicos
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#fc9ca0'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = '#FDB4B7'}
                                    aria-label="Confirmar eliminación"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryActions;
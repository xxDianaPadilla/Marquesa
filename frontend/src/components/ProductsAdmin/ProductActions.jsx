// Ruta: frontend/src/components/ProductsAdmin/ProductActions.jsx
import React, { useState } from 'react';

/**
 * Componente para las acciones de productos mejorado
 * Mantiene el diseño original pero añade validaciones y mejor manejo de estados
 * Permite editar y eliminar productos con confirmación de eliminación
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.product - Producto sobre el cual actuar
 * @param {Function} props.onEdit - Función para editar producto
 * @param {Function} props.onDelete - Función para eliminar producto
 */
const ProductActions = ({ product, onEdit, onDelete }) => {
    // ============ ESTADOS LOCALES ============
    
    // Estado para controlar la visibilidad del modal de confirmación
    const [showConfirm, setShowConfirm] = useState(false);
    
    // Estado para prevenir múltiples clics durante eliminación
    const [isDeleting, setIsDeleting] = useState(false);

    // ============ FUNCIONES DE MANEJO DE EVENTOS ============
    
    /**
     * Maneja el clic en el botón de eliminar
     * Muestra el modal de confirmación
     */
    const handleDelete = () => {
        if (isDeleting) return; // Prevenir múltiples clics
        
        console.log('🗑️ Solicitando confirmación para eliminar producto:', product._id);
        setShowConfirm(true);
    };
    
    /**
     * Confirma la eliminación del producto
     * Ejecuta la función onDelete y maneja los estados
     */
    const confirmDelete = async () => {
        if (isDeleting) return; // Prevenir múltiples clics
        
        console.log('✅ Confirmando eliminación de producto:', product._id);
        
        try {
            setIsDeleting(true);
            await onDelete(product._id);
            setShowConfirm(false);
            console.log('✅ Producto eliminado exitosamente');
        } catch (error) {
            console.error('❌ Error durante la eliminación:', error);
            // En caso de error, mantener el modal abierto
        } finally {
            setIsDeleting(false);
        }
    };
    
    /**
     * Cancela la eliminación del producto
     * Cierra el modal de confirmación
     */
    const cancelDelete = () => {
        if (isDeleting) return; // Prevenir cancelación durante eliminación
        
        console.log('❌ Cancelando eliminación de producto:', product._id);
        setShowConfirm(false);
    };

    /**
     * Maneja el clic en el botón de editar
     * Llama a la función onEdit pasada como prop
     */
    const handleEdit = () => {
        if (isDeleting) return; // Prevenir edición durante eliminación
        
        console.log('✏️ Iniciando edición de producto:', product._id);
        onEdit?.(product);
    };

    return (
        <div className="flex items-center space-x-2">
            {/* ============ BOTÓN EDITAR (DISEÑO ORIGINAL) ============ */}
            <button
                onClick={handleEdit}
                disabled={isDeleting}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Editar producto"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                </svg>
            </button>

            {/* ============ BOTÓN ELIMINAR (DISEÑO ORIGINAL) ============ */}
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                title={isDeleting ? "Eliminando..." : "Eliminar producto"}
            >
                {isDeleting ? (
                    // Spinner de carga durante eliminación
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                ) : (
                    // Icono de eliminación normal
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                    </svg>
                )}
            </button>

            {/* ============ MODAL DE CONFIRMACIÓN (DISEÑO ORIGINAL MEJORADO) ============ */}
            {showConfirm && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 ease-out">
                        <div className="p-6">
                            {/* ============ ENCABEZADO CON ICONO (DISEÑO ORIGINAL) ============ */}
                            <div className="flex items-start mb-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-4 flex-1 mr-2">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Confirmar eliminación
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        ¿Estás seguro de que deseas eliminar
                                    </p>
                                    <p className="text-sm text-gray-600 leading-relaxed break-words" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        el producto "<span className="font-medium text-gray-900">{product.name}</span>"?
                                    </p>
                                    
                                    {/* Información adicional del producto */}
                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <span className="font-medium">Precio:</span> ${product.price?.toFixed(2) || '0.00'}
                                            </div>
                                            <div>
                                                <span className="font-medium">Stock:</span> {product.stock || 0}
                                            </div>
                                            <div className="col-span-2">
                                                <span className="font-medium">Categoría:</span> {product.categoryId?.name || 'Sin categoría'}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <p className="text-xs text-red-600 mt-2 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        ⚠️ Esta acción no se puede deshacer
                                    </p>
                                </div>
                            </div>

                            {/* ============ BOTONES (DISEÑO ORIGINAL) ============ */}
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={cancelDelete}
                                    disabled={isDeleting}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-center whitespace-nowrap min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    style={{
                                        fontFamily: 'Poppins, sans-serif',
                                        backgroundColor: isDeleting ? '#9CA3AF' : '#FDB4B7',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isDeleting) e.target.style.backgroundColor = '#fc9ca0';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isDeleting) e.target.style.backgroundColor = '#FDB4B7';
                                    }}
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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

export default ProductActions;
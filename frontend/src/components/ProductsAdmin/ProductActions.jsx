// Ruta: frontend/src/components/ProductsAdmin/ProductActions.jsx
import React, { useState } from 'react';
import DeleteConfirmModal from '../DeleteConfirmModal';

/**
 * Componente para las acciones de productos mejorado
 * Mantiene el diseño original pero usa el modal genérico con OverlayBackdrop
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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    // Estado para prevenir múltiples clics durante eliminación
    const [isDeleting, setIsDeleting] = useState(false);

    // ============ FUNCIONES DE MANEJO DE EVENTOS ============
    
    /**
     * Maneja el clic en el botón de eliminar
     * Muestra el modal de confirmación
     */
    const handleDelete = () => {
        if (isDeleting) return; // Prevenir múltiples clics
        
        console.log('🗑️ Abriendo modal de confirmación para producto:', product._id);
        setShowDeleteModal(true);
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
            setShowDeleteModal(false);
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
        setShowDeleteModal(false);
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

    // Preparar información adicional del producto para el modal
    const productInfo = {
        price: product.price?.toFixed(2) || '0.00',
        stock: product.stock || 0,
        category: product.categoryId?.name || product.categoryDisplay || 'Sin categoría'
    };

    return (
        <>
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
            </div>

            {/* ============ MODAL DE CONFIRMACIÓN CON OVERLAYBACKDROP ============ */}
            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={cancelDelete}
                onConfirm={confirmDelete}
                title={product.name}
                type="producto"
                itemInfo={productInfo}
                isDeleting={isDeleting}
            />
        </>
    );
};

export default ProductActions;
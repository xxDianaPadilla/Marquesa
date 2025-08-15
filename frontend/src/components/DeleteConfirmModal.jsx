import React, { useState } from "react";
import OverlayBackdrop from "./OverlayBackdrop";

/**
 * Modal genérico de confirmación de eliminación
 * Usa OverlayBackdrop para consistencia visual
 * Puede ser usado por cualquier componente que necesite confirmación de eliminación
 * 
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onConfirm - Función para confirmar la eliminación
 * @param {string} props.title - Título del elemento a eliminar
 * @param {string} props.type - Tipo de elemento (categoría, producto, material)
 * @param {Object} props.itemInfo - Información adicional del elemento
 * @param {boolean} props.isDeleting - Si está en proceso de eliminación
 */
const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  type = "elemento", 
  itemInfo = {}, 
  isDeleting = false 
}) => {
  
  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const handleClose = () => {
    if (isDeleting) return; // No permitir cerrar si está eliminando
    onClose();
  };

  if (!isOpen) return null;

  return (
    <OverlayBackdrop isVisible={isOpen} onClose={handleClose}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 ease-out"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* ============ ENCABEZADO CON ICONO ============ */}
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Confirmar eliminación
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  ¿Estás seguro de que deseas eliminar {type === "categoría" ? "la" : "el"} {type}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed break-words" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  "<span className="font-medium text-gray-900">{title}</span>"?
                </p>
                
                {/* Información adicional según el tipo */}
                {Object.keys(itemInfo).length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <div className="space-y-1">
                      {itemInfo.price && (
                        <div><span className="font-medium">Precio:</span> ${itemInfo.price}</div>
                      )}
                      {itemInfo.stock !== undefined && (
                        <div><span className="font-medium">Stock:</span> {itemInfo.stock}</div>
                      )}
                      {itemInfo.category && (
                        <div><span className="font-medium">Categoría:</span> {itemInfo.category}</div>
                      )}
                      {itemInfo.product && (
                        <div><span className="font-medium">Producto:</span> {itemInfo.product}</div>
                      )}
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-red-600 mt-2 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  ⚠️ Esta acción no se puede deshacer
                </p>
              </div>
            </div>

            {/* ============ BOTONES. ============ */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleClose}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-center whitespace-nowrap min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  backgroundColor: isDeleting ? '#9CA3AF' : '#FDB4B7',
                  cursor: isDeleting ? 'not-allowed' : 'pointer'
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
    </OverlayBackdrop>
  );
};

export default DeleteConfirmModal;
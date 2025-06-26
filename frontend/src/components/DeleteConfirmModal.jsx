import React, { useState } from "react";

/**
 * Componente DeleteConfirmModal
 * Ruta: frontend/src/components/DeleteConfirmModal.jsx
 * Modal de confirmación para eliminar elementos multimedia
 */
const DeleteConfirmModal = ({ item, onClose, onConfirm }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    // Manejar confirmación de eliminación
    const handleConfirm = async () => {
        setIsDeleting(true);

        try {
            // Simular tiempo de procesamiento
            await new Promise(resolve => setTimeout(resolve, 1000));
            onConfirm();
        } catch (error) {
            console.error("Error al eliminar multimedia:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    if (!item) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                {/* Header del modal */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Confirmar eliminación
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isDeleting}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Contenido del modal */}
                <div className="p-6">
                    <div className="mb-4">
                        <p className="text-gray-700 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            ¿Estás seguro de que deseas eliminar este elemento multimedia? Esta acción no se puede deshacer.
                        </p>

                        {/* Información del elemento a eliminar */}
                        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-red-500">
                            <div className="flex items-start gap-3">
                                {/* Icono del tipo de archivo */}
                                <div className="flex-shrink-0 mt-1">
                                    {item.type === "imagen" && (
                                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    {item.type === "video" && (
                                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                        </svg>
                                    )}
                                    {item.type === "blog" && (
                                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>

                                {/* Información del elemento */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {item.title}
                                    </p>
                                    <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {item.description}
                                    </p>
                                    <div className="flex flex-wrap gap-4 text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        <span className="capitalize">
                                            <strong>Tipo:</strong> {item.type}
                                        </span>
                                        <span>
                                            <strong>Categoría:</strong> {item.category}
                                        </span>
                                        <span>
                                            <strong>Tamaño:</strong> {item.size}
                                        </span>
                                    </div>
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-500 truncate" style={{ fontFamily: 'monospace' }}>
                                            <strong>URL:</strong> {item.url}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isDeleting}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={isDeleting}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            {isDeleting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Eliminando...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Sí, eliminar
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
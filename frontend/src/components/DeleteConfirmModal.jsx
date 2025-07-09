import React, { useState } from "react";
import OverlayBackdrop from "./OverlayBackdrop";

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

    // Obtener icono según el tipo de archivo
    const getFileIcon = (item) => {
        const hasImage = item.imageURL && item.imageURL.trim() !== "";
        const hasVideo = item.videoURL && item.videoURL.trim() !== "";

        if (hasImage && hasVideo) {
            return (
                <div className="flex items-center gap-1">
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                </div>
            );
        } else if (hasImage) {
            return (
                <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
            );
        } else if (hasVideo) {
            return (
                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
            );
        } else {
            return (
                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
            );
        }
    };

    if (!item) return null;

    return (
        <OverlayBackdrop isVisible={true} onClose={onClose}>
            <div className="flex items-center justify-center min-h-screen p-2 sm:p-4">
                {/* Modal con altura ajustada y estructura flexbox */}
                <div
                    className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-lg h-auto max-h-[85vh] flex flex-col overflow-hidden transform transition-all duration-300 ease-out border border-gray-200 mx-2 sm:mx-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header personalizado con icono de advertencia */}
                    <div className="flex items-center gap-4 p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Confirmar eliminación
                            </h2>
                            <p className="text-gray-600 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Esta acción no se puede deshacer
                            </p>
                        </div>
                        <button
                            style={{ cursor: 'pointer' }}
                            onClick={onClose}
                            disabled={isDeleting}
                            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100 disabled:opacity-50 flex-shrink-0"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Contenido scrolleable */}
                    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db #f8f9fa' }}>
                        {/* Mensaje principal */}
                        <div className="mb-6">
                            <p className="text-gray-700 text-center sm:text-left" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                ¿Estás seguro de que deseas eliminar este elemento multimedia?
                            </p>
                        </div>

                        {/* Información del elemento a eliminar */}
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-6">
                            <div className="flex items-start gap-3">
                                {/* Icono del tipo de archivo */}
                                <div className="flex-shrink-0 mt-1">
                                    {getFileIcon(item)}
                                </div>

                                {/* Información del elemento */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {item.title || 'Sin título'}
                                    </h3>
                                    {item.description && (
                                        <p className="text-sm text-gray-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            {item.description}
                                        </p>
                                    )}

                                    {/* Metadatos */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        <div>
                                            <span className="font-medium">Tipo:</span> {item.type}
                                        </div>
                                        <div>
                                            <span className="font-medium">Fecha:</span> {new Date(item.createdAt).toLocaleDateString('es-ES')}
                                        </div>
                                    </div>

                                    {/* URLs disponibles */}
                                    {(item.imageURL || item.videoURL) && (
                                        <div className="space-y-1">
                                            {item.imageURL && (
                                                <div className="bg-white rounded p-2 border">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-xs font-medium text-blue-700">Imagen</span>
                                                    </div>
                                                    <code className="text-xs text-gray-600 break-all block" style={{ fontFamily: 'monospace' }}>
                                                        {item.imageURL.length > 50 ? `${item.imageURL.substring(0, 50)}...` : item.imageURL}
                                                    </code>
                                                </div>
                                            )}
                                            {item.videoURL && (
                                                <div className="bg-white rounded p-2 border">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                                        </svg>
                                                        <span className="text-xs font-medium text-red-700">Video</span>
                                                    </div>
                                                    <code className="text-xs text-gray-600 break-all block" style={{ fontFamily: 'monospace' }}>
                                                        {item.videoURL.length > 50 ? `${item.videoURL.substring(0, 50)}...` : item.videoURL}
                                                    </code>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Advertencia adicional */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                            <div className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <div>
                                    <p className="text-yellow-800 text-sm font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Advertencia importante
                                    </p>
                                    <p className="text-yellow-700 text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Los archivos multimedia también serán eliminados del servidor y no podrán ser recuperados.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer con botones fijos */}
                    <div className="bg-white border-t border-gray-200 p-4 sm:p-6 flex-shrink-0">
                        <div className="flex flex-col sm:flex-row justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isDeleting}
                                className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={isDeleting}
                                className="w-full sm:w-auto px-4 py-2 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#FDB4B7', cursor: 'pointer' }}
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span className="hidden sm:inline">Eliminando...</span>
                                        <span className="sm:hidden">...</span>
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

                {/* Estilos CSS inline para scrollbar */}
                <style jsx>{`
                    /* Scrollbar personalizado para webkit */
                    .overflow-y-auto::-webkit-scrollbar {
                        width: 8px;
                    }

                    .overflow-y-auto::-webkit-scrollbar-track {
                        background: #f8f9fa;
                        border-radius: 4px;
                    }

                    .overflow-y-auto::-webkit-scrollbar-thumb {
                        background: #d1d5db;
                        border-radius: 4px;
                        border: 1px solid #f8f9fa;
                    }

                    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                        background: #9ca3af;
                    }
                `}</style>
            </div>
        </OverlayBackdrop>
    );
};

export default DeleteConfirmModal;
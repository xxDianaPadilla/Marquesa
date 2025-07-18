import React from 'react';
import OverlayBackdrop from '../OverlayBackdrop';

const DeleteMessageModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    message, 
    isDeleting = false,
    formatTime,
    compact = false
}) => {
    if (!isOpen) return null;

    return (
        <OverlayBackdrop isVisible={true} onClose={onClose}>
            <div className="flex items-center justify-center min-h-screen p-4">
                <div 
                    className={`bg-white rounded-lg shadow-2xl ${compact ? 'max-w-sm w-full mx-4' : 'max-w-md w-full mx-4'} transform transition-all duration-300 ease-out border border-gray-200`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header del modal */}
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Eliminar mensaje
                                </h3>
                                <p className="text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Esta acción no se puede deshacer
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Contenido del modal */}
                    <div className="p-4 sm:p-6">
                        <div className="mb-4">
                            <p className="text-gray-700 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                ¿Estás seguro de que quieres eliminar este mensaje?
                            </p>
                            
                            {/* Preview del mensaje a eliminar */}
                            {message && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-8 h-8 bg-[#E8ACD2] rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                            {message.senderId?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                {message.senderId?.fullName || 'Usuario'}
                                            </p>
                                            <p className="text-sm text-gray-600 break-words" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                {message.message || '📎 Archivo multimedia'}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                {formatTime(message.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <div className="flex items-start space-x-2">
                                <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <p className="text-sm text-amber-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    El mensaje será eliminado permanentemente y no podrá ser recuperado.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer con botones */}
                    <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
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
                                    Eliminar mensaje
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </OverlayBackdrop>
    );
};

export default DeleteMessageModal;
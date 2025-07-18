// frontend/src/components/ConfirmDialog.jsx
import React from 'react';

const ConfirmDialog = ({ 
    isOpen, 
    title, 
    message, 
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm, 
    onCancel,
    type = 'danger',
    loading = false 
}) => {
    const types = {
        danger: {
            icon: (
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            confirmBg: 'bg-red-600 hover:bg-red-700',
            iconBg: 'bg-red-100'
        },
        warning: {
            icon: (
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
            iconBg: 'bg-yellow-100'
        },
        info: {
            icon: (
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            confirmBg: 'bg-blue-600 hover:bg-blue-700',
            iconBg: 'bg-blue-100'
        }
    };

    if (!isOpen) return null;

    const currentType = types[type] || types.danger;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Overlay */}
                <div 
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    onClick={onCancel}
                ></div>

                {/* Contenido del modal */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${currentType.iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
                                {currentType.icon}
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 
                                    className="text-lg leading-6 font-medium text-gray-900"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                >
                                    {title}
                                </h3>
                                <div className="mt-2">
                                    <p 
                                        className="text-sm text-gray-500"
                                        style={{ fontFamily: 'Poppins, sans-serif' }}
                                    >
                                        {message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            disabled={loading}
                            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${currentType.confirmBg} text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                            style={{ fontFamily: 'Poppins, sans-serif', cursor: loading ? 'not-allowed' : 'pointer' }}
                            onClick={onConfirm}
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Procesando...
                                </div>
                            ) : (
                                confirmText
                            )}
                        </button>
                        <button
                            type="button"
                            disabled={loading}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ fontFamily: 'Poppins, sans-serif', cursor: loading ? 'not-allowed' : 'pointer' }}
                            onClick={onCancel}
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
import React, { useState } from 'react';

// Componente para las acciones de productos
// Permite editar y eliminar productos con confirmación de eliminación
const ProductActions = ({ product, onEdit, onDelete }) => {
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDelete = () => setShowConfirm(true);
    const confirmDelete = () => {
        onDelete(product._id);
        setShowConfirm(false);
    };
    const cancelDelete = () => setShowConfirm(false);

    return (
        <div className="flex items-center space-x-2">
            {/* Botón editar */}
            <button
                onClick={() => onEdit(product)}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                title="Editar producto"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                </svg>
            </button>

            {/* Botón eliminar */}
            <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-150"
                title="Eliminar producto"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                </svg>
            </button>

            {/* Modal de confirmación */}
            {showConfirm && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 ease-out">
                        <div className="p-6">
                            {/* Encabezado con icono */}
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
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={cancelDelete}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-center whitespace-nowrap min-w-[100px]"
                                    style={{
                                        fontFamily: 'Poppins, sans-serif',
                                        backgroundColor: '#FDB4B7',
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#fc9ca0'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = '#FDB4B7'}
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

export default ProductActions;

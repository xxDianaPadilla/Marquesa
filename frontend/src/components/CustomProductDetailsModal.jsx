import React from 'react';
import { X } from 'lucide-react';

const CustomProductDetailsModal = ({ isOpen, onClose, customProduct }) => {
    if (!isOpen || !customProduct) return null;

    // Calcular totales
    const materialsTotal = customProduct.selectedMaterials?.reduce((sum, material) => {
        const quantity = material.quantity || 1;
        const price = material.materialId?.price || 0;
        return sum + (price * quantity);
    }, 0) || 0;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-pink-50 to-purple-50 p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                Detalles del Producto Personalizado
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {customProduct.productToPersonalize}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Precio Total */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold text-gray-700">Precio Total:</span>
                            <span className="text-2xl font-bold text-green-600">
                                ${customProduct.totalPrice?.toFixed(2) || '0.00'}
                            </span>
                        </div>
                    </div>

                    {/* Imagen de Referencia */}
                    {customProduct.referenceImage && (
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                Imagen de Referencia
                            </h3>
                            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                                <img
                                    src={customProduct.referenceImage}
                                    alt="Referencia del cliente"
                                    className="w-full h-auto object-contain max-h-80"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Comentarios */}
                    {customProduct.extraComments && (
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                Comentarios del Cliente
                            </h3>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-gray-700 text-sm leading-relaxed">
                                    {customProduct.extraComments}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Materiales Seleccionados */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                            Materiales Seleccionados
                        </h3>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                            Material
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                                            Cantidad
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                                            Precio Unit.
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                                            Subtotal
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {customProduct.selectedMaterials?.map((material, index) => {
                                        const quantity = material.quantity || 1;
                                        const price = material.materialId?.price || 0;
                                        const subtotal = price * quantity;

                                        return (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center space-x-3">
                                                        {material.materialId?.image && (
                                                            <img
                                                                src={material.materialId.image}
                                                                alt={material.materialId.name}
                                                                className="w-10 h-10 rounded-md object-cover"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                }}
                                                            />
                                                        )}
                                                        <span className="text-sm font-medium text-gray-800">
                                                            {material.materialId?.name || 'Material no disponible'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                                                        x{quantity}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-gray-600">
                                                    ${price.toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-800">
                                                    ${subtotal.toFixed(2)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan="3" className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                            Total de Materiales:
                                        </td>
                                        <td className="px-4 py-3 text-right text-lg font-bold text-gray-900">
                                            ${materialsTotal.toFixed(2)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Información adicional */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Fecha de creación:</span>
                            <span className="font-medium text-gray-800">
                                {new Date(customProduct.createdAt).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                        {customProduct.updatedAt && customProduct.updatedAt !== customProduct.createdAt && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Última actualización:</span>
                                <span className="font-medium text-gray-800">
                                    {new Date(customProduct.updatedAt).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-lg transition-all font-medium shadow-md hover:shadow-lg"
                        style={{ cursor: 'pointer' }}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomProductDetailsModal;
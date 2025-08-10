/**
 * Componente OrderReview - Revisión final del pedido
 * 
 * Componente que permite al usuario revisar toda la información del pedido
 * antes de confirmar la compra. Muestra resumen de envío, pago y productos.
 */

import React, { useState } from 'react';

const OrderReview = ({
    onBack,
    onConfirm,
    orderData,
    isProcessing = false
}) => {
    const [isConfirming, setIsConfirming] = useState(false);

    // Función para manejar la confirmación
    const handleConfirm = async () => {
        setIsConfirming(true);
        try {
            await onConfirm();
        } catch (error) {
            console.error('Error al confirmar pedido:', error);
        } finally {
            setIsConfirming(false);
        }
    };

    // Formatear fecha para mostrar
    const formatDate = (dateString) => {
        if (!dateString) return 'No especificada';

        const [year, month, day] = dateString.split('-');
        const date = new Date(year, month - 1, day);
        
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Obtener etiqueta del método de pago
    const getPaymentTypeLabel = (type) => {
        const labels = {
            'Transferencia': 'Transferencia bancaria',
            'Efectivo': 'Pago en efectivo',
            'Débito': 'Tarjeta de débito',
            'Crédito': 'Tarjeta de crédito'
        };
        return labels[type] || type;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Revisión del pedido
            </h2>

            {/* Información de envío */}
            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    📦 Información de envío
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-medium text-gray-700">Receptor:</span>
                            <p className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {orderData.shippingInfo?.receiverName || 'No especificado'}
                            </p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Teléfono:</span>
                            <p className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {orderData.shippingInfo?.receiverPhone || 'No especificado'}
                            </p>
                        </div>
                    </div>

                    <div className="text-sm">
                        <span className="font-medium text-gray-700">Dirección:</span>
                        <p className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {orderData.shippingInfo?.deliveryAddress || 'No especificada'}
                        </p>
                    </div>

                    <div className="text-sm">
                        <span className="font-medium text-gray-700">Punto de referencia:</span>
                        <p className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {orderData.shippingInfo?.deliveryPoint || 'No especificado'}
                        </p>
                    </div>

                    <div className="text-sm">
                        <span className="font-medium text-gray-700">Fecha de entrega:</span>
                        <p className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {formatDate(orderData.shippingInfo?.deliveryDate)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Información de pago */}
            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    💳 Información de pago
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm">
                        <span className="font-medium text-gray-700">Método de pago:</span>
                        <p className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {getPaymentTypeLabel(orderData.paymentInfo?.paymentType)}
                        </p>
                    </div>

                    {orderData.paymentInfo?.paymentProofImage && (
                        <div className="mt-3">
                            <span className="font-medium text-gray-700 text-sm">Comprobante:</span>
                            <div className="mt-2 flex items-center text-sm text-green-600">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Comprobante cargado correctamente
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Resumen financiero */}
            <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    💰 Resumen de costos
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Subtotal:
                        </span>
                        <span className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            ${orderData.originalSubtotal?.toFixed(2) || '0.00'}
                        </span>
                    </div>

                    {/* Mostrar descuento si está aplicado */}
                    {orderData.discountApplied && orderData.discountAmount > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Descuento {orderData.discountInfo?.name ? `(${orderData.discountInfo.name})` : ''}:
                            </span>
                            <span className="font-medium text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                -${orderData.discountAmount?.toFixed(2) || '0.00'}
                            </span>
                        </div>
                    )}

                    <div className="border-t pt-2">
                        <div className="flex justify-between font-bold text-lg">
                            <span style={{ fontFamily: 'Poppins, sans-serif' }}>Total:</span>
                            <span style={{ fontFamily: 'Poppins, sans-serif' }}>
                                ${orderData.cartTotal?.toFixed(2) || '0.00'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Información importante */}
            <div className="mb-6 bg-amber-50 p-4 rounded-lg">
                <div className="flex items-start">
                    <svg className="w-5 h-5 text-amber-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                        <p className="text-amber-700 text-sm font-medium mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Importante
                        </p>
                        <ul className="text-amber-600 text-xs space-y-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            <li>• Una vez confirmado, el pedido no podrá ser modificado</li>
                            <li>• El tiempo de entrega puede variar según la ubicación</li>
                            <li>• Asegúrate de que la información de contacto sea correcta</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-between">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={isConfirming || isProcessing}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200"
                    style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                >
                    Volver al pago
                </button>

                <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={isConfirming || isProcessing}
                    className="px-8 py-3 bg-pink-400 text-white rounded-md hover:bg-pink-500 disabled:bg-pink-300 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                    style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                >
                    {isConfirming || isProcessing ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Procesando pedido...
                        </span>
                    ) : (
                        'Confirmar pedido'
                    )}
                </button>
            </div>

            {/* Estado de procesamiento */}
            {(isConfirming || isProcessing) && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                        <svg className="animate-spin h-5 w-5 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <div>
                            <p className="text-blue-700 text-sm font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Procesando tu pedido...
                            </p>
                            <p className="text-blue-600 text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Por favor no cierres esta ventana
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderReview;
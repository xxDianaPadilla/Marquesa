import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const OrderReview = ({ onBack, onConfirm }) => {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const handleConfirmOrder = () => {
        // Aquí podremos agregar la lógica para procesar el pedido
        setShowModal(true);
        if (onConfirm) {
            onConfirm();
        }
    };

    const handleContinueShopping = () => {
        setShowModal(false);
        navigate('/categoryProducts');
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-xl font-semibold mb-6">Revisar pedido</h3>
                         
                {/* Información de envío */}
                <div className="mb-6">
                    <h4 className="text-lg font-medium mb-4">Información de envío</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex">
                            <span className="font-medium text-gray-700 w-42">Nombre y apellido:</span>
                            <span className="text-gray-600">Bryan Miranda</span>
                        </div>
                        <div className="flex">
                            <span className="font-medium text-gray-700 w-32">Dirección:</span>
                            <span className="text-gray-600">&ensp;&ensp;&ensp;Jardines del escorial, calle bienestar casa 15A, San Salvador &ensp;&ensp;&ensp;San salvador</span>
                        </div>
                        <div className="flex">
                            <span className="font-medium text-gray-700 w-32">Referencia:</span>
                            <span className="text-gray-600">Punto de la 308</span>
                        </div>
                        <div className="flex">
                            <span className="font-medium text-gray-700 w-32">Estado:</span>
                            <span className="text-gray-600">Agendada</span>
                        </div>
                        <div className="flex">
                            <span className="font-medium text-gray-700 w-42">Correo electrónico:</span>
                            <span className="text-gray-600">bryanmiranda@gmail.com</span>
                        </div>
                        <div className="flex">
                            <span className="font-medium text-gray-700 w-32">Teléfono:</span>
                            <span className="text-gray-600">6793-8435</span>
                        </div>
                    </div>
                </div>

                {/* Método de pago */}
                <div className="mb-6">
                    <h4 className="text-lg font-medium mb-4">Método de pago</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="w-6 h-6 bg-pink-400 rounded-full flex items-center justify-center mr-3">
                                <span className="text-white text-sm">$</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Transferencia bancaria</span>
                                <p className="text-sm text-pink-500 mt-1">Tu pedido estará procesado una vez que se verifique el pago</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-4 mt-8">
                    <button
                        onClick={onBack}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                        Volver
                    </button>
                    <button
                        onClick={handleConfirmOrder}
                        className="flex-1 bg-pink-400 text-white py-3 rounded-lg hover:bg-pink-500 transition-colors font-medium"
                    >
                        Realizar pedido
                    </button>
                </div>
            </div>

            {/* Modal de confirmación */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="p-8 text-center">
                            {/* Ícono de check */}
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            
                            {/* Título */}
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                ¡Gracias por tu pedido!
                            </h2>
                            
                            {/* Subtítulo */}
                            <p className="text-gray-600 mb-4">
                                Tu pedido ha sido recibido
                            </p>
                            
                            {/* Descripción */}
                            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                                Hemos enviado un correo electrónico de confirmación a tu dirección de correo electrónico con los detalles de tu pedido
                            </p>
                            
                            {/* Detalles del pedido */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <h3 className="font-semibold text-gray-800 mb-3">Detalles del pedido</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Nombre del comprador</span>
                                        <p className="font-medium text-gray-800">Bryan Miranda</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Fecha de compra</span>
                                        <p className="font-medium text-gray-800">7/5/2025</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Botón de seguir comprando */}
                            <button
                                onClick={handleContinueShopping}
                                className="w-full bg-pink-400 text-white py-3 rounded-lg hover:bg-pink-500 transition-colors font-medium"
                            >
                                Seguir comprando
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default OrderReview;
import React, { useState } from "react";
import qrIcon from "../assets/qrIcon.png";
import attentionIcon from "../assets/attentionIcon.png";

const PaymentMethodSelection = ({ onNext, onBack }) => {
    const [selectedMethod, setSelectedMethod] = useState('');
    const [transferTab, setTransferTab] = useState('datos');

    const handleConfirmPayment = () => {
        if (selectedMethod) {
            // Aquí podremos agregar validaciones adicionales
            onNext(); 
        } else {
            alert('Por favor selecciona un método de pago');
        }
    };

    const paymentMethods = [
        { id: 'card', name: 'Tarjeta de Crédito/Débito', icon: '💳' },
        { id: 'paypal', name: 'PayPal', icon: '🅿️' },
        { id: 'transfer', name: 'Transferencia Bancaria', icon: '🏦' }
    ];

    const renderPayPalForm = () => (
        <div className="mt-6 space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-4">
                Serás redirigido a PayPal para completar tu pago de forma segura. Una vez completado, volverás a nuestra tienda para finalizar tu pedido.
            </div>
            <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Pay Pal
            </button>
        </div>
    );

    const renderTransferForm = () => (
        <div className="mt-6 space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-start">
                    <div className="w-5 h-5 rounded-fullflex items-center justify-center mr-3 mt-0.5">
                        <img src={attentionIcon} alt="" />
                    </div>
                    <div className="text-sm text-blue-800">
                        Realiza una transferencia bancaria a la siguiente cuenta y adjunta el comprobante de pago. Tu pedido será procesado una vez que se verifique el pago.
                    </div>
                </div>
            </div>

            <div className="flex border-b">
                <button
                    onClick={() => setTransferTab('datos')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 ${transferTab === 'datos'
                        ? 'border-pink-400 text-pink-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Datos bancarios
                </button>
                <button
                    onClick={() => setTransferTab('qr')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 ${transferTab === 'qr'
                        ? 'border-pink-400 text-pink-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Código QR
                </button>
            </div>

            {transferTab === 'datos' ? (
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-medium mb-3">Datos bancarios</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Banco:</span>
                                <span className="font-medium">Banco agrícola</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Titular:</span>
                                <span className="font-medium">Marquesa</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Número de cuenta:</span>
                                <span className="font-medium">8798 0123 4567 8801</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tipo de cuenta:</span>
                                <span className="font-medium">Ahorro</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Concepto:</span>
                                <span className="font-medium">Tu nombre + dirección</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-medium mb-3">Comprobante de transferencia</h4>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <div className="text-4xl mb-2">📄</div>
                            <div className="text-sm text-gray-600 mb-2">Haz clic para subir o arrastra y suelta</div>
                            <div className="text-xs text-gray-500">JPG, PNG o PDF (máx. 5MB)</div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-medium mb-3">Datos bancarios</h4>
                        <div className="flex justify-center mb-4">
                            <div className="w-48 h-48 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-48 h-48 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                                        <img src={qrIcon} alt="" className="w-full h-full object-cover rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-center text-sm text-gray-600 mb-4">
                            Escanea este código QR con la app de tu banco para realizar la transferencia automáticamente
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-medium mb-3">Comprobante de transferencia</h4>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <div className="text-4xl mb-2">📄</div>
                            <div className="text-sm text-gray-600 mb-2">Haz clic para subir o arrastra y suelta</div>
                            <div className="text-xs text-gray-500">JPG, PNG o PDF (máx. 5MB)</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-6">Método de pago</h3>
            <div className="space-y-4">
                {paymentMethods.map((method) => (
                    <label
                        key={method.id}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${selectedMethod === method.id
                            ? 'border-pink-400 bg-pink-50'
                            : 'border-gray-300 hover:border-gray-400'
                            }`}
                    >
                        <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={selectedMethod === method.id}
                            onChange={(e) => setSelectedMethod(e.target.value)}
                            className="sr-only"
                        />
                        <span className="text-2xl mr-4">{method.icon}</span>
                        <span className="text-sm font-medium">{method.name}</span>
                        <div className={`ml-auto w-4 h-4 rounded-full border-2 ${selectedMethod === method.id
                            ? 'border-pink-400 bg-pink-400'
                            : 'border-gray-300'
                            }`}>
                            {selectedMethod === method.id && (
                                <div className="w-full h-full rounded-full bg-white border-2 border-pink-400"></div>
                            )}
                        </div>
                    </label>
                ))}

                {selectedMethod === 'card' && (
                    <div className="mt-6 space-y-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                            <label className="block text-sm font-medium mb-2">Número de la tarjeta</label>
                            <input
                                type="text"
                                placeholder="1234 5678 9012 3456"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Nombre del titular</label>
                            <input
                                type="text"
                                placeholder="Nombre completo"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Fecha de expiración</label>
                                <input
                                    type="text"
                                    placeholder="MM/AA"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">CVV</label>
                                <input
                                    type="text"
                                    placeholder="123"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {selectedMethod === 'paypal' && renderPayPalForm()}

                {selectedMethod === 'transfer' && renderTransferForm()}

                <div className="flex gap-4 pt-4">
                    <button
                        style={{ cursor: 'pointer' }}
                        onClick={onBack}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                        Volver
                    </button>
                    <button
                        style={{ cursor: 'pointer' }}
                        onClick={handleConfirmPayment}
                        disabled={!selectedMethod}
                        className={`flex-1 py-3 rounded-lg font-medium transition-colors ${selectedMethod
                            ? 'bg-pink-400 text-white hover:bg-pink-500'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {selectedMethod === 'transfer' ? 'Confirmar pedido' : 'Pagar ahora'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentMethodSelection;
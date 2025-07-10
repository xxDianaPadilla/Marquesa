// frontend/src/components/ResultModal.jsx
import React, { useState } from 'react';
import { X, Copy, CheckCircle } from 'lucide-react';

const ResultModal = ({ isOpen, selectedCode, onClose, onCopyCode }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        onCopyCode(selectedCode.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = () => {
        onClose();
    };

    if (!isOpen || !selectedCode) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 transform animate-bounce-in">
                {/* Header del modal */}
                <div className="relative p-8 text-center border-b border-gray-100">
                    <button
                        onClick={handleClose}
                        className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                        style={{ cursor: 'pointer' }}
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                    
                    {/* Icono de celebración */}
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                         style={{ backgroundColor: '#E8ACD2' }}>
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                        </svg>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-800 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        ¡Felicidades!
                    </h2>
                    <p className="text-lg text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Has ganado un descuento especial
                    </p>
                </div>

                {/* Contenido del modal */}
                <div className="p-8">
                    {/* Código de descuento con colores exactos */}
                    <div 
                        className="text-center p-8 rounded-2xl mb-8 border-2 border-dashed relative overflow-hidden"
                        style={{ 
                            backgroundColor: selectedCode.color,
                            borderColor: selectedCode.color
                        }}
                    >
                        {/* Patrón de fondo decorativo */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-2 left-2 w-4 h-4 bg-white rounded-full"></div>
                            <div className="absolute top-6 right-4 w-2 h-2 bg-white rounded-full"></div>
                            <div className="absolute bottom-4 left-6 w-3 h-3 bg-white rounded-full"></div>
                            <div className="absolute bottom-2 right-2 w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        
                        <div className="relative z-10">
                            <div 
                                className="text-2xl font-bold mb-2" 
                                style={{ 
                                    fontFamily: 'Poppins, sans-serif',
                                    color: selectedCode.textColor 
                                }}
                            >
                                {selectedCode.name}
                            </div>
                            <div 
                                className="text-4xl font-bold mb-4" 
                                style={{ 
                                    fontFamily: 'Poppins, sans-serif',
                                    color: selectedCode.textColor 
                                }}
                            >
                                {selectedCode.discount}
                            </div>
                            <div 
                                className="text-lg font-bold px-6 py-3 rounded-full inline-block shadow-md"
                                style={{ 
                                    fontFamily: 'Poppins, sans-serif',
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    color: '#374151'
                                }}
                            >
                                Código: {selectedCode.code}
                            </div>
                        </div>
                    </div>

                    {/* Botón de copiar */}
                    <button
                        onClick={handleCopy}
                        className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 mb-6 shadow-lg ${
                            copied 
                                ? 'bg-green-500 text-white transform scale-105' 
                                : 'text-white hover:scale-105'
                        }`}
                        style={{ 
                            fontFamily: 'Poppins, sans-serif', 
                            cursor: 'pointer',
                            backgroundColor: copied ? undefined : '#E8ACD2'
                        }}
                        disabled={copied}
                    >
                        {copied ? (
                            <>
                                <CheckCircle className="w-6 h-6" />
                                ¡Código copiado!
                            </>
                        ) : (
                            <>
                                <Copy className="w-6 h-6" />
                                Copiar código
                            </>
                        )}
                    </button>

                    {/* Instrucciones */}
                    <div style={{ backgroundColor: '#F0F9FF' }} className="border-2 rounded-xl p-6 mb-6" >
                        <h4 className="font-bold text-blue-800 mb-4 text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Cómo usar tu descuento:
                        </h4>
                        <ol className="text-blue-700 space-y-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            <li className="flex items-center">
                                <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">1</span>
                                Añade productos a tu carrito
                            </li>
                            <li className="flex items-center">
                                <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">2</span>
                                Ve al proceso de pago
                            </li>
                            <li className="flex items-center">
                                <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">3</span>
                                Ingresa el código en "Código de descuento"
                            </li>
                            <li className="flex items-center">
                                <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">4</span>
                                ¡Disfruta tu descuento!
                            </li>
                        </ol>
                    </div>

                    {/* Términos y condiciones */}
                    <div className="text-center mb-6">
                        <p className="text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            * Válido hasta el 30 de agosto, 2025
                        </p>
                        <p className="text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            * No acumulable con otras promociones
                        </p>
                    </div>

                    {/* Botón de continuar comprando */}
                    <button
                        onClick={handleClose}
                        className="w-full py-3 px-6 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-lg"
                        style={{ fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                    >
                        Continuar comprando
                    </button>
                </div>
            </div>

            {/* Confeti animado de fondo */}
            <div className="fixed inset-0 pointer-events-none">
                {[...Array(25)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute animate-pulse"
                        style={{
                            backgroundColor: ['#FADDDD', '#E8ACD2', '#C6E2C6'][i % 3],
                            width: Math.random() * 12 + 4 + 'px',
                            height: Math.random() * 12 + 4 + 'px',
                            borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                            top: Math.random() * 100 + '%',
                            left: Math.random() * 100 + '%',
                            animationDelay: i * 0.1 + 's',
                            animationDuration: '3s'
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default ResultModal;
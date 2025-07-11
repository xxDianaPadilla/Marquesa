// frontend/src/components/ResultModal.jsx
import React, { useState } from 'react';
import { X, Copy, CheckCircle } from 'lucide-react';

// Componente para mostrar el modal de resultados
// Recibe isOpen, selectedCode, onClose y onCopyCode como props
const ResultModal = ({ isOpen, selectedCode, onClose, onCopyCode }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        onCopyCode(selectedCode.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
// Función para manejar el cierre del modal
    const handleClose = () => {
        onClose();
    };

    if (!isOpen || !selectedCode) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg mx-2 sm:mx-4 transform animate-bounce-in max-h-[90vh] sm:max-h-[85vh] md:max-h-[80vh] overflow-y-auto">
                {/* Header del modal */}
                <div className="relative p-4 sm:p-5 md:p-6 text-center border-b border-gray-100 flex-shrink-0">
                    <button
                        onClick={handleClose}
                        className="absolute right-2 sm:right-3 md:right-4 top-2 sm:top-3 md:top-4 p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                        style={{ cursor: 'pointer' }}
                    >
                        <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    </button>
                    
                    {/* Icono de celebración */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg"
                         style={{ backgroundColor: '#E8ACD2' }}>
                        <svg className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                        </svg>
                    </div>

                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        ¡Felicidades!
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Has ganado un descuento especial
                    </p>
                </div>

                {/* Contenido del modal */}
                <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
                    {/* Código de descuento con colores exactos */}
                    <div 
                        className="text-center p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border-2 border-dashed relative overflow-hidden"
                        style={{ 
                            backgroundColor: selectedCode.color,
                            borderColor: selectedCode.color
                        }}
                    >
                        {/* Patrón de fondo decorativo */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-1 sm:top-2 left-1 sm:left-2 w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                            <div className="absolute top-3 sm:top-4 right-2 sm:right-3 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full"></div>
                            <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-4 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                            <div className="absolute bottom-1 right-1 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full"></div>
                        </div>
                        
                        <div className="relative z-10">
                            <div 
                                className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2" 
                                style={{ 
                                    fontFamily: 'Poppins, sans-serif',
                                    color: selectedCode.textColor 
                                }}
                            >
                                {selectedCode.name}
                            </div>
                            <div 
                                className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3" 
                                style={{ 
                                    fontFamily: 'Poppins, sans-serif',
                                    color: selectedCode.textColor 
                                }}
                            >
                                {selectedCode.discount}
                            </div>
                            <div 
                                className="text-xs sm:text-sm md:text-base font-bold px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-full inline-block shadow-md"
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
                        className={`w-full py-2.5 sm:py-3 md:py-3.5 px-4 sm:px-5 md:px-6 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 shadow-lg ${
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
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                                ¡Código copiado!
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                                Copiar código
                            </>
                        )}
                    </button>

                    {/* Instrucciones */}
                    <div style={{ backgroundColor: '#F0F9FF' }} className="border-2 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5" >
                        <h4 className="font-bold text-blue-800 mb-2 sm:mb-3 text-sm sm:text-base md:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Cómo usar tu descuento:
                        </h4>
                        <ol className="text-blue-700 space-y-1.5 sm:space-y-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            <li className="flex items-start">
                                <span className="bg-blue-200 text-blue-800 rounded-full w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex items-center justify-center text-xs sm:text-sm font-bold mr-2 sm:mr-3 mt-0.5 flex-shrink-0">1</span>
                                <span className="text-xs sm:text-sm md:text-base">Añade productos a tu carrito</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-blue-200 text-blue-800 rounded-full w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex items-center justify-center text-xs sm:text-sm font-bold mr-2 sm:mr-3 mt-0.5 flex-shrink-0">2</span>
                                <span className="text-xs sm:text-sm md:text-base">Ve al proceso de pago</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-blue-200 text-blue-800 rounded-full w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex items-center justify-center text-xs sm:text-sm font-bold mr-2 sm:mr-3 mt-0.5 flex-shrink-0">3</span>
                                <span className="text-xs sm:text-sm md:text-base">Ingresa el código en "Código de descuento"</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-blue-200 text-blue-800 rounded-full w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex items-center justify-center text-xs sm:text-sm font-bold mr-2 sm:mr-3 mt-0.5 flex-shrink-0">4</span>
                                <span className="text-xs sm:text-sm md:text-base">¡Disfruta tu descuento!</span>
                            </li>
                        </ol>
                    </div>

                    {/* Términos y condiciones */}
                    <div className="text-center">
                        <p className="text-xs sm:text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            * Válido hasta el 30 de agosto, 2025
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            * No acumulable con otras promociones
                        </p>
                    </div>

                    {/* Botón de continuar comprando */}
                    <button
                        onClick={handleClose}
                        className="w-full py-2 sm:py-2.5 md:py-3 px-4 sm:px-5 md:px-6 border-2 border-gray-300 rounded-lg sm:rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-sm sm:text-base md:text-lg"
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
                            width: Math.random() * 6 + 4 + 'px',
                            height: Math.random() * 6 + 4 + 'px',
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
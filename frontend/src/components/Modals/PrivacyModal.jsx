import React from "react";
import { X } from "lucide-react";

/**
 * Modal para mostrar las políticas de privacidad de La MarquesaSV
 * Diseñado con los colores rosados de la aplicación
 * 
 * @param {boolean} isOpen - Si el modal está abierto
 * @param {Function} onClose - Función para cerrar el modal
 */
const PrivacyModal = ({ isOpen, onClose }) => {
    // No renderizar si el modal no está abierto
    if (!isOpen) return null;

    /**
     * Maneja el clic en el fondo del modal para cerrarlo
     */
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    /**
     * Previene el scroll del body cuando el modal está abierto
     */
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup al desmontar el componente
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden transform transition-all duration-300 ease-out">
                
                {/* Header del modal */}
                <div className="flex items-center justify-between p-6 border-b border-pink-100" style={{ backgroundColor: '#FDB4B7' }}>
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Política de Privacidad
                        </h3>
                    </div>
                    
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Contenido scrolleable */}
                <div className="p-6 overflow-y-auto max-h-[70vh]" style={{ backgroundColor: '#FFEEF0' }}>
                    
                    {/* Introducción */}
                    <div className="mb-6 p-4 bg-pink-50 rounded-lg border border-pink-200">
                        <p className="text-gray-700 text-sm leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            En <strong className="text-pink-600">La MarquesaSV</strong>, respetamos tu privacidad y nos comprometemos a 
                            proteger la información personal que compartes con nosotros. Esta Política de Privacidad describe cómo 
                            recopilamos, utilizamos y protegemos tus datos.
                        </p>
                    </div>

                    {/* Sección 1: Información que recopilamos */}
                    <div className="mb-6">
                        <div className="flex items-center mb-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-pink-300 rounded-full flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>1</span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Información que recopilamos
                            </h4>
                        </div>
                        <div className="ml-11 p-4 bg-white rounded-lg border border-pink-100">
                            <ul className="space-y-2 text-gray-700 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                                    Nombre completo
                                </li>
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                                    Dirección de entrega
                                </li>
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                                    Teléfono de contacto
                                </li>
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                                    Correo electrónico
                                </li>
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                                    Datos de facturación y pago (cuando aplica)
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Sección 2: Uso de la información */}
                    <div className="mb-6">
                        <div className="flex items-center mb-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-pink-300 rounded-full flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>2</span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Uso de la información
                            </h4>
                        </div>
                        <div className="ml-11 p-4 bg-white rounded-lg border border-pink-100">
                            <p className="text-gray-700 text-sm mb-3 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Utilizamos tus datos para:
                            </p>
                            <ul className="space-y-2 text-gray-700 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                                    Procesar pedidos
                                </li>
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                                    Enviar confirmaciones y actualizaciones
                                </li>
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                                    Mejorar nuestros servicios
                                </li>
                                <li className="flex items-center">
                                    <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                                    Ofrecer promociones personalizadas (con tu consentimiento)
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Sección 3: Protección de datos */}
                    <div className="mb-6">
                        <div className="flex items-center mb-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-pink-300 rounded-full flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>3</span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Protección de datos
                            </h4>
                        </div>
                        <div className="ml-11 p-4 bg-white rounded-lg border border-pink-100">
                            <p className="text-gray-700 text-sm leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                La información recopilada es confidencial y está protegida por medidas de seguridad físicas, 
                                digitales y administrativas.
                            </p>
                        </div>
                    </div>

                    {/* Sección 4: Compartición con terceros */}
                    <div className="mb-6">
                        <div className="flex items-center mb-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-pink-300 rounded-full flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>4</span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Compartición con terceros
                            </h4>
                        </div>
                        <div className="ml-11 p-4 bg-white rounded-lg border border-pink-100">
                            <p className="text-gray-700 text-sm leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                No compartimos tu información con terceros, excepto en casos necesarios para completar el servicio 
                                (por ejemplo, plataformas de pago o mensajería).
                            </p>
                        </div>
                    </div>

                    {/* Sección 5: Derechos del usuario */}
                    <div className="mb-6">
                        <div className="flex items-center mb-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-pink-300 rounded-full flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>5</span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Derechos del usuario
                            </h4>
                        </div>
                        <div className="ml-11 p-4 bg-white rounded-lg border border-pink-100">
                            <p className="text-gray-700 text-sm leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Tienes derecho a acceder, corregir o eliminar tus datos personales escribiéndonos a: 
                                <a href="mailto:marquesasv@gmail.com" className="text-pink-600 underline hover:text-pink-700 transition-colors ml-1">
                                    marquesasv@gmail.com
                                </a>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer del modal */}
                <div className="p-6 border-t border-pink-100" style={{ backgroundColor: '#FDB4B7' }}>
                    <button
                        onClick={onClose}
                        className="w-full bg-white hover:bg-gray-50 text-pink-600 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrivacyModal;
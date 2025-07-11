import React from "react";
import { X } from "lucide-react";

/**
 * Modal para mostrar los términos y condiciones de La MarquesaSV
 * Diseñado con los colores rosados de la aplicación
 * 
 * @param {boolean} isOpen - Si el modal está abierto
 * @param {Function} onClose - Función para cerrar el modal
 */
const TermsModal = ({ isOpen, onClose }) => {
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
                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Términos y Condiciones
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
                            Al utilizar los servicios de <strong className="text-pink-600">La MarquesaSV</strong>, aceptas los siguientes términos:
                        </p>
                    </div>

                    {/* Sección 1: Pedidos */}
                    <div className="mb-6">
                        <div className="flex items-center mb-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-pink-300 rounded-full flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>1</span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Pedidos
                            </h4>
                        </div>
                        <div className="ml-11 p-4 bg-white rounded-lg border border-pink-100">
                            <p className="text-gray-700 text-sm leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Todos los pedidos deben realizarse a través de nuestros canales oficiales (redes sociales, sitio web o WhatsApp). 
                                El pago debe completarse antes de la elaboración del arreglo floral.
                            </p>
                        </div>
                    </div>

                    {/* Sección 2: Productos */}
                    <div className="mb-6">
                        <div className="flex items-center mb-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-pink-300 rounded-full flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>2</span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Productos
                            </h4>
                        </div>
                        <div className="ml-11 p-4 bg-white rounded-lg border border-pink-100">
                            <p className="text-gray-700 text-sm leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Nuestros arreglos pueden variar ligeramente en diseño y flores según disponibilidad estacional, 
                                pero se respeta siempre el estilo y calidad ofrecidos.
                            </p>
                        </div>
                    </div>

                    {/* Sección 3: Precios */}
                    <div className="mb-6">
                        <div className="flex items-center mb-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-pink-300 rounded-full flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>3</span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Precios
                            </h4>
                        </div>
                        <div className="ml-11 p-4 bg-white rounded-lg border border-pink-100">
                            <p className="text-gray-700 text-sm leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Los precios están expresados en dólares estadounidenses (USD) e incluyen IVA. 
                                Los costos de envío pueden variar según la zona.
                            </p>
                        </div>
                    </div>

                    {/* Sección 4: Cancelaciones */}
                    <div className="mb-6">
                        <div className="flex items-center mb-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-pink-300 rounded-full flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>4</span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Cancelaciones y reembolsos
                            </h4>
                        </div>
                        <div className="ml-11 p-4 bg-white rounded-lg border border-pink-100">
                            <p className="text-gray-700 text-sm leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Los pedidos pueden cancelarse hasta 48 horas después de la fecha que se emitió la orden del pedido. 
                                No se hacen reembolsos por cancelaciones fuera de ese plazo o por errores en los datos proporcionados por el cliente.
                            </p>
                        </div>
                    </div>

                    {/* Sección 5: Uso del contenido */}
                    <div className="mb-6">
                        <div className="flex items-center mb-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-pink-300 rounded-full flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>5</span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Uso del contenido
                            </h4>
                        </div>
                        <div className="ml-11 p-4 bg-white rounded-lg border border-pink-100">
                            <p className="text-gray-700 text-sm leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Todo el contenido visual, logotipos y fotografías pertenecen a La MarquesaSV y no puede ser usado sin autorización previa.
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

export default TermsModal;
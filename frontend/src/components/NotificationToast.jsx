// frontend/src/components/NotificationToast.jsx

// Importa React y el hook useEffect para manejar efectos secundarios
import React, { useEffect } from 'react';

/**
 * Componente NotificationToast - Notificación temporal tipo toast
 * 
 * Muestra notificaciones temporales en la esquina superior derecha de la pantalla
 * con diferentes tipos visuales (éxito, error, advertencia, información, favorito)
 * y desaparición automática configurable.
 * 
 * @param {boolean} show - Si la notificación debe mostrarse
 * @param {string} message - Mensaje a mostrar en la notificación
 * @param {string} type - Tipo de notificación ('success', 'error', 'warning', 'info', 'favorite')
 * @param {number} duration - Duración en milisegundos antes de auto-cerrar (0 = no auto-cerrar)
 * @param {function} onClose - Función a ejecutar al cerrar la notificación
 * @param {string} className - Clases CSS adicionales
 */
const NotificationToast = ({ 
    show, 
    message, 
    type = 'success', 
    duration = 2000,
    onClose,
    className = '' 
}) => {
    // Definición de tipos con colores de fondo e iconos específicos
    const types = {
        success: {
            bg: 'bg-green-500',
            icon: (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            )
        },
        error: {
            bg: 'bg-red-500',
            icon: (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            )
        },
        warning: {
            bg: 'bg-yellow-500',
            icon: (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        info: {
            bg: 'bg-blue-500',
            icon: (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        favorite: {
            bg: 'bg-pink-500',
            icon: (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            )
        }
    };

    // Efecto para auto-cerrar la notificación después de la duración especificada
    useEffect(() => {
        if (show && duration > 0) {
            const timer = setTimeout(() => {
                if (onClose) onClose();
            }, duration);

            // Cleanup: cancela el timer si el componente se desmonta o cambian las dependencias
            return () => clearTimeout(timer);
        }
    }, [show, duration, onClose]);

    // No renderiza nada si show es false
    if (!show) return null;

    // Obtiene la configuración del tipo actual o usa 'info' por defecto
    const { bg, icon } = types[type] || types.info;

    return (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${bg} text-white ${className}`}>
            <div className="flex items-center">
                {/* Icono del tipo de notificación */}
                {icon}
                
                {/* Mensaje de la notificación */}
                <span style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {message}
                </span>
                
                {/* Botón de cerrar (opcional) */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="ml-4 text-white hover:text-gray-200 transition-colors"
                        style={{ cursor: 'pointer' }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};

export default NotificationToast;
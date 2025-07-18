// frontend/src/components/LoadingSpinner.jsx

// Importa React para crear el componente
import React from 'react';

/**
 * Componente LoadingSpinner - Indicador de carga visual reutilizable
 * 
 * Componente que muestra un spinner animado con texto personalizable
 * para indicar estados de carga en la aplicación. Incluye diferentes
 * tamaños y colores configurables.
 * 
 * @param {string} size - Tamaño del spinner ('sm', 'md', 'lg')
 * @param {string} text - Texto a mostrar debajo del spinner
 * @param {string} color - Color del spinner (valor hexadecimal)
 * @param {string} className - Clases CSS adicionales
 */
const LoadingSpinner = ({ 
    size = 'md', 
    text = 'Cargando...', 
    color = '#FDB4B7', // Color rosa por defecto del tema
    className = '' 
}) => {
    // Definición de clases de tamaño para el spinner
    const sizeClasses = {
        sm: 'w-6 h-6',                    // Pequeño: 24x24px
        md: 'w-8 h-8 sm:w-12 sm:h-12',   // Mediano: responsive 32px/48px
        lg: 'w-16 h-16'                  // Grande: 64x64px
    };

    return (
        <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
            <div className="text-center">
                {/* Spinner circular animado */}
                <div 
                    className={`animate-spin rounded-full border-b-2 mx-auto mb-4 ${sizeClasses[size]}`}
                    style={{ borderColor: color }}
                ></div>
                
                {/* Texto de carga (opcional) */}
                {text && (
                    <p 
                        className="text-gray-600 text-sm sm:text-base"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                        {text}
                    </p>
                )}
            </div>
        </div>
    );
};

export default LoadingSpinner;
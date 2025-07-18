// frontend/src/components/Divider.jsx

// Importa React para crear el componente
import React from 'react';

/**
 * Componente Divider - Separador visual configurable horizontal o vertical
 * 
 * Permite crear líneas de separación entre secciones de contenido
 * con opciones para incluir texto y personalizar colores
 * 
 * @param {string} orientation - Orientación del divisor ('horizontal', 'vertical')
 * @param {string} text - Texto opcional a mostrar en el centro del divisor
 * @param {string} className - Clases CSS adicionales
 * @param {string} color - Color de la línea divisoria (valor hexadecimal)
 */
const Divider = ({ 
    orientation = 'horizontal', 
    text, 
    className = '',
    color = '#E5E7EB'  // Color gris por defecto
}) => {
    // Divisor vertical
    if (orientation === 'vertical') {
        return (
            <div 
                className={`w-px bg-gray-300 ${className}`}
                style={{ backgroundColor: color }}
            />
        );
    }

    // Divisor horizontal con texto en el centro
    if (text) {
        return (
            <div className={`relative flex items-center ${className}`}>
                {/* Línea izquierda */}
                <div className="flex-grow border-t" style={{ borderColor: color }}></div>
                {/* Texto central */}
                <span 
                    className="flex-shrink mx-4 text-gray-500 text-sm"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    {text}
                </span>
                {/* Línea derecha */}
                <div className="flex-grow border-t" style={{ borderColor: color }}></div>
            </div>
        );
    }

    // Divisor horizontal simple
    return (
        <hr 
            className={`border-0 h-px ${className}`}
            style={{ backgroundColor: color }}
        />
    );
};

export default Divider;
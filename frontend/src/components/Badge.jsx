// frontend/src/components/Badge.jsx

// Importa React para crear el componente
import React from 'react';

/**
 * Componente Badge - Etiqueta visual reutilizable para mostrar estados o categorías
 * 
 * @param {React.ReactNode} children - Contenido del badge (texto, números, etc.)
 * @param {string} variant - Variante de color del badge ('default', 'primary', 'success', 'warning', 'error', 'info', 'agendado', 'en-proceso', 'entregado')
 * @param {string} size - Tamaño del badge ('sm', 'md', 'lg')
 * @param {string} className - Clases CSS adicionales
 */
const Badge = ({ 
    children, 
    variant = 'default', 
    size = 'md',
    className = '' 
}) => {
    // Definición de variantes de color y estilo para diferentes estados
    const variants = {
        default: 'bg-gray-100 text-gray-800 border-gray-300',
        primary: 'bg-pink-100 text-pink-800 border-pink-300',
        success: 'bg-green-100 text-green-800 border-green-300',
        warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        error: 'bg-red-100 text-red-800 border-red-300',
        info: 'bg-blue-100 text-blue-800 border-blue-300',
        // Variantes específicas para estados de pedidos/procesos
        agendado: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        'en-proceso': 'bg-blue-100 text-blue-800 border-blue-300',
        entregado: 'bg-green-100 text-green-800 border-green-300'
    };

    // Definición de tamaños para el badge (padding y texto)
    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base'
    };

    return (
        <span
            className={`
                inline-flex items-center font-medium rounded-full border
                ${variants[variant]}
                ${sizes[size]}
                ${className}
            `}
            style={{ fontFamily: 'Poppins, sans-serif' }}
        >
            {/* Renderiza el contenido del badge */}
            {children}
        </span>
    );
};

export default Badge;
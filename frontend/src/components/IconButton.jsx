// frontend/src/components/IconButton.jsx

// Importa React para crear el componente
import React from 'react';

/**
 * Componente IconButton - Botón circular que contiene solo un icono
 * 
 * Botón especializado para mostrar únicamente iconos con diferentes variantes de estilo,
 * tamaños y estados. Ideal para acciones rápidas y interfaces minimalistas.
 * 
 * @param {React.ReactNode|string} icon - Icono a mostrar (URL de imagen o componente React)
 * @param {function} onClick - Función que se ejecuta al hacer clic
 * @param {string} variant - Variante de estilo ('default', 'primary', 'secondary', 'danger', 'success', 'transparent')
 * @param {string} size - Tamaño del botón ('sm', 'md', 'lg')
 * @param {boolean} disabled - Si el botón está deshabilitado
 * @param {boolean} loading - Si el botón está en estado de carga
 * @param {string} tooltip - Texto del tooltip que aparece al hacer hover
 * @param {string} className - Clases CSS adicionales
 * @param {object} props - Props adicionales para el elemento button
 */
const IconButton = ({ 
    icon, 
    onClick, 
    variant = 'default',
    size = 'md',
    disabled = false,
    loading = false,
    tooltip,
    className = '',
    ...props 
}) => {
    // Definición de variantes de color y estilo
    const variants = {
        default: 'bg-gray-100 hover:bg-gray-200 text-gray-600',
        primary: 'bg-[#FDB4B7] hover:bg-[#F2C6C2] text-white',
        secondary: 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-300',
        danger: 'bg-red-100 hover:bg-red-200 text-red-600',
        success: 'bg-green-100 hover:bg-green-200 text-green-600',
        transparent: 'bg-transparent hover:bg-gray-100 text-gray-600'
    };

    // Definición de tamaños para el botón (ancho, alto y padding)
    const sizes = {
        sm: 'w-8 h-8 p-1',
        md: 'w-10 h-10 p-2',
        lg: 'w-12 h-12 p-3'
    };

    // Definición de tamaños para los iconos
    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            title={tooltip} // Tooltip nativo del navegador
            className={`
                ${variants[variant]}
                ${sizes[size]}
                rounded-full flex items-center justify-center
                transition-all duration-200 transform hover:scale-105
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300
                ${className}
            `}
            style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
            {...props}
        >
            {/* Renderizado condicional del contenido del botón */}
            {loading ? (
                // Spinner de carga
                <div className={`animate-spin rounded-full border-b-2 border-current ${iconSizes[size]}`}></div>
            ) : typeof icon === 'string' ? (
                // Icono como imagen
                <img src={icon} alt="" className={iconSizes[size]} />
            ) : (
                // Icono como componente React - clona el elemento y añade la clase de tamaño
                React.cloneElement(icon, { className: iconSizes[size] })
            )}
        </button>
    );
};

export default IconButton;
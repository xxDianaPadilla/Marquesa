// frontend/src/components/ActionButton.jsx

// Importa React para crear el componente
import React from 'react';

/**
 * Componente ActionButton - Botón de acción reutilizable con múltiples variantes y estados
 * 
 * @param {React.ReactNode} children - Contenido del botón (texto, iconos, etc.)
 * @param {function} onClick - Función que se ejecuta al hacer clic en el botón
 * @param {string} variant - Variante del estilo del botón ('primary', 'secondary', 'outline', 'danger', 'success')
 * @param {string} size - Tamaño del botón ('sm', 'md', 'lg')
 * @param {boolean} disabled - Si el botón está deshabilitado
 * @param {boolean} loading - Si el botón está en estado de carga
 * @param {React.ReactNode|string} icon - Icono a mostrar (puede ser una imagen URL o componente React)
 * @param {string} className - Clases CSS adicionales
 * @param {object} props - Props adicionales que se pasan al elemento button
 */
const ActionButton = ({ 
    children, 
    onClick, 
    variant = 'primary', 
    size = 'md', 
    disabled = false,
    loading = false,
    icon,
    className = '',
    ...props 
}) => {
    // Definición de variantes de color y estilo para el botón
    const variants = {
        primary: 'bg-[#FDB4B7] hover:bg-[#F2C6C2] text-white',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
        outline: 'border border-[#FDB4B7] text-[#FDB4B7] hover:bg-[#FDB4B7] hover:text-white',
        danger: 'bg-red-500 hover:bg-red-600 text-white',
        success: 'bg-green-500 hover:bg-green-600 text-white'
    };

    // Definición de tamaños para el botón (padding y texto)
    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading} // Deshabilita si está disabled o loading
            className={`
                ${variants[variant]}
                ${sizes[size]}
                rounded-lg font-medium transition-all duration-200 
                flex items-center justify-center gap-2
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:scale-105 transform
                ${className}
            `}
            style={{ 
                fontFamily: 'Poppins, sans-serif',
                cursor: disabled ? 'not-allowed' : 'pointer'
            }}
            {...props}
        >
            {/* Renderizado condicional del contenido del botón */}
            {loading ? (
                // Spinner de carga cuando loading es true
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : icon ? (
                // Renderiza icono si se proporciona
                typeof icon === 'string' ? (
                    <img src={icon} alt="" className="w-4 h-4" />
                ) : (
                    icon
                )
            ) : null}
            {children}
        </button>
    );
};

export default ActionButton;
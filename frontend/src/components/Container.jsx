// frontend/src/components/Container.jsx

// Importa React para crear el componente
import React from 'react';

/**
 * Componente Container - Contenedor responsive para centrar y limitar el ancho del contenido
 * 
 * Proporciona un wrapper con ancho máximo configurable, centrado horizontalmente
 * y con padding responsive para mantener márgenes apropiados en diferentes dispositivos
 * 
 * @param {React.ReactNode} children - Contenido que se renderizará dentro del contenedor
 * @param {string} size - Tamaño máximo del contenedor ('sm', 'default', 'lg', 'xl', 'full')
 * @param {string} padding - Configuración de padding responsive ('none', 'sm', 'default', 'lg')
 * @param {string} className - Clases CSS adicionales
 */
const Container = ({ 
    children, 
    size = 'default',
    padding = 'default',
    className = '' 
}) => {
    // Definición de tamaños máximos para el contenedor
    const sizes = {
        sm: 'max-w-4xl',      // ~896px
        default: 'max-w-6xl', // ~1152px
        lg: 'max-w-7xl',      // ~1280px
        xl: 'max-w-8xl',      // Tamaño extra grande (custom)
        full: 'max-w-full'    // Sin límite de ancho
    };

    // Definición de configuraciones de padding responsive
    const paddings = {
        none: '',                               // Sin padding
        sm: 'px-2 sm:px-4',                    // Padding pequeño
        default: 'px-4 sm:px-6 lg:px-8',      // Padding estándar responsive
        lg: 'px-6 sm:px-8 lg:px-12'           // Padding grande
    };

    return (
        <div className={`${sizes[size]} mx-auto ${paddings[padding]} ${className}`}>
            {/* Renderiza el contenido pasado como children */}
            {children}
        </div>
    );
};

export default Container;
// frontend/src/components/StatsCard.jsx

// Importa React para crear el componente
import React from 'react';

/**
 * Componente StatsCard - Tarjeta para mostrar estadísticas de manera visual
 * 
 * Componente especializado para presentar métricas y estadísticas importantes
 * con iconos, colores personalizables y formato centrado. Ideal para dashboards
 * y resúmenes de datos.
 * 
 * @param {React.ReactNode|string} icon - Icono a mostrar (URL de imagen o componente React)
 * @param {string} title - Título de la estadística
 * @param {string|number} value - Valor principal a mostrar
 * @param {string} subtitle - Subtítulo opcional con información adicional
 * @param {string} color - Color de fondo de la tarjeta
 * @param {string} textColor - Color del texto ('white', 'black', etc.)
 * @param {string} className - Clases CSS adicionales
 */
const StatsCard = ({ 
    icon, 
    title, 
    value, 
    subtitle, 
    color = '#E8ACD2',  // Color rosa por defecto del tema
    textColor = 'white',
    className = '' 
}) => {
    return (
        <div 
            className={`text-center rounded-xl p-4 flex-1 ${className}`} 
            style={{ backgroundColor: color }}
        >
            {/* Icono (opcional) */}
            {icon && (
                <div className="flex justify-center mb-2">
                    {/* Renderiza icono como imagen o componente React */}
                    {typeof icon === 'string' ? (
                        <img src={icon} alt={title} className="w-6 h-6" />
                    ) : (
                        icon
                    )}
                </div>
            )}
            
            {/* Título de la estadística */}
            <p 
                className={`text-xs text-${textColor} mb-1`}
                style={{ fontFamily: 'Poppins, sans-serif' }}
            >
                {title}
            </p>
            
            {/* Valor principal (número, porcentaje, etc.) */}
            <p 
                className={`text-${textColor} text-xl font-bold`}
                style={{ fontFamily: 'Poppins, sans-serif' }}
            >
                {value}
            </p>
            
            {/* Subtítulo opcional */}
            {subtitle && (
                <p 
                    className={`text-xs text-${textColor} opacity-75 mt-1`}
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    {subtitle}
                </p>
            )}
        </div>
    );
};

export default StatsCard;
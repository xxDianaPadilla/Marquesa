// frontend/src/components/InfoCard.jsx

// Importa React para crear el componente
import React from 'react';

/**
 * Componente InfoCard - Tarjeta informativa con diseño visual destacado
 * 
 * Componente que presenta información de manera visual atractiva con iconos,
 * colores personalizables y efectos de vidrio esmerilado. Ideal para mostrar
 * información importante, estadísticas o características destacadas.
 * 
 * @param {React.ReactNode} icon - Icono a mostrar en la tarjeta
 * @param {string} title - Título principal de la tarjeta
 * @param {React.ReactNode|string} description - Descripción o contenido (puede ser texto o JSX)
 * @param {string} backgroundColor - Color de fondo para el área de descripción
 * @param {string} borderColor - Color del borde izquierdo del área de descripción
 * @param {string} iconBg - Gradiente de fondo para el contenedor del icono
 * @param {string|number} number - Número a mostrar en lugar del icono
 * @param {string} className - Clases CSS adicionales
 */
const InfoCard = ({ 
    icon, 
    title, 
    description, 
    backgroundColor = '#BEF7FF',
    borderColor = '#3C3550',
    iconBg = 'linear-gradient(to bottom right, #BEF7FF, #3C3550)',
    number,
    className = '' 
}) => {
    return (
        <div 
            className={`bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 sm:p-10 lg:p-12 hover:shadow-2xl transition-all duration-300 ${className}`} 
            style={{ borderColor: '#FADDDD', borderWidth: '1px' }}
        >
            {/* Contenedor principal con layout horizontal */}
            <div className="flex items-start space-x-6">
                {/* Contenedor del icono/número con gradiente de fondo */}
                <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0" 
                    style={{ background: iconBg }}
                >
                    {/* Renderiza número o icono según lo que se proporcione */}
                    {number ? (
                        <span className="text-white text-xl font-bold">{number}</span>
                    ) : (
                        icon
                    )}
                </div>
                
                {/* Contenedor del contenido textual */}
                <div className="flex-1">
                    {/* Título principal */}
                    <h3 
                        className="text-2xl sm:text-3xl font-bold mb-4" 
                        style={{ fontFamily: 'Poppins, sans-serif', color: '#3C3550' }}
                    >
                        {title}
                    </h3>
                    
                    {/* Área de descripción con fondo coloreado y borde izquierdo */}
                    <div 
                        className="rounded-2xl p-6" 
                        style={{ 
                            backgroundColor, 
                            borderLeftColor: borderColor, 
                            borderLeftWidth: '4px' 
                        }}
                    >
                        <div className="flex items-start space-x-4">
                            {/* Renderiza la descripción como texto o JSX */}
                            {typeof description === 'string' ? (
                                <p 
                                    className="text-base sm:text-lg leading-relaxed" 
                                    style={{ fontFamily: 'Poppins, sans-serif', color: '#999999' }}
                                >
                                    {description}
                                </p>
                            ) : (
                                description
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfoCard;
// frontend/src/components/ProgressBar.jsx

// Importa React para crear el componente
import React from 'react';

/**
 * Componente ProgressBar - Barra de progreso con pasos visuales
 * 
 * Componente que muestra el progreso a través de múltiples pasos con:
 * - Barra de progreso visual
 * - Iconos de estado para cada paso
 * - Etiquetas opcionales
 * - Estados: completado, actual, pendiente
 * 
 * @param {Array} steps - Array de objetos con información de cada paso
 * @param {number} currentStep - Paso actual (1-indexed)
 * @param {string} className - Clases CSS adicionales
 * @param {boolean} showLabels - Si mostrar las etiquetas de los pasos
 */
const ProgressBar = ({ 
    steps, 
    currentStep, 
    className = '',
    showLabels = true 
}) => {
    // Calcula el porcentaje de progreso basado en el paso actual
    const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

    return (
        <div className={`w-full ${className}`}>
            {/* Contenedor principal de la barra de progreso */}
            <div className="relative mb-8">
                {/* Barra de fondo gris */}
                <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
                    {/* Barra de progreso coloreada */}
                    <div 
                        className="h-full rounded-full transition-all duration-300" 
                        style={{ 
                            width: `${progressPercentage}%`, 
                            backgroundColor: '#E8ACD2' // Color rosa del tema
                        }}
                    ></div>
                </div>

                {/* Contenedor de los pasos con iconos */}
                <div className="flex items-center justify-between mb-4">
                    {steps.map((step, index) => {
                        const stepNumber = index + 1;
                        const isCompleted = stepNumber < currentStep;   // Paso ya completado
                        const isCurrent = stepNumber === currentStep;   // Paso actual
                        
                        return (
                            <div key={step.id || index} className="flex flex-col items-center relative">
                                {/* Círculo del paso con estado visual */}
                                <div 
                                    className={`
                                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium 
                                        ${isCompleted ? 'text-white' : 
                                          isCurrent ? 'text-white' : 'bg-gray-400 text-gray-500'}
                                    `} 
                                    style={{ 
                                        backgroundColor: isCompleted || isCurrent ? '#E8ACD2' : '' 
                                    }}
                                >
                                    {/* Muestra icono personalizado o número del paso */}
                                    {step.icon || stepNumber}
                                </div>
                                
                                {/* Etiqueta del paso (opcional) */}
                                {showLabels && (
                                    <span 
                                        className={`
                                            mt-2 text-sm font-medium 
                                            ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'}
                                        `}
                                        style={{ fontFamily: 'Poppins, sans-serif' }}
                                    >
                                        {step.label}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ProgressBar;
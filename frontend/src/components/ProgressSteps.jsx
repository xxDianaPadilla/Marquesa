import React, { useState } from "react";

// Componente ProgressSteps que muestra el progreso de un proceso de compra
// Recibe como prop 'currentStep' que indica el paso actual (por defecto es 1)
const ProgressSteps = ({ currentStep = 1 }) => {
    // Array que define los pasos del proceso de compra
    const steps = [
        { 
            number: 1, 
            title: "Envío", 
            active: currentStep >= 1,    // El paso está activo si currentStep es mayor o igual a 1
            completed: currentStep > 1   // El paso está completado si currentStep es mayor a 1
        },
        { 
            number: 2, 
            title: "Pago", 
            active: currentStep >= 2,    // El paso está activo si currentStep es mayor o igual a 2
            completed: currentStep > 2   // El paso está completado si currentStep es mayor a 2
        },
        { 
            number: 3, 
            title: "Revisión", 
            active: currentStep >= 3,    // El paso está activo si currentStep es mayor o igual a 3
            completed: currentStep > 3   // El paso está completado si currentStep es mayor a 3
        }
    ];

    return (
        // Contenedor principal con máximo ancho, centrado y padding
        <div className="max-w-7xl mx-auto px-6 py-8 bg-white">
            {/* Título principal del proceso */}
            <h1 className="text-2xl text-center font-bold mb-8">Finalizar Compra</h1>
            
            {/* Contenedor para los pasos del progreso */}
            <div className="flex items-center justify-center mb-8">
                {/* Mapea cada paso del array steps */}
                {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center">
                        {/* Contenedor individual para cada paso */}
                        <div className="flex flex-col items-center">
                            {/* Círculo que representa el paso */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                                step.completed
                                    ? 'bg-green-500'    // Verde si el paso está completado
                                    : step.active
                                        ? 'bg-pink-400'  // Rosa si el paso está activo
                                        : 'bg-gray-300'  // Gris si el paso no está activo
                                }`}>
                                {/* Muestra un check si está completado, sino el número del paso */}
                                {step.completed ? '✓' : step.number}
                            </div>
                            {/* Título del paso debajo del círculo */}
                            <span className="text-sm mt-2 text-gray-600">{step.title}</span>
                        </div>
                        
                        {/* Línea conectora entre pasos (no se muestra en el último paso) */}
                        {index < steps.length - 1 && (
                            <div className={`w-16 h-0.5 mx-4 mt-[-20px] ${
                                step.completed ? 'bg-green-500' : 'bg-gray-300'  // Verde si completado, gris si no
                                }`}></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Exporta el componente como default
export default ProgressSteps;
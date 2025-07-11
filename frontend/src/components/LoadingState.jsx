import React from 'react';

// Componente para mostrar un estado de carga
// Este componente muestra un spinner y un mensaje de carga
const LoadingState = ({ message = "Cargando multimedia...", size = "md" }) => {
    // Clases para el tamaño del spinner y el contenedor
    // Permite personalizar el tamaño del spinner y el contenedor según las necesidades
    const sizeClasses = {
        sm: "h-6 w-6",
        md: "h-12 w-12",
        lg: "h-16 w-16"
    };
    // Clases para el contenedor del spinner según el tamaño
    // Esto permite que el contenedor se ajuste al tamaño del spinner y mantenga un diseño
    const containerClasses = {
        sm: "h-32",
        md: "h-64",
        lg: "min-h-[400px]"
    };

    return (
        <div className={`flex items-center justify-center ${containerClasses[size]}`}>
            <div className="text-center">
                <div className={`animate-spin rounded-full border-b-2 border-[#FF7260] mx-auto mb-4 ${sizeClasses[size]}`}></div>
                <p className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {message}
                </p>
            </div>
        </div>
    );
};

export default LoadingState;
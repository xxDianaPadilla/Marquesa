import React from "react";

// Componente de texto informativo
// Este componente muestra un texto informativo con estilo responsive mejorado
const InfoText = ({ children }) => {
    return (
        <p 
            className="text-center leading-relaxed
                       text-xs sm:text-sm md:text-base lg:text-base
                       px-2 sm:px-4 md:px-6 lg:px-8
                       mb-4 sm:mb-5 md:mb-6 lg:mb-7
                       mx-auto max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg
                       break-words"
            style={{
                fontFamily: 'Poppins, sans-serif', 
                color: '#999999',
                lineHeight: '1.5'
            }}
        >
            {children}
        </p>
    );
};

export default InfoText;
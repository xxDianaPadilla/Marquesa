import React from "react";

// Componente QuestionText que muestra una pregunta con un enlace/botón interactivo
// Recibe props con valores por defecto para personalizar el texto y la acción
const QuestionText = ({
    question = "¿No tienes una cuenta aún?",    // Texto de la pregunta (valor por defecto)
    linkText = "Registrate",                    // Texto del enlace/botón (valor por defecto)
    onLinkClick                                 // Función que se ejecuta al hacer clic en el enlace
}) => {
    return (
        // Contenedor principal centrado con margen superior
        <div className="text-center mt-6">
            {/* Texto de la pregunta */}
            <span
                className="text-sm text-gray-600 italic font-medium"
                style={{ fontFamily: 'Poppins, sans-serif' }}
            >
                {question}
            </span>
            
            {/* Botón/enlace interactivo */}
            <button
                onClick={onLinkClick}  // Ejecuta la función pasada como prop al hacer clic
                className="text-sm font-semibold italic ml-1 hover:underline transition-all duration-200"
                style={{
                    color: '#FF6A5F',                    // Color coral/salmón personalizado
                    fontFamily: 'Poppins, sans-serif',  // Fuente Poppins
                    cursor: 'pointer'                    // Cursor de mano al pasar por encima
                }}
            >
                {linkText}
            </button>
        </div>
    );
};

// Exporta el componente como default
export default QuestionText;
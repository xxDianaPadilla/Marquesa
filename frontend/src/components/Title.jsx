import React from "react";

// Componente Title que renderiza un título estilizado
const Title = ({ children }) => {
    return (
        // Renderiza un h1 con estilos personalizados
        <h1 className="text-black text-3xl font-bold italic text-center mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {/* Muestra el contenido que se pase como 'children' (puede ser texto o cualquier componente hijo) */}
            {children}
        </h1>
    );
};

// Exporta el componente Title para que pueda ser utilizado en otros archivos
export default Title;

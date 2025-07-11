// Importa React, necesario para crear componentes en React
import React from "react";

// Definición del componente funcional Separator
// Recibe una propiedad `text` con un valor por defecto de "o"
const Separator = ({ text = "o" }) => {
    return (
        // Contenedor principal con clase flex para organizar los elementos en fila
        <div className="flex items-center my-6">
            
            {/* Línea de separación a la izquierda con estilo */}
            <div className="flex-1 h-px bg-gray-300"></div>
            
            {/* Contenedor del texto que aparece en el medio del separador */}
            <div className="px-4">
                <span
                    className="text-gray-500 text-sm font-medium"
                    // Aplica la fuente 'Poppins' al texto
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                    {/* Muestra el valor de la propiedad 'text' */}
                    {text}
                </span>
            </div>
            
            {/* Línea de separación a la derecha con estilo */}
            <div className="flex-1 h-px bg-gray-300"></div>
        </div>
    );
};

// Exporta el componente como default para poder usarlo en otras partes de la aplicación
export default Separator;

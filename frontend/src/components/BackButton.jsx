import React from "react";
import backIcon from "../assets/backIcon.png";

/**
 * Componente de botón de navegación hacia atrás
 * Estilo consistente con el diseño rosa/pink del proyecto
 */
const BackButton = ({ onClick }) => {
    return (
        <button
            style={{ cursor: 'pointer' }}
            onClick={onClick}
            // Posicionamiento absoluto en esquina superior izquierda
            className="absolute top-6 left-6 flex items-center gap-2 text-pink-400 hover:text-pink-500 transition-colors duration-200 z-10"
        >
            {/* Icono de flecha hacia atrás */}
            <img
                src={backIcon}
                alt="Regresar"
                style={{ width: '25px', height: '25px' }}
            />
            {/* Texto con fuente Poppins y color personalizado */}
            <span
                className="text-lg font-medium"
                style={{ fontFamily: 'Poppins, sans-serif', color: "#FDB4B7" }}
            >
                Regresar
            </span>
        </button>
    );
};

export default BackButton;
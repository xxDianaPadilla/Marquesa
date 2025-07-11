import React from "react";

/**
 * Componente de botón reutilizable con múltiples variantes
 * Soporta iconos, diferentes estilos y estados disabled
 */
const Button = ({ text, onClick, variant = "primary", icon, type, disabled }) => {
    /**
     * Define estilos de texto basado en la variante
     */
    const getButtonStyles = () => {
        switch (variant) {
            case "primary":
                return "text-black";
            case "secondary":
                return "bg-gray-200 hover:bg-gray-300 text-gray-800";
            case "Google":
                return "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300";
            default:
                return "text-black";
        }
    };

    /**
     * Define color de fondo basado en la variante
     */
    const getBackgroundColor = () => {
        switch (variant) {
            case "primary":
                return "#FADDDD"; // Rosa claro del tema
            case "secondary":
                return "";
            case "Google":
                return "";
            default:
                return "#F8BBD9"; // Rosa alternativo
        }
    };

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`
                w-full rounded-lg py-3 px-6 italic text-center
                transition-colors duration-200 flex items-center justify-center
                hover:opacity-90
                ${getButtonStyles()}
            ` }
            style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '16px',
                backgroundColor: getBackgroundColor(),
                cursor: 'pointer'
            }}
        >
            {/* Icono opcional a la izquierda del texto */}
            {icon && (
                <img
                    src={icon}
                    alt="Icon"
                    className="w-5 h-5 mr-2"
                />
            )}
            {text}
        </button>
    );
};

export default Button;
/**
 * Componente ErrorActionButton - Botón de acción para páginas de error
 * 
 * Funcionalidades principales:
 * - Botones primarios y secundarios con estilos fijos
 * - Gradientes y colores consistentes con el proyecto
 * - Efectos hover y transiciones
 * - Diseño responsivo
 * - Basado en los estilos de la página 404 original
 * 
 * Ubicación: frontend/src/components/errors/ErrorActionButton.jsx
 */

import React from "react";

const ErrorActionButton = ({ 
  onClick, 
  children, 
  variant = "primary", // "primary" o "outline"
  className = "",
  customGradient = null
}) => {
  // Estilos base comunes
  const baseStyles = {
    fontFamily: "Poppins, sans-serif",
  };

  // Estilos para botón primario - COLORES FIJOS
  const primaryStyles = {
    ...baseStyles,
    background: customGradient || "linear-gradient(to right, #FF6A5F, #FDB4B7)",
    color: "#FFFFFF",
    border: "none",
  };

  // Estilos para botón outline - COLORES FIJOS
  const outlineStyles = {
    ...baseStyles,
    color: "#3C3550",
    borderColor: "#F2C6C2",
    backgroundColor: "white",
    borderWidth: "2px",
    borderStyle: "solid",
  };

  const buttonStyles = variant === "primary" ? primaryStyles : outlineStyles;

  return (
    <button
      onClick={onClick}
      className={`px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 w-full sm:w-auto ${className}`}
      style={buttonStyles}
    >
      {children}
    </button>
  );
};

export default ErrorActionButton;
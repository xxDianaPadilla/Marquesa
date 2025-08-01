/**
 * Componente ErrorSuggestionsGrid - Grid de sugerencias para páginas de error
 * 
 * Funcionalidades principales:
 * - Grid responsivo de sugerencias/causas de error
 * - Tarjetas con iconos y descripciones
 * - Colores de fondo predefinidos del proyecto
 * - Efectos hover y transiciones
 * - Diseño basado en la página 404 original
 * 
 * Ubicación: frontend/src/components/errors/ErrorSuggestionsGrid.jsx
 */

import React from "react";

const ErrorSuggestionsGrid = ({ suggestions, columns = 3 }) => {
  // Definir los colores fijos para las tarjetas - BASADOS EN LA PÁGINA 404
  const predefinedColors = [
    "#BEF7FF", // Azul claro
    "#F2C6C2", // Rosa
    "#FADDDD", // Rosa más claro
    "#FDB4B7", // Rosa medio
  ];

  // Clases de grid responsivo según el número de columnas
  const gridClasses = {
    2: "grid md:grid-cols-2 gap-6",
    3: "grid md:grid-cols-3 gap-6",
    4: "grid md:grid-cols-2 lg:grid-cols-4 gap-6",
  };

  return (
    <div className={gridClasses[columns] || gridClasses[3]}>
      {suggestions.map((suggestion, index) => {
        // Asignar color de fondo de forma cíclica
        const backgroundColor = predefinedColors[index % predefinedColors.length];
        
        return (
          <div
            key={suggestion.id || index}
            className={`bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 ${
              suggestion.onClick ? 'cursor-pointer group' : ''
            }`}
            style={{ borderColor: backgroundColor, borderWidth: "1px" }}
            onClick={suggestion.onClick}
          >
            {/* Icono */}
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md mx-auto mb-4 ${
                suggestion.onClick ? 'group-hover:scale-110 transition-transform duration-300' : ''
              }`}
              style={{ backgroundColor: "#3C3550" }}
            >
              {suggestion.icon}
            </div>
            
            {/* Título */}
            <h3
              className={`font-bold text-lg mb-2 text-center ${
                suggestion.onClick ? 'group-hover:text-gray-800 transition-colors duration-300' : ''
              }`}
              style={{ fontFamily: "Poppins, sans-serif", color: "#3C3550" }}
            >
              {suggestion.title}
            </h3>
            
            {/* Descripción */}
            <p 
              className="text-sm text-center" 
              style={{ fontFamily: "Poppins, sans-serif", color: "#999999" }}
            >
              {suggestion.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default ErrorSuggestionsGrid;
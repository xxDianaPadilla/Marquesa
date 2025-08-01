/**
 * Componente ErrorInfoCard - Tarjeta de información adicional para páginas de error
 * 
 * Funcionalidades principales:
 * - Tarjeta con gradiente de fondo para información especial
 * - Icono y contenido flexible
 * - Gradientes fijos basados en el proyecto La Marquesa
 * - Diseño responsivo y elegante
 * - Basado en los estilos de la página 404 original
 * 
 * Ubicación: frontend/src/components/errors/ErrorInfoCard.jsx
 */

import React from "react";

const ErrorInfoCard = ({ 
  icon, 
  title, 
  children, 
  gradient = "linear-gradient(to right, #FDB4B7, #F2C6C2)" 
}) => {
  return (
    <div
      className="rounded-3xl shadow-xl p-8 sm:p-10"
      style={{ background: gradient }}
    >
      <div className="flex items-start space-x-6">
        {/* Icono */}
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        
        {/* Contenido */}
        <div className="flex-1">
          <h4
            className="text-white text-xl sm:text-2xl font-bold mb-4"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            {title}
          </h4>
          
          <div
            className="text-white/90 text-base sm:text-lg"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorInfoCard;
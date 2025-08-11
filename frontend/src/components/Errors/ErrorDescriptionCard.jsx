/**
 * Componente ErrorDescriptionCard - Tarjeta de descripción del error
 * 
 * Funcionalidades principales:
 * - Contenedor elegante para la descripción del error
 * - Icono central con gradiente fijo
 * - Texto descriptivo del error
 * - Botones de acción integrados
 * - Colores fijos basados en la página 404 original
 * - Diseño responsivo
 * 
 * Ubicación: frontend/src/components/errors/ErrorDescriptionCard.jsx
 */

import React from "react";

const ErrorDescriptionCard = ({
    icon,
    description,
    children // Para los botones de acción
}) => {
    return (
        <div
            className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 sm:p-10 max-w-4xl mx-auto mb-12"
            style={{ borderColor: "#FADDDD", borderWidth: "1px" }}
        >
            {/* Icono central con gradiente fijo */}
            <div className="flex items-center justify-center mb-6">
                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                    style={{ background: "linear-gradient(to bottom right, #F2C6C2, #FDB4B7)" }}
                >
                    {icon}
                </div>
            </div>

            {/* Descripción del error */}
            <p
                className="text-lg sm:text-xl leading-relaxed text-center mb-6"
                style={{ fontFamily: "Poppins, sans-serif", color: "#999999" }}
            >
                {description}
            </p>

            {/* Botones de acción */}
            {children && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {children}
                </div>
            )}
        </div>
    );
};

export default ErrorDescriptionCard;
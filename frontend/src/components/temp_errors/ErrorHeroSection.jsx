/**
 * Componente ErrorHeroSection - Sección hero para páginas de error
 * 
 * Funcionalidades principales:
 * - Decoración superior con puntos animados
 * - Código de estado grande y centrado
 * - Título descriptivo del error
 * - Línea decorativa
 * - Colores fijos basados en la página 404 original
 * - Diseño responsivo
 * 
 * Ubicación: frontend/src/components/errors/ErrorHeroSection.jsx
 */

import React from "react";

const ErrorHeroSection = ({
    statusCode,
    title,
    gradientColors = "linear-gradient(to right, #FF6A5F, #FDB4B7)"
}) => {
    return (
        <div className="text-center mb-16">
            {/* Decoración superior - COLORES FIJOS */}
            <div className="flex justify-center mb-6">
                <div className="flex space-x-2">
                    <div
                        className="w-3 h-3 rounded-full animate-pulse"
                        style={{ backgroundColor: "#FDB4B7" }}
                    ></div>
                    <div
                        className="w-3 h-3 rounded-full animate-pulse delay-75"
                        style={{ backgroundColor: "#F2C6C2" }}
                    ></div>
                    <div
                        className="w-3 h-3 rounded-full animate-pulse delay-150"
                        style={{ backgroundColor: "#FDB4B7" }}
                    ></div>
                </div>
            </div>

            {/* Código de estado */}
            <div className="mb-6">
                <span
                    className="text-8xl sm:text-9xl lg:text-[12rem] font-bold bg-clip-text text-transparent"
                    style={{
                        fontFamily: "Poppins, sans-serif",
                        backgroundImage: gradientColors,
                    }}
                >
                    {statusCode}
                </span>
            </div>

            {/* Título descriptivo */}
            <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
                style={{ fontFamily: "Poppins, sans-serif" }}
            >
                {title}
            </h1>

            {/* Línea decorativa - COLORES FIJOS */}
            <div
                className="w-24 h-1 mx-auto rounded-full mb-8"
                style={{ background: "linear-gradient(to right, #F2C6C2, #FADDDD)" }}
            ></div>
        </div>
    );
};

export default ErrorHeroSection;
/**
 * Componente BadRequest - Página de Error 400 (Solicitud Incorrecta) - ACTUALIZADA
 * 
 * Funcionalidades principales:
 * - Utiliza componentes reutilizables para mantener consistencia visual
 * - Colores fijos basados en la página 404 original
 * - Manejo elegante del error 400
 * - Diseño unificado con el resto del proyecto
 * - Botones de navegación para recuperación
 * - Información sobre posibles causas del error
 * 
 * Ubicación: frontend/src/pages/errors/BadRequest.jsx
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import ErrorPageContainer from "../../components/Errors/ErrorPageContainer";
import ErrorHeroSection from "../../components/Errors/ErrorHeroSection";
import ErrorDescriptionCard from "../../components/Errors/ErrorDescriptionCard";
import ErrorActionButton from "../../components/Errors/ErrorActionButton";
import ErrorSuggestionsGrid from "../../components/Errors/ErrorSuggestionsGrid";

const BadRequest = () => {

  /**
   * Navega hacia la página anterior en el historial
   */
  const handleGoBack = () => {
    window.history.back();
  };

  /**
   * Datos de las posibles causas del error 400
   */
  const errorCauses = [
    {
      id: 1,
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: "Datos faltantes",
      description: "Algunos campos requeridos pueden estar vacíos o incompletos"
    },
    {
      id: 2,
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: "Formato incorrecto",
      description: "Los datos pueden tener un formato inválido o no permitido"
    }
  ];

  return (
    <ErrorPageContainer>
      {/* Sección hero con código de estado y título */}
      <ErrorHeroSection 
        statusCode="400"
        title="Solicitud incorrecta"
        gradientColors="linear-gradient(to right, #FF6A5F, #FDB4B7)"
      />

      {/* Descripción del error con botones de acción */}
      <ErrorDescriptionCard 
        icon={
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        }
        description="La solicitud que enviaste no pudo ser procesada debido a un error en los datos proporcionados. Por favor, verifica la información e inténtalo nuevamente."
      >
        <ErrorActionButton
          onClick={handleGoBack}
          variant="primary"
        >
          Volver e intentar 🡢
        </ErrorActionButton>
      </ErrorDescriptionCard>

      {/* Grid de posibles causas del error */}
      <ErrorSuggestionsGrid 
        suggestions={errorCauses}
        columns={2}
      />
    </ErrorPageContainer>
  );
};

export default BadRequest;
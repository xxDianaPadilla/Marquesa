/**
 * Componente Forbidden - Página de Error 403 (Acceso Prohibido) - ACTUALIZADA
 * 
 * Funcionalidades principales:
 * - Utiliza componentes reutilizables para mantener consistencia visual
 * - Colores fijos basados en la página 404 original
 * - Manejo elegante del error 403
 * - Botones de navegación para contactar soporte o ir al inicio
 * - Información sobre posibles razones del acceso prohibido
 * - Diseño responsivo y accesible
 * 
 * Ubicación: frontend/src/pages/errors/Forbidden.jsx
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import ErrorPageContainer from "../../components/errors/ErrorPageContainer";
import ErrorHeroSection from "../../components/errors/ErrorHeroSection";
import ErrorDescriptionCard from "../../components/errors/ErrorDescriptionCard";
import ErrorActionButton from "../../components/errors/ErrorActionButton";
import ErrorSuggestionsGrid from "../../components/errors/ErrorSuggestionsGrid";

const Forbidden = () => {
  const navigate = useNavigate();

  /**
   * Navega hacia la página principal del sitio
   */
  const handleGoHome = () => {
    navigate("/");
  };

  /**
   * Datos de las posibles razones del error 403
   */
  const forbiddenReasons = [
    {
      id: 1,
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: "Permisos insuficientes",
      description: "Tu cuenta no tiene los permisos necesarios para acceder a esta sección"
    },
    {
      id: 2,
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: "Contenido restringido",
      description: "Esta sección requiere acceso especial o membresía premium"
    },
    {
      id: 3,
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: "Área administrativa",
      description: "Solo para personal autorizado del equipo La Marquesa"
    }
  ];

  return (
    <ErrorPageContainer>
      {/* Sección hero con código de estado y título */}
      <ErrorHeroSection 
        statusCode="403"
        title="Acceso prohibido"
        gradientColors="linear-gradient(to right, #FF6A5F, #FDB4B7)"
      />

      {/* Descripción del error con botones de acción */}
      <ErrorDescriptionCard 
        icon={
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
              clipRule="evenodd"
            />
          </svg>
        }
        description="No tienes permisos para acceder a esta página. Tu cuenta puede no tener los privilegios necesarios o el contenido puede estar restringido."
      >
        <ErrorActionButton
          onClick={handleGoHome}
          variant="primary"
          customGradient="linear-gradient(to right, #FF6A5F, #FDB4B7)"
        >
          Ir al inicio
        </ErrorActionButton>
        
      </ErrorDescriptionCard>

      {/* Grid de posibles razones del error */}
      <ErrorSuggestionsGrid 
        suggestions={forbiddenReasons}
        columns={3}
      />
    </ErrorPageContainer>
  );
};

export default Forbidden;
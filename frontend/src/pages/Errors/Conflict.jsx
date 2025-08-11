/**
 * Componente Conflict - Página de Error 409 (Conflicto) - ACTUALIZADA
 * 
 * Funcionalidades principales:
 * - Utiliza componentes reutilizables para mantener consistencia visual
 * - Colores fijos basados en la página 404 original
 * - Manejo elegante del error 409
 * - Botones de navegación para intentar nuevamente o ir al inicio
 * - Información sobre posibles causas del conflicto
 * - Diseño responsivo y accesible
 * 
 * Ubicación: frontend/src/pages/errors/Conflict.jsx
 */

import React from "react";
import { useNavigate } from "react-router-dom";

// Componentes específicos para páginas de error
import ErrorPageContainer from "../../components/Errors/ErrorPageContainer";
import ErrorHeroSection from "../../components/Errors/ErrorHeroSection";
import ErrorDescriptionCard from "../../components/Errors/ErrorDescriptionCard";
import ErrorActionButton from "../../components/Errors/ErrorActionButton";
import ErrorSuggestionsGrid from "../../components/Errors/ErrorSuggestionsGrid";
import ErrorInfoCard from "../../components/errors/ErrorInfoCard";

const Conflict = () => {

  /**
   * Recarga la página actual para intentar la operación nuevamente
   */
  const handleTryAgain = () => {
    window.location.reload();
  };

  /**
   * Datos de las posibles causas del error 409
   */
  const conflictCauses = [
    {
      id: 1,
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: "Datos duplicados",
      description: "La información ya existe en el sistema y no puede duplicarse"
    },
    {
      id: 2,
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: "Operación simultánea",
      description: "Otra operación está en progreso sobre el mismo recurso"
    }
  ];

  return (
    <ErrorPageContainer>
      {/* Sección hero con código de estado y título */}
      <ErrorHeroSection 
        statusCode="409"
        title="Conflicto detectado"
        gradientColors="linear-gradient(to right, #FF6A5F, #FDB4B7)"
      />

      {/* Descripción del error con botones de acción */}
      <ErrorDescriptionCard 
        icon={
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        }
        description="La solicitud no pudo completarse debido a un conflicto con el estado actual del recurso. Esto puede ocurrir cuando intentas realizar una acción que ya fue ejecutada o que entra en conflicto con otra operación."
      >
        <ErrorActionButton
          onClick={handleTryAgain}
          variant="primary"
        >
          Intentar nuevamente 🔄
        </ErrorActionButton>
      </ErrorDescriptionCard>

      {/* Grid de posibles causas del error */}
      <ErrorSuggestionsGrid 
        suggestions={conflictCauses}
        columns={2}
      />

      {/* Mensaje de ayuda adicional */}
      <ErrorInfoCard 
        icon={
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        }
        title="¿Necesitas ayuda?"
        gradient="linear-gradient(to right, #FDB4B7, #F2C6C2)"
      >
        <p>Si el problema persiste, no dudes en contactar nuestro equipo de soporte</p>
      </ErrorInfoCard>

    </ErrorPageContainer>
  );
};

export default Conflict;
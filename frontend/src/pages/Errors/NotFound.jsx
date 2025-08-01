/**
 * Componente NotFound - Página de Error 404 (Página No Encontrada) - ACTUALIZADA
 * 
 * Funcionalidades principales:
 * - Utiliza componentes reutilizables para mantener consistencia visual
 * - Colores fijos basados en la página 404 original
 * - Manejo elegante del error 404
 * - Botones de navegación para ir al inicio o volver atrás
 * - Sugerencias de navegación útiles
 * - Diseño responsivo y accesible
 * 
 * Ubicación: frontend/src/pages/errors/NotFound.jsx
 */

import React from "react";
import { useNavigate } from "react-router-dom";

// Componentes específicos para páginas de error
import ErrorPageContainer from "../../components/errors/ErrorPageContainer";
import ErrorHeroSection from "../../components/errors/ErrorHeroSection";
import ErrorDescriptionCard from "../../components/errors/ErrorDescriptionCard";
import ErrorActionButton from "../../components/errors/ErrorActionButton";
import ErrorSuggestionsGrid from "../../components/errors/ErrorSuggestionsGrid";

const NotFound = () => {
  const navigate = useNavigate();

  /**
   * Navega hacia la página anterior en el historial
   */
  const handleGoBack = () => {
    window.history.back();
  };

  /**
   * Navega hacia la página de productos
   */
  const handleViewProducts = () => {
    navigate("/categoryProducts");
  };

  /**
   * Navega hacia la página de blogs/medios
   */
  const handleViewBlogs = () => {
    navigate("/mediaPage");
  };

  /**
   * Datos de sugerencias de navegación
   */
  const navigationSuggestions = [
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
      title: "Explora nuestros productos",
      description: "Descubre nuestros arreglos florales y productos únicos",
      onClick: handleViewProducts
    },
    {
      id: 2,
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: "Lee nuestros blogs",
      description: "Descubre contenido interesante y consejos útiles",
      onClick: handleViewBlogs
    }
  ];

  return (
    <ErrorPageContainer>
      {/* Sección hero con código de estado y título */}
      <ErrorHeroSection 
        statusCode="404"
        title="Página no encontrada"
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
        description="Lo sentimos, la página que buscas no existe o ha sido movida. Puede que el enlace esté roto o que hayas escrito mal la dirección."
      >
        <ErrorActionButton
          onClick={handleGoBack}
          variant="primary"
          customGradient="linear-gradient(to right, #FF6A5F, #FDB4B7)"
        >
          Volver atrás
        </ErrorActionButton>
        
      </ErrorDescriptionCard>

      {/* Grid de sugerencias de navegación */}
      <ErrorSuggestionsGrid 
        suggestions={navigationSuggestions}
        columns={2}
      />
    </ErrorPageContainer>
  );
};

export default NotFound;
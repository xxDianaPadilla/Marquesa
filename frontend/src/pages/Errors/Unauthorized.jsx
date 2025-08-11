/**
 * Componente Unauthorized - Página de Error 401 (Acceso No Autorizado) - ACTUALIZADA
 * 
 * Funcionalidades principales:
 * - Utiliza componentes reutilizables para mantener consistencia visual
 * - Colores fijos basados en la página 404 original
 * - Manejo elegante del error 401
 * - Botones de navegación para iniciar sesión o ir al inicio
 * - Información sobre por qué se requiere autenticación
 * - Diseño responsivo y accesible
 * 
 * Ubicación: frontend/src/pages/errors/Unauthorized.jsx
 */

import React from "react";
import { useNavigate } from "react-router-dom";

// Componentes específicos para páginas de error
import ErrorInfoCard2 from "../../components/Errors/ErrorInfoCard2";
import ErrorPageContainer from "../../components/Errors/ErrorPageContainer";
import ErrorHeroSection from "../../components/Errors/ErrorHeroSection";
import ErrorDescriptionCard from "../../components/Errors/ErrorDescriptionCard";
import ErrorActionButton from "../../components/Errors/ErrorActionButton";

const Unauthorized = () => {
  const navigate = useNavigate();

  /**
   * Navega hacia la página de inicio de sesión
   */
  const handleLogin = () => {
    navigate("/login");
  };

  /**
   * Beneficios de iniciar sesión
   */
  const loginBenefits = [
    "Acceder a tu perfil y pedidos",
    "Realizar compras y seguimiento",
    "Disfrutar de ofertas exclusivas",
    "Guardar productos favoritos",
    "Crear productos personalizados"
  ];

  return (
    <ErrorPageContainer>
      {/* Sección hero con código de estado y título */}
      <ErrorHeroSection 
        statusCode="401"
        title="Acceso no autorizado"
        gradientColors="linear-gradient(to right, #FF6A5F, #FDB4B7)"
      />

      {/* Descripción del error con botones de acción */}
      <ErrorDescriptionCard 
        icon={
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
        }
        description="Necesitas iniciar sesión para acceder a esta página. Por favor, ingresa con tu cuenta o regístrate si aún no tienes una."
      >
        <ErrorActionButton
          onClick={handleLogin}
          variant="primary"
        >
          Iniciar sesión 🡢
        </ErrorActionButton>
        
      </ErrorDescriptionCard>

      {/* Información sobre los beneficios de iniciar sesión */}
      <ErrorInfoCard2
        icon={
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        }
        title="¿Por qué necesitas iniciar sesión?"
        gradient="linear-gradient(to right, #FDB4B7, #F2C6C2)"
      >
        <ul className="space-y-2">
          {loginBenefits.map((benefit, index) => (
            <li 
              key={index}
              className="flex items-center space-x-2"
            >
              <span className="text-white/70">•</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </ErrorInfoCard2>
    </ErrorPageContainer>
  );
};

export default Unauthorized;
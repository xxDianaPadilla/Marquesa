/**
 * Componente ErrorPageContainer - Contenedor base para todas las páginas de error
 * 
 * Funcionalidades principales:
 * - Layout unificado para todas las páginas de error
 * - Decoraciones y estilos consistentes basados en la página 404
 * - Colores fijos del proyecto La Marquesa
 * - Diseño responsivo y accesible
 * - Estructura modular y reutilizable
 * 
 * Ubicación: frontend/src/components/errors/ErrorPageContainer.jsx
 */

import React from "react";

// Componentes principales del proyecto
import Header from "../Header/Header";
import Footer from "../Footer";

const ErrorPageContainer = ({ children }) => {
  return (
    <>
      <div className="min-h-screen ">
        {/* Header de la página */}
        <Header />

        {/* Contenido principal */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ">
          {children}
        </main>
      </div>
      
      <Footer />
    </>
  );
};

export default ErrorPageContainer;
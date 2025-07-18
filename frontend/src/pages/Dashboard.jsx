/**
 * Página principal del dashboard administrativo
 * 
 * Funcionalidades principales:
 * - Estadísticas generales con tarjetas informativas
 * - Gráficos de ingresos y análisis de datos
 * - Productos más vendidos y mejor valorados
 * - Controles de la ruleta de descuentos
 * - Panel de herramientas administrativas
 * 
 * Componentes utilizados:
 * - AdminLayout (existente)
 * - AdminTools (existente)
 * - DashboardCards (existente)
 * - StatisticsCharts (existente)
 * - BestSelledProductsCards (existente)
 * - BestRankedProductsCards (existente)
 * - ActionButton (nuevo)
 */

import React, { useState } from "react";
import ruletaIcon from "../assets/ruleta.png";

// Componentes existentes
import AdminLayout from "../components/AdminLayout";
import AdminTools from "../components/AdminTools";
import DashboardCards from "../components/DashboardCards";
import StatisticsCharts from "../components/StatisticsCharts";
import BestSelledProductsCards from "../components/BestSelledProductsCards";
import BestRankedProductsCards from "../components/BestRankedProductsCards";

// Componentes nuevos reutilizables
import ActionButton from "../components/ActionButton";

const Dashboard = () => {
  // Estado para controlar la ruleta de descuentos
  const [ruletaEnabled, setRuletaEnabled] = useState(false);
  const [ruletaLoading, setRuletaLoading] = useState(false);

  /**
   * Maneja la habilitación/deshabilitación de la ruleta
   */
  const handleRuletaToggle = async (enable) => {
    setRuletaLoading(true);
    
    // Simular llamada a API
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRuletaEnabled(enable);
      console.log(`Ruleta ${enable ? 'habilitada' : 'deshabilitada'}`);
    } catch (error) {
      console.error('Error al actualizar estado de ruleta:', error);
    } finally {
      setRuletaLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-3 sm:p-6">
        {/* Header de bienvenida con herramientas administrativas */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          {/* Contenedor flex responsivo para AdminTools */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0">
            {/* Información principal del dashboard */}
            <div className="flex-1">
              <h1
                className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-4"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                ¡Bienvenido de nuevo, Miguel!
              </h1>
              <p
                className="text-gray-600 text-sm sm:text-base"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                ¡Han pasado muchas cosas mientras no has estado!
              </p>
            </div>

            {/* Panel de herramientas administrativas */}
            <div className="flex-shrink-0 w-full sm:w-auto">
              <AdminTools />
            </div>
          </div>
        </div>

        {/* Tarjetas de estadísticas principales */}
        <DashboardCards />

        {/* Grid principal del dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sección de gráfico de ingresos - Ocupa 2 columnas en pantallas grandes */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <h3
              className="text-lg font-semibold mb-4"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Total de ingresos trimestrales
            </h3>
            <div className="lg:col-span-2">
              <StatisticsCharts />
            </div>
          </div>

          {/* Sidebar derecho - Ocupa 1 columna */}
          <div className="space-y-6">
            {/* Sección de productos más comprados */}
            <BestSelledProductsCards />

            {/* Widget de ruleta de descuentos mejorado */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-lg font-semibold"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Ruleta de descuentos
                </h3>
                {/* Icono de la ruleta con indicador de estado */}
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <img src={ruletaIcon} alt="Icono de ruleta" />
                  </div>
                  {/* Indicador de estado */}
                  <div 
                    className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                      ruletaEnabled ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                    title={ruletaEnabled ? 'Activa' : 'Inactiva'}
                  ></div>
                </div>
              </div>
              
              <p
                className="text-sm text-gray-600 mb-4"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {ruletaEnabled 
                  ? 'La ruleta está actualmente habilitada para los clientes'
                  : '¿Deseas habilitar la ruleta de descuentos y promociones?'
                }
              </p>

              {/* Estado actual de la ruleta */}
              {ruletaEnabled && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span 
                      className="text-sm text-green-800"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Ruleta activa y disponible para clientes
                    </span>
                  </div>
                </div>
              )}

              {/* Botones de control usando ActionButton */}
              <div className="flex space-x-3">
                <ActionButton
                  onClick={() => handleRuletaToggle(true)}
                  variant={ruletaEnabled ? "secondary" : "primary"}
                  size="sm"
                  loading={ruletaLoading}
                  disabled={ruletaEnabled}
                  className="flex-1"
                  style={{
                    backgroundColor: ruletaEnabled ? '#f3f4f6' : '#FFA88A',
                    color: ruletaEnabled ? '#6b7280' : '#000000',
                  }}
                >
                  {ruletaEnabled ? 'Habilitada' : 'Habilitar'}
                </ActionButton>
                
                <ActionButton
                  onClick={() => handleRuletaToggle(false)}
                  variant={ruletaEnabled ? "danger" : "secondary"}
                  size="sm"
                  loading={ruletaLoading}
                  disabled={!ruletaEnabled}
                  className="flex-1"
                >
                  Deshabilitar
                </ActionButton>
              </div>

              {/* Información adicional sobre la ruleta */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Promociones activas</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                  <span>Usos esta semana</span>
                  <span className="font-medium">42</span>
                </div>
              </div>
            </div>

            {/* Sección de productos mejor valorados */}
            <BestRankedProductsCards />
          </div>
        </div>

        {/* Sección de acciones rápidas */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3
            className="text-lg font-semibold mb-4"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Acciones rápidas
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <ActionButton
              onClick={() => window.location.href = '/categoriesManager'}
              variant="outline"
              size="md"
              className="h-16 flex-col"
              icon={
                <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
            >
              Categorías
            </ActionButton>

            <ActionButton
              onClick={() => window.location.href = '/productsManager'}
              variant="outline"
              size="md"
              className="h-16 flex-col"
              icon={
                <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              }
            >
              Productos
            </ActionButton>

            <ActionButton
              onClick={() => window.location.href = '/salesManager'}
              variant="outline"
              size="md"
              className="h-16 flex-col"
              icon={
                <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              }
            >
              Ventas
            </ActionButton>

            <ActionButton
              onClick={() => window.location.href = '/reviewsManager'}
              variant="outline"
              size="md"
              className="h-16 flex-col"
              icon={
                <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              }
            >
              Reseñas
            </ActionButton>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
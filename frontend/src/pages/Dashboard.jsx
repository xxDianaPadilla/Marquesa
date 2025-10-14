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
 * - RuletaToggleControl (nuevo)
 */

import React from "react";

// Componentes existentes
import AdminLayout from "../components/AdminLayout";
import AdminTools from "../components/AdminTools";
import DashboardCards from "../components/DashboardCards";
import StatisticsCharts from "../components/StatisticsCharts";
import BestSelledProductsCards from "../components/BestSelledProductsCards";
import BestRankedProductsCards from "../components/BestRankedProductsCards";

// ✅ NUEVO: Componente para control de ruleta
import RuletaToggleControl from "../components/RuletaToggleControl";

const Dashboard = () => {
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

        {/* ✅ NUEVO: Control de Ruleta de Descuentos */}
        <div className="mb-6">
          <RuletaToggleControl />
        </div>

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

            {/* Sección de productos mejor valorados */}
            <BestRankedProductsCards />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
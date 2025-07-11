import React, { useState } from "react";
import ruletaIcon from "../assets/ruleta.png";
import AdminLayout from "../components/AdminLayout";
import AdminTools from "../components/AdminTools";
import DashboardCards from "../components/DashboardCards";
import StatisticsCharts from "../components/StatisticsCharts";
import BestSelledProductsCards from "../components/BestSelledProductsCards";
import BestRankedProductsCards from "../components/BestRankedProductsCards";

const DashboardLayout = ({ children }) => {
  // Estado para controlar si el sidebar está expandido o contraído
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar con control de expansión */}
      <NavbarAdmin isExpanded={isExpanded} setIsExpanded={setIsExpanded} />

      {/* Main content area con margen dinámico según sidebar */}
      <div
        style={{ marginLeft: isExpanded ? "12rem" : "4rem" }}
        className="transition-margin duration-300"
      >
        {/* Contenido con padding */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <AdminLayout>
      <div className="p-3 sm:p-6">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          {/* Contenedor flex responsivo para alinear AdminTools con el contenido */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0">
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

            {/* AdminTools se mueve debajo en mobile y a la derecha en desktop */}
            <div className="flex-shrink-0 w-full sm:w-auto">
              <AdminTools />
            </div>
          </div>
        </div>

        {/* Cards de estadísticas */}
        <DashboardCards />

        {/* Grid principal del dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico de ingresos - Ocupa 2 columnas */}
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
            {/* Productos más comprados */}
            <BestSelledProductsCards />

            {/* Ruleta de descuentos */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-lg font-semibold"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Ruleta de descuentos
                </h3>
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <img src={ruletaIcon} alt="" />
                </div>
              </div>
              <p
                className="text-sm text-gray-600 mb-4"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                ¿Deseas habilitar la ruleta de descuentos y promociones?
              </p>
              <div className="flex space-x-3">
                <button
                  className="flex-1 px-4 py-2 text-sm rounded-lg hover:bg-orange-600 transition-colors duration-200"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    backgroundColor: "#FFA88A",
                    color: "#000000",
                    cursor: "pointer",
                  }}
                >
                  Habilitar
                </button>
                <button
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  style={{ fontFamily: "Poppins, sans-serif", cursor: "pointer" }}
                >
                  Deshabilitar
                </button>
              </div>
            </div>

            {/* Tus mejores productos */}
            <BestRankedProductsCards />
          </div>
        </div>
      </div>
    </AdminLayout >
  );
};

export default Dashboard;
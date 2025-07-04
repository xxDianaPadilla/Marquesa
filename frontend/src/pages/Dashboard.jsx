import React from "react";
import ruletaIcon from "../assets/ruleta.png";
import NavbarAdmin from "../components/NavbarAdmin";
import AdminTools from "../components/AdminTools";
import DashboardCards from "../components/DashboardCards";
import StatisticsCharts from "../components/StatisticsCharts";
import BestSelledProductsCards from "../components/BestSelledProductsCards";
import BestRankedProductsCards from "../components/BestRankedProductsCards";

const DashboardLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <NavbarAdmin />

            {/* Main content area */}
            <div className="ml-16">
                {/* Content wrapper with padding */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    return (
        <DashboardLayout>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                {/* Contenedor flex para alinear AdminTools con el contenido */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            ¡Bienvenido de nuevo, Miguel!
                        </h1>
                        <p className="text-gray-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            ¡Han pasado muchas cosas mientras no has estado!
                        </p>
                    </div>
                    <AdminTools />
                </div>
            </div>

            {/* Cards de estadísticas */}
            <DashboardCards />

            {/* Grid principal del dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gráfico de ingresos - Ocupa 2 columnas */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
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
                            <h3 className="text-lg font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Ruleta de descuentos
                            </h3>
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                                <img src={ruletaIcon} alt="" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            ¿Deseas habilitar la ruleta de descuentos y promociones?
                        </p>
                        <div className="flex space-x-3">
                            <button className="flex-1 px-4 py-2 text-sm rounded-lg hover:bg-orange-600 transition-colors duration-200" style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#FFA88A', color: '#000000' }}>
                                Habilitar
                            </button>
                            <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors duration-200" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Deshabilitar
                            </button>
                        </div>
                    </div>

                    {/* Tus mejores productos */}
                    <BestRankedProductsCards />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
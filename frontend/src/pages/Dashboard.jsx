import React from "react";
import ruletaIcon from "../assets/ruleta.png";
import NavbarAdmin from "../components/NavbarAdmin";
import AdminTools from "../components/AdminTools";
import DashboardCards from "../components/DashboardCards";
import StatisticsCharts from "../components/StatisticsCharts";
import BestSelledProductsCards from "../components/BestSelledProductsCards";

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

                    {/* Acciones rápidas */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Acciones rápidas
                        </h3>
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 group">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Agregar producto
                                    </span>
                                </div>
                                <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            <button className="w-full flex items-center justify-between px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 group">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Ver clientes
                                    </span>
                                </div>
                                <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            <button className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200 group">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        Ver reportes
                                    </span>
                                </div>
                                <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
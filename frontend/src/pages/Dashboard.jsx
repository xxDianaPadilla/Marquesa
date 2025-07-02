import React from "react";
import NavbarAdmin from "../components/NavbarAdmin";
import AdminTools from "../components/AdminTools";
import DashboardCards from "../components/DashboardCards";
import StatisticsCharts from "../components/StatisticsCharts";

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

            {/* Aquí irán los próximos componentes del dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Placeholder para futuros componentes */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Gráfico de ingresos
                    </h3>
                    <div className="lg:col-span-2">
                        <StatisticsCharts />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Productos más comprados (próximamente)
                        </h3>
                        <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                            <p className="text-gray-400">Lista de productos</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Acciones rápidas (próximamente)
                        </h3>
                        <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                            <p className="text-gray-400">Botones de acción</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
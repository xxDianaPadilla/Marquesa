import React from "react";
import { useDashboardStats } from "./Dashboard/Hooks/useDashboardStats";
import userDashboard from "../assets/userDashboard.png";
import giftDashboard from "../assets/giftDashboard.png";
import increaseArrow from "../assets/increaseArrow.png";

// Componente para las tarjetas del dashboard
// Muestra estadísticas clave como clientes nuevos y productos vendidos
const DashboardCards = () => {
    const { stats, error, refetch } = useDashboardStats();

    if (error) {
        return (
            <div className="mb-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 text-sm">Error al cargar estadísticas: {error}</p>
                    <button
                        onClick={refetch}
                        className="mt-2 text-red-700 hover:text-red-800 text-sm underline"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }
    // Componente para una tarjeta de estadística
    // Muestra el título, valor, cambio porcentual y un icono
    const StatCard = ({
        title,
        value,
        percentageChange,
        isPositive,
        icon,
        loading,
        bgColor = "#FADDDD",
        iconBg = "#FADDDD",
        textColor = "#FF6A5F"
    }) => {
        return (
            <div className={`${bgColor} rounded-2xl p-6 flex items-start justify-between relative overflow-hidden`}>
                {/* Contenido principal */}
                <div className="flex-1">
                    <h3 className="text-gray-700 text-sm font-medium mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {title}
                    </h3>

                    {loading ? (
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-baseline mb-2">
                                <span className="text-2xl font-bold mr-1" style={{ fontFamily: 'Poppins, sans-serif', color: '#FF6A5F' }}>
                                    +{value.toLocaleString()}
                                </span>
                            </div>

                            <div className="flex items-center">
                                <div className="flex items-center mr-2">
                                    <svg
                                        className={`w-3 h-3 mr-1 ${isPositive ? 'text-green-500' : 'text-red-500'} ${isPositive ? '' : 'rotate-180'}`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                        +{Math.abs(percentageChange)}%
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    Respecto al trimestre pasado
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* Icono */}
                <div className={`w-8 h-8 ${textColor} flex items-center justify-center`}>
                    <img src={icon} alt={title + " icon"} className="w-full h-full object-contain" />
                </div>
            </div>
        );
    };

    return (
        <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card de Clientes Nuevos */}
                <StatCard
                    title="Clientes nuevos"
                    value={stats.newClients.current}
                    percentageChange={stats.newClients.percentageChange}
                    isPositive={stats.newClients.percentageChange >= 0}
                    loading={stats.newClients.loading}
                    bgColor="bg-red-50"
                    iconBg="bg-red-100"
                    textColor="text-red-600"
                    icon={userDashboard} />

                {/* Card de Productos Vendidos */}
                <StatCard
                    title="Productos vendidos"
                    value={stats.soldProducts.current}
                    percentageChange={stats.soldProducts.percentageChange}
                    isPositive={stats.soldProducts.percentageChange >= 0}
                    loading={stats.soldProducts.loading}
                    bgColor="bg-red-50"
                    iconBg="bg-orange-100"
                    textColor="text-orange-600"
                    icon={giftDashboard}
                />
            </div>
        </div>
    );
};

export default DashboardCards;
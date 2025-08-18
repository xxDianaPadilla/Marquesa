/**
 * Componente UserSummary - Resumen estadístico del usuario
 * Muestra estadísticas de pedidos del usuario
 * Mejorado para manejar mejor los estados de carga y errores
 * 
 * - stats: Objeto con estadísticas del usuario (opcional, usa valores por defecto)
 */
import React from 'react';
import { useAuth } from '../../context/AuthContext';

// Importar iconos existentes
import regalo from '../../assets/Regalo.png';
import relog from '../../assets/relog.png';
import cancelar from "../../assets/cancelar.png";

const UserSummary = ({ stats = {} }) => {
    const { userOrderStats, user, userInfo, loading } = useAuth();
    
    // Verificar si tenemos información del usuario para hacer la petición
    const hasUserInfo = user || userInfo;
    const userId = user?.id || user?._id || userInfo?._id;
    
    console.log('UserSummary - Debug:', {
        userOrderStats,
        hasUserInfo: !!hasUserInfo,
        userId,
        loading,
        user,
        userInfo
    });

    // Datos por defecto (manteniendo los valores actuales del diseño)
    const defaultStats = {
        totalOrders: 0,
        pendingOrders: 0,
        cancelledOrders: 0
    };

    // Usar stats proporcionados o userOrderStats del contexto o valores por defecto
    const finalStats = {
        totalOrders: stats.totalOrders ?? userOrderStats?.totalOrders ?? defaultStats.totalOrders,
        pendingOrders: stats.pendingOrders ?? userOrderStats?.pendingOrders ?? defaultStats.pendingOrders,
        cancelledOrders: stats.cancelledOrders ?? userOrderStats?.cancelledOrders ?? defaultStats.cancelledOrders
    };

    /**
     * Configuración de las tarjetas de estadísticas
     */
    const summaryCards = [
        {
            icon: regalo,
            iconAlt: "regalo",
            label: "Pedidos totales",
            value: finalStats.totalOrders,
            id: "total-orders"
        },
        {
            icon: relog,
            iconAlt: "relog",
            label: "Pedidos pendientes",
            value: finalStats.pendingOrders,
            id: "pending-orders"
        },
        {
            icon: cancelar,
            iconAlt: "cancelar",
            label: "Pedidos pagados",
            value: finalStats.cancelledOrders,
            id: "cancelled-orders"
        }
    ];

    // Determinar si debe mostrar el indicador de carga
    const shouldShowLoading = loading || (!userOrderStats && hasUserInfo && userId);

    return (
        <div className="mt-8">
            <h3 className="font-semibold text-gray-800 mb-3 text-lg md:text-xl">
                Resumen
            </h3>

            {/* Grid de tarjetas estadísticas */}
            <div className="flex flex-col md:flex-row gap-3">
                {summaryCards.map((card) => (
                    <div
                        key={card.id}
                        className="text-center rounded-xl p-4 flex-1 relative"
                        style={{ backgroundColor: '#E8ACD2' }}
                    >
                        <img
                            src={card.icon}
                            alt={card.iconAlt}
                            className="mx-auto w-6 mb-1"
                        />
                        <p className="text-xs text-white">
                            {card.label}
                        </p>
                        <p className="text-white text-xl font-bold">
                            {shouldShowLoading ? (
                                <span className="inline-block animate-pulse">...</span>
                            ) : (
                                card.value
                            )}
                        </p>
                        
                        {/* Overlay de carga para cada tarjeta */}
                        {shouldShowLoading && (
                            <div className="absolute inset-0 bg-black bg-opacity-10 rounded-xl flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Indicador de estado mejorado */}
            <div className="text-center mt-2">
                {shouldShowLoading ? (
                    <p className="text-xs text-gray-500">
                        Cargando estadísticas...
                    </p>
                ) : !hasUserInfo ? (
                    <p className="text-xs text-gray-400">
                        No hay información del usuario disponible
                    </p>
                ) : userOrderStats ? (
                    <p className="text-xs text-gray-500">
                        Estadísticas actualizadas
                    </p>
                ) : (
                    <p className="text-xs text-gray-400">
                        No se pudieron cargar las estadísticas
                    </p>
                )}
            </div>
        </div>
    );
};

export default UserSummary;
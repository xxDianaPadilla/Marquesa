/**
 * Componente UserSummary - Resumen estadístico del usuario
 * Muestra estadísticas de pedidos del usuario
 * Por ahora mantiene los datos de ejemplo, pero preparado para datos reales
 * 
 * - stats: Objeto con estadísticas del usuario (opcional, usa valores por defecto)
 */
import React from 'react';

// Importar iconos existentes
import regalo from '../../assets/Regalo.png';
import relog from '../../assets/relog.png';
import cancelar from "../../assets/cancelar.png";

const UserSummary = ({ stats = {} }) => {
    // Datos por defecto (manteniendo los valores actuales del diseño)
    const defaultStats = {
        totalOrders: 12,
        pendingOrders: 3,
        cancelledOrders: 5
    };

    // Usar stats proporcionados o valores por defecto
    const finalStats = {
        totalOrders: stats.totalOrders ?? defaultStats.totalOrders,
        pendingOrders: stats.pendingOrders ?? defaultStats.pendingOrders,
        cancelledOrders: stats.cancelledOrders ?? defaultStats.cancelledOrders
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
            label: "Pedidos cancelados",
            value: finalStats.cancelledOrders,
            id: "cancelled-orders"
        }
    ];

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
                        className="text-center rounded-xl p-4 flex-1" 
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
                            {card.value}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserSummary;
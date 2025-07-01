import { useState, useEffect } from "react";

export const useDashboardStats = () => {
    const [stats, setStats] = useState({
        newClients: {
            current: 0,
            previous: 0,
            percentageChange: 0,
            loading: true
        },
        soldProducts: {
            current: 0,
            previous: 0,
            percentageChange: 0,
            loading: true
        }
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchJSON = async (url) => {
        const res = await fetch(url);
        if (!res.ok) {
            const errorBody = await res.json().catch(() => ({}));
            throw new Error(errorBody.message || `Error en ${url}: ${res.status}`);
        }
        return res.json();
    };

    const fetchDashboardStats = async () => {
        try {
            const [currentClients, previousClients] = await Promise.all([
                fetchJSON('http://localhost:4000/api/clients/new-clients-stats?period=current'),
                fetchJSON('http://localhost:4000/api/clients/new-clients-stats?period=previous')
            ]);

            const [currentSales, previousSales] = await Promise.all([
                fetchJSON('http://localhost:4000/api/sales/sold-products-stats?period=current'),
                fetchJSON('http://localhost:4000/api/sales/sold-products-stats?period=previous')
            ]);

            const clientsPercentageChange = previousClients.count === 0 ? 100 :
                ((currentClients.count - previousClients.count) / previousClients.count) * 100;

            const salesPercentageChange = previousSales.count === 0 ? 100 :
                ((currentSales.count - previousSales.count) / previousSales.count) * 100;

            setStats({
                newClients: {
                    current: currentClients.count,
                    previous: previousClients.count,
                    percentageChange: Math.round(clientsPercentageChange * 10) / 10,
                    loading: false
                },
                soldProducts: {
                    current: currentSales.count,
                    previous: previousSales.count,
                    percentageChange: Math.round(salesPercentageChange * 10) / 10,
                    loading: false
                }
            });
        } catch (error) {
            setError(error.message);
            setStats(prev => ({
                newClients: { ...prev.newClients, loading: false },
                soldProducts: { ...prev.soldProducts, loading: false }
            }));
        }
    };

    return { stats, error, refetch: fetchDashboardStats };
};
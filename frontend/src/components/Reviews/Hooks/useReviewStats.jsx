// frontend/src/components/Reviews/Hooks/useReviewStats.jsx
import { useState, useEffect } from "react";

/**
 * Hook personalizado para obtener y manejar estadísticas de reseñas
 * 
 * Se conecta a la API para obtener estadísticas completas de las reseñas,
 * incluyendo métricas de calificación, distribución, tendencias y análisis.
 * Proporciona funciones adicionales para análisis de rendimiento y insights.
 * 
 * @returns {Object} Objeto con estadísticas, estado de carga, errores y funciones utilitarias
 */
export const useReviewStats = () => {
    // Estados principales del hook
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Efecto para cargar estadísticas al montar el componente
     * Realiza la petición inicial a la API de estadísticas
     */
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:4000/api/reviews/stats');
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: Error al obtener estadísticas`);
                }
                
                // Verificar que la respuesta sea JSON válido
                const data = await response.json();
                
                // Validar y normalizar los datos recibidos
                // Asegurar que todos los campos necesarios estén presentes con valores por defecto
                const normalizedStats = {
                    totalReviews: data.totalReviews || 0,
                    averageRating: data.averageRating ? parseFloat(data.averageRating).toFixed(1) : 0,
                    positiveReviews: data.positiveReviews || 0,
                    neutralReviews: data.neutralReviews || 0,
                    negativeReviews: data.negativeReviews || 0,
                    pendingReviews: data.pendingReviews || 0,
                    approvedReviews: data.approvedReviews || 0,
                    rejectedReviews: data.rejectedReviews || 0,
                    repliedReviews: data.repliedReviews || 0,
                    verifiedReviews: data.verifiedReviews || 0,
                    reviewsWithImages: data.reviewsWithImages || 0,
                    ratingDistribution: data.ratingDistribution || {
                        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
                    },
                    monthlyStats: data.monthlyStats || [],
                    topProducts: data.topProducts || [],
                    recentTrends: data.recentTrends || {
                        thisMonth: 0,
                        lastMonth: 0,
                        percentageChange: 0
                    }
                };

                setStats(normalizedStats);
                setError(null);
                
            } catch (error) {
                console.error('Error fetching review stats:', error);
                setError(error.message);
                
                // Establecer estadísticas por defecto en caso de error
                setStats({
                    totalReviews: 0,
                    averageRating: 0,
                    positiveReviews: 0,
                    neutralReviews: 0,
                    negativeReviews: 0,
                    pendingReviews: 0,
                    approvedReviews: 0,
                    rejectedReviews: 0,
                    repliedReviews: 0,
                    verifiedReviews: 0,
                    reviewsWithImages: 0,
                    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                    monthlyStats: [],
                    topProducts: [],
                    recentTrends: { thisMonth: 0, lastMonth: 0, percentageChange: 0 }
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    /**
     * Función para refrescar las estadísticas manualmente
     * Útil para actualizar datos después de cambios
     */
    const refreshStats = async () => {
        await fetchStats();
    };

    /**
     * Obtiene estadísticas específicas de un período de tiempo
     * Permite análisis de rendimiento en rangos de fechas específicos
     * 
     * @param {Date} startDate - Fecha de inicio del período
     * @param {Date} endDate - Fecha de fin del período
     * @returns {Promise<Object>} Estadísticas del período especificado
     */
    const getStatsForPeriod = async (startDate, endDate) => {
        try {
            const params = new URLSearchParams({
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            });

            const response = await fetch(`http://localhost:4000/api/reviews/stats/period?${params}`);
            
            if (!response.ok) {
                throw new Error('Error al obtener estadísticas del período');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching period stats:', error);
            throw error;
        }
    };

    /**
     * Calcula y retorna tendencias de calificaciones con porcentajes
     * Proporciona un análisis detallado de la distribución de calificaciones
     * 
     * @returns {Object|null} Objeto con tendencias por nivel de calificación
     */
    const getRatingTrends = () => {
        if (!stats || !stats.ratingDistribution) {
            return null;
        }

        const total = stats.totalReviews;
        if (total === 0) return null;

        return {
            excellent: {
                count: stats.ratingDistribution[5],
                percentage: ((stats.ratingDistribution[5] / total) * 100).toFixed(1)
            },
            good: {
                count: stats.ratingDistribution[4],
                percentage: ((stats.ratingDistribution[4] / total) * 100).toFixed(1)
            },
            average: {
                count: stats.ratingDistribution[3],
                percentage: ((stats.ratingDistribution[3] / total) * 100).toFixed(1)
            },
            poor: {
                count: stats.ratingDistribution[2],
                percentage: ((stats.ratingDistribution[2] / total) * 100).toFixed(1)
            },
            terrible: {
                count: stats.ratingDistribution[1],
                percentage: ((stats.ratingDistribution[1] / total) * 100).toFixed(1)
            }
        };
    };

    /**
     * Calcula métricas de rendimiento del servicio al cliente
     * Analiza tasas de respuesta, aprobación y verificación
     * 
     * @returns {Object|null} Métricas de servicio al cliente
     */
    const getCustomerServiceMetrics = () => {
        if (!stats) return null;

        // Calcular tasa de respuesta
        const responseRate = stats.totalReviews > 0 
            ? ((stats.repliedReviews / stats.totalReviews) * 100).toFixed(1)
            : 0;

        // Calcular tasa de aprobación
        const approvalRate = stats.totalReviews > 0
            ? ((stats.approvedReviews / stats.totalReviews) * 100).toFixed(1)
            : 0;

        // Calcular tasa de verificación
        const verificationRate = stats.totalReviews > 0
            ? ((stats.verifiedReviews / stats.totalReviews) * 100).toFixed(1)
            : 0;

        return {
            responseRate: parseFloat(responseRate),
            approvalRate: parseFloat(approvalRate),
            verificationRate: parseFloat(verificationRate),
            pendingCount: stats.pendingReviews,
            unansweredCount: stats.totalReviews - stats.repliedReviews
        };
    };

    /**
     * Genera insights automatizados basados en las estadísticas
     * Proporciona recomendaciones y alertas basadas en el análisis de datos
     * 
     * @returns {Array} Array de insights con tipo, título, mensaje y acción recomendada
     */
    const getInsights = () => {
        if (!stats) return [];

        const insights = [];
        const customerService = getCustomerServiceMetrics();
        const ratingTrends = getRatingTrends();

        // Insight sobre tasa de respuesta baja
        if (customerService.responseRate < 50) {
            insights.push({
                type: 'warning',
                title: 'Tasa de respuesta baja',
                message: `Solo has respondido al ${customerService.responseRate}% de las reseñas. Responder mejora la confianza del cliente.`,
                action: 'Responder reseñas pendientes'
            });
        } else if (customerService.responseRate > 80) {
            insights.push({
                type: 'success',
                title: 'Excelente tasa de respuesta',
                message: `Has respondido al ${customerService.responseRate}% de las reseñas. ¡Sigue así!`,
                action: null
            });
        }

        // Insight sobre calificaciones bajas
        if (ratingTrends && (ratingTrends.poor.count + ratingTrends.terrible.count) > 0) {
            const negativeCount = ratingTrends.poor.count + ratingTrends.terrible.count;
            const negativePercentage = ((negativeCount / stats.totalReviews) * 100).toFixed(1);
            
            insights.push({
                type: 'warning',
                title: 'Reseñas negativas detectadas',
                message: `${negativeCount} reseñas (${negativePercentage}%) tienen calificaciones de 1-2 estrellas.`,
                action: 'Revisar y responder reseñas negativas'
            });
        }

        // Insight sobre reseñas pendientes
        if (stats.pendingReviews > 5) {
            insights.push({
                type: 'info',
                title: 'Reseñas pendientes de moderación',
                message: `Tienes ${stats.pendingReviews} reseñas esperando moderación.`,
                action: 'Moderar reseñas pendientes'
            });
        }

        // Insight sobre promedio de calificación
        if (stats.averageRating >= 4.5) {
            insights.push({
                type: 'success',
                title: 'Excelente calificación promedio',
                message: `Tu calificación promedio es ${stats.averageRating}/5. ¡Tus clientes están muy satisfechos!`,
                action: null
            });
        } else if (stats.averageRating < 3.5) {
            insights.push({
                type: 'warning',
                title: 'Calificación promedio baja',
                message: `Tu calificación promedio es ${stats.averageRating}/5. Considera mejorar la calidad del servicio.`,
                action: 'Analizar reseñas negativas para mejoras'
            });
        }

        return insights;
    };

    // Retornar todas las funciones y estados del hook
    return {
        stats,
        loading,
        error,
        refreshStats,
        getStatsForPeriod,
        getRatingTrends,
        getCustomerServiceMetrics,
        getInsights
    };
};
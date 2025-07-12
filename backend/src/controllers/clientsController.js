// Importé el modelo de clientes para trabajar con la base de datos
import clientsModel from "../models/Clients.js";

// Objeto que contendrá todas las funciones del controller
const clientsController = {};

// Función helper para validar período
const validatePeriod = (period) => {
    const validPeriods = ['current', 'previous'];
    return validPeriods.includes(period);
};

// Función helper para calcular fechas de trimestre
const calculateQuarterDates = (period, now = new Date()) => {
    let startDate, endDate;

    if (period === 'current') {
        const currentMonth = now.getMonth();
        const quarterStart = Math.floor(currentMonth / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        endDate = new Date(now.getFullYear(), quarterStart + 3, 0);
    } else {
        const currentMonth = now.getMonth();
        const prevQuarterStart = Math.floor(currentMonth / 3) * 3 - 3;
        const year = now.getFullYear() - (prevQuarterStart < 0 ? 1 : 0);
        const adjustedQuarterStart = prevQuarterStart < 0 ? 9 : prevQuarterStart;

        startDate = new Date(year, adjustedQuarterStart, 1);
        endDate = new Date(year, adjustedQuarterStart + 3, 0);
    }

    return { startDate, endDate };
};

// Función para obtener estadísticas de clientes nuevos por trimestre
clientsController.getNewClientsStats = async (req, res) => {
    try {
        // Obtenemos el parámetro 'period' de la query, por defecto 'current'
        const { period = 'current' } = req.query;

        // Validar período
        if (!validatePeriod(period)) {
            return res.status(400).json({
                success: false,
                message: "Período no válido. Use 'current' o 'previous'"
            });
        }

        // Obtenemos la fecha actual para los cálculos
        const now = new Date();
        
        try {
            const { startDate, endDate } = calculateQuarterDates(period, now);

            // Validar que las fechas sean válidas
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Error en el cálculo de fechas del trimestre"
                });
            }

            // Contamos los clientes creados en el rango de fechas especificado
            const newClients = await clientsModel.countDocuments({
                createdAt: {
                    $gte: startDate, 
                    $lte: endDate    
                }
            });

            // Verificar si es un número válido
            if (typeof newClients !== 'number' || newClients < 0) {
                throw new Error('Resultado de conteo inválido');
            }

            // Retornamos la respuesta con los datos calculados
            res.status(200).json({
                success: true,
                count: newClients,  
                period: period,     
                startDate: startDate.toISOString(),          
                endDate: endDate.toISOString(),
                quarter: Math.floor(now.getMonth() / 3) + 1             
            });
        } catch (dateError) {
            console.error('Error en cálculo de fechas:', dateError);
            return res.status(400).json({
                success: false,
                message: "Error en el procesamiento de fechas"
            });
        }
    } catch (error) {
        console.error('Error en getNewClientsStats:', error);
        
        // Manejar errores específicos de MongoDB
        if (error.name === 'MongoNetworkError') {
            return res.status(503).json({
                success: false,
                message: "Servicio de base de datos no disponible temporalmente"
            });
        }
        
        if (error.name === 'MongoServerError') {
            return res.status(502).json({
                success: false,
                message: "Error en el servidor de base de datos"
            });
        }
        
        // Error genérico del servidor
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener estadísticas de clientes nuevos",
            error: error.message
        });
    }
};

// Función para obtener el total de clientes registrados
clientsController.getTotalClients = async (req, res) => {
    try {
        // Contamos todos los documentos en la colección de clientes
        const totalClients = await clientsModel.countDocuments();
        
        // Verificar que el resultado sea válido
        if (typeof totalClients !== 'number' || totalClients < 0) {
            throw new Error('Resultado de conteo inválido');
        }
        
        // Retornamos el total de clientes
        res.status(200).json({
            success: true,
            total: totalClients,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error en getTotalClients:', error);
        
        // Manejar errores específicos de MongoDB
        if (error.name === 'MongoNetworkError') {
            return res.status(503).json({
                success: false,
                message: "Servicio de base de datos no disponible temporalmente"
            });
        }
        
        if (error.name === 'MongoServerError') {
            return res.status(502).json({
                success: false,
                message: "Error en el servidor de base de datos"
            });
        }
        
        // Error genérico del servidor
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener total de clientes",
            error: error.message
        });
    }
};

// Función adicional para obtener estadísticas detalladas de clientes
clientsController.getDetailedClientsStats = async (req, res) => {
    try {
        const now = new Date();
        const { startDate: currentStart, endDate: currentEnd } = calculateQuarterDates('current', now);
        const { startDate: previousStart, endDate: previousEnd } = calculateQuarterDates('previous', now);

        // Ejecutar todas las consultas en paralelo
        const [
            totalClients,
            currentQuarterClients,
            previousQuarterClients,
            thisMonthClients,
            thisWeekClients
        ] = await Promise.all([
            clientsModel.countDocuments(),
            clientsModel.countDocuments({
                createdAt: { $gte: currentStart, $lte: currentEnd }
            }),
            clientsModel.countDocuments({
                createdAt: { $gte: previousStart, $lte: previousEnd }
            }),
            clientsModel.countDocuments({
                createdAt: { 
                    $gte: new Date(now.getFullYear(), now.getMonth(), 1),
                    $lte: now
                }
            }),
            clientsModel.countDocuments({
                createdAt: { 
                    $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
                    $lte: now
                }
            })
        ]);

        // Calcular porcentaje de crecimiento
        const growthPercentage = previousQuarterClients > 0 
            ? ((currentQuarterClients - previousQuarterClients) / previousQuarterClients * 100).toFixed(2)
            : currentQuarterClients > 0 ? 100 : 0;

        res.status(200).json({
            success: true,
            data: {
                total: totalClients,
                currentQuarter: currentQuarterClients,
                previousQuarter: previousQuarterClients,
                thisMonth: thisMonthClients,
                thisWeek: thisWeekClients,
                growthPercentage: parseFloat(growthPercentage),
                quarter: Math.floor(now.getMonth() / 3) + 1
            },
            timestamp: now.toISOString()
        });
    } catch (error) {
        console.error('Error en getDetailedClientsStats:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener estadísticas detalladas",
            error: error.message
        });
    }
};

// Exportamos el controller para poder usarlo en las rutas
export default clientsController;
// Importé el modelo de clientes para trabajar con la base de datos
import clientsModel from "../models/Clients.js";

// Objeto que contendrá todas las funciones del controller
const clientsController = {};

// Función para obtener estadísticas de clientes nuevos por trimestre
clientsController.getNewClientsStats = async (req, res) => {
    try {
        // Obtenemos el parámetro 'period' de la query, por defecto 'current'
        const { period = 'current' } = req.query;

        // Obtenemos la fecha actual para los cálculos
        const now = new Date();
        let startDate, endDate;

        // Si el período es 'current', calculo el trimestre actual
        if (period === 'current') {
            // Obtenemos el mes actual (0-11)
            const currentMonth = now.getMonth();
            // Calculamos el mes de inicio del trimestre actual (0, 3, 6, 9)
            const quarterStart = Math.floor(currentMonth / 3) * 3;
            // Fecha de inicio del trimestre (primer día del mes)
            startDate = new Date(now.getFullYear(), quarterStart, 1);
            // Fecha de fin del trimestre (último día del tercer mes)
            endDate = new Date(now.getFullYear(), quarterStart + 3, 0);
        } else {
            // Si el período es 'previous', calculo el trimestre anterior
            const currentMonth = now.getMonth();
            // Calculamos el mes de inicio del trimestre anterior
            const prevQuarterStart = Math.floor(currentMonth / 3) * 3 - 3;
            // Ajustamos el año si el trimestre anterior es del año pasado
            const year = now.getFullYear() - (prevQuarterStart < 0 ? 1 : 0);
            // Ajustamos el mes si es negativo (último trimestre del año anterior)
            const adjustedQuarterStart = prevQuarterStart < 0 ? 9 : prevQuarterStart;

            // Calculamos las fechas del trimestre anterior
            startDate = new Date(year, adjustedQuarterStart, 1);
            endDate = new Date(year, adjustedQuarterStart + 3, 0);
        }

        // Contamos los clientes creados en el rango de fechas especificado
        const newClients = await clientsModel.countDocuments({
            createdAt: {
                $gte: startDate, 
                $lte: endDate    
            }
        });

        // Retornamos la respuesta con los datos calculados
        res.json({
            count: newClients,  
            period: period,     
            startDate,          
            endDate             
        });
    } catch (error) {
        // Manejos de errores con código de estado 500
        res.status(500).json({
            message: "Error al obtener estadísticas de clientes nuevos",
            error: error.message
        });
    }
};

// Función para obtener el total de clientes registrados
clientsController.getTotalClients = async (req, res) => {
    try {
        // Contamos todos los documentos en la colección de clientes
        const totalClients = await clientsModel.countDocuments();
        
        // Retornamos el total de clientes
        res.json({total: totalClients});
    } catch (error) {
        // Manejos de errores con código de estado 500
        res.status(500).json({
            message: "Error al obtener total de clientes",
            error: error.message
        });
    }
};

// Exportamos el controller para poder usarlo en las rutas
export default clientsController;
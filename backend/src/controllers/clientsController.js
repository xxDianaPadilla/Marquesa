import clientsModel from "../models/Clients.js";

const clientsController = {};

clientsController.getNewClientsStats = async (req, res) => {
    try {
        const { period = 'current' } = req.query;

        const now = new Date();
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

        const newClients = await clientsModel.countDocuments({
            createdAt: {
                $gte: startDate,
                $lte: endDate
            }
        });

        res.json({
            count: newClients,
            period: period,
            startDate,
            endDate
        });
    } catch (error) {
        res.status(500).json({
            message: "Error al obtener estadísticas de clientes nuevos",
            error: error.message
        });
    }
};

clientsController.getTotalClients = async (req, res) => {
    try {
        const totalClients = await clientsModel.countDocuments();
        res.json({total: totalClients});
    } catch (error) {
        res.status(500).json({
            message: "Error al obtener total de clientes",
            error: error.message
        });
    }
};

export default clientsController;
import salesModel from "../models/Sales.js";
import productsModel from "../models/products.js";
import customProductModel from "../models/CustomProducts.js";
import Clients from '../models/Clients.js';
import ShoppingCart from '../models/ShoppingCart.js'
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";

const salesController = {};

cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.cloudinary_api_key,
    api_secret: config.cloudinary.cloudinary_api_secret
});

// Obtenemos todas las ventas
salesController.getSales = async (req, res) => {
    try {
        const sales = await salesModel.find().populate('ShoppingCartId');
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las ventas", error: error.message });
    }
};

// Obtenemos una venta por ID
salesController.getSaleById = async (req, res) => {
    try {
        const sale = await salesModel.findById(req.params.id).populate('ShoppingCartId');
        if (!sale) {
            return res.status(404).json({ message: "Venta no encontrada" });
        }
        res.json(sale);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la venta", error: error.message });
    }
};

// Creamos una nueva venta
salesController.createSale = async (req, res) => {
    try {
        const {
            paymentType,
            status,
            trackingStatus,
            deliveryAddress,
            receiverName,
            receiverPhone,
            deliveryPoint,
            deliveryDate,
            ShoppingCartId
        } = req.body;

        // Validamos campos requeridos
        if (!paymentType || !deliveryAddress || !receiverName || !receiverPhone || !deliveryPoint || !deliveryDate || !ShoppingCartId) {
            return res.status(400).json({
                message: 'Faltan campos requeridos: paymentType, deliveryAddress, receiverName, receiverPhone, deliveryPoint, deliveryDate, ShoppingCartId'
            });
        }

        let paymentProofImage = '';

        // Subimos imagen de comprobante de pago a Cloudinary si existe
        if (req.file) {
            const result = await cloudinary.uploader.upload(
                req.file.path,
                {
                    folder: "payment-proofs",
                    allowed_formats: ["jpg", "png", "jpeg", "pdf"]
                }
            );
            paymentProofImage = result.secure_url;
        } else {
            return res.status(400).json({
                message: 'La imagen del comprobante de pago es requerida'
            });
        }

        const newSale = new salesModel({
            paymentType,
            paymentProofImage,
            status,
            trackingStatus,
            deliveryAddress,
            receiverName,
            receiverPhone,
            deliveryPoint,
            deliveryDate,
            ShoppingCartId
        });

        await newSale.save();
        res.status(201).json({ message: "Venta creada exitosamente", sale: newSale });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Error de validación", error: error.message });
        }
        res.status(400).json({ message: "Error al crear la venta", error: error.message });
    }
};

// Actualizamos una venta
salesController.updateSale = async (req, res) => {
    try {
        const {
            paymentType,
            status,
            trackingStatus,
            deliveryAddress,
            receiverName,
            receiverPhone,
            deliveryPoint,
            deliveryDate,
            ShoppingCartId
        } = req.body;

        const updateData = {
            paymentType,
            status,
            trackingStatus,
            deliveryAddress,
            receiverName,
            receiverPhone,
            deliveryPoint,
            deliveryDate,
            ShoppingCartId
        };

        // Removemos campos indefinidos
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined || updateData[key] === null || updateData[key] === '') {
                delete updateData[key];
            }
        });

        // Subimos nueva imagen de comprobante de pago si existe
        if (req.file) {
            // Obtenemos la venta actual para eliminar la imagen anterior si existe
            const currentSale = await salesModel.findById(req.params.id);
            if (currentSale && currentSale.paymentProofImage) {
                // Extraemos public_id de la URL de Cloudinary y eliminar imagen anterior
                const publicId = currentSale.paymentProofImage.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`payment-proofs/${publicId}`);
            }

            const result = await cloudinary.uploader.upload(
                req.file.path,
                {
                    folder: "payment-proofs",
                    allowed_formats: ["jpg", "png", "jpeg", "pdf"]
                }
            );
            updateData.paymentProofImage = result.secure_url;
        }

        const updatedSale = await salesModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('ShoppingCartId');

        if (!updatedSale) {
            return res.status(404).json({ message: "Venta no encontrada" });
        }

        res.json({ message: "Venta actualizada exitosamente", sale: updatedSale });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Error de validación", error: error.message });
        }
        res.status(400).json({ message: "Error al actualizar la venta", error: error.message });
    }
};

// Eliminamos una venta
salesController.deleteSale = async (req, res) => {
    try {
        const deletedSale = await salesModel.findByIdAndDelete(req.params.id);

        if (!deletedSale) {
            return res.status(404).json({ message: "Venta no encontrada" });
        }

        // Eliminamos imagen de Cloudinary si existe
        if (deletedSale.paymentProofImage) {
            const publicId = deletedSale.paymentProofImage.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`payment-proofs/${publicId}`);
        }

        res.json({ message: "Venta eliminada exitosamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la venta", error: error.message });
    }
};

// Actualizamos solo el estado de pago
salesController.updatePaymentStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const updatedSale = await salesModel.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).populate('ShoppingCartId');

        if (!updatedSale) {
            return res.status(404).json({ message: "Venta no encontrada" });
        }

        res.json({ message: "Estado de pago actualizado", sale: updatedSale });
    } catch (error) {
        res.status(400).json({ message: "Error al actualizar el estado de pago", error: error.message });
    }
};

// Actualizamos solo el estado de seguimiento
salesController.updateTrackingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { trackingStatus } = req.body;

        const validStatuses = ['Agendado', 'En proceso', 'Entregado'];
        if (!validStatuses.includes(trackingStatus)) {
            return res.status(400).json({
                message: 'Estado de seguimiento no válido'
            });
        }

        const updatedSale = await salesModel.findByIdAndUpdate(
            id,
            { trackingStatus },
            { new: true, runValidators: true }
        );

        if (!updatedSale) {
            return res.status(404).json({
                message: 'Venta no encontrada'
            });
        }

        res.json({
            message: 'Estado actualizado correctamente',
            sale: updatedSale
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar el estado',
            error: error.message
        });
    }
};

// Actualizamos solo el comprobante de pago
salesController.updatePaymentProof = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No se proporcionó imagen del comprobante" });
        }

        // Obtenemos la venta actual para eliminar la imagen anterior
        const currentSale = await salesModel.findById(req.params.id);
        if (!currentSale) {
            return res.status(404).json({ message: "Venta no encontrada" });
        }

        // Eliminamos imagen anterior si existe
        if (currentSale.paymentProofImage) {
            const publicId = currentSale.paymentProofImage.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`payment-proofs/${publicId}`);
        }

        // Subimos nueva imagen
        const result = await cloudinary.uploader.upload(
            req.file.path,
            {
                folder: "payment-proofs",
                allowed_formats: ["jpg", "png", "jpeg", "pdf"]
            }
        );

        const updatedSale = await salesModel.findByIdAndUpdate(
            req.params.id,
            { paymentProofImage: result.secure_url },
            { new: true, runValidators: true }
        ).populate('ShoppingCartId');

        res.json({ message: "Comprobante de pago actualizado", sale: updatedSale });
    } catch (error) {
        res.status(400).json({ message: "Error al actualizar el comprobante de pago", error: error.message });
    }
};

// Obtenemos ventas por estado de pago
salesController.getSalesByPaymentStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const sales = await salesModel.find({ status }).populate('ShoppingCartId');
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las ventas por estado", error: error.message });
    }
};

// Obtenemos ventas por estado de seguimiento
salesController.getSalesByTrackingStatus = async (req, res) => {
    try {
        const { trackingStatus } = req.params;
        const sales = await salesModel.find({ trackingStatus }).populate('ShoppingCartId');
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las ventas por estado de seguimiento", error: error.message });
    }
};

salesController.getSoldProductsStats = async (req, res) => {
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

        const soldProducts = await salesModel.countDocuments({
            status: 'Pagado',
            createdAt: {
                $gte: startDate,
                $lte: endDate
            }
        });

        res.json({
            count: soldProducts,
            period,
            startDate,
            endDate
        });

    } catch (error) {
        console.error("Error en getSoldProductsStats:", error);
        res.status(500).json({
            message: "Error al obtener estadísticas de productos vendidos",
            error: error.message
        });
    }
};

salesController.getTotalSales = async (req, res) => {
    try {
        const totalSales = await salesModel.countDocuments();
        res.json({ total: totalSales });
    } catch (error) {
        res.status(500).json({
            message: "Error al obtener total de ventas",
            error: error.message
        });
    }
};

salesController.getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const currentMonth = now.getMonth();
        const quarterStart = Math.floor(currentMonth / 3) * 3;

        const currentQuarterStart = new Date(now.getFullYear(), quarterStart, 1);
        const currentQuarterEnd = new Date(now.getFullYear(), quarterStart + 3, 0);

        const prevQuarterStart = Math.floor(currentMonth / 3) * 3 - 3;
        const prevYear = now.getFullYear() - (prevQuarterStart < 0 ? 1 : 0);
        const adjustedPrevQuarterStart = prevQuarterStart < 0 ? 9 : prevQuarterStart;
        const previousQuarterStart = new Date(prevYear, adjustedPrevQuarterStart, 1);
        const previousQuarterEnd = new Date(prevYear, adjustedPrevQuarterStart + 3, 0);

        const currentSales = await salesModel.countDocuments({
            createdAt: {
                $gte: currentQuarterStart,
                $lte: currentQuarterEnd
            }
        });

        const previousSales = await salesModel.countDocuments({
            createdAt: {
                $gte: previousQuarterStart,
                $lte: previousQuarterEnd
            }
        });

        const salesPercentageChange = previousSales === 0 ? 100 :
            ((currentSales - previousSales) / previousSales) * 100;

        res.json({
            currentPeriodSales: currentSales,
            previousPeriodSales: previousSales,
            salesPercentageChange: Math.round(salesPercentageChange * 10) / 10,
            period: {
                current: { start: currentQuarterStart, end: currentQuarterEnd },
                previous: { start: previousQuarterStart, end: previousQuarterEnd }
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error al obtener estadísticas del dashboard",
            error: error.message
        });
    }
};

salesController.getSalesDetailed = async (req, res) => {
    try {
        // Obtenemos ventas con populate completo
        const sales = await salesModel.find()
            .populate({
                path: 'ShoppingCartId',
                populate: {
                    path: 'clientId',
                    model: 'Clients',
                    select: 'fullName phone email address'
                }
            })
            .sort({ deliveryDate: 1 });

        if (!sales || sales.length === 0) {
            return res.json([]);
        }

        const salesWithDetails = await Promise.all(
            sales.map(async (sale) => {
                try {
                    const saleObj = sale.toObject();

                    // Verificamos que existe el ShoppingCart
                    if (!saleObj.ShoppingCartId) {
                        console.warn(`Venta ${saleObj._id} sin ShoppingCart`);
                        return {
                            _id: saleObj._id,
                            clientName: 'Cliente no encontrado',
                            clientPhone: '',
                            clientEmail: '',
                            clientAddress: '',
                            paymentType: saleObj.paymentType,
                            paymentProofImage: saleObj.paymentProofImage,
                            status: saleObj.status,
                            trackingStatus: saleObj.trackingStatus,
                            deliveryAddress: saleObj.deliveryAddress,
                            receiverName: saleObj.receiverName,
                            receiverPhone: saleObj.receiverPhone,
                            deliveryPoint: saleObj.deliveryPoint,
                            deliveryDate: saleObj.deliveryDate,
                            total: 0,
                            items: [],
                            createdAt: saleObj.createdAt,
                            updatedAt: saleObj.updatedAt
                        };
                    }

                    // Obtenemos información del cliente
                    const client = saleObj.ShoppingCartId.clientId;
                    
                    // Si no hay cliente poblado, intentamos obtenerlo manualmente
                    let clientInfo = null;
                    if (!client && saleObj.ShoppingCartId.clientId) {
                        clientInfo = await Clients.findById(saleObj.ShoppingCartId.clientId)
                            .select('fullName phone email address');
                    } else {
                        clientInfo = client;
                    }

                    // Obtenemos detalles de los productos
                    const cartItems = saleObj.ShoppingCartId.items || [];
                    const itemsDetails = [];

                    for (const item of cartItems) {
                        try {
                            if (item.itemType === 'product') {
                                const product = await productsModel.findById(item.itemId)
                                    .select('name price images description');
                                if (product) {
                                    itemsDetails.push({
                                        type: 'product',
                                        name: product.name,
                                        price: product.price,
                                        quantity: item.quantity || 1,
                                        subtotal: item.subtotal,
                                        image: product.images && product.images.length > 0 ? product.images[0].image : null
                                    });
                                }
                            } else if (item.itemType === 'custom') {
                                const customProduct = await customProductModel.findById(item.itemId)
                                    .populate('selectedItems.productId', 'name price images');
                                if (customProduct) {
                                    itemsDetails.push({
                                        type: 'custom',
                                        name: 'Producto Personalizado',
                                        price: customProduct.totalPrice,
                                        quantity: item.quantity || 1,
                                        subtotal: item.subtotal,
                                        image: customProduct.referenceImage || null,
                                        selectedItems: customProduct.selectedItems
                                    });
                                }
                            }
                        } catch (itemError) {
                            console.error(`Error procesando item ${item.itemId}:`, itemError);
                        }
                    }

                    // Formateamos la fecha correctamente
                    let formattedDate = saleObj.deliveryDate;
                    if (saleObj.deliveryDate) {
                        // Creamos fecha en zona horaria local
                        const date = new Date(saleObj.deliveryDate);
                        // Ajustamos para evitar cambios de timezone
                        formattedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
                    }

                    return {
                        _id: saleObj._id,
                        clientName: clientInfo?.fullName || 'Cliente no encontrado',
                        clientPhone: clientInfo?.phone || '',
                        clientEmail: clientInfo?.email || '',
                        clientAddress: clientInfo?.address || '',
                        paymentType: saleObj.paymentType,
                        paymentProofImage: saleObj.paymentProofImage,
                        status: saleObj.status,
                        trackingStatus: saleObj.trackingStatus,
                        deliveryAddress: saleObj.deliveryAddress,
                        receiverName: saleObj.receiverName,
                        receiverPhone: saleObj.receiverPhone,
                        deliveryPoint: saleObj.deliveryPoint,
                        deliveryDate: formattedDate,
                        total: saleObj.ShoppingCartId?.total || 0,
                        items: itemsDetails,
                        createdAt: saleObj.createdAt,
                        updatedAt: saleObj.updatedAt
                    };

                } catch (saleError) {
                    console.error(`Error procesando venta ${sale._id}:`, saleError);
                    return null;
                }
            })
        );

        // Filtramos ventas nulas
        const validSales = salesWithDetails.filter(sale => sale !== null);

        res.json(validSales);
    } catch (error) {
        console.error('Error en getSalesDetailed:', error);
        res.status(500).json({
            message: 'Error al obtener las ventas',
            error: error.message
        });
    }
};

salesController.getSalesByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const validStatuses = ['Agendado', 'En proceso', 'Entregado'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: 'Estado no válido'
            });
        }

        const sales = await salesModel.find({ trackingStatus: status })
            .populate({
                path: 'ShoppingCartId',
                populate: {
                    path: 'clientId',
                    model: 'Clients',
                    select: 'fullName phone email'
                }
            })
            .sort({ deliveryDate: 1 });

        res.json(sales);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener las ventas por estado',
            error: error.message
        });
    }
};

salesController.getSalesByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                message: 'Debe proporcionar fechas de inicio y fin'
            });
        }

        const sales = await salesModel.find({
            deliveryDate: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        })
            .populate({
                path: 'ShoppingCartId',
                populate: {
                    path: 'clientId',
                    model: 'Clients',
                    select: 'fullName phone email'
                }
            })
            .sort({ deliveryDate: 1 });

        res.json(sales);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener las ventas por fecha',
            error: error.message
        });
    }
};

salesController.searchSales = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                message: 'Debe proporcionar un término de búsqueda'
            });
        }

        const sales = await salesModel.find({
            $or: [
                { receiverName: { $regex: q, $options: 'i' } },
                { deliveryPoint: { $regex: q, $options: 'i' } },
                { deliveryAddress: { $regex: q, $options: 'i' } }
            ]
        })
            .populate({
                path: 'ShoppingCartId',
                populate: {
                    path: 'clientId',
                    model: 'Clients',
                    select: 'fullName phone email'
                }
            })
            .sort({ deliveryDate: 1 });

        res.json(sales);
    } catch (error) {
        res.status(500).json({
            message: 'Error al buscar ventas',
            error: error.message
        });
    }
};

salesController.getSalesStats = async (req, res) => {
    try {
        const totalSales = await salesModel.countDocuments();
        const agendadas = await salesModel.countDocuments({ trackingStatus: 'Agendado' });
        const enProceso = await salesModel.countDocuments({ trackingStatus: 'En proceso' });
        const entregadas = await salesModel.countDocuments({ trackingStatus: 'Entregado' });

        const stats = {
            total: totalSales,
            agendadas,
            enProceso,
            entregadas,
            porcentajes: {
                agendadas: totalSales ? ((agendadas / totalSales) * 100).toFixed(1) : 0,
                enProceso: totalSales ? ((enProceso / totalSales) * 100).toFixed(1) : 0,
                entregadas: totalSales ? ((entregadas / totalSales) * 100).toFixed(1) : 0
            }
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener estadísticas',
            error: error.message
        });
    }
};

export default salesController;
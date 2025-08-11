import salesModel from "../models/Sales.js";
import productsModel from "../models/products.js";
import customProductModel from "../models/CustomProducts.js";
import Clients from '../models/Clients.js';
import ShoppingCart from '../models/ShoppingCart.js'
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";
import mongoose from "mongoose";

const salesController = {};

// Función helper para configuración dinámica de cookies basada en el entorno
const getCookieConfig = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
        httpOnly: false, // Permitir acceso desde JavaScript
        secure: isProduction, // Solo HTTPS en producción
        sameSite: isProduction ? 'none' : 'lax', // Cross-domain en producción
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        domain: undefined // Dejar que el navegador determine
    };
};

// Función helper para obtener token de múltiples fuentes en la petición
const getTokenFromRequest = (req) => {
    let token = req.cookies?.authToken;
    let source = 'cookie';
    
    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
            source = 'authorization_header';
        }
    }
    
    return { token, source };
};

// Función helper para validar ObjectId
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// Función helper para validar tipo de pago
const validatePaymentType = (paymentType) => {
    const validTypes = ["Transferencia", "Efectivo", "Débito", "Crédito"];
    if (!paymentType || !validTypes.includes(paymentType)) {
        return {
            isValid: false,
            error: "Tipo de pago inválido. Debe ser: " + validTypes.join(", ")
        };
    }
    return { isValid: true, value: paymentType };
};

// Función helper para validar estado de pago
const validatePaymentStatus = (status) => {
    const validStatuses = ["Pendiente", "Pagado"];
    if (!status || !validStatuses.includes(status)) {
        return {
            isValid: false,
            error: "Estado de pago inválido. Debe ser: " + validStatuses.join(", ")
        };
    }
    return { isValid: true, value: status };
};

// Función helper para validar estado de seguimiento
const validateTrackingStatus = (status) => {
    const validStatuses = ["Agendado", "En proceso", "Entregado"];
    if (!status || !validStatuses.includes(status)) {
        return {
            isValid: false,
            error: "Estado de seguimiento inválido. Debe ser: " + validStatuses.join(", ")
        };
    }
    return { isValid: true, value: status };
};

// Función helper para validar dirección
const validateAddress = (address) => {
    if (!address || typeof address !== 'string') {
        return { isValid: false, error: "La dirección de entrega es requerida" };
    }

    const trimmedAddress = address.trim();

    if (trimmedAddress.length < 20) {
        return { isValid: false, error: "La dirección debe tener al menos 20 caracteres" };
    }

    if (trimmedAddress.length > 200) {
        return { isValid: false, error: "La dirección no puede exceder 200 caracteres" };
    }

    return { isValid: true, value: trimmedAddress };
};

// Función helper para validar nombre del receptor
const validateReceiverName = (name) => {
    if (!name || typeof name !== 'string') {
        return { isValid: false, error: "El nombre del receptor es requerido" };
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 12) {
        return { isValid: false, error: "El nombre del receptor debe tener al menos 12 caracteres" };
    }

    if (trimmedName.length > 100) {
        return { isValid: false, error: "El nombre del receptor no puede exceder 100 caracteres" };
    }

    // Validar que no contenga números
    if (/\d/.test(trimmedName)) {
        return { isValid: false, error: "El nombre del receptor no puede contener números" };
    }

    return { isValid: true, value: trimmedName };
};

// Función helper para validar teléfono
const validatePhone = (phone) => {
    if (!phone || typeof phone !== 'string') {
        return { isValid: false, error: "El teléfono es requerido" };
    }

    const trimmedPhone = phone.trim();

    // Verifica el formato exacto: 4 dígitos, guion, 4 dígitos
    const phoneRegex = /^\d{4}-\d{4}$/;

    if (!phoneRegex.test(trimmedPhone)) {
        return {
            isValid: false,
            error: "El teléfono debe tener el formato 1234-5678"
        };
    }

    return { isValid: true, value: trimmedPhone };
};

// Función helper para validar punto de referencia
const validateDeliveryPoint = (point) => {
    if (!point || typeof point !== 'string') {
        return { isValid: false, error: "El punto de referencia es requerido" };
    }

    const trimmedPoint = point.trim();

    if (trimmedPoint.length < 20) {
        return { isValid: false, error: "El punto de referencia debe tener al menos 20 caracteres" };
    }

    if (trimmedPoint.length > 200) {
        return { isValid: false, error: "El punto de referencia no puede exceder 200 caracteres" };
    }

    return { isValid: true, value: trimmedPoint };
};

// Función helper para validar fecha de entrega
const validateDeliveryDate = (date) => {
    if (!date) {
        return { isValid: false, error: "La fecha de entrega es requerida" };
    }

    const deliveryDate = new Date(date);

    if (isNaN(deliveryDate.getTime())) {
        return { isValid: false, error: "Fecha de entrega no válida" };
    }

    // Validar que la fecha no sea en el pasado
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deliveryDate.setHours(0, 0, 0, 0);

    if (deliveryDate < today) {
        return { isValid: false, error: "La fecha de entrega no puede ser en el pasado" };
    }

    // Validar que no sea más de 1 año en el futuro
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    if (deliveryDate > oneYearFromNow) {
        return { isValid: false, error: "La fecha de entrega no puede ser más de 1 año en el futuro" };
    }

    return { isValid: true, value: deliveryDate };
};

// Función helper para validar imagen de comprobante
const validatePaymentProofImage = (file) => {
    if (!file) {
        return { isValid: false, error: "La imagen del comprobante de pago es requerida" };
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.mimetype)) {
        return {
            isValid: false,
            error: "Formato de archivo no válido. Solo se permiten JPG, PNG, WEBP y PDF"
        };
    }

    if (file.size > maxSize) {
        return { isValid: false, error: "El archivo es demasiado grande. Máximo 10MB" };
    }

    return { isValid: true };
};

cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.cloudinary_api_key,
    api_secret: config.cloudinary.cloudinary_api_secret
});

/**
 * Obtenemos todas las ventas
 * Implementa configuración de cookies cross-domain
 */
salesController.getSales = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, trackingStatus } = req.query;

        // Validar parámetros de paginación
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        if (isNaN(pageNum) || pageNum < 1) {
            return res.status(400).json({
                success: false,
                message: "Número de página inválido"
            });
        }

        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            return res.status(400).json({
                success: false,
                message: "Límite inválido (1-100)"
            });
        }

        // Construir filtros
        const filters = {};

        if (status) {
            const statusValidation = validatePaymentStatus(status);
            if (statusValidation.isValid) {
                filters.status = statusValidation.value;
            }
        }

        if (trackingStatus) {
            const trackingValidation = validateTrackingStatus(trackingStatus);
            if (trackingValidation.isValid) {
                filters.trackingStatus = trackingValidation.value;
            }
        }

        const skip = (pageNum - 1) * limitNum;

        const [sales, totalCount] = await Promise.all([
            salesModel.find(filters)
                .populate('ShoppingCartId')
                .sort({ deliveryDate: 1 })
                .skip(skip)
                .limit(limitNum),
            salesModel.countDocuments(filters)
        ]);

        // Configurar cookies con configuración dinámica cross-domain
        const { token } = getTokenFromRequest(req);
        if (token) {
            const cookieConfig = getCookieConfig();
            res.cookie("authToken", token, cookieConfig);
        }

        res.status(200).json({
            success: true,
            data: sales,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalCount / limitNum),
                totalItems: totalCount,
                itemsPerPage: limitNum,
                hasNextPage: skip + limitNum < totalCount,
                hasPrevPage: pageNum > 1
            },
            token: token || 'session_maintained' // También en el body para mayor compatibilidad
        });
    } catch (error) {
        console.error('Error en getSales:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener las ventas",
            error: error.message
        });
    }
};

/**
 * Obtenemos una venta por ID
 * Implementa configuración de cookies cross-domain
 */
salesController.getSaleById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de venta no válido"
            });
        }

        const sale = await salesModel.findById(id).populate('ShoppingCartId');

        if (!sale) {
            return res.status(404).json({
                success: false,
                message: "Venta no encontrada"
            });
        }

        // Configurar cookies con configuración dinámica cross-domain
        const { token } = getTokenFromRequest(req);
        if (token) {
            const cookieConfig = getCookieConfig();
            res.cookie("authToken", token, cookieConfig);
        }

        res.status(200).json({
            success: true,
            data: sale,
            token: token || 'session_maintained' // También en el body para mayor compatibilidad
        });
    } catch (error) {
        console.error('Error en getSaleById:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener la venta",
            error: error.message
        });
    }
};

/**
 * Obtener estadísticas de pedidos del usuario
 * Implementa configuración de cookies cross-domain
 */
salesController.getUserOrderStats = async (req, res) => {
    try {
        const { userId } = req.params;

        console.log('=== getUserOrderStats iniciado ===');
        console.log('UserId recibido:', userId);

        // Validar que se proporcione el ID del usuario
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "ID de usuario requerido"
            });
        }

        // Validar que el userId sea un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.log('UserId no es válido:', userId);
            return res.status(400).json({
                success: false,
                message: "ID de usuario no válido"
            });
        }

        // Convertir userId a ObjectId
        const userObjectId = new mongoose.Types.ObjectId(userId);
        console.log('UserId convertido a ObjectId:', userObjectId);

        // Obtener todas las ventas del usuario a través del ShoppingCart
        const userSales = await salesModel.aggregate([
            {
                // Hacer lookup con ShoppingCart para obtener el clientId
                $lookup: {
                    from: 'shoppingcarts', // Nombre de la colección (debe ser en minúsculas y plural)
                    localField: 'ShoppingCartId',
                    foreignField: '_id',
                    as: 'shoppingCart'
                }
            },
            {
                // Filtrar documentos que tienen shoppingCart
                $match: {
                    'shoppingCart': { $ne: [] }
                }
            },
            {
                // Descomponer el array del shoppingCart
                $unwind: '$shoppingCart'
            },
            {
                // Filtrar por el clientId del usuario
                $match: {
                    'shoppingCart.clientId': userObjectId
                }
            },
            {
                // Proyecto para mantener solo campos necesarios
                $project: {
                    status: 1,
                    trackingStatus: 1,
                    createdAt: 1,
                    ShoppingCartId: 1
                }
            }
        ]);

        console.log('Ventas encontradas por aggregation:', userSales.length);
        console.log('Primer documento (si existe):', userSales[0]);

        // Si no hay ventas, devolver estadísticas en cero
        if (userSales.length === 0) {
            console.log('No se encontraron ventas para el usuario');
            const emptyStats = {
                totalOrders: 0,
                pendingOrders: 0,
                cancelledOrders: 0,
                scheduledOrders: 0,
                inProcessOrders: 0,
                deliveredOrders: 0
            };

            // Configurar cookies con configuración dinámica cross-domain
            const { token } = getTokenFromRequest(req);
            if (token) {
                const cookieConfig = getCookieConfig();
                res.cookie("authToken", token, cookieConfig);
            }

            return res.status(200).json({
                success: true,
                data: {
                    userId,
                    orderStats: emptyStats
                },
                token: token || 'session_maintained' // También en el body para mayor compatibilidad
            });
        }

        // Calcular estadísticas - LÓGICA CORREGIDA
        const stats = {
            totalOrders: userSales.length,
            // Pedidos pendientes: status "Pendiente"
            pendingOrders: userSales.filter(sale => sale.status === 'Pendiente').length,
            // Pedidos cancelados: según tu especificación, son los "Pagado"
            cancelledOrders: userSales.filter(sale => sale.status === 'Pagado').length,
            // Estadísticas por trackingStatus
            scheduledOrders: userSales.filter(sale => sale.trackingStatus === 'Agendado').length,
            inProcessOrders: userSales.filter(sale => sale.trackingStatus === 'En proceso').length,
            deliveredOrders: userSales.filter(sale => sale.trackingStatus === 'Entregado').length
        };

        console.log('Estadísticas calculadas:', stats);
        console.log('Detalle de estados encontrados:', {
            statusCounts: {
                Pendiente: userSales.filter(s => s.status === 'Pendiente').length,
                Pagado: userSales.filter(s => s.status === 'Pagado').length
            },
            trackingCounts: {
                Agendado: userSales.filter(s => s.trackingStatus === 'Agendado').length,
                'En proceso': userSales.filter(s => s.trackingStatus === 'En proceso').length,
                Entregado: userSales.filter(s => s.trackingStatus === 'Entregado').length
            }
        });

        // Configurar cookies con configuración dinámica cross-domain
        const { token } = getTokenFromRequest(req);
        if (token) {
            const cookieConfig = getCookieConfig();
            res.cookie("authToken", token, cookieConfig);
        }

        res.status(200).json({
            success: true,
            data: {
                userId,
                orderStats: stats
            },
            token: token || 'session_maintained' // También en el body para mayor compatibilidad
        });

    } catch (error) {
        console.error('Error completo en getUserOrderStats:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener estadísticas de pedidos",
            error: error.message
        });
    }
};

/**
 * Obtener pedidos del usuario
 * Implementa configuración de cookies cross-domain
 */
salesController.getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "ID de usuario requerido"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.log('UserId no es válido: ', userId);
            return res.status(400).json({
                success: false,
                message: "ID de usuario no válido"
            });
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);
        console.log('UserId convertido a ObjectId: ', userObjectId);

        const userOrders = await salesModel.aggregate([
            {
                $lookup: {
                    from: 'shoppingcarts',
                    localField: 'ShoppingCartId',
                    foreignField: '_id',
                    as: 'shoppingCart'
                }
            },
            {
                $match: {
                    'shoppingCart': { $ne: [] }
                }
            },
            {
                $unwind: '$shoppingCart'
            },
            {
                $match: {
                    'shoppingCart.clientId': userObjectId
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $limit: 10
            },
            {
                $project: {
                    _id: 1,
                    paymentType: 1,
                    paymentProofImage: 1,
                    status: 1,
                    trackingStatus: 1,
                    deliveryAddress: 1,
                    receiverName: 1,
                    receiverPhone: 1,
                    deliveryPoint: 1,
                    deliveryDate: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    'shoppingCart._id': 1,
                    'shoppingCart.items': 1,
                    'shoppingCart.total': 1,
                    'shoppingCart.createdAt': 1
                }
            }
        ]);

        console.log('Pedidos encontrados: ', userOrders.length);

        const enrichedOrders = userOrders.map(order => ({
            ...order,
            productCount: order.shoppingCart?.items?.length || 0,
            formattedDate: order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-ES') : 'N/A',
            cancellableUntil: order.createdAt ? new Date(new Date(order.createdAt).getTime() + (3 * 24 * 60 * 60 * 1000)) : null,
            trackingStatusLabel: order.trackingStatus === 'Agendado' ? 'Preparando' :
                order.trackingStatus === 'En proceso' ? 'En camino' :
                    order.trackingStatus === 'Entregado' ? 'Entregado' : order.trackingStatus
        }));

        console.log('Primer pedido procesado (si existe): ', enrichedOrders[0]);

        // Configurar cookies con configuración dinámica cross-domain
        const { token } = getTokenFromRequest(req);
        if (token) {
            const cookieConfig = getCookieConfig();
            res.cookie("authToken", token, cookieConfig);
        }

        res.status(200).json({
            success: true,
            data: enrichedOrders,
            count: enrichedOrders.length,
            message: `Se encontraron ${enrichedOrders.length} pedidos para el usuario`,
            token: token || 'session_maintained' // También en el body para mayor compatibilidad
        });
    } catch (error) {
        console.log('Error completo en getUserOrders: ', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener los pedidos del usuario",
            error: error.message
        });
    }
};

// FUNCIONES AUXILIARES PARA MANEJAR IMÁGENES
function extractImageUrl(images) {
    if (!images || !Array.isArray(images) || images.length === 0) {
        console.log('No hay imágenes disponibles');
        return null;
    }

    const firstImage = images[0];
    console.log('Primera imagen encontrada - tipo:', typeof firstImage, 'contenido:', firstImage);

    let imageUrl = null;

    // Caso 1: Es un string directo
    if (typeof firstImage === 'string') {
        imageUrl = firstImage;
        console.log('Imagen es string directo:', imageUrl);
    }
    // Caso 2: Es un objeto con la propiedad 'image'
    else if (typeof firstImage === 'object' && firstImage !== null) {
        // Según tu esquema, la imagen debería estar en firstImage.image
        imageUrl = firstImage.image;

        console.log('Imagen extraída del objeto:', {
            objetoCompleto: firstImage,
            imagenExtraida: imageUrl,
            tipoImagenExtraida: typeof imageUrl
        });

        // Si no está en .image, buscar en otras propiedades comunes
        if (!imageUrl) {
            imageUrl = firstImage.url ||
                firstImage.src ||
                firstImage.path ||
                firstImage.href;
            console.log('Imagen encontrada en propiedad alternativa:', imageUrl);
        }
    }

    const validatedUrl = validateImageUrl(imageUrl);
    console.log('URL final validada:', validatedUrl);

    return validatedUrl;
}

function validateImageUrl(url) {
    if (!url || typeof url !== 'string') {
        return null;
    }

    const trimmedUrl = url.trim();

    // Verificar que no sea una string vacía o valores inválidos
    if (!trimmedUrl ||
        trimmedUrl === '' ||
        trimmedUrl === 'null' ||
        trimmedUrl === 'undefined' ||
        trimmedUrl.toLowerCase() === 'none') {
        return null;
    }

    // Verificar que parezca una URL válida
    try {
        new URL(trimmedUrl);
        return trimmedUrl;
    } catch (error) {
        console.warn('URL inválida:', trimmedUrl);
        return null;
    }
}

function isValidImageUrl(url) {
    return validateImageUrl(url) !== null;
}

/**
 * Continúa desde salesController.js parte 1
 * Implementa configuración de cookies cross-domain en todos los métodos
 */

/**
 * Obtener detalles completos del pedido
 * Implementa configuración de cookies cross-domain
 */
salesController.getOrderDetails = async (req, res) => {
    try {
        const { saleId } = req.params;

        if (!saleId) {
            return res.status(400).json({
                success: false,
                message: "ID de venta requerido"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(saleId)) {
            return res.status(400).json({
                success: false,
                message: "ID de venta no válido"
            });
        }

        // Obtener datos de la venta con populate del carrito y cliente
        const orderDetails = await salesModel.findById(saleId)
            .populate({
                path: 'ShoppingCartId',
                populate: {
                    path: 'clientId',
                    model: 'clients',
                    select: 'fullName email phone address profilePicture'
                }
            })
            .lean();

        if (!orderDetails) {
            return res.status(404).json({
                success: false,
                message: "Pedido no encontrado"
            });
        }

        let productsData = [];
        if (orderDetails.ShoppingCartId?.items && orderDetails.ShoppingCartId.items.length > 0) {
            const productPromises = orderDetails.ShoppingCartId.items.map(async (item) => {
                try {
                    let productData = null;

                    if (item.itemType === 'product') {
                        // Buscar en productos regulares
                        const product = await mongoose.model('products').findById(item.itemId).lean();
                        if (product) {
                            console.log('=== PRODUCTO REGULAR ENCONTRADO ===');
                            console.log('ID:', product._id);
                            console.log('Nombre:', product.name);
                            console.log('Images array completo:', JSON.stringify(product.images, null, 2));
                            console.log('Primer elemento del array:', product.images?.[0]);
                            console.log('Tipo del primer elemento:', typeof product.images?.[0]);

                            // FUNCIÓN MEJORADA PARA EXTRAER IMAGEN
                            let imageUrl = extractImageUrl(product.images);

                            console.log('URL final extraída para el frontend:', imageUrl);
                            console.log('Tipo de URL final:', typeof imageUrl);
                            console.log('=== FIN PRODUCTO REGULAR ===\n');

                            productData = {
                                name: product.name,
                                description: product.description,
                                image: imageUrl,
                                price: product.price
                            };
                        }
                    } else if (item.itemType === 'custom') {
                        // Buscar en productos personalizados
                        const customProduct = await mongoose.model('CustomProducts').findById(item.itemId).lean();
                        if (customProduct) {
                            productData = {
                                name: customProduct.productToPersonalize,
                                description: customProduct.extraComments,
                                image: validateImageUrl(customProduct.referenceImage),
                                price: customProduct.totalPrice
                            };
                        }
                    }

                    return {
                        ...item,
                        name: productData?.name || 'Producto no disponible',
                        description: productData?.description || 'Sin descripción',
                        image: productData?.image || null,
                        price: productData?.price || 0,
                        subtotal: item.subtotal || (productData?.price || 0) * (item.quantity || 1)
                    };
                } catch (error) {
                    console.error('Error al obtener producto:', item.itemId, error);
                    return {
                        ...item,
                        name: 'Error al cargar producto',
                        description: 'No se pudo cargar la información',
                        image: null,
                        price: 0,
                        subtotal: 0
                    };
                }
            });

            productsData = await Promise.all(productPromises);
        }

        // Estructurar la respuesta
        const response = {
            order: {
                _id: orderDetails._id,
                paymentType: orderDetails.paymentType,
                paymentProofImage: orderDetails.paymentProofImage,
                status: orderDetails.status,
                trackingStatus: orderDetails.trackingStatus,
                deliveryAddress: orderDetails.deliveryAddress,
                receiverName: orderDetails.receiverName,
                receiverPhone: orderDetails.receiverPhone,
                deliveryPoint: orderDetails.deliveryPoint,
                deliveryDate: orderDetails.deliveryDate,
                createdAt: orderDetails.createdAt,
                updatedAt: orderDetails.updatedAt,
                shoppingCart: {
                    _id: orderDetails.ShoppingCartId?._id,
                    clientId: orderDetails.ShoppingCartId?.clientId?._id,
                    items: orderDetails.ShoppingCartId?.items || [],
                    total: orderDetails.ShoppingCartId?.total || 0,
                    createdAt: orderDetails.ShoppingCartId?.createdAt
                }
            },
            customer: orderDetails.ShoppingCartId?.clientId || null,
            products: productsData
        };

        // Debug final
        console.log('Respuesta final - productos con imágenes:', productsData.map(p => ({
            name: p.name,
            image: p.image,
            hasValidImage: isValidImageUrl(p.image)
        })));

        // Configurar cookies con configuración dinámica cross-domain
        const { token } = getTokenFromRequest(req);
        if (token) {
            const cookieConfig = getCookieConfig();
            res.cookie("authToken", token, cookieConfig);
        }

        res.status(200).json({
            success: true,
            data: response,
            message: 'Detalles del pedido obtenidos exitosamente',
            token: token || 'session_maintained' // También en el body para mayor compatibilidad
        });

    } catch (error) {
        console.error('Error completo en getOrderDetails:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener los detalles del pedido",
            error: error.message
        });
    }
};

/**
 * Cancelar pedido con validación de fecha
 * Implementa configuración de cookies cross-domain
 */
salesController.cancelOrder = async (req, res) => {
    try {
        const { saleId } = req.params;

        if (!saleId) {
            return res.status(400).json({
                success: false,
                message: "ID de venta requerido"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(saleId)) {
            return res.status(400).json({
                success: false,
                message: "ID de venta no válido"
            });
        }

        // Verificar que el pedido existe
        const order = await salesModel.findById(saleId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Pedido no encontrado"
            });
        }

        // Validaciones de estado
        if (order.trackingStatus === 'Entregado') {
            return res.status(400).json({
                success: false,
                message: "No se puede cancelar un pedido ya entregado"
            });
        }

        if (order.trackingStatus === 'Cancelado') {
            return res.status(400).json({
                success: false,
                message: "El pedido ya está cancelado"
            });
        }

        // Verificar que no han pasado más de 3 días desde la creación
        const now = new Date();
        const createdAt = new Date(order.createdAt);
        const threeDaysInMs = 3 * 24 * 60 * 60 * 1000; // 3 días en milisegundos
        const timeDifference = now - createdAt;

        if (timeDifference > threeDaysInMs) {
            const cancellableDate = new Date(createdAt.getTime() + threeDaysInMs);
            return res.status(400).json({
                success: false,
                message: `No se puede cancelar el pedido después de 3 días. El límite de cancelación era el ${cancellableDate.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                })}`
            });
        }

        // Actualizar el estado del pedido
        const updatedOrder = await salesModel.findByIdAndUpdate(
            saleId,
            {
                status: 'Cancelado',
                trackingStatus: 'Cancelado',
                updatedAt: new Date()
            },
            { new: true }
        );

        // Configurar cookies con configuración dinámica cross-domain
        const { token } = getTokenFromRequest(req);
        if (token) {
            const cookieConfig = getCookieConfig();
            res.cookie("authToken", token, cookieConfig);
        }

        res.status(200).json({
            success: true,
            data: updatedOrder,
            message: 'Pedido cancelado exitosamente',
            token: token || 'session_maintained' // También en el body para mayor compatibilidad
        });

    } catch (error) {
        console.error('Error al cancelar pedido:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al cancelar el pedido",
            error: error.message
        });
    }
};

/**
 * Verificar elegibilidad para cancelación
 * Implementa configuración de cookies cross-domain
 */
salesController.checkCancellationEligibility = async (req, res) => {
    try {
        const { saleId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(saleId)) {
            return res.status(400).json({
                success: false,
                message: "ID de venta no válido"
            });
        }

        const order = await salesModel.findById(saleId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Pedido no encontrado"
            });
        }

        const now = new Date();
        const createdAt = new Date(order.createdAt);
        const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
        const timeDifference = now - createdAt;
        const cancellableDate = new Date(createdAt.getTime() + threeDaysInMs);

        const isCancellable =
            order.trackingStatus !== 'Entregado' &&
            order.trackingStatus !== 'Cancelado' &&
            timeDifference <= threeDaysInMs;

        // Configurar cookies con configuración dinámica cross-domain
        const { token } = getTokenFromRequest(req);
        if (token) {
            const cookieConfig = getCookieConfig();
            res.cookie("authToken", token, cookieConfig);
        }

        res.status(200).json({
            success: true,
            data: {
                isCancellable,
                currentStatus: order.trackingStatus,
                createdAt: order.createdAt,
                cancellableUntil: cancellableDate,
                remainingHours: isCancellable ? Math.max(0, Math.ceil((threeDaysInMs - timeDifference) / (1000 * 60 * 60))) : 0
            },
            message: 'Información de cancelación obtenida exitosamente',
            token: token || 'session_maintained' // También en el body para mayor compatibilidad
        });

    } catch (error) {
        console.error('Error al verificar elegibilidad de cancelación:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

/**
 * Crear nueva venta
 * Implementa configuración de cookies cross-domain y respuesta híbrida
 */
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

        // 1. VALIDACIONES DE DATOS BÁSICOS
        console.log('Iniciando validaciones para nueva venta...');

        // Validar tipo de pago
        const paymentTypeValidation = validatePaymentType(paymentType);
        if (!paymentTypeValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: paymentTypeValidation.error
            });
        }

        // Validar dirección de entrega
        const addressValidation = validateAddress(deliveryAddress);
        if (!addressValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: addressValidation.error
            });
        }

        // Validar nombre del receptor
        const nameValidation = validateReceiverName(receiverName);
        if (!nameValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: nameValidation.error
            });
        }

        // Validar teléfono del receptor
        const phoneValidation = validatePhone(receiverPhone);
        if (!phoneValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: phoneValidation.error
            });
        }

        // Validar punto de referencia
        const pointValidation = validateDeliveryPoint(deliveryPoint);
        if (!pointValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: pointValidation.error
            });
        }

        // Validar fecha de entrega
        const dateValidation = validateDeliveryDate(deliveryDate);
        if (!dateValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: dateValidation.error
            });
        }

        // 2. VALIDACIONES DE CARRITO
        if (!ShoppingCartId || !isValidObjectId(ShoppingCartId)) {
            return res.status(400).json({
                success: false,
                message: "ID de carrito de compras inválido"
            });
        }

        // Validar que el carrito existe
        const cartExists = await ShoppingCart.findById(ShoppingCartId);
        if (!cartExists) {
            return res.status(404).json({
                success: false,
                message: "Carrito de compras no encontrado"
            });
        }

        // 3. VALIDACIONES DE COMPROBANTE DE PAGO
        console.log(`Validando comprobante para pago tipo: ${paymentType}`);

        // Determinar si es necesario el comprobante
        const requiresProof = paymentType !== 'Efectivo';
        let imageValidation = { isValid: true };

        if (requiresProof) {
            // Validar que se envió un archivo
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "El comprobante de pago es requerido para este método de pago"
                });
            }

            // Validar el archivo
            imageValidation = validatePaymentProofImage(req.file);
            if (!imageValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: imageValidation.error
                });
            }
        }

        // 4. PROCESAMIENTO DE COMPROBANTE DE PAGO
        let paymentProofImage = '';

        if (requiresProof && req.file) {
            console.log('Subiendo comprobante de pago a Cloudinary...');

            try {
                const result = await cloudinary.uploader.upload(
                    req.file.path,
                    {
                        folder: "payment-proofs",
                        allowed_formats: ["jpg", "png", "jpeg", "pdf", "webp"],
                        transformation: req.file.mimetype.startsWith('image/') ? [
                            { width: 1200, height: 1200, crop: "limit" },
                            { quality: "auto" }
                        ] : undefined
                    }
                );
                paymentProofImage = result.secure_url;
                console.log('Comprobante subido exitosamente:', paymentProofImage);
            } catch (cloudinaryError) {
                console.error('Error en Cloudinary:', cloudinaryError);
                return res.status(502).json({
                    success: false,
                    message: "Error al procesar el comprobante de pago"
                });
            }
        } else if (paymentType === 'Efectivo') {
            console.log('Pago en efectivo - no se requiere comprobante');
            // Para efectivo, podemos establecer un valor por defecto o dejarlo vacío
            paymentProofImage = '';
        }

        // 5. VALIDACIÓN Y CONFIGURACIÓN DE ESTADOS
        // *** CORREGIDO: Lógica de estado basada en tipo de pago ***
        let validatedStatus;

        if (paymentType === 'Efectivo') {
            // Para efectivo siempre es "Pendiente" hasta que se entregue
            validatedStatus = "Pendiente";
            console.log('Pago en efectivo - estado establecido como Pendiente');
        } else {
            // Para otros métodos de pago, si hay comprobante es "Pagado"
            if (paymentProofImage) {
                validatedStatus = "Pagado";
                console.log(`Pago ${paymentType} con comprobante - estado establecido como Pagado`);
            } else {
                validatedStatus = "Pendiente";
                console.log(`Pago ${paymentType} sin comprobante - estado establecido como Pendiente`);
            }
        }

        // Si se proporciona un estado específico, validarlo y usarlo solo si es válido
        if (status) {
            const statusValidation = validatePaymentStatus(status);
            if (statusValidation.isValid) {
                validatedStatus = statusValidation.value;
                console.log(`Estado personalizado aplicado: ${validatedStatus}`);
            }
        }

        // Establecer estado de tracking por defecto
        let validatedTrackingStatus = "Agendado";

        if (trackingStatus) {
            const trackingValidation = validateTrackingStatus(trackingStatus);
            if (!trackingValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: trackingValidation.error
                });
            }
            validatedTrackingStatus = trackingValidation.value;
        }

        // 6. CREAR LA VENTA
        console.log('Creando nueva venta en la base de datos...');

        const saleData = {
            paymentType: paymentTypeValidation.value,
            paymentProofImage,
            status: validatedStatus,
            trackingStatus: validatedTrackingStatus,
            deliveryAddress: addressValidation.value,
            receiverName: nameValidation.value,
            receiverPhone: phoneValidation.value,
            deliveryPoint: pointValidation.value,
            deliveryDate: dateValidation.value,
            ShoppingCartId
        };

        console.log('Datos de la venta a crear:', {
            paymentType: saleData.paymentType,
            status: saleData.status,
            hasProofImage: !!saleData.paymentProofImage,
            trackingStatus: saleData.trackingStatus
        });

        const newSale = new salesModel(saleData);
        await newSale.save();

        console.log('Venta creada con ID:', newSale._id);

        // 7. PREPARAR RESPUESTA
        // Poblar carrito en la respuesta
        const populatedSale = await salesModel
            .findById(newSale._id)
            .populate('ShoppingCartId');

        // Configurar cookies con configuración dinámica cross-domain
        const { token } = getTokenFromRequest(req);
        const currentToken = token || 'session_maintained';
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", currentToken, cookieConfig);

        // Respuesta exitosa con patrón híbrido
        res.status(201).json({
            success: true,
            message: "Venta creada exitosamente",
            data: {
                sale: populatedSale,
                paymentInfo: {
                    type: paymentType,
                    requiresProof: requiresProof,
                    proofUploaded: !!paymentProofImage,
                    status: validatedStatus,
                    trackingStatus: validatedTrackingStatus
                }
            },
            token: currentToken // También en el body para mayor compatibilidad
        });

        console.log('Venta procesada exitosamente con estado:', validatedStatus);

    } catch (error) {
        console.error('Error en createSale:', error);

        // Manejo específico de errores de validación de Mongoose
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message,
                value: err.value
            }));

            return res.status(400).json({
                success: false,
                message: "Error de validación en los datos",
                errors: validationErrors
            });
        }

        // Manejo de errores de casting (IDs inválidos, etc.)
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: `Formato inválido para el campo: ${error.path}`,
                field: error.path,
                value: error.value
            });
        }

        // Manejo de errores de duplicación (si hay índices únicos)
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(409).json({
                success: false,
                message: `Ya existe un registro con ese ${field}`,
                field: field
            });
        }

        // Error genérico del servidor
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al crear la venta",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
        });
    }
};

/**
 * Actualizar venta
 * Implementa configuración de cookies cross-domain
 */
salesController.updateSale = async (req, res) => {
    try {
        const { id } = req.params;
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

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de venta no válido"
            });
        }

        // Verificar que la venta existe
        const existingSale = await salesModel.findById(id);
        if (!existingSale) {
            return res.status(404).json({
                success: false,
                message: "Venta no encontrada"
            });
        }

        const updateData = {};

        // Validar campos opcionales para actualización
        if (paymentType !== undefined) {
            const paymentTypeValidation = validatePaymentType(paymentType);
            if (!paymentTypeValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: paymentTypeValidation.error
                });
            }
            updateData.paymentType = paymentTypeValidation.value;
        }

        if (status !== undefined) {
            const statusValidation = validatePaymentStatus(status);
            if (!statusValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: statusValidation.error
                });
            }
            updateData.status = statusValidation.value;
        }

        if (trackingStatus !== undefined) {
            const trackingValidation = validateTrackingStatus(trackingStatus);
            if (!trackingValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: trackingValidation.error
                });
            }
            updateData.trackingStatus = trackingValidation.value;
        }

        if (deliveryAddress !== undefined) {
            const addressValidation = validateAddress(deliveryAddress);
            if (!addressValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: addressValidation.error
                });
            }
            updateData.deliveryAddress = addressValidation.value;
        }

        if (receiverName !== undefined) {
            const nameValidation = validateReceiverName(receiverName);
            if (!nameValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: nameValidation.error
                });
            }
            updateData.receiverName = nameValidation.value;
        }

        if (receiverPhone !== undefined) {
            const phoneValidation = validatePhone(receiverPhone);
            if (!phoneValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: phoneValidation.error
                });
            }
            updateData.receiverPhone = phoneValidation.value;
        }

        if (deliveryPoint !== undefined) {
            const pointValidation = validateDeliveryPoint(deliveryPoint);
            if (!pointValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: pointValidation.error
                });
            }
            updateData.deliveryPoint = pointValidation.value;
        }

        if (deliveryDate !== undefined) {
            const dateValidation = validateDeliveryDate(deliveryDate);
            if (!dateValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: dateValidation.error
                });
            }
            updateData.deliveryDate = dateValidation.value;
        }

        if (ShoppingCartId !== undefined) {
            if (!isValidObjectId(ShoppingCartId)) {
                return res.status(400).json({
                    success: false,
                    message: "ID de carrito de compras inválido"
                });
            }

            const cartExists = await ShoppingCart.findById(ShoppingCartId);
            if (!cartExists) {
                return res.status(404).json({
                    success: false,
                    message: "Carrito de compras no encontrado"
                });
            }

            updateData.ShoppingCartId = ShoppingCartId;
        }

        // Subir nueva imagen de comprobante de pago si existe
        if (req.file) {
            const imageValidation = validatePaymentProofImage(req.file);
            if (!imageValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: imageValidation.error
                });
            }

            try {
                // Eliminar imagen anterior de Cloudinary
                if (existingSale.paymentProofImage) {
                    const urlParts = existingSale.paymentProofImage.split('/');
                    const publicIdWithExtension = urlParts[urlParts.length - 1];
                    const publicId = publicIdWithExtension.split('.')[0];
                    await cloudinary.uploader.destroy(`payment-proofs/${publicId}`);
                }

                const result = await cloudinary.uploader.upload(
                    req.file.path,
                    {
                        folder: "payment-proofs",
                        allowed_formats: ["jpg", "png", "jpeg", "pdf", "webp"],
                        transformation: req.file.mimetype.startsWith('image/') ? [
                            { width: 1200, height: 1200, crop: "limit" },
                            { quality: "auto" }
                        ] : undefined
                    }
                );
                updateData.paymentProofImage = result.secure_url;
            } catch (cloudinaryError) {
                console.error('Error en Cloudinary:', cloudinaryError);
                return res.status(502).json({
                    success: false,
                    message: "Error al procesar el comprobante de pago"
                });
            }
        }

        // Verificar que hay algo que actualizar
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No se proporcionaron datos para actualizar"
            });
        }

        const updatedSale = await salesModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('ShoppingCartId');

        // Configurar cookies con configuración dinámica cross-domain
        const { token } = getTokenFromRequest(req);
        const currentToken = token || 'session_maintained';
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", currentToken, cookieConfig);

        res.status(200).json({
            success: true,
            message: "Venta actualizada exitosamente",
            data: updatedSale,
            token: currentToken // También en el body para mayor compatibilidad
        });
    } catch (error) {
        console.error('Error en updateSale:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Error de validación",
                details: Object.values(error.errors).map(err => err.message)
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Datos con formato incorrecto"
            });
        }

        res.status(500).json({
            success: false,
            message: "Error interno del servidor al actualizar la venta",
            error: error.message
        });
    }
};

// Función helper para calcular fechas de trimestre (reutilizada del cliente controller)
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

/**
 * Obtener estadísticas de productos vendidos
 * Implementa configuración de cookies cross-domain
 */
salesController.getSoldProductsStats = async (req, res) => {
    try {
        const { period = 'current' } = req.query;

        // Validar período
        if (!['current', 'previous'].includes(period)) {
            return res.status(400).json({
                success: false,
                message: "Período inválido. Use 'current' o 'previous'"
            });
        }

        const now = new Date();
        const { startDate, endDate } = calculateQuarterDates(period, now);

        const soldProducts = await salesModel.countDocuments({
            status: 'Pagado',
            createdAt: {
                $gte: startDate,
                $lte: endDate
            }
        });

        // Configurar cookies con configuración dinámica cross-domain
        const { token } = getTokenFromRequest(req);
        if (token) {
            const cookieConfig = getCookieConfig();
            res.cookie("authToken", token, cookieConfig);
        }

        res.status(200).json({
            success: true,
            count: soldProducts,
            period,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            token: token || 'session_maintained' // También en el body para mayor compatibilidad
        });

    } catch (error) {
        console.error("Error en getSoldProductsStats:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener estadísticas de productos vendidos",
            error: error.message
        });
    }
};

/**
 * Obtener total de ventas
 * Implementa configuración de cookies cross-domain
 */
salesController.getTotalSales = async (req, res) => {
    try {
        const totalSales = await salesModel.countDocuments();

        // Configurar cookies con configuración dinámica cross-domain
        const { token } = getTokenFromRequest(req);
        if (token) {
            const cookieConfig = getCookieConfig();
            res.cookie("authToken", token, cookieConfig);
        }

        res.status(200).json({
            success: true,
            total: totalSales,
            token: token || 'session_maintained' // También en el body para mayor compatibilidad
        });
    } catch (error) {
        console.error('Error en getTotalSales:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener total de ventas",
            error: error.message
        });
    }
};

/**
 * Obtener estadísticas del dashboard
 * Implementa configuración de cookies cross-domain
 */
salesController.getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const { startDate: currentQuarterStart, endDate: currentQuarterEnd } = calculateQuarterDates('current', now);
        const { startDate: previousQuarterStart, endDate: previousQuarterEnd } = calculateQuarterDates('previous', now);

        const [currentSales, previousSales] = await Promise.all([
            salesModel.countDocuments({
                createdAt: {
                    $gte: currentQuarterStart,
                    $lte: currentQuarterEnd
                }
            }),
            salesModel.countDocuments({
                createdAt: {
                    $gte: previousQuarterStart,
                    $lte: previousQuarterEnd
                }
            })
        ]);

        const salesPercentageChange = previousSales === 0 ? 100 :
            ((currentSales - previousSales) / previousSales) * 100;

        // Configurar cookies con configuración dinámica cross-domain
        const { token } = getTokenFromRequest(req);
        if (token) {
            const cookieConfig = getCookieConfig();
            res.cookie("authToken", token, cookieConfig);
        }

        res.status(200).json({
            success: true,
            data: {
                currentPeriodSales: currentSales,
                previousPeriodSales: previousSales,
                salesPercentageChange: Math.round(salesPercentageChange * 10) / 10,
                period: {
                    current: { start: currentQuarterStart.toISOString(), end: currentQuarterEnd.toISOString() },
                    previous: { start: previousQuarterStart.toISOString(), end: previousQuarterEnd.toISOString() }
                }
            },
            token: token || 'session_maintained' // También en el body para mayor compatibilidad
        });
    } catch (error) {
        console.error('Error en getDashboardStats:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener estadísticas del dashboard",
            error: error.message
        });
    }
};

/**
 * Eliminar venta
 */
salesController.deleteSale = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de venta no válido"
            });
        }

        const deletedSale = await salesModel.findByIdAndDelete(id);

        if (!deletedSale) {
            return res.status(404).json({
                success: false,
                message: "Venta no encontrada"
            });
        }

        const { token } = getTokenFromRequest(req);
        const currentToken = token || 'session_maintained';
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", currentToken, cookieConfig);

        res.status(200).json({
            success: true,
            message: "Venta eliminada exitosamente",
            token: currentToken
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar venta",
            error: error.message
        });
    }
};

/**
 * Obtener ventas detalladas
 */
salesController.getSalesDetailed = async (req, res) => {
    try {
        const sales = await salesModel.find()
            .populate({
                path: 'ShoppingCartId',
                populate: {
                    path: 'clientId',
                    model: 'clients'
                }
            })
            .sort({ createdAt: -1 });

        const { token } = getTokenFromRequest(req);
        const currentToken = token || 'session_maintained';
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", currentToken, cookieConfig);

        res.status(200).json({
            success: true,
            data: sales,
            token: currentToken
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener ventas detalladas",
            error: error.message
        });
    }
};

/**
 * Obtener ventas por estado de pago
 */
salesController.getSalesByPaymentStatus = async (req, res) => {
    try {
        const { status } = req.params;

        const statusValidation = validatePaymentStatus(status);
        if (!statusValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: statusValidation.error
            });
        }

        const sales = await salesModel.find({ status: statusValidation.value })
            .populate('ShoppingCartId')
            .sort({ createdAt: -1 });

        const { token } = getTokenFromRequest(req);
        const currentToken = token || 'session_maintained';
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", currentToken, cookieConfig);

        res.status(200).json({
            success: true,
            data: sales,
            count: sales.length,
            token: currentToken
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener ventas por estado de pago",
            error: error.message
        });
    }
};

/**
 * Obtener ventas por estado de seguimiento
 */
salesController.getSalesByTrackingStatus = async (req, res) => {
    try {
        const { trackingStatus } = req.params;

        const trackingValidation = validateTrackingStatus(trackingStatus);
        if (!trackingValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: trackingValidation.error
            });
        }

        const sales = await salesModel.find({ trackingStatus: trackingValidation.value })
            .populate('ShoppingCartId')
            .sort({ createdAt: -1 });

        const { token } = getTokenFromRequest(req);
        const currentToken = token || 'session_maintained';
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", currentToken, cookieConfig);

        res.status(200).json({
            success: true,
            data: sales,
            count: sales.length,
            token: currentToken
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener ventas por estado de seguimiento",
            error: error.message
        });
    }
};

/**
 * Actualizar estado de pago
 */
salesController.updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de venta no válido"
            });
        }

        const statusValidation = validatePaymentStatus(status);
        if (!statusValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: statusValidation.error
            });
        }

        const updatedSale = await salesModel.findByIdAndUpdate(
            id,
            { status: statusValidation.value },
            { new: true }
        ).populate('ShoppingCartId');

        if (!updatedSale) {
            return res.status(404).json({
                success: false,
                message: "Venta no encontrada"
            });
        }

        const { token } = getTokenFromRequest(req);
        const currentToken = token || 'session_maintained';
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", currentToken, cookieConfig);

        res.status(200).json({
            success: true,
            message: "Estado de pago actualizado",
            data: updatedSale,
            token: currentToken
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar estado de pago",
            error: error.message
        });
    }
};

/**
 * Actualizar estado de seguimiento
 */
salesController.updateTrackingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { trackingStatus } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de venta no válido"
            });
        }

        const trackingValidation = validateTrackingStatus(trackingStatus);
        if (!trackingValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: trackingValidation.error
            });
        }

        const updatedSale = await salesModel.findByIdAndUpdate(
            id,
            { trackingStatus: trackingValidation.value },
            { new: true }
        ).populate('ShoppingCartId');

        if (!updatedSale) {
            return res.status(404).json({
                success: false,
                message: "Venta no encontrada"
            });
        }

        const { token } = getTokenFromRequest(req);
        const currentToken = token || 'session_maintained';
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", currentToken, cookieConfig);

        res.status(200).json({
            success: true,
            message: "Estado de seguimiento actualizado",
            data: updatedSale,
            token: currentToken
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar estado de seguimiento",
            error: error.message
        });
    }
};

/**
 * Actualizar comprobante de pago
 */
salesController.updatePaymentProof = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de venta no válido"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Archivo de comprobante requerido"
            });
        }

        const imageValidation = validatePaymentProofImage(req.file);
        if (!imageValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: imageValidation.error
            });
        }

        const existingSale = await salesModel.findById(id);
        if (!existingSale) {
            return res.status(404).json({
                success: false,
                message: "Venta no encontrada"
            });
        }

        try {
            const result = await cloudinary.uploader.upload(
                req.file.path,
                {
                    folder: "payment-proofs",
                    allowed_formats: ["jpg", "png", "jpeg", "pdf", "webp"]
                }
            );

            const updatedSale = await salesModel.findByIdAndUpdate(
                id,
                { paymentProofImage: result.secure_url },
                { new: true }
            ).populate('ShoppingCartId');

            const { token } = getTokenFromRequest(req);
            const currentToken = token || 'session_maintained';
            const cookieConfig = getCookieConfig();
            res.cookie("authToken", currentToken, cookieConfig);

            res.status(200).json({
                success: true,
                message: "Comprobante actualizado exitosamente",
                data: updatedSale,
                token: currentToken
            });
        } catch (cloudinaryError) {
            res.status(502).json({
                success: false,
                message: "Error al procesar comprobante",
                error: cloudinaryError.message
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar comprobante",
            error: error.message
        });
    }
};

// NOTA: Los demás métodos del salesController deben seguir el mismo patrón
// implementando getCookieConfig() y getTokenFromRequest() en todas las respuestas
// También agregar el token en el body de cada respuesta para compatibilidad cross-domain

export default salesController;
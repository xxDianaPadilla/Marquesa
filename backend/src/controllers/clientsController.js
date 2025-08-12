// Importé el modelo de clientes para trabajar con la base de datos
import clientsModel from "../models/Clients.js";
import productsModel from "../models/products.js"; // Ajusta la ruta según tu estructura
// Importé Cloudinary para manejar imágenes y configuraciones
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";
import mongoose from "mongoose";

// Configuración de Cloudinary con las credenciales del archivo de configuración
cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.cloudinary_api_key,
    api_secret: config.cloudinary.cloudinary_api_secret
});

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

// Objeto que contendrá todas las funciones del controller
const clientsController = {};

// Función helper para validar período
const validatePeriod = (period) => {
    const validPeriods = ['current', 'previous'];
    return validPeriods.includes(period);
};

/**
 * Actualiza el perfil del cliente autenticado
 * Permite actualizar teléfono, dirección y foto de perfil
 */
clientsController.updateProfile = async (req, res) => {
    try {
        console.log('=== INICIO updateProfile ===');
        console.log('User ID del token:', req.user?.id);
        console.log('Datos recibidos:', req.body);
        console.log('Archivo recibido:', req.file);

        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Usuario no autenticado"
            });
        }

        const { phone, address, fullName, action, productId, ...otherUpdates } = req.body;

        // Buscar el cliente
        const client = await clientsModel.findById(userId);
        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        // MANEJO DE FAVORITOS
        if (action === 'add_favorite' && productId) {
            // Verificar si ya está en favoritos
            const isAlreadyFavorite = client.favorites.some(
                fav => fav.productId.toString() === productId
            );

            if (isAlreadyFavorite) {
                return res.status(400).json({
                    success: false,
                    message: "El producto ya está en favoritos"
                });
            }

            // Agregar a favoritos
            client.favorites.push({ productId });
            await client.save();

            // Configurar cookies con configuración dinámica
            const cookieConfig = getCookieConfig();
            const currentToken = req.cookies?.authToken || 'session_maintained';
            res.cookie("authToken", currentToken, cookieConfig);

            return res.status(200).json({
                success: true,
                message: "Producto agregado a favoritos",
                token: currentToken, // También en el body para mayor compatibilidad
                user: {
                    id: client._id,
                    name: client.fullName,
                    email: client.email,
                    phone: client.phone,
                    address: client.address,
                    birthDate: client.birthDate,
                    profilePicture: client.profilePicture,
                    favorites: client.favorites,
                    discount: client.discount
                }
            });
        }

        if (action === 'remove_favorite' && productId) {
            // Remover de favoritos
            const favoriteIndex = client.favorites.findIndex(
                fav => fav.productId.toString() === productId
            );

            if (favoriteIndex === -1) {
                return res.status(400).json({
                    success: false,
                    message: "El producto no está en favoritos"
                });
            }

            client.favorites.splice(favoriteIndex, 1);
            await client.save();

            // Configurar cookies con configuración dinámica
            const cookieConfig = getCookieConfig();
            const currentToken = req.cookies?.authToken || 'session_maintained';
            res.cookie("authToken", currentToken, cookieConfig);

            return res.status(200).json({
                success: true,
                message: "Producto removido de favoritos",
                token: currentToken, // También en el body para mayor compatibilidad
                user: {
                    id: client._id,
                    name: client.fullName,
                    email: client.email,
                    phone: client.phone,
                    address: client.address,
                    birthDate: client.birthDate,
                    profilePicture: client.profilePicture,
                    favorites: client.favorites,
                    discount: client.discount
                }
            });
        }

        // VALIDACIONES PARA ACTUALIZACIÓN NORMAL DEL PERFIL
        if (phone) {
            if (!phone.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "El teléfono es requerido"
                });
            }

            const phoneClean = phone.trim().replace(/\D/g, '');
            if (phoneClean.length !== 8) {
                return res.status(400).json({
                    success: false,
                    message: "El teléfono debe tener 8 dígitos"
                });
            }
        }

        if (address && address.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: "La dirección debe tener al menos 10 caracteres"
            });
        }

        // Validación del nombre si se proporciona
        if (fullName) {
            if (fullName.trim().length < 3) {
                return res.status(400).json({
                    success: false,
                    message: "El nombre debe tener al menos 3 caracteres"
                });
            }

            if (fullName.trim().length > 100) {
                return res.status(400).json({
                    success: false,
                    message: "El nombre no puede exceder 100 caracteres"
                });
            }

            const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
            if (!nameRegex.test(fullName.trim())) {
                return res.status(400).json({
                    success: false,
                    message: "El nombre solo puede contener letras"
                });
            }
        }

        // Preparar datos para actualizar
        const updateData = {};
        
        if (phone) {
            const phoneClean = phone.trim().replace(/\D/g, '');
            updateData.phone = phoneClean.slice(0, 4) + "-" + phoneClean.slice(4);
        }
        
        if (address) {
            updateData.address = address.trim();
        }

        if (fullName) {
            updateData.fullName = fullName.trim();
        }

        // Manejar imagen de perfil si se proporciona
        if (req.file) {
            try {
                console.log('Procesando imagen de perfil...');

                // Eliminar imagen anterior de Cloudinary si existe
                if (client.profilePicture) {
                    try {
                        const urlParts = client.profilePicture.split('/');
                        const publicIdWithExtension = urlParts[urlParts.length - 1];
                        const publicId = publicIdWithExtension.split('.')[0];
                        await cloudinary.uploader.destroy(`profiles/${publicId}`);
                        console.log('Imagen anterior eliminada de Cloudinary');
                    } catch (cloudError) {
                        console.log('No se pudo eliminar la imagen anterior:', cloudError.message);
                    }
                }

                // Subir nueva imagen
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: "profiles",
                    allowed_formats: ["jpg", "png", "jpeg", "webp"],
                    transformation: [
                        { width: 300, height: 300, crop: "fill", gravity: "face" },
                        { quality: "auto" }
                    ]
                });

                updateData.profilePicture = result.secure_url;
                console.log('Nueva imagen subida a Cloudinary:', result.secure_url);
            } catch (cloudinaryError) {
                console.error('Error al procesar imagen:', cloudinaryError);
                return res.status(502).json({
                    success: false,
                    message: "Error al procesar la imagen. Inténtalo con un archivo más pequeño."
                });
            }
        }

        // Actualizar cliente solo si hay datos para actualizar
        if (Object.keys(updateData).length > 0) {
            const updatedClient = await clientsModel.findByIdAndUpdate(
                userId,
                updateData,
                { new: true, runValidators: true }
            ).select('-password');

            console.log('Cliente actualizado exitosamente');

            // Configurar cookies con configuración dinámica
            const cookieConfig = getCookieConfig();
            const currentToken = req.cookies?.authToken || 'session_maintained';
            res.cookie("authToken", currentToken, cookieConfig);

            return res.status(200).json({
                success: true,
                message: "Perfil actualizado exitosamente",
                token: currentToken, // También en el body para mayor compatibilidad
                user: {
                    id: updatedClient._id,
                    name: updatedClient.fullName,
                    email: updatedClient.email,
                    phone: updatedClient.phone,
                    address: updatedClient.address,
                    birthDate: updatedClient.birthDate,
                    profilePicture: updatedClient.profilePicture,
                    favorites: updatedClient.favorites,
                    discount: updatedClient.discount
                }
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "No hay datos para actualizar"
            });
        }

    } catch (error) {
        console.error('Error en updateProfile:', error);

        // Manejar errores específicos de validación
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                details: Object.values(error.errors).map(err => err.message)
            });
        }

        // Manejar errores de duplicación
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(409).json({
                success: false,
                message: `Este ${field} ya está en uso por otro usuario`
            });
        }

        // Error genérico del servidor
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al actualizar perfil",
            error: error.message
        });
    }
};

// NUEVA FUNCIÓN: Validar código de descuento
clientsController.validateRuletaCode = async (req, res) => {
    try {
        console.log('=== INICIO validateRuletaCode ===');
        console.log('User ID del token:', req.user?.id);
        console.log('Código a validar:', req.params.code);

        const userId = req.user?.id;
        const { code } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Usuario no autenticado"
            });
        }

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Código de descuento es requerido"
            });
        }

        // Buscar el cliente
        const client = await clientsModel.findById(userId);
        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        // Buscar el código
        const ruletaCode = client.ruletaCodes ? client.ruletaCodes.find(
            ruletaCode => ruletaCode.code === code
        ) : null;

        if (!ruletaCode) {
            return res.status(404).json({
                success: false,
                message: "Código no encontrado"
            });
        }

        // Verificar estado del código
        if (ruletaCode.status === 'used') {
            return res.status(400).json({
                success: false,
                message: "Este código ya ha sido utilizado",
                code: ruletaCode
            });
        }

        if (ruletaCode.status === 'expired' || ruletaCode.expiresAt < new Date()) {
            // Marcar como expirado si no lo estaba
            if (ruletaCode.status !== 'expired') {
                ruletaCode.status = 'expired';
                await client.save();
            }

            return res.status(400).json({
                success: false,
                message: "Este código ha expirado",
                code: ruletaCode
            });
        }

        console.log('Código validado exitosamente:', code);

        // Configurar cookies con configuración dinámica
        const cookieConfig = getCookieConfig();
        const currentToken = req.cookies?.authToken || 'session_maintained';
        res.cookie("authToken", currentToken, cookieConfig);

        res.status(200).json({
            success: true,
            message: "Código válido",
            token: currentToken, // También en el body para mayor compatibilidad
            code: {
                code: ruletaCode.code,
                name: ruletaCode.name,
                discount: ruletaCode.discount,
                expiresAt: ruletaCode.expiresAt
            }
        });

    } catch (error) {
        console.error('Error en validateRuletaCode:', error);

        res.status(500).json({
            success: false,
            message: "Error interno del servidor al validar código de descuento",
            error: error.message
        });
    }
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

clientsController.validatePromotionalCode = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { code } = req.body;

        if (!clientId || !code) {
            return res.status(400).json({
                success: false,
                message: "ID de cliente y código son requeridos"
            });
        }

        const client = await clientsModel.findById(clientId);
        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Cliente no encontrado"
            });
        }

        // Buscar por código O por nombre (más flexible)
        const foundCode = client.ruletaCodes.find(rCode => {
            const isActive = rCode.status === 'active';
            const codeMatch = rCode.code.toUpperCase() === code.toUpperCase();
            const nameMatch = rCode.name.toUpperCase() === code.toUpperCase();

            return isActive && (codeMatch || nameMatch);
        });

        if (!foundCode) {
            return res.status(400).json({
                success: false,
                message: "Código promocional no válido o ya utilizado"
            });
        }

        const now = new Date();
        if (foundCode.expiresAt < now) {
            // Marcar como expirado
            await clientsModel.findByIdAndUpdate(
                clientId,
                {
                    $set: {
                        "ruletaCodes.$[elem].status": "expired"
                    }
                },
                {
                    arrayFilters: [{ "elem.codeId": foundCode.codeId }],
                    new: true
                }
            );

            return res.status(400).json({
                success: false,
                message: "El código promocional ha expirado"
            });
        }

        res.status(200).json({
            success: true,
            message: "Código promocional válido",
            discountData: {
                codeId: foundCode.codeId,
                code: foundCode.code,
                name: foundCode.name,
                discount: foundCode.discount,
                color: foundCode.color,
                textColor: foundCode.textColor,
                expiresAt: foundCode.expiresAt
            }
        });

    } catch (error) {
        console.error('Error validando código promocional: ', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

clientsController.usePromotionalCode = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { codeId, orderId } = req.body;

        console.log('=== INICIO: Marcando código como usado ===');
        console.log('Datos recibidos:', {
            clientId,
            codeId,
            orderId,
            orderIdType: typeof orderId
        });

        // Validaciones básicas
        if (!clientId || !codeId) {
            console.log('❌ Error: Faltan datos requeridos');
            return res.status(400).json({
                success: false,
                message: "ID de cliente y código son requeridos"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            console.log('❌ Error: ClientId no es un ObjectId válido');
            return res.status(400).json({
                success: false,
                message: "ID de cliente no válido"
            });
        }

        let processedOrderId = orderId;
        if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
            processedOrderId = new mongoose.Types.ObjectId(orderId);
        }

        console.log('Datos procesados:', {
            clientId,
            codeId,
            processedOrderId,
            processedOrderIdType: typeof processedOrderId
        });

        // PASO 1: Verificar cliente y código existente ANTES de actualizar
        const client = await clientsModel.findById(clientId);
        if (!client) {
            console.log('Error: Cliente no encontrado');
            return res.status(404).json({
                success: false,
                message: "Cliente no encontrado"
            });
        }

        const currentCode = client.ruletaCodes.find(code =>
            code.codeId === codeId
        );

        if (!currentCode) {
            console.log('Error: Código no encontrado');
            console.log('Códigos disponibles:', client.ruletaCodes.map(c => ({
                codeId: c.codeId,
                status: c.status
            })));
            return res.status(404).json({
                success: false,
                message: "Código promocional no encontrado"
            });
        }

        console.log('Código actual antes de actualización:', {
            codeId: currentCode.codeId,
            code: currentCode.code,
            status: currentCode.status,
            expiresAt: currentCode.expiresAt
        });

        if (currentCode.status !== 'active') {
            console.log('Error: Código no está activo:', currentCode.status);
            return res.status(400).json({
                success: false,
                message: `El código no está disponible. Estado: ${currentCode.status}`
            });
        }

        // PASO 3: Verificar expiración
        const now = new Date();
        if (currentCode.expiresAt && now > new Date(currentCode.expiresAt)) {
            console.log('Error: Código expirado');

            // Marcar como expirado primero
            await clientsModel.findByIdAndUpdate(
                clientId,
                {
                    $set: {
                        "ruletaCodes.$[elem].status": "expired"
                    }
                },
                {
                    arrayFilters: [{ "elem.codeId": codeId }]
                }
            );

            return res.status(400).json({
                success: false,
                message: "El código promocional ha expirado"
            });
        }

        console.log('Código válido, procediendo a actualizar...');

        const updateResult = await clientsModel.findOneAndUpdate(
            {
                _id: clientId,
                'ruletaCodes': {
                    $elemMatch: {
                        'codeId': codeId,
                        'status': 'active'
                    }
                }
            },
            {
                $set: {
                    "ruletaCodes.$.status": "used",
                    "ruletaCodes.$.usedAt": now,
                    "ruletaCodes.$.usedInOrderId": processedOrderId
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updateResult) {
            console.log('Primera estrategia falló, intentando estrategia alternativa...');

            const codeIndex = client.ruletaCodes.findIndex(code =>
                code.codeId === codeId && code.status === 'active'
            );

            if (codeIndex === -1) {
                return res.status(400).json({
                    success: false,
                    message: "Código no encontrado o ya no está activo"
                });
            }

            const alternativeUpdate = await clientsModel.findByIdAndUpdate(
                clientId,
                {
                    $set: {
                        [`ruletaCodes.${codeIndex}.status`]: "used",
                        [`ruletaCodes.${codeIndex}.usedAt`]: now,
                        [`ruletaCodes.${codeIndex}.usedInOrderId`]: processedOrderId
                    }
                },
                {
                    new: true,
                    runValidators: true
                }
            );

            if (!alternativeUpdate) {
                console.log('Error: Ambas estrategias fallaron');
                return res.status(500).json({
                    success: false,
                    message: "Error al actualizar el código en la base de datos"
                });
            }

            console.log('Actualización exitosa con estrategia alternativa');
            var finalResult = alternativeUpdate;
        } else {
            console.log('Actualización exitosa con primera estrategia');
            var finalResult = updateResult;
        }

        // PASO 5: Verificar resultado final
        const updatedCode = finalResult.ruletaCodes.find(code =>
            code.codeId === codeId
        );

        console.log('Código después de actualización:', {
            codeId: updatedCode?.codeId,
            newStatus: updatedCode?.status,
            usedAt: updatedCode?.usedAt,
            orderId: updatedCode?.usedInOrderId
        });

        if (!updatedCode || updatedCode.status !== 'used') {
            console.log('VERIFICACIÓN FALLÓ: El código no se actualizó correctamente');
            return res.status(500).json({
                success: false,
                message: "Error en la verificación: código no se marcó como usado"
            });
        }

        console.log('SUCCESS: Código marcado como usado exitosamente');

        res.status(200).json({
            success: true,
            message: "Código promocional marcado como usado exitosamente",
            usedCode: {
                codeId: updatedCode.codeId,
                code: updatedCode.code,
                name: updatedCode.name,
                discount: updatedCode.discount,
                usedAt: updatedCode.usedAt,
                orderId: updatedCode.usedInOrderId,
                previousStatus: 'active',
                newStatus: 'used'
            },
            debug: {
                clientId: clientId,
                updateTimestamp: now.toISOString(),
                strategy: updateResult ? 'primary' : 'alternative'
            }
        });

    } catch (error) {
        console.error('ERROR CRÍTICO en usePromotionalCode:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message,
        });
    }
};

clientsController.addToFavorites = async (req, res) => {
    try {
        console.log('=== INICIO addToFavorites ===');
        console.log('User ID del token:', req.user?.id);
        console.log('Datos recibidos:', req.body);

        const userId = req.user?.id;
        const { productId } = req.body;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Usuario no autenticado"
            });
        }

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "ID del producto es requerido"
            });
        }

        // Buscar el cliente
        const client = await clientsModel.findById(userId);
        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        // Verificar si ya está en favoritos
        const isAlreadyFavorite = client.favorites.some(
            fav => fav.productId.toString() === productId
        );

        if (isAlreadyFavorite) {
            return res.status(400).json({
                success: false,
                message: "El producto ya está en favoritos"
            });
        }

        // Agregar a favoritos
        client.favorites.push({ productId });
        await client.save();

        // Poblar los favoritos después de guardar
        await client.populate('favorites.productId');

        console.log('Producto agregado a favoritos exitosamente:', productId);

        // Configurar cookies con configuración dinámica
        const cookieConfig = getCookieConfig();
        const currentToken = req.cookies?.authToken || 'session_maintained';
        res.cookie("authToken", currentToken, cookieConfig);

        res.status(200).json({
            success: true,
            message: "Producto agregado a favoritos exitosamente",
            token: currentToken,
            favorites: client.favorites
        });

    } catch (error) {
        console.error('Error en addToFavorites:', error);
        
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al agregar a favoritos",
            error: error.message
        });
    }
};

clientsController.getClientPromotionalCodes = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { status } = req.query;

        const client = await clientsModel.findById(clientId).select('ruletCodes');
        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Cliente no encontrado"
            });
        }

        let filteredCodes = client.ruletaCodes;
        if (status) {
            filteredCodes = client.ruletaCodes.filter(code => code.status === status);
        }

        const now = new Date();
        const expiredCodes = filteredCodes.filter(code =>
            code.status === 'active' && code.expiresAt < now
        );

        if (expiredCodes.length > 0) {
            await clientsModel.findByIdAndUpdate(
                clientId,
                {
                    $set: {
                        "ruletaCodes.$[elem].status": "expired"
                    }
                },
                {
                    arrayFilters: [{
                        "elem.status": "active",
                        "elem.expiresAt": { $lt: now }
                    }]
                }
            );

            filteredCodes = filteredCodes.map(code => ({
                ...code.toObject(),
                status: code.expiresAt < now ? 'expired' : code.status
            }));
        }

        const formattedCodes = filteredCodes.map(code => ({
            codeId: code.codeId,
            code: code.code,
            name: code.name,
            discount: code.discount,
            color: code.color,
            textColor: code.textColor,
            status: code.status,
            createdAt: code.createdAt,
            expiresAt: code.expiresAt,
            usedAt: code.usedAt || null,
            usedInOrderId: code.usedInOrderId || null
        }));

        res.status(200).json({
            success: true,
            message: "Códigos promocionales obtenidos exitosamente",
            codes: formattedCodes,
            total: formattedCodes.length,
            activeCount: formattedCodes.filter(c => c.status === 'active').length,
            usedCount: formattedCodes.filter(c => c.status === 'used').length,
            expiredCount: formattedCodes.filter(c => c.status === 'expired').length
        });
    } catch (error) {
        console.error('Error obteniendo códigos promocionales: ', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

/**
 * Obtener favoritos del usuario
 */
clientsController.getFavorites = async (req, res) => {
    try {
        console.log('=== INICIO getFavorites ===');
        console.log('User ID del token:', req.user?.id);

        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Usuario no autenticado"
            });
        }

        // Buscar el cliente y poblar los favoritos
        const client = await clientsModel.findById(userId).populate('favorites.productId');
        
        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        // Configurar cookies con configuración dinámica
        const cookieConfig = getCookieConfig();
        const currentToken = req.cookies?.authToken || 'session_maintained';
        res.cookie("authToken", currentToken, cookieConfig);

        console.log('Favoritos encontrados:', client.favorites.length);

        return res.status(200).json({
            success: true,
            message: "Favoritos obtenidos exitosamente",
            token: currentToken,
            favorites: client.favorites,
            user: {
                id: client._id,
                name: client.fullName,
                email: client.email,
                phone: client.phone,
                address: client.address,
                birthDate: client.birthDate,
                profilePicture: client.profilePicture,
                favorites: client.favorites,
                discount: client.discount
            }
        });

    } catch (error) {
        console.error('Error en getFavorites:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener favoritos",
            error: error.message
        });
    }
};
/**
 * Remover de favoritos
 */
clientsController.removeFromFavorites = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { productId } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Usuario no autenticado"
            });
        }

        const client = await clientsModel.findById(userId);
        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        const favoriteIndex = client.favorites.findIndex(
            fav => fav.productId.toString() === productId
        );

        if (favoriteIndex === -1) {
            return res.status(400).json({
                success: false,
                message: "El producto no está en favoritos"
            });
        }

        client.favorites.splice(favoriteIndex, 1);
        await client.save();

        // Poblar favoritos restantes
        await client.populate('favorites.productId');

        const { token } = getTokenFromRequest(req);
        const currentToken = token || 'session_maintained';
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", currentToken, cookieConfig);

        res.status(200).json({
            success: true,
            message: "Producto removido de favoritos",
            token: currentToken,
            favorites: client.favorites
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al remover de favoritos",
            error: error.message
        });
    }
};

/**
 * Toggle favorito
 */
clientsController.toggleFavorite = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { productId } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Usuario no autenticado"
            });
        }

        const client = await clientsModel.findById(userId);
        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        const favoriteIndex = client.favorites.findIndex(
            fav => fav.productId.toString() === productId
        );

        let action = '';
        if (favoriteIndex === -1) {
            client.favorites.push({ productId });
            action = 'added';
        } else {
            client.favorites.splice(favoriteIndex, 1);
            action = 'removed';
        }

        await client.save();
        
        // Poblar favoritos después de guardar
        await client.populate('favorites.productId');

        const { token } = getTokenFromRequest(req);
        const currentToken = token || 'session_maintained';
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", currentToken, cookieConfig);

        res.status(200).json({
            success: true,
            message: `Producto ${action === 'added' ? 'agregado a' : 'removido de'} favoritos`,
            action,
            token: currentToken,
            favorites: client.favorites
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al modificar favoritos",
            error: error.message
        });
    }
};

/**
 * Generar código de ruleta
 */
clientsController.generateRuletaCode = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { discount, name, color, textColor, expiresInDays = 30 } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Usuario no autenticado"
            });
        }

        const client = await clientsModel.findById(userId);
        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        const newCode = {
            codeId: new mongoose.Types.ObjectId().toString(),
            code: Math.random().toString(36).substring(2, 10).toUpperCase(),
            name: name || `Descuento ${discount}%`,
            discount: discount || 10,
            color: color || '#FF6B6B',
            textColor: textColor || '#FFFFFF',
            status: 'active',
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + (expiresInDays * 24 * 60 * 60 * 1000))
        };

        if (!client.ruletaCodes) {
            client.ruletaCodes = [];
        }

        client.ruletaCodes.push(newCode);
        await client.save();

        const { token } = getTokenFromRequest(req);
        const currentToken = token || 'session_maintained';
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", currentToken, cookieConfig);

        res.status(201).json({
            success: true,
            message: "Código de ruleta generado exitosamente",
            code: newCode,
            token: currentToken
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al generar código de ruleta",
            error: error.message
        });
    }
};

/**
 * Obtener códigos de ruleta del usuario
 */
clientsController.getUserRuletaCodes = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Usuario no autenticado"
            });
        }

        const client = await clientsModel.findById(userId);
        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        const { token } = getTokenFromRequest(req);
        const currentToken = token || 'session_maintained';
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", currentToken, cookieConfig);

        res.status(200).json({
            success: true,
            codes: client.ruletaCodes || [],
            token: currentToken
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener códigos de ruleta",
            error: error.message
        });
    }
};

/**
 * Usar código de ruleta
 */
clientsController.useRuletaCode = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { codeId, orderId } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Usuario no autenticado"
            });
        }

        const client = await clientsModel.findById(userId);
        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        const codeIndex = client.ruletaCodes.findIndex(
            code => code.codeId === codeId && code.status === 'active'
        );

        if (codeIndex === -1) {
            return res.status(400).json({
                success: false,
                message: "Código no encontrado o ya utilizado"
            });
        }

        client.ruletaCodes[codeIndex].status = 'used';
        client.ruletaCodes[codeIndex].usedAt = new Date();
        client.ruletaCodes[codeIndex].usedInOrderId = orderId;

        await client.save();

        const { token } = getTokenFromRequest(req);
        const currentToken = token || 'session_maintained';
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", currentToken, cookieConfig);

        res.status(200).json({
            success: true,
            message: "Código usado exitosamente",
            token: currentToken
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al usar código de ruleta",
            error: error.message
        });
    }
};
// Exportamos el controller para poder usarlo en las rutas
export default clientsController;
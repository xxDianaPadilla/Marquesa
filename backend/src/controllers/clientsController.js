// Importé el modelo de clientes para trabajar con la base de datos
import clientsModel from "../models/Clients.js";

// Importé Cloudinary para manejar imágenes y configuraciones
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";

// Configuración de Cloudinary con las credenciales del archivo de configuración
cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.cloudinary_api_key,
    api_secret: config.cloudinary.cloudinary_api_secret
});

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

        const { phone, address, fullName } = req.body;

        // Validaciones
        if (!phone || !phone.trim()) {
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

        // Formatear teléfono
        const formattedPhone = phoneClean.slice(0, 4) + "-" + phoneClean.slice(4);

        if (!address || !address.trim()) {
            return res.status(400).json({
                success: false,
                message: "La dirección es requerida"
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

        // Validar longitud de dirección
        if (address.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: "La dirección debe tener al menos 10 caracteres"
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

        // Preparar datos para actualizar
        const updateData = {
            phone: formattedPhone,
            address: address.trim()
        };

        // Agregar el nombre a los datos de actualización si se proporcionó
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

        // Actualizar cliente
        const updatedClient = await clientsModel.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password'); // No devolver la contraseña

        console.log('Cliente actualizado exitosamente');

        res.status(200).json({
            success: true,
            message: "Perfil actualizado exitosamente",
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

// NUEVA FUNCIÓN: Generar código de descuento de la ruleta
clientsController.generateRuletaCode = async (req, res) => {
    try {
        console.log('=== INICIO generateRuletaCode ===');
        console.log('User ID del token:', req.user?.id);

        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Usuario no autenticado"
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

        // Verificar códigos activos (máximo 10 códigos activos)
        const activeCodes = client.ruletaCodes ? client.ruletaCodes.filter(code => code.status === 'active') : [];
        
        if (activeCodes.length >= 10) {
            return res.status(400).json({
                success: false,
                message: "Has alcanzado el máximo de códigos activos (10). Utiliza tus códigos existentes o espera a que se caduquen para obtener nuevos."
            });
        }

        // Códigos de descuento disponibles con colores
        const discountOptions = [
            { 
                name: 'Verano 2025', 
                discount: '25% OFF', 
                color: '#FADDDD',
                textColor: '#374151'
            },
            { 
                name: 'Ruleta marquesa', 
                discount: '20% OFF', 
                color: '#E8ACD2',
                textColor: '#FFFFFF'
            },
            { 
                name: 'Primavera 2025', 
                discount: '15% OFF', 
                color: '#C6E2C6',
                textColor: '#374151'
            },
            { 
                name: 'Flores especiales', 
                discount: '30% OFF', 
                color: '#FADDDD',
                textColor: '#374151'
            },
            { 
                name: 'Giftbox deluxe', 
                discount: '18% OFF', 
                color: '#E8ACD2',
                textColor: '#FFFFFF'
            },
            { 
                name: 'Cuadros únicos', 
                discount: '22% OFF', 
                color: '#C6E2C6',
                textColor: '#374151'
            }
        ];

        // Seleccionar un código aleatorio
        const randomIndex = Math.floor(Math.random() * discountOptions.length);
        const selectedDiscount = discountOptions[randomIndex];

        // Generar código único de 6 dígitos
        const generateUniqueCode = () => {
            return Math.floor(100000 + Math.random() * 900000).toString();
        };

        let uniqueCode = generateUniqueCode();
        
        // Verificar que el código no exista en los códigos del usuario
        while (client.ruletaCodes && client.ruletaCodes.some(code => code.code === uniqueCode)) {
            uniqueCode = generateUniqueCode();
        }

        // Crear el nuevo código con fecha de expiración (30 días)
        const newCode = {
            codeId: `${userId}_${Date.now()}_${uniqueCode}`,
            code: uniqueCode,
            name: selectedDiscount.name,
            discount: selectedDiscount.discount,
            color: selectedDiscount.color,
            textColor: selectedDiscount.textColor,
            status: 'active',
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)) // 30 días
        };

        // Inicializar ruletaCodes si no existe
        if (!client.ruletaCodes) {
            client.ruletaCodes = [];
        }

        // Agregar el nuevo código
        client.ruletaCodes.push(newCode);

        // Guardar cambios
        await client.save();

        console.log('Código de ruleta generado exitosamente:', newCode.code);

        res.status(200).json({
            success: true,
            message: "Código de descuento generado exitosamente",
            code: {
                code: newCode.code,
                name: newCode.name,
                discount: newCode.discount,
                color: newCode.color,
                textColor: newCode.textColor,
                expiresAt: newCode.expiresAt
            }
        });

    } catch (error) {
        console.error('Error en generateRuletaCode:', error);
        
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al generar código de descuento",
            error: error.message
        });
    }
};

// NUEVA FUNCIÓN: Obtener códigos de descuento del usuario
clientsController.getUserRuletaCodes = async (req, res) => {
    try {
        console.log('=== INICIO getUserRuletaCodes ===');
        console.log('User ID del token:', req.user?.id);

        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Usuario no autenticado"
            });
        }

        // Buscar el cliente y actualizar códigos expirados
        const client = await clientsModel.findById(userId);
        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        // Actualizar códigos expirados
        if (client.ruletaCodes && client.ruletaCodes.length > 0) {
            const now = new Date();
            let hasUpdates = false;

            client.ruletaCodes.forEach(code => {
                if (code.status === 'active' && code.expiresAt < now) {
                    code.status = 'expired';
                    hasUpdates = true;
                }
            });

            if (hasUpdates) {
                await client.save();
            }
        }

        // Obtener códigos ordenados por fecha de creación (más recientes primero)
        const allCodes = client.ruletaCodes || [];
        allCodes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Filtrar códigos para mostrar (máximo 10)
        // Priorizar códigos activos, luego recientes utilizados/expirados
        const activeCodes = allCodes.filter(code => code.status === 'active');
        const inactiveCodes = allCodes.filter(code => code.status !== 'active');
        
        const codesToShow = [...activeCodes, ...inactiveCodes].slice(0, 10);

        // Formatear códigos para respuesta
        const formattedCodes = codesToShow.map(code => ({
            codeId: code.codeId,
            code: code.code,
            name: code.name,
            discount: code.discount,
            color: code.color,
            textColor: code.textColor,
            status: code.status,
            createdAt: code.createdAt,
            expiresAt: code.expiresAt,
            usedAt: code.usedAt,
            usedInOrderId: code.usedInOrderId
        }));

        console.log(`Códigos de ruleta obtenidos: ${formattedCodes.length} de ${allCodes.length} totales`);

        res.status(200).json({
            success: true,
            codes: formattedCodes,
            totalCodes: allCodes.length,
            activeCodes: activeCodes.length,
            maxActiveAllowed: 10
        });

    } catch (error) {
        console.error('Error en getUserRuletaCodes:', error);
        
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener códigos de descuento",
            error: error.message
        });
    }
};

// NUEVA FUNCIÓN: Marcar código como utilizado
clientsController.useRuletaCode = async (req, res) => {
    try {
        console.log('=== INICIO useRuletaCode ===');
        console.log('User ID del token:', req.user?.id);
        console.log('Datos recibidos:', req.body);

        const userId = req.user?.id;
        const { code, orderId } = req.body;
        
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

        // Buscar el código en los códigos del usuario
        const codeIndex = client.ruletaCodes ? client.ruletaCodes.findIndex(
            ruletaCode => ruletaCode.code === code && ruletaCode.status === 'active'
        ) : -1;

        if (codeIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Código no encontrado, ya utilizado o expirado"
            });
        }

        // Verificar que el código no haya expirado
        if (client.ruletaCodes[codeIndex].expiresAt < new Date()) {
            // Marcar como expirado
            client.ruletaCodes[codeIndex].status = 'expired';
            await client.save();
            
            return res.status(400).json({
                success: false,
                message: "El código ha expirado"
            });
        }

        // Marcar el código como utilizado
        client.ruletaCodes[codeIndex].status = 'used';
        client.ruletaCodes[codeIndex].usedAt = new Date();
        if (orderId) {
            client.ruletaCodes[codeIndex].usedInOrderId = orderId;
        }

        await client.save();

        console.log('Código marcado como utilizado exitosamente:', code);

        res.status(200).json({
            success: true,
            message: "Código utilizado exitosamente",
            code: client.ruletaCodes[codeIndex]
        });

    } catch (error) {
        console.error('Error en useRuletaCode:', error);
        
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al utilizar código de descuento",
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

        res.status(200).json({
            success: true,
            message: "Código válido",
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

// Exportamos el controller para poder usarlo en las rutas
export default clientsController;
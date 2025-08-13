import shoppingCartModel from "../models/ShoppingCart.js";
import mongoose from "mongoose";
 
// Función helper para configuración dinámica de cookies basada en el entorno
const getCookieConfig = () => {
    const isProduction = process.env.NODE_ENV === 'production';
   
    // ✅ CORRECCIÓN CRÍTICA: Configuración específica para Render + Vercel
    if (isProduction) {
        return {
            httpOnly: false, // Permitir acceso desde JavaScript (crítico para cross-domain)
            secure: true, // HTTPS obligatorio en producción
            sameSite: 'none', // Permitir cookies cross-domain
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días (más duradero)
            domain: undefined, // No especificar domain para cross-domain
            path: '/'
        };
    } else {
        // Configuración para desarrollo local
        return {
            httpOnly: false,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
            domain: undefined,
            path: '/'
        };
    }
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
 
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};
 
const calculateCartTotal = (items) => {
    return items.reduce((total, item) => total + item.subtotal, 0);
};
 
const shoppingCartController = {};
 
/**
 * Obtenemos todos los carritos
 * Implementa configuración de cookies cross-domain
 */
shoppingCartController.getShoppingCarts = async (req, res) => {
    try {
        const carts = await shoppingCartModel.find()
            .populate('clientId')
            .populate({
                path: 'items.itemId',
                refPath: 'items.itemTypeRef'
            });
 
        // Configurar cookies con configuración dinámica cross-domain
        const { token } = getTokenFromRequest(req);
        if (token) {
            const cookieConfig = getCookieConfig();
            res.cookie("authToken", token, cookieConfig);
        }
 
        res.status(200).json({
            success: true,
            data: carts,
            token: token || 'session_maintained' // También en el body para mayor compatibilidad
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener carritos",
            error: error.message
        });
    }
};
 
/**
 * Obtenemos carrito por ID
 * Implementa configuración de cookies cross-domain
 */
shoppingCartController.getShoppingCartById = async (req, res) => {
    try {
        const cart = await shoppingCartModel.findById(req.params.id)
            .populate('clientId')
            .populate({
                path: 'items.itemId',
                refPath: 'items.itemTypeRef'
            });
 
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Carrito no encontrado"
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
            data: cart,
            token: token || 'session_maintained' // También en el body para mayor compatibilidad
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener carrito",
            error: error.message
        });
    }
};
 
/**
 * Obtenemos carrito por cliente
 * Implementa configuración de cookies cross-domain y verificación híbrida
 */
shoppingCartController.getShoppingCartByClient = async (req, res) => {
    try {
        const { clientId } = req.params;
 
        // Validaciones
        if (!clientId) {
            return res.status(400).json({
                success: false,
                message: "clientId es requerido",
                error: "Missing clientId parameter"
            });
        }
 
        // CAMBIO CLAVE: Solo buscar carritos activos
        const cart = await shoppingCartModel.findOne({
            clientId: clientId,
            status: 'Activo'  // Solo carritos activos
        }).populate('items.itemId');
 
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "No se encontró carrito activo para este cliente"
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
            message: "Carrito obtenido exitosamente",
            shoppingCart: cart,
            token: token || 'session_maintained' // También en el body para mayor compatibilidad
        });
 
    } catch (error) {
        console.error('Error al obtener carrito por cliente:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};
 
/**
 * Creamos nuevo carrito
 * Implementa configuración de cookies cross-domain
 */
shoppingCartController.createShoppingCart = async (req, res) => {
    try {
        const { clientId, items, promotionalCode, total } = req.body;
 
        // Validación: clientId es requerido
        if (!clientId) {
            return res.status(400).json({
                success: false,
                message: "El ID del cliente es requerido",
                error: "clientId is required"
            });
        }
 
        // Validación: items es requerido y debe ser un array
        if (!items) {
            return res.status(400).json({
                success: false,
                message: "Los items son requeridos",
                error: "items is required"
            });
        }
 
        if (!Array.isArray(items)) {
            return res.status(400).json({
                success: false,
                message: "Los items deben ser un array",
                error: "items must be an array"
            });
        }
 
        // Validación: items no puede estar vacío
        if (items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "El carrito debe contener al menos un item",
                error: "items array cannot be empty"
            });
        }
 
        // Validación: cada item debe tener productId y quantity
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
 
            if (!item.productId) {
                return res.status(400).json({
                    success: false,
                    message: `El item en la posición ${i} debe tener un productId`,
                    error: `items[${i}].productId is required`
                });
            }
 
            if (!item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `El item en la posición ${i} debe tener una quantity`,
                    error: `items[${i}].quantity is required`
                });
            }
 
            if (typeof item.quantity !== 'number' || item.quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: `La cantidad del item en la posición ${i} debe ser un número mayor a 0`,
                    error: `items[${i}].quantity must be a positive number`
                });
            }
        }
 
        // Validación: total es requerido
        if (total === undefined || total === null) {
            return res.status(400).json({
                success: false,
                message: "El total es requerido",
                error: "total is required"
            });
        }
 
        // Validación: total debe ser un número válido
        if (typeof total !== 'number' || isNaN(total)) {
            return res.status(400).json({
                success: false,
                message: "El total debe ser un número válido",
                error: "total must be a valid number"
            });
        }
 
        // Validación: total debe ser mayor o igual a 0
        if (total < 0) {
            return res.status(400).json({
                success: false,
                message: "El total no puede ser negativo",
                error: "total cannot be negative"
            });
        }
 
        // Validación: promotionalCode (opcional) debe ser string si se proporciona
        if (promotionalCode !== undefined && promotionalCode !== null && typeof promotionalCode !== 'string') {
            return res.status(400).json({
                success: false,
                message: "El código promocional debe ser una cadena de texto",
                error: "promotionalCode must be a string"
            });
        }
 
        // Si todas las validaciones pasan, crear el carrito
        const newCart = new shoppingCartModel({
            clientId,
            items,
            promotionalCode,
            total
        });
 
        await newCart.save();
 
        // Configurar cookies con configuración dinámica cross-domain
        const { token } = getTokenFromRequest(req);
        const currentToken = token || 'session_maintained';
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", currentToken, cookieConfig);
 
        res.status(201).json({
            success: true,
            message: "Carrito creado exitosamente",
            cart: newCart,
            token: currentToken // También en el body para mayor compatibilidad
        });
 
    } catch (error) {
        // Manejo de errores específicos de MongoDB/Mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Error de validación en el modelo",
                error: error.message
            });
        }
 
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Conflicto: el carrito ya existe",
                error: "Duplicate key error"
            });
        }
 
        // Error genérico del servidor
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al crear carrito",
            error: error.message
        });
    }
};
 
/**
 * Actualizar cantidad de item específico
 * Implementa configuración de cookies cross-domain
 */
shoppingCartController.updateItemQuantity = async (req, res) => {
    try {
        const { clientId, itemId, quantity } = req.body;
 
        // Validaciones básicas
        if (!clientId || !itemId || !quantity) {
            return res.status(400).json({
                success: false,
                message: "ClientId, itemId y quantity son requeridos"
            });
        }
 
        // Validar ObjectIds
        if (!isValidObjectId(clientId) || !isValidObjectId(itemId)) {
            return res.status(400).json({
                success: false,
                message: "IDs inválidos proporcionados"
            });
        }
 
        // Validar quantity
        const qty = parseInt(quantity);
        if (isNaN(qty) || qty < 1 || qty > 99) {
            return res.status(400).json({
                success: false,
                message: "La cantidad debe ser un número entre 1 y 99"
            });
        }
 
        // Buscar el carrito del cliente
        const cart = await shoppingCartModel.findOne({ clientId })
            .populate('items.itemId');
 
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Carrito no encontrado para este cliente"
            });
        }
 
        // Buscar el item en el carrito
        const itemIndex = cart.items.findIndex(item =>
            item.itemId._id.toString() === itemId.toString()
        );
 
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Producto no encontrado en el carrito"
            });
        }
 
        // Actualizar la cantidad y el subtotal
        const item = cart.items[itemIndex];
        const itemPrice = item.itemId.price;
 
        cart.items[itemIndex].quantity = qty;
        cart.items[itemIndex].subtotal = itemPrice * qty;
 
        // Recalcular el total del carrito
        cart.total = calculateCartTotal(cart.items);
 
        // Guardar los cambios
        await cart.save();
 
        // Poblar el carrito actualizado para la respuesta
        await cart.populate('items.itemId');
 
        // Configurar cookies con configuración dinámica cross-domain
        const { token } = getTokenFromRequest(req);
        const currentToken = token || 'session_maintained';
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", currentToken, cookieConfig);
 
        res.status(200).json({
            success: true,
            message: "Cantidad actualizada correctamente",
            shoppingCart: cart,
            updatedItem: {
                itemId: item.itemId._id,
                quantity: qty,
                subtotal: itemPrice * qty
            },
            token: currentToken // También en el body para mayor compatibilidad
        });
 
    } catch (error) {
        console.error('Error al actualizar cantidad:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al actualizar cantidad"
        });
    }
};
 
/**
 * Agregar item al carrito (versión nueva)
 * Implementa configuración de cookies cross-domain
 */
shoppingCartController.addItemToCartNew = async (req, res) => {
    try {
        const { clientId, itemId, quantity = 1, itemType = 'product' } = req.body;
 
        // Validaciones básicas
        if (!clientId || !itemId) {
            return res.status(400).json({
                success: false,
                message: "ClientId y itemId son requeridos"
            });
        }
 
        // Validar ObjectIds
        if (!isValidObjectId(clientId) || !isValidObjectId(itemId)) {
            return res.status(400).json({
                success: false,
                message: "IDs inválidos proporcionados"
            });
        }
 
        // Validar quantity
        const qty = parseInt(quantity);
        if (isNaN(qty) || qty < 1 || qty > 99) {
            return res.status(400).json({
                success: false,
                message: "La cantidad debe ser un número entre 1 y 99"
            });
        }
 
        // Validar itemType
        if (!['product', 'custom'].includes(itemType)) {
            return res.status(400).json({
                success: false,
                message: "itemType debe ser 'product' o 'custom'"
            });
        }
 
        // Determinar la colección de referencia
        const itemTypeRef = itemType === 'product' ? 'products' : 'CustomProducts';
 
        // Buscar el producto para obtener el precio
        let productModel;
        let product;
 
        try {
            if (itemType === 'product') {
                // Para productos normales, usar el modelo de productos
                const { default: productsModel } = await import('../models/products.js');
                product = await productsModel.findById(itemId);
            } else {
                // Para productos personalizados, usar el modelo de CustomProducts
                const { default: customProductsModel } = await import('../models/CustomProducts.js');
                product = await customProductsModel.findById(itemId);
            }
        } catch (error) {
            console.error('Error loading model or finding product:', error);
            return res.status(400).json({
                success: false,
                message: "Error al buscar el producto",
                debug: error.message
            });
        }
 
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Producto no encontrado"
            });
        }
 
        // Calcular subtotal
        if (!product) {
            return res.status(404).json({
                success: false,
                message: itemType === 'product' ? "Producto no encontrado" : "Producto personalizado no encontrado",
                debug: {
                    itemId,
                    itemType,
                    itemTypeRef
                }
            });
        }
 
        // Calcular subtotal - manejar diferentes estructuras de precio
        let productPrice;
        if (itemType === 'product') {
            productPrice = product.price;
        } else {
            // Para productos personalizados, el precio está en 'totalPrice'
            productPrice = product.totalPrice;
        }
 
        if (!productPrice || productPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: "Precio del producto no válido",
                debug: {
                    itemType,
                    productPrice: productPrice,
                    product: product
                }
            });
        }
 
        const subtotal = productPrice * qty;
 
       
        // CAMBIO CLAVE: Buscar solo el carrito ACTIVO del cliente
        let cart = await shoppingCartModel.findOne({
            clientId,
            status: 'Activo'  // Solo carritos activos
        });
 
        if (!cart) {
            // Crear un nuevo carrito ACTIVO
            cart = new shoppingCartModel({
                clientId,
                items: [],
                total: 0,
                status: 'Activo'  // Asegurar que el nuevo carrito sea activo
            });
        }
 
        // Verificar si el item ya existe en el carrito
        const existingItemIndex = cart.items.findIndex(item =>
            item.itemId.toString() === itemId.toString() && item.itemType === itemType
        );
 
        if (existingItemIndex !== -1) {
            // Actualizar cantidad si el item ya existe
            const newQuantity = cart.items[existingItemIndex].quantity + qty;
 
            if (newQuantity > 99) {
                return res.status(400).json({
                    success: false,
                    message: "La cantidad total no puede exceder 99 unidades"
                });
            }
 
            cart.items[existingItemIndex].quantity = newQuantity;
            cart.items[existingItemIndex].subtotal = product.price * newQuantity;
        } else {
            // Agregar nuevo item al carrito
            cart.items.push({
                itemType,
                itemId,
                itemTypeRef,
                quantity: qty,
                subtotal
            });
        }
 
        // Recalcular el total del carrito
        cart.total = calculateCartTotal(cart.items);
 
        // Guardar los cambios
        await cart.save();
 
        // Poblar el carrito para la respuesta
        await cart.populate('items.itemId');
 
        // Configurar cookies con configuración dinámica cross-domain
        const { token } = getTokenFromRequest(req);
        const currentToken = token || 'session_maintained';
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", currentToken, cookieConfig);
 
        res.status(200).json({
            success: true,
            message: "Producto agregado al carrito correctamente",
            shoppingCart: cart,
            addedItem: {
                itemId,
                itemType,
                quantity: qty,
                subtotal
            },
            token: currentToken // También en el body para mayor compatibilidad
        });
 
    } catch (error) {
        console.error('Error al agregar item al carrito:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al agregar producto",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
 
/**
 * Remover item específico del carrito
 * Implementa configuración de cookies cross-domain
 */
shoppingCartController.removeSpecificItem = async (req, res) => {
    try {
        const { clientId, itemId } = req.body;
 
        // Validaciones básicas
        if (!clientId || !itemId) {
            return res.status(400).json({
                success: false,
                message: "ClientId y itemId son requeridos"
            });
        }
 
        // Validar ObjectIds
        if (!isValidObjectId(clientId) || !isValidObjectId(itemId)) {
            return res.status(400).json({
                success: false,
                message: "IDs inválidos proporcionados"
            });
        }
 
        // Buscar el carrito del cliente
        const cart = await shoppingCartModel.findOne({ clientId })
            .populate('items.itemId');
 
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Carrito no encontrado para este cliente"
            });
        }
 
        // Verificar que el item existe en el carrito
        const itemExists = cart.items.some(item =>
            item.itemId._id.toString() === itemId.toString()
        );
 
        if (!itemExists) {
            return res.status(404).json({
                success: false,
                message: "Producto no encontrado en el carrito"
            });
        }
 
        // Eliminar el item del carrito
        cart.items = cart.items.filter(item =>
            item.itemId._id.toString() !== itemId.toString()
        );
 
        // Recalcular el total del carrito
        cart.total = calculateCartTotal(cart.items);
 
        // Guardar los cambios
        await cart.save();
 
        // Poblar el carrito actualizado para la respuesta
        await cart.populate('items.itemId');
 
        // Configurar cookies con configuración dinámica cross-domain
        const { token } = getTokenFromRequest(req);
        const currentToken = token || 'session_maintained';
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", currentToken, cookieConfig);
 
        res.status(200).json({
            success: true,
            message: "Producto eliminado correctamente del carrito",
            shoppingCart: cart,
            removedItemId: itemId,
            token: currentToken // También en el body para mayor compatibilidad
        });
 
    } catch (error) {
        console.error('Error al eliminar item:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al eliminar producto",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
 
/**
 * Limpiar carrito después de compra
 * Implementa configuración de cookies cross-domain
 */
shoppingCartController.clearCartAfterPurchase = async (req, res) => {
    try {
        const { cartId } = req.params;
        const { userId } = req.body;
 
        // Validaciones
        if (!cartId || !userId) {
            return res.status(400).json({
                success: false,
                message: "cartId y userId son requeridos",
                error: "Missing required parameters"
            });
        }
 
        if (!mongoose.Types.ObjectId.isValid(cartId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "IDs no tienen formato válido",
                error: "Invalid ID format"
            });
        }
 
        // Buscar el carrito y verificar que pertenece al usuario
        const cart = await shoppingCartModel.findOne({
            _id: cartId,
            clientId: userId
        });
 
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Carrito no encontrado o no pertenece al usuario",
                error: "Cart not found"
            });
        }
 
        // Verificar que el carrito tiene items para limpiar
        if (cart.items.length === 0) {
            // Configurar cookies con configuración dinámica cross-domain
            const { token } = getTokenFromRequest(req);
            const currentToken = token || 'session_maintained';
            const cookieConfig = getCookieConfig();
            res.cookie("authToken", currentToken, cookieConfig);
 
            return res.status(200).json({
                success: true,
                message: "El carrito ya está vacío",
                cart,
                cleared: false,
                token: currentToken // También en el body para mayor compatibilidad
            });
        }
 
        // SOLUCIÓN: Marcar TODOS los carritos activos del usuario como completados
        await shoppingCartModel.updateMany(
            {
                clientId: userId,
                status: 'Activo'
            },
            {
                status: 'Completado',
                completedAt: new Date()
            }
        );
 
        // Verificar si ya existe un carrito activo después de la actualización
        let activeCart = await shoppingCartModel.findOne({
            clientId: userId,
            status: 'Activo'
        }).populate({
            path: 'items.itemId',
        });
 
        // Solo crear un nuevo carrito si no existe uno activo
        if (!activeCart) {
            activeCart = new shoppingCartModel({
                clientId: userId,
                items: [],
                total: 0,
                status: 'Activo',
                createdAt: new Date()
            });
            await activeCart.save();
        }
 
        // Configurar cookies con configuración dinámica cross-domain
        const { token } = getTokenFromRequest(req);
        const currentToken = token || 'session_maintained';
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", currentToken, cookieConfig);
 
        res.status(200).json({
            success: true,
            message: "Carrito limpiado después de compra exitosa",
            completedCartId: cartId,
            activeCart: activeCart,
            cleared: true,
            token: currentToken // También en el body para mayor compatibilidad
        });
 
    } catch (error) {
        console.error('Error al limpiar carrito después de compra:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};
 
/**
 * Obtener carrito activo del usuario
 * Implementa configuración de cookies cross-domain
 */
shoppingCartController.getActiveCart = async (req, res) => {
    try {
        const { userId } = req.params;
 
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "userId es requerido y debe tener formato válido",
                error: "Invalid user ID"
            });
        }
 
        // Buscar carrito activo del usuario
        let activeCart = await shoppingCartModel.findOne({
            clientId: userId,
            status: 'Activo'
        }).populate('items.itemId');
 
        // Si no existe, crear uno nuevo
        if (!activeCart) {
            activeCart = new shoppingCartModel({
                clientId: userId,
                items: [],
                total: 0,
                status: 'Activo',
                createdAt: new Date()
            });
            await activeCart.save();
        }
 
        // Configurar cookies con configuración dinámica cross-domain
        const { token } = getTokenFromRequest(req);
        const currentToken = token || 'session_maintained';
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", currentToken, cookieConfig);
 
        res.status(200).json({
            success: true,
            message: "Carrito activo obtenido exitosamente",
            cart: activeCart,
            token: currentToken // También en el body para mayor compatibilidad
        });
 
    } catch (error) {
        console.error('Error al obtener carrito activo:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};
 
/**
 * Limpiar carritos duplicados (ejecutar una sola vez)
 * Implementa configuración de cookies cross-domain
 */
shoppingCartController.cleanupDuplicateCarts = async (req, res) => {
    try {
        // Encontrar usuarios con múltiples carritos activos
        const duplicateCarts = await shoppingCartModel.aggregate([
            { $match: { status: 'Activo' } },
            {
                $group: {
                    _id: '$clientId',
                    count: { $sum: 1 },
                    carts: { $push: '$ROOT' }
                }
            },
            { $match: { count: { $gt: 1 } } }
        ]);
 
        let cleanedCount = 0;
 
        for (const userCarts of duplicateCarts) {
            // Ordenar por fecha de creación, mantener el más reciente
            const sortedCarts = userCarts.carts.sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );
 
            // Mantener solo el carrito más reciente, marcar otros como completados
            for (let i = 1; i < sortedCarts.length; i++) {
                await shoppingCartModel.updateOne(
                    { _id: sortedCarts[i]._id },
                    {
                        status: 'Completado',
                        completedAt: new Date()
                    }
                );
                cleanedCount++;
            }
        }
 
        // Configurar cookies con configuración dinámica cross-domain
        const { token } = getTokenFromRequest(req);
        const currentToken = token || 'session_maintained';
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", currentToken, cookieConfig);
 
        res.status(200).json({
            success: true,
            message: "Limpieza de carritos duplicados completada",
            cleanedCarts: cleanedCount,
            usersAffected: duplicateCarts.length,
            token: currentToken // También en el body para mayor compatibilidad
        });
 
    } catch (error) {
        console.error('Error en limpieza de carritos:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};
 
/**
 * Actualizar carrito completo
 */
shoppingCartController.updateShoppingCart = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
 
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de carrito inválido"
            });
        }
 
        const updatedCart = await shoppingCartModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('items.itemId');
 
        if (!updatedCart) {
            return res.status(404).json({
                success: false,
                message: "Carrito no encontrado"
            });
        }
 
        const { token } = getTokenFromRequest(req);
        const currentToken = token || 'session_maintained';
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", currentToken, cookieConfig);
 
        res.status(200).json({
            success: true,
            message: "Carrito actualizado exitosamente",
            cart: updatedCart,
            token: currentToken
        });
 
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar carrito",
            error: error.message
        });
    }
};
 
/**
 * Eliminar carrito
 */
shoppingCartController.deleteShoppingCart = async (req, res) => {
    try {
        const { id } = req.params;
 
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de carrito inválido"
            });
        }
 
        const deletedCart = await shoppingCartModel.findByIdAndDelete(id);
 
        if (!deletedCart) {
            return res.status(404).json({
                success: false,
                message: "Carrito no encontrado"
            });
        }
 
        const { token } = getTokenFromRequest(req);
        const currentToken = token || 'session_maintained';
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", currentToken, cookieConfig);
 
        res.status(200).json({
            success: true,
            message: "Carrito eliminado exitosamente",
            token: currentToken
        });
 
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar carrito",
            error: error.message
        });
    }
};
 
/**
 * Agregar item al carrito (formato original)
 */
shoppingCartController.addItemToCart = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { itemId, quantity = 1, itemType = 'product' } = req.body;
 
        // Reutilizar la lógica de addItemToCartNew
        req.body.clientId = clientId;
        return await shoppingCartController.addItemToCartNew(req, res);
 
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al agregar item al carrito",
            error: error.message
        });
    }
};
 
/**
 * Actualizar item del carrito
 */
shoppingCartController.updateCartItem = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { itemId, quantity } = req.body;
 
        // Reutilizar la lógica de updateItemQuantity
        req.body.clientId = clientId;
        return await shoppingCartController.updateItemQuantity(req, res);
 
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar item",
            error: error.message
        });
    }
};
 
/**
 * Remover item del carrito
 */
shoppingCartController.removeItemFromCart = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { itemId } = req.body;
 
        // Reutilizar la lógica de removeSpecificItem
        req.body.clientId = clientId;
        return await shoppingCartController.removeSpecificItem(req, res);
 
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al remover item",
            error: error.message
        });
    }
};
 
/**
 * Aplicar código promocional
 */
shoppingCartController.applyPromotionalCode = async (req, res) => {
    try {
        const { cartId } = req.params;
        const { promotionalCode } = req.body;
 
        if (!isValidObjectId(cartId)) {
            return res.status(400).json({
                success: false,
                message: "ID de carrito inválido"
            });
        }
 
        const cart = await shoppingCartModel.findById(cartId);
 
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Carrito no encontrado"
            });
        }
 
        // Aquí puedes agregar lógica para validar el código promocional
        cart.promotionalCode = promotionalCode;
        await cart.save();
 
        const { token } = getTokenFromRequest(req);
        const currentToken = token || 'session_maintained';
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", currentToken, cookieConfig);
 
        res.status(200).json({
            success: true,
            message: "Código promocional aplicado",
            cart,
            token: currentToken
        });
 
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al aplicar código promocional",
            error: error.message
        });
    }
};
 
// NOTA: Métodos adicionales como addItemToCart, updateCartItem, removeItemFromCart,
// applyPromotionalCode, updateShoppingCart, deleteShoppingCart también deben
// implementar getCookieConfig() y getTokenFromRequest() siguiendo el mismo patrón
// y agregar el token en el body de cada respuesta para compatibilidad cross-domain
 
export default shoppingCartController;
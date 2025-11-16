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

        // Logging detallado para debugging
        console.log('=== ADD ITEM TO CART DEBUG ===');
        console.log('Full request body:', JSON.stringify(req.body, null, 2));
        console.log('clientId details:', {
            value: clientId,
            type: typeof clientId,
            length: clientId?.length,
            stringValue: String(clientId),
            trimmed: String(clientId).trim()
        });
        console.log('itemId details:', {
            value: itemId,
            type: typeof itemId,
            length: itemId?.length,
            stringValue: String(itemId),
            trimmed: String(itemId).trim()
        });

        // Validaciones básicas
        if (!clientId || !itemId) {
            console.log('❌ Validación básica falló: clientId o itemId faltantes');
            return res.status(400).json({
                success: false,
                message: "ClientId y itemId son requeridos"
            });
        }

        // Limpiar y normalizar IDs antes de validar
        const cleanClientId = String(clientId).trim();
        const cleanItemId = String(itemId).trim();

        console.log('IDs limpiados:', {
            originalClientId: clientId,
            cleanClientId,
            originalItemId: itemId,
            cleanItemId
        });

        // Validar ObjectIds con IDs limpiados
        const clientIdValid = mongoose.Types.ObjectId.isValid(cleanClientId);
        const itemIdValid = mongoose.Types.ObjectId.isValid(cleanItemId);

        console.log('Validación de ObjectIds:', {
            clientIdValid,
            itemIdValid,
            cleanClientIdLength: cleanClientId.length,
            cleanItemIdLength: cleanItemId.length
        });

        if (!clientIdValid || !itemIdValid) {
            console.log('❌ Validación de ObjectId falló');
            console.log('Cliente ID:', cleanClientId, 'válido:', clientIdValid);
            console.log('Item ID:', cleanItemId, 'válido:', itemIdValid);

            return res.status(400).json({
                success: false,
                message: "IDs inválidos proporcionados",
                debug: {
                    originalClientId: clientId,
                    originalItemId: itemId,
                    cleanClientId,
                    cleanItemId,
                    clientIdValid,
                    itemIdValid,
                    clientIdLength: cleanClientId.length,
                    itemIdLength: cleanItemId.length
                }
            });
        }

        console.log('✅ Validaciones pasaron, continuando...');

        // Usar los IDs limpiados para el resto del proceso
        const processClientId = cleanClientId;
        const processItemId = cleanItemId;

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
        let product;

        try {
            if (itemType === 'product') {
                // Para productos normales, usar el modelo de productos
                const { default: productsModel } = await import('../models/products.js');
                product = await productsModel.findById(processItemId);
            } else {
                // Para productos personalizados, usar el modelo de CustomProducts
                const { default: customProductsModel } = await import('../models/CustomProducts.js');
                product = await customProductsModel.findById(processItemId);
                console.log('Producto personalizado encontrado:', product ? 'SÍ' : 'NO');
                if (product) {
                    console.log('Producto personalizado details:', {
                        id: product._id,
                        clientId: product.clientId,
                        totalPrice: product.totalPrice,
                        productToPersonalize: product.productToPersonalize
                    });
                }
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
            console.log('❌ Producto no encontrado');
            return res.status(404).json({
                success: false,
                message: itemType === 'product' ? "Producto no encontrado" : "Producto personalizado no encontrado",
                debug: {
                    processItemId,
                    itemType,
                    itemTypeRef
                }
            });
        }

        console.log('✅ Producto encontrado, continuando con el carrito...');

        // FIX: Calcular precio correcto según el tipo de producto
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

        // CAMBIO CLAVE: Buscar solo el carrito ACTIVO del cliente usando el ID limpiado
        let cart = await shoppingCartModel.findOne({
            clientId: processClientId,
            status: 'Activo'  // Solo carritos activos
        });

        if (!cart) {
            console.log('Creando nuevo carrito para cliente:', processClientId);
            // Crear un nuevo carrito ACTIVO
            cart = new shoppingCartModel({
                clientId: processClientId,
                items: [],
                total: 0,
                status: 'Activo'  // Asegurar que el nuevo carrito sea activo
            });
        } else {
            console.log('Carrito existente encontrado:', cart._id);
        }

        // Verificar si el item ya existe en el carrito usando IDs limpiados
        const existingItemIndex = cart.items.findIndex(item =>
            item.itemId.toString() === processItemId.toString() && item.itemType === itemType
        );

        if (existingItemIndex !== -1) {
            console.log('Item existente encontrado, actualizando cantidad...');
            // FIX: Actualizar cantidad usando productPrice en lugar de product.price
            const newQuantity = cart.items[existingItemIndex].quantity + qty;

            if (newQuantity > 99) {
                return res.status(400).json({
                    success: false,
                    message: "La cantidad total no puede exceder 99 unidades"
                });
            }

            cart.items[existingItemIndex].quantity = newQuantity;
            cart.items[existingItemIndex].subtotal = productPrice * newQuantity; // FIX: Usar productPrice
        } else {
            console.log('Agregando nuevo item al carrito...');
            // Agregar nuevo item al carrito usando IDs limpiados
            cart.items.push({
                itemType,
                itemId: processItemId,
                itemTypeRef,
                quantity: qty,
                subtotal // Ya calculado correctamente arriba
            });
        }

        // FIX: Mejorar el cálculo del total del carrito
        cart.total = cart.items.reduce((total, item) => total + item.subtotal, 0);

        // Guardar los cambios
        console.log('Guardando carrito...');
        await cart.save();
        console.log('✅ Carrito guardado exitosamente');

        // Poblar el carrito para la respuesta
        await cart.populate('items.itemId');

        // Configurar cookies con configuración dinámica cross-domain
        const { token } = getTokenFromRequest(req);
        const currentToken = token || 'session_maintained';
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", currentToken, cookieConfig);

        console.log('✅ Respuesta exitosa enviada');
        res.status(200).json({
            success: true,
            message: "Producto agregado al carrito correctamente",
            shoppingCart: cart,
            addedItem: {
                itemId: processItemId,
                itemType,
                quantity: qty,
                subtotal,
                productPrice // Agregar para debugging
            },
            token: currentToken // También en el body para mayor compatibilidad
        });

    } catch (error) {
        console.error('❌ Error al agregar item al carrito:', error);
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
        console.log('🗑️ === BACKEND: removeSpecificItem ===');
        console.log('Request method:', req.method);
        console.log('Request body:', req.body);
        console.log('Request params:', req.params);

        const { clientId, itemId } = req.body;

        // Log para debugging
        console.log('ClientId recibido:', clientId);
        console.log('ItemId recibido:', itemId);

        // Validaciones básicas
        if (!clientId || !itemId) {
            console.log('❌ Faltan clientId o itemId');
            return res.status(400).json({
                success: false,
                message: "ClientId y itemId son requeridos",
                received: { clientId, itemId }
            });
        }

        // Validar ObjectIds
        if (!isValidObjectId(clientId) || !isValidObjectId(itemId)) {
            console.log('❌ IDs inválidos');
            return res.status(400).json({
                success: false,
                message: "IDs inválidos proporcionados",
                received: { clientId, itemId }
            });
        }

        // Buscar el carrito del cliente
        console.log('🔍 Buscando carrito para cliente:', clientId);
        const cart = await shoppingCartModel.findOne({
            clientId,
            status: 'Activo' // ✅ IMPORTANTE: Solo carritos activos
        }).populate('items.itemId');

        if (!cart) {
            console.log('❌ Carrito no encontrado');
            return res.status(404).json({
                success: false,
                message: "Carrito activo no encontrado para este cliente"
            });
        }

        console.log('✅ Carrito encontrado:', cart._id);
        console.log('Items en carrito:', cart.items.length);

        // Log de todos los items para debugging
        cart.items.forEach((item, index) => {
            console.log(`Item ${index}:`, {
                itemId: item.itemId,
                itemIdType: typeof item.itemId,
                itemIdString: item.itemId?.toString(),
                itemIdObjectId: item.itemId?._id?.toString(),
                itemType: item.itemType
            });
        });

        // ✅ VERIFICACIÓN MEJORADA: Buscar el item
        const itemIndex = cart.items.findIndex(item => {
            // Caso 1: itemId es un objeto poblado
            if (item.itemId && typeof item.itemId === 'object' && item.itemId._id) {
                const match = item.itemId._id.toString() === itemId.toString();
                console.log(`Comparando objeto ${item.itemId._id} con ${itemId}: ${match}`);
                return match;
            }
            // Caso 2: itemId es una referencia string
            if (typeof item.itemId === 'string') {
                const match = item.itemId.toString() === itemId.toString();
                console.log(`Comparando string ${item.itemId} con ${itemId}: ${match}`);
                return match;
            }
            // Caso 3: itemId es ObjectId
            if (item.itemId && item.itemId.toString) {
                const match = item.itemId.toString() === itemId.toString();
                console.log(`Comparando ObjectId ${item.itemId} con ${itemId}: ${match}`);
                return match;
            }
            return false;
        });

        if (itemIndex === -1) {
            console.log('❌ Item no encontrado en el carrito');
            console.log('Items disponibles:', cart.items.map(item => ({
                id: item.itemId?._id || item.itemId,
                type: typeof item.itemId
            })));
            return res.status(404).json({
                success: false,
                message: "Producto no encontrado en el carrito",
                availableItems: cart.items.map(item => ({
                    id: item.itemId?._id || item.itemId,
                    type: typeof item.itemId
                })),
                searchingFor: itemId
            });
        }

        console.log('✅ Item encontrado en índice:', itemIndex);

        // Remover el item
        const removedItem = cart.items[itemIndex];
        cart.items.splice(itemIndex, 1);

        console.log('✅ Item removido:', {
            itemId: removedItem.itemId?._id || removedItem.itemId,
            quantity: removedItem.quantity
        });

        // Recalcular el total del carrito
        cart.total = calculateCartTotal(cart.items);
        console.log('💰 Nuevo total:', cart.total);

        // Guardar los cambios
        await cart.save();
        console.log('💾 Carrito guardado');

        // Poblar el carrito actualizado para la respuesta
        await cart.populate('items.itemId');

        // Configurar cookies
        const { token } = getTokenFromRequest(req);
        const currentToken = token || 'session_maintained';
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", currentToken, cookieConfig);

        console.log('🎉 Eliminación exitosa');

        res.status(200).json({
            success: true,
            message: "Producto eliminado correctamente del carrito",
            shoppingCart: cart,
            removedItemId: itemId,
            token: currentToken
        });

    } catch (error) {
        console.error('❌ Error en removeSpecificItem:', error);
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
        const { userId, orderId } = req.body;

        console.log('🛒 Limpiando carrito después de compra:', {
            cartId,
            userId,
            orderId
        });

        if (!isValidObjectId(cartId)) {
            return res.status(400).json({
                success: false,
                message: "ID de carrito inválido"
            });
        }

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "ID de usuario requerido"
            });
        }

        const cart = await shoppingCartModel.findById(cartId);

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Carrito no encontrado"
            });
        }

        if (cart.clientId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "No tienes permiso para modificar este carrito"
            });
        }

        // ✅ Confirmar descuento pendiente ANTES de cambiar status
        if (cart.pendingDiscount && orderId) {
            console.log('Confirmando descuento pendiente antes de limpiar...');

            cart.appliedDiscount = {
                code: cart.pendingDiscount.code,
                codeId: cart.pendingDiscount.codeId,
                name: cart.pendingDiscount.name,
                discount: cart.pendingDiscount.discount,
                amount: cart.pendingDiscount.amount,
                appliedAt: new Date(),
                orderId: orderId
            };

            cart.pendingDiscount = undefined;

            // ✅ CRÍTICO: Recalcular con el descuento aplicado
            cart.recalculateTotals();
        }

        // Marcar carrito como completado
        cart.status = 'Completado';
        await cart.save();

        console.log('✅ Carrito completado:', {
            cartId: cart._id,
            subtotal: cart.subtotal,
            total: cart.total,
            appliedDiscount: cart.appliedDiscount,
            descuentoAplicado: cart.appliedDiscount?.amount || 0
        });

        // Crear nuevo carrito activo para el usuario
        const newCart = new shoppingCartModel({
            clientId: userId,
            items: [],
            subtotal: 0,
            total: 0,
            status: 'Activo'
        });

        await newCart.save();

        console.log('✅ Nuevo carrito activo creado:', newCart._id);

        const { token } = getTokenFromRequest(req);
        const currentToken = token || 'session_maintained';
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", currentToken, cookieConfig);

        res.status(200).json({
            success: true,
            message: "Carrito limpiado y descuento confirmado exitosamente",
            completedCartId: cart._id,
            activeCart: {
                _id: newCart._id,
                items: newCart.items,
                subtotal: newCart.subtotal,
                total: newCart.total
            },
            cleared: true,
            discountConfirmed: !!cart.appliedDiscount,
            finalTotal: cart.total, 
            token: currentToken
        });

    } catch (error) {
        console.error('Error limpiando carrito:', error);
        res.status(500).json({
            success: false,
            message: "Error al limpiar el carrito",
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

        if (!isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                message: "ID de usuario inválido"
            });
        }

        // Buscar carrito activo del usuario
        let cart = await shoppingCartModel
            .findOne({
                clientId: userId,
                status: 'Activo'
            })
            .populate({
                path: 'items.itemId',
                select: 'name description price image images referenceImage productToPersonalize totalPrice extraComments'
            })
            .sort({ createdAt: -1 });

        // Si no hay carrito activo, crear uno nuevo
        if (!cart) {
            console.log('No hay carrito activo, creando uno nuevo...');
            cart = new shoppingCartModel({
                clientId: userId,
                items: [],
                subtotal: 0,
                total: 0,
                status: 'Activo'
            });
            await cart.save();
        }

        const { token } = getTokenFromRequest(req);
        const currentToken = token || 'session_maintained';
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", currentToken, cookieConfig);

        res.status(200).json({
            success: true,
            cart: {
                _id: cart._id,
                clientId: cart.clientId,
                items: cart.items,
                subtotal: cart.subtotal,
                total: cart.total,
                pendingDiscount: cart.pendingDiscount || null,
                appliedDiscount: cart.appliedDiscount || null,
                status: cart.status,
                createdAt: cart.createdAt,
                updatedAt: cart.updatedAt
            },
            token: currentToken
        });

    } catch (error) {
        console.error('Error obteniendo carrito activo:', error);
        res.status(500).json({
            success: false,
            message: "Error al obtener el carrito activo",
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

shoppingCartController.applyPendingDiscount = async (req, res) => {
    try {
        const { cartId } = req.params;
        const { code, codeId, name, discount, amount, color, textColor } = req.body;

        console.log('📋 Aplicando descuento pendiente:', {
            cartId,
            code,
            codeId,
            amount
        });

        if (!isValidObjectId(cartId)) {
            return res.status(400).json({
                success: false,
                message: "ID de carrito inválido"
            });
        }

        if (!code || !codeId || !amount) {
            return res.status(400).json({
                success: false,
                message: "Datos de descuento incompletos"
            });
        }

        const cart = await shoppingCartModel.findById(cartId);

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Carrito no encontrado"
            });
        }

        // Aplicar descuento pendiente
        cart.pendingDiscount = {
            code,
            codeId,
            name,
            discount,
            amount: parseFloat(amount),
            appliedAt: new Date(),
            color,
            textColor
        };

        // ✅ CRÍTICO: Recalcular totales ANTES de guardar
        cart.recalculateTotals();

        await cart.save();

        console.log('✅ Descuento pendiente aplicado:', {
            cartId: cart._id,
            pendingDiscount: cart.pendingDiscount,
            subtotal: cart.subtotal,
            total: cart.total,
            descuentoRestado: cart.subtotal - cart.total
        });

        const { token } = getTokenFromRequest(req);
        const currentToken = token || 'session_maintained';
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", currentToken, cookieConfig);

        res.status(200).json({
            success: true,
            message: "Descuento preparado para aplicar al completar la compra",
            cart: {
                _id: cart._id,
                subtotal: cart.subtotal,
                total: cart.total,
                pendingDiscount: cart.pendingDiscount,
                appliedDiscount: cart.appliedDiscount
            },
            token: currentToken
        });

    } catch (error) {
        console.error('Error aplicando descuento pendiente:', error);
        res.status(500).json({
            success: false,
            message: "Error al aplicar descuento pendiente",
            error: error.message
        });
    }
};

shoppingCartController.removePendingDiscount = async (req, res) => {
    try {
        const { cartId } = req.params;

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

        // Remover descuento pendiente directamente
        cart.pendingDiscount = undefined;
        await cart.save();

        const { token } = getTokenFromRequest(req);
        const currentToken = token || 'session_maintained';
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", currentToken, cookieConfig);

        res.status(200).json({
            success: true,
            message: "Descuento pendiente removido",
            cart: {
                _id: cart._id,
                subtotal: cart.subtotal,
                total: cart.total,
                pendingDiscount: cart.pendingDiscount
            },
            token: currentToken
        });

    } catch (error) {
        console.error('Error removiendo descuento pendiente:', error);
        res.status(500).json({
            success: false,
            message: "Error al remover descuento pendiente",
            error: error.message
        });
    }
};

shoppingCartController.confirmDiscountOnPurchase = async (req, res) => {
    try {
        const { cartId } = req.params;
        const { orderId } = req.body;

        console.log('Confirmando descuento al completar compra:', {
            cartId,
            orderId
        });

        if (!isValidObjectId(cartId)) {
            return res.status(400).json({
                success: false,
                message: "ID de carrito inválido"
            });
        }

        if (!orderId || !isValidObjectId(orderId)) {
            return res.status(400).json({
                success: false,
                message: "ID de orden inválido"
            });
        }

        const cart = await shoppingCartModel.findById(cartId);

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Carrito no encontrado"
            });
        }

        // Confirmar descuento directamente
        if (cart.pendingDiscount && cart.pendingDiscount.amount > 0) {
            cart.appliedDiscount = {
                code: cart.pendingDiscount.code,
                codeId: cart.pendingDiscount.codeId,
                name: cart.pendingDiscount.name,
                discount: cart.pendingDiscount.discount,
                amount: cart.pendingDiscount.amount,
                appliedAt: new Date(),
                orderId: orderId
            };

            // Limpiar descuento pendiente
            cart.pendingDiscount = undefined;
        }

        cart.status = 'Completado';
        await cart.save();

        console.log('Descuento confirmado y aplicado:', {
            cartId: cart._id,
            appliedDiscount: cart.appliedDiscount,
            newTotal: cart.total,
            orderId
        });

        const { token } = getTokenFromRequest(req);
        const currentToken = token || 'session_maintained';
        const cookieConfig = getCookieConfig();
        res.cookie("authToken", currentToken, cookieConfig);

        res.status(200).json({
            success: true,
            message: "Descuento confirmado y aplicado exitosamente",
            cart: {
                _id: cart._id,
                subtotal: cart.subtotal,
                total: cart.total,
                appliedDiscount: cart.appliedDiscount,
                status: cart.status
            },
            token: currentToken
        });

    } catch (error) {
        console.error('Error confirmando descuento:', error);
        res.status(500).json({
            success: false,
            message: "Error al confirmar descuento",
            error: error.message
        });
    }
};

// NOTA: Métodos adicionales como addItemToCart, updateCartItem, removeItemFromCart, 
// applyPromotionalCode, updateShoppingCart, deleteShoppingCart también deben 
// implementar getCookieConfig() y getTokenFromRequest() siguiendo el mismo patrón
// y agregar el token en el body de cada respuesta para compatibilidad cross-domain

export default shoppingCartController;
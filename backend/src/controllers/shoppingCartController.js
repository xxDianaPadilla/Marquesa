import shoppingCartModel from "../models/ShoppingCart.js";

const shoppingCartController = {};

// Obtenemos todos los carritos
shoppingCartController.getShoppingCarts = async (req, res) => {
    try {
        const carts = await shoppingCartModel.find()
            .populate('clientId')
            .populate({
                path: 'items.itemId',
                refPath: 'items.itemTypeRef'
            });

        res.status(200).json(carts);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener carritos", error: error.message });
    }
};

// Obtenemos carrito por ID
shoppingCartController.getShoppingCartById = async (req, res) => {
    try {
        const cart = await shoppingCartModel.findById(req.params.id)
            .populate('clientId')
            .populate({
                path: 'items.itemId',
                refPath: 'items.itemTypeRef'
            });

        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener carrito", error: error.message });
    }
};

// Obtenemos carrito por cliente
shoppingCartController.getShoppingCartByClient = async (req, res) => {
    try {
        const cart = await shoppingCartModel.findOne({ clientId: req.params.clientId })
            .populate('clientId')
            .populate({
                path: 'items.itemId',
                refPath: 'items.itemTypeRef'
            });

        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado para este cliente" });
        }

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener carrito del cliente", error: error.message });
    }
};

// Creamos nuevo carrito
shoppingCartController.createShoppingCart = async (req, res) => {
    try {
        const { clientId, items, promotionalCode, total } = req.body;

        // Validación: clientId es requerido
        if (!clientId) {
            return res.status(400).json({
                message: "El ID del cliente es requerido",
                error: "clientId is required"
            });
        }

        // Validación: items es requerido y debe ser un array
        if (!items) {
            return res.status(400).json({
                message: "Los items son requeridos",
                error: "items is required"
            });
        }

        if (!Array.isArray(items)) {
            return res.status(400).json({
                message: "Los items deben ser un array",
                error: "items must be an array"
            });
        }

        // Validación: items no puede estar vacío
        if (items.length === 0) {
            return res.status(400).json({
                message: "El carrito debe contener al menos un item",
                error: "items array cannot be empty"
            });
        }

        // Validación: cada item debe tener productId y quantity
        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (!item.productId) {
                return res.status(400).json({
                    message: `El item en la posición ${i} debe tener un productId`,
                    error: `items[${i}].productId is required`
                });
            }

            if (!item.quantity) {
                return res.status(400).json({
                    message: `El item en la posición ${i} debe tener una quantity`,
                    error: `items[${i}].quantity is required`
                });
            }

            if (typeof item.quantity !== 'number' || item.quantity <= 0) {
                return res.status(400).json({
                    message: `La cantidad del item en la posición ${i} debe ser un número mayor a 0`,
                    error: `items[${i}].quantity must be a positive number`
                });
            }
        }

        // Validación: total es requerido
        if (total === undefined || total === null) {
            return res.status(400).json({
                message: "El total es requerido",
                error: "total is required"
            });
        }

        // Validación: total debe ser un número válido
        if (typeof total !== 'number' || isNaN(total)) {
            return res.status(400).json({
                message: "El total debe ser un número válido",
                error: "total must be a valid number"
            });
        }

        // Validación: total debe ser mayor o igual a 0
        if (total < 0) {
            return res.status(400).json({
                message: "El total no puede ser negativo",
                error: "total cannot be negative"
            });
        }

        // Validación: promotionalCode (opcional) debe ser string si se proporciona
        if (promotionalCode !== undefined && promotionalCode !== null && typeof promotionalCode !== 'string') {
            return res.status(400).json({
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
        res.status(201).json({ message: "Carrito creado exitosamente", cart: newCart });

    } catch (error) {
        // Manejo de errores específicos de MongoDB/Mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: "Error de validación en el modelo",
                error: error.message
            });
        }

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Conflicto: el carrito ya existe",
                error: "Duplicate key error"
            });
        }

        // Error genérico del servidor
        res.status(500).json({
            message: "Error interno del servidor al crear carrito",
            error: error.message
        });
    }
};

// Agregamos item al carrito
shoppingCartController.addItemToCart = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { itemType, itemId, itemTypeRef, quantity, subtotal } = req.body;

        // Validación: clientId es requerido
        if (!clientId) {
            return res.status(400).json({
                message: "El ID del cliente es requerido",
                error: "clientId is required"
            });
        }

        // Validación: itemType es requerido
        if (!itemType) {
            return res.status(400).json({
                message: "El tipo de item es requerido",
                error: "itemType is required"
            });
        }

        // Validación: itemId es requerido
        if (!itemId) {
            return res.status(400).json({
                message: "El ID del item es requerido",
                error: "itemId is required"
            });
        }

        // Validación: itemTypeRef es requerido
        if (!itemTypeRef) {
            return res.status(400).json({
                message: "La referencia del tipo de item es requerida",
                error: "itemTypeRef is required"
            });
        }

        // Validación: subtotal es requerido
        if (subtotal === undefined || subtotal === null) {
            return res.status(400).json({
                message: "El subtotal es requerido",
                error: "subtotal is required"
            });
        }

        // Validación: subtotal debe ser un número válido y no negativo
        if (typeof subtotal !== 'number' || isNaN(subtotal)) {
            return res.status(400).json({
                message: "El subtotal debe ser un número válido",
                error: "subtotal must be a valid number"
            });
        }

        if (subtotal < 0) {
            return res.status(400).json({
                message: "El subtotal no puede ser negativo",
                error: "subtotal cannot be negative"
            });
        }

        // Validación: quantity debe ser un número entero positivo si se proporciona
        if (quantity !== undefined) {
            if (typeof quantity !== 'number' || isNaN(quantity)) {
                return res.status(400).json({
                    message: "La cantidad debe ser un número válido",
                    error: "quantity must be a valid number"
                });
            }

            if (quantity <= 0) {
                return res.status(400).json({
                    message: "La cantidad debe ser mayor a 0",
                    error: "quantity must be greater than 0"
                });
            }

            if (!Number.isInteger(quantity)) {
                return res.status(400).json({
                    message: "La cantidad debe ser un número entero",
                    error: "quantity must be an integer"
                });
            }
        }

        // Validación: verificar formato de ObjectId para clientId e itemId
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({
                message: "El ID del cliente no tiene un formato válido",
                error: "Invalid clientId format"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({
                message: "El ID del item no tiene un formato válido",
                error: "Invalid itemId format"
            });
        }

        let cart = await shoppingCartModel.findOne({ clientId });

        if (!cart) {
            // Si no existe carrito, crear uno nuevo
            cart = new shoppingCartModel({
                clientId,
                items: [],
                total: 0
            });
        }

        // Verificamos si el item ya existe en el carrito
        const existingItemIndex = cart.items.findIndex(
            item => item.itemId.toString() === itemId && item.itemType === itemType
        );

        if (existingItemIndex > -1) {
            // Si existe, actualizar cantidad y subtotal
            const currentQuantity = cart.items[existingItemIndex].quantity || 0;
            const newQuantity = currentQuantity + (quantity || 1);

            cart.items[existingItemIndex].quantity = newQuantity;
            cart.items[existingItemIndex].subtotal += subtotal;
        } else {
            // Si no existe, agregar nuevo item
            cart.items.push({
                itemType,
                itemId,
                itemTypeRef,
                quantity: quantity || 1,
                subtotal
            });
        }

        // Validación: verificar que todos los items tienen subtotal válido antes de recalcular
        const hasInvalidSubtotal = cart.items.some(item =>
            typeof item.subtotal !== 'number' || isNaN(item.subtotal) || item.subtotal < 0
        );

        if (hasInvalidSubtotal) {
            return res.status(400).json({
                message: "Algunos items del carrito tienen subtotales inválidos",
                error: "Invalid subtotal values in cart items"
            });
        }

        // Recalculamos total
        const newTotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
        cart.total = newTotal;

        await cart.save();
        res.status(200).json({
            message: "Item agregado al carrito exitosamente",
            cart
        });

    } catch (error) {
        // Manejo de errores específicos de MongoDB/Mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: "Error de validación en el modelo",
                error: error.message
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                message: "ID proporcionado no es válido",
                error: "Invalid ID format"
            });
        }

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Conflicto al agregar item al carrito",
                error: "Duplicate key error"
            });
        }

        // Error genérico del servidor
        res.status(500).json({
            message: "Error interno del servidor al agregar item al carrito",
            error: error.message
        });
    }
};

// Actualizamos item del carrito
shoppingCartController.updateCartItem = async (req, res) => {
    try {
        const { cartId, itemId } = req.params;
        const { quantity, subtotal } = req.body;

        // Validación: cartId es requerido y debe ser un ObjectId válido
        if (!cartId) {
            return res.status(400).json({
                message: "El ID del carrito es requerido",
                error: "cartId is required"
            });
        }

        // Validación: itemId es requerido y debe ser un ObjectId válido
        if (!itemId) {
            return res.status(400).json({
                message: "El ID del item es requerido",
                error: "itemId is required"
            });
        }

        // Validación: al menos uno de quantity o subtotal debe ser proporcionado
        if (quantity === undefined && subtotal === undefined) {
            return res.status(400).json({
                message: "Debe proporcionar al menos quantity o subtotal para actualizar",
                error: "Either quantity or subtotal must be provided"
            });
        }

        // Validación: quantity debe ser un número positivo si se proporciona
        if (quantity !== undefined) {
            if (typeof quantity !== 'number' || isNaN(quantity)) {
                return res.status(400).json({
                    message: "La cantidad debe ser un número válido",
                    error: "quantity must be a valid number"
                });
            }

            if (quantity <= 0) {
                return res.status(400).json({
                    message: "La cantidad debe ser mayor a 0",
                    error: "quantity must be greater than 0"
                });
            }

            // Validación: quantity debe ser un número entero
            if (!Number.isInteger(quantity)) {
                return res.status(400).json({
                    message: "La cantidad debe ser un número entero",
                    error: "quantity must be an integer"
                });
            }
        }

        // Validación: subtotal debe ser un número válido y no negativo si se proporciona
        if (subtotal !== undefined) {
            if (typeof subtotal !== 'number' || isNaN(subtotal)) {
                return res.status(400).json({
                    message: "El subtotal debe ser un número válido",
                    error: "subtotal must be a valid number"
                });
            }

            if (subtotal < 0) {
                return res.status(400).json({
                    message: "El subtotal no puede ser negativo",
                    error: "subtotal cannot be negative"
                });
            }
        }

        // Validación: verificar formato de ObjectId para cartId
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(cartId)) {
            return res.status(400).json({
                message: "El ID del carrito no tiene un formato válido",
                error: "Invalid cartId format"
            });
        }

        // Validación: verificar formato de ObjectId para itemId
        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({
                message: "El ID del item no tiene un formato válido",
                error: "Invalid itemId format"
            });
        }

        // Buscar el carrito
        const cart = await shoppingCartModel.findById(cartId);

        if (!cart) {
            return res.status(404).json({
                message: "Carrito no encontrado",
                error: "Cart not found"
            });
        }

        // Buscar el item en el carrito
        const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);

        if (itemIndex === -1) {
            return res.status(404).json({
                message: "Item no encontrado en el carrito",
                error: "Item not found in cart"
            });
        }

        // Validación: verificar que el item existe y tiene las propiedades necesarias
        const currentItem = cart.items[itemIndex];
        if (!currentItem) {
            return res.status(404).json({
                message: "Item no válido en el carrito",
                error: "Invalid item in cart"
            });
        }

        // Actualizamos item
        if (quantity !== undefined) {
            cart.items[itemIndex].quantity = quantity;
        }
        if (subtotal !== undefined) {
            cart.items[itemIndex].subtotal = subtotal;
        }

        // Validación: verificar que todos los items tienen subtotal válido antes de recalcular
        const hasInvalidSubtotal = cart.items.some(item =>
            typeof item.subtotal !== 'number' || isNaN(item.subtotal) || item.subtotal < 0
        );

        if (hasInvalidSubtotal) {
            return res.status(400).json({
                message: "Algunos items del carrito tienen subtotales inválidos",
                error: "Invalid subtotal values in cart items"
            });
        }

        // Recalculamos total
        const newTotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
        cart.total = newTotal;

        await cart.save();
        res.status(200).json({
            message: "Item actualizado exitosamente",
            cart
        });

    } catch (error) {
        // Manejo de errores específicos de MongoDB/Mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: "Error de validación en el modelo",
                error: error.message
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                message: "ID proporcionado no es válido",
                error: "Invalid ID format"
            });
        }

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Conflicto al actualizar el item",
                error: "Duplicate key error"
            });
        }

        // Error genérico del servidor
        res.status(500).json({
            message: "Error interno del servidor al actualizar item",
            error: error.message
        });
    }
};

// Eliminamos item del carrito
shoppingCartController.removeItemFromCart = async (req, res) => {
    try {
        const { cartId, itemId } = req.params;

        // Validación: cartId es requerido
        if (!cartId) {
            return res.status(400).json({
                message: "El ID del carrito es requerido",
                error: "cartId is required"
            });
        }

        // Validación: itemId es requerido
        if (!itemId) {
            return res.status(400).json({
                message: "El ID del item es requerido",
                error: "itemId is required"
            });
        }

        // Validación: verificar formato de ObjectId para cartId
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(cartId)) {
            return res.status(400).json({
                message: "El ID del carrito no tiene un formato válido",
                error: "Invalid cartId format"
            });
        }

        // Validación: verificar formato de ObjectId para itemId
        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({
                message: "El ID del item no tiene un formato válido",
                error: "Invalid itemId format"
            });
        }

        const cart = await shoppingCartModel.findById(cartId);

        if (!cart) {
            return res.status(404).json({
                message: "Carrito no encontrado",
                error: "Cart not found"
            });
        }

        // Verificar si el item existe en el carrito antes de eliminarlo
        const itemExists = cart.items.some(item => item._id.toString() === itemId);

        if (!itemExists) {
            return res.status(404).json({
                message: "Item no encontrado en el carrito",
                error: "Item not found in cart"
            });
        }

        // Guardar cantidad de items antes de eliminar para verificar si se eliminó
        const itemCountBefore = cart.items.length;

        // Eliminar item del carrito
        cart.items = cart.items.filter(item => item._id.toString() !== itemId);

        // Verificar que efectivamente se eliminó el item
        if (cart.items.length === itemCountBefore) {
            return res.status(400).json({
                message: "No se pudo eliminar el item del carrito",
                error: "Failed to remove item from cart"
            });
        }

        // Validación: verificar que todos los items restantes tienen subtotal válido
        const hasInvalidSubtotal = cart.items.some(item =>
            typeof item.subtotal !== 'number' || isNaN(item.subtotal) || item.subtotal < 0
        );

        if (hasInvalidSubtotal) {
            return res.status(400).json({
                message: "Algunos items del carrito tienen subtotales inválidos",
                error: "Invalid subtotal values in remaining cart items"
            });
        }

        // Recalculamos total
        const newTotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
        cart.total = newTotal;

        await cart.save();
        res.status(200).json({
            message: "Item eliminado del carrito exitosamente",
            cart
        });

    } catch (error) {
        // Manejo de errores específicos de MongoDB/Mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: "Error de validación en el modelo",
                error: error.message
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                message: "ID proporcionado no es válido",
                error: "Invalid ID format"
            });
        }

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Conflicto al eliminar item del carrito",
                error: "Duplicate key error"
            });
        }

        // Error genérico del servidor
        res.status(500).json({
            message: "Error interno del servidor al eliminar item",
            error: error.message
        });
    }
};

// Aplicamos código promocional
shoppingCartController.applyPromotionalCode = async (req, res) => {
    try {
        const { cartId } = req.params;
        const { promotionalCode } = req.body;

        // Validación: cartId es requerido
        if (!cartId) {
            return res.status(400).json({
                message: "El ID del carrito es requerido",
                error: "cartId is required"
            });
        }

        // Validación: promotionalCode es requerido
        if (!promotionalCode) {
            return res.status(400).json({
                message: "El código promocional es requerido",
                error: "promotionalCode is required"
            });
        }

        // Validación: promotionalCode debe ser un string
        if (typeof promotionalCode !== 'string') {
            return res.status(400).json({
                message: "El código promocional debe ser una cadena de texto",
                error: "promotionalCode must be a string"
            });
        }

        // Validación: promotionalCode no debe estar vacío
        if (promotionalCode.trim() === '') {
            return res.status(400).json({
                message: "El código promocional no puede estar vacío",
                error: "promotionalCode cannot be empty"
            });
        }

        // Validación: verificar formato de ObjectId para cartId
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(cartId)) {
            return res.status(400).json({
                message: "El ID del carrito no tiene un formato válido",
                error: "Invalid cartId format"
            });
        }

        // Validación: longitud del código promocional (opcional, ajustar según necesidades)
        if (promotionalCode.length > 50) {
            return res.status(400).json({
                message: "El código promocional no puede tener más de 50 caracteres",
                error: "promotionalCode too long"
            });
        }

        const cart = await shoppingCartModel.findById(cartId);

        if (!cart) {
            return res.status(404).json({
                message: "Carrito no encontrado",
                error: "Cart not found"
            });
        }

        // Validación: verificar si el carrito ya tiene un código promocional aplicado
        if (cart.promotionalCode && cart.promotionalCode.trim() !== '') {
            return res.status(409).json({
                message: "El carrito ya tiene un código promocional aplicado",
                error: "Cart already has a promotional code applied"
            });
        }

        // Limpiar espacios en blanco del código promocional
        const cleanPromotionalCode = promotionalCode.trim();

        cart.promotionalCode = cleanPromotionalCode;

        await cart.save();
        res.status(200).json({
            message: "Código promocional aplicado exitosamente",
            cart
        });

    } catch (error) {
        // Manejo de errores específicos de MongoDB/Mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: "Error de validación en el modelo",
                error: error.message
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                message: "ID proporcionado no es válido",
                error: "Invalid ID format"
            });
        }

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Conflicto al aplicar código promocional",
                error: "Duplicate key error"
            });
        }

        // Error genérico del servidor
        res.status(500).json({
            message: "Error interno del servidor al aplicar código promocional",
            error: error.message
        });
    }
};

// Vaciamos carrito
shoppingCartController.clearCart = async (req, res) => {
    try {
        const { cartId } = req.params;

        // Validación: cartId es requerido
        if (!cartId) {
            return res.status(400).json({
                message: "El ID del carrito es requerido",
                error: "cartId is required"
            });
        }

        // Validación: verificar formato de ObjectId para cartId
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(cartId)) {
            return res.status(400).json({
                message: "El ID del carrito no tiene un formato válido",
                error: "Invalid cartId format"
            });
        }

        const cart = await shoppingCartModel.findById(cartId);

        if (!cart) {
            return res.status(404).json({
                message: "Carrito no encontrado",
                error: "Cart not found"
            });
        }

        // Validación: verificar si el carrito ya está vacío
        if (cart.items.length === 0) {
            return res.status(200).json({
                message: "El carrito ya está vacío",
                cart
            });
        }

        // Limpiar carrito
        cart.items = [];
        cart.total = 0;
        cart.promotionalCode = undefined;

        await cart.save();
        res.status(200).json({
            message: "Carrito vaciado exitosamente",
            cart
        });

    } catch (error) {
        // Manejo de errores específicos de MongoDB/Mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: "Error de validación en el modelo",
                error: error.message
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                message: "ID proporcionado no es válido",
                error: "Invalid ID format"
            });
        }

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Conflicto al vaciar carrito",
                error: "Duplicate key error"
            });
        }

        // Error genérico del servidor
        res.status(500).json({
            message: "Error interno del servidor al vaciar carrito",
            error: error.message
        });
    }
};

// Actualizamos carrito completo
shoppingCartController.updateShoppingCart = async (req, res) => {
    try {
        const { items, promotionalCode, total } = req.body;
        const { id } = req.params;

        // Validación: id es requerido
        if (!id) {
            return res.status(400).json({
                message: "El ID del carrito es requerido",
                error: "cartId is required"
            });
        }

        // Validación: verificar formato de ObjectId para id
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "El ID del carrito no tiene un formato válido",
                error: "Invalid cartId format"
            });
        }

        // Validación: al menos un campo debe ser proporcionado para actualizar
        if (items === undefined && promotionalCode === undefined && total === undefined) {
            return res.status(400).json({
                message: "Debe proporcionar al menos un campo para actualizar (items, promotionalCode, total)",
                error: "At least one field must be provided for update"
            });
        }

        // Validación: items debe ser un array si se proporciona
        if (items !== undefined) {
            if (!Array.isArray(items)) {
                return res.status(400).json({
                    message: "Los items deben ser un array",
                    error: "items must be an array"
                });
            }

            // Validación: cada item debe tener los campos requeridos
            for (let i = 0; i < items.length; i++) {
                const item = items[i];

                if (!item.itemId) {
                    return res.status(400).json({
                        message: `El item en la posición ${i} debe tener un itemId`,
                        error: `items[${i}].itemId is required`
                    });
                }

                if (!item.quantity) {
                    return res.status(400).json({
                        message: `El item en la posición ${i} debe tener una quantity`,
                        error: `items[${i}].quantity is required`
                    });
                }

                if (typeof item.quantity !== 'number' || item.quantity <= 0) {
                    return res.status(400).json({
                        message: `La cantidad del item en la posición ${i} debe ser un número mayor a 0`,
                        error: `items[${i}].quantity must be a positive number`
                    });
                }

                if (!Number.isInteger(item.quantity)) {
                    return res.status(400).json({
                        message: `La cantidad del item en la posición ${i} debe ser un número entero`,
                        error: `items[${i}].quantity must be an integer`
                    });
                }

                if (item.subtotal === undefined || item.subtotal === null) {
                    return res.status(400).json({
                        message: `El item en la posición ${i} debe tener un subtotal`,
                        error: `items[${i}].subtotal is required`
                    });
                }

                if (typeof item.subtotal !== 'number' || item.subtotal < 0) {
                    return res.status(400).json({
                        message: `El subtotal del item en la posición ${i} debe ser un número no negativo`,
                        error: `items[${i}].subtotal must be a non-negative number`
                    });
                }

                if (!item.itemType) {
                    return res.status(400).json({
                        message: `El item en la posición ${i} debe tener un itemType`,
                        error: `items[${i}].itemType is required`
                    });
                }

                if (!item.itemTypeRef) {
                    return res.status(400).json({
                        message: `El item en la posición ${i} debe tener un itemTypeRef`,
                        error: `items[${i}].itemTypeRef is required`
                    });
                }

                // Validación: verificar formato de ObjectId para itemId
                if (!mongoose.Types.ObjectId.isValid(item.itemId)) {
                    return res.status(400).json({
                        message: `El itemId del item en la posición ${i} no tiene un formato válido`,
                        error: `items[${i}].itemId has invalid format`
                    });
                }
            }
        }

        // Validación: total debe ser un número válido si se proporciona
        if (total !== undefined) {
            if (typeof total !== 'number' || isNaN(total)) {
                return res.status(400).json({
                    message: "El total debe ser un número válido",
                    error: "total must be a valid number"
                });
            }

            if (total < 0) {
                return res.status(400).json({
                    message: "El total no puede ser negativo",
                    error: "total cannot be negative"
                });
            }
        }

        // Validación: promotionalCode debe ser string si se proporciona
        if (promotionalCode !== undefined && promotionalCode !== null) {
            if (typeof promotionalCode !== 'string') {
                return res.status(400).json({
                    message: "El código promocional debe ser una cadena de texto",
                    error: "promotionalCode must be a string"
                });
            }

            if (promotionalCode.length > 50) {
                return res.status(400).json({
                    message: "El código promocional no puede tener más de 50 caracteres",
                    error: "promotionalCode too long"
                });
            }
        }

        // Construir objeto de actualización solo con campos definidos
        const updateData = {};
        if (items !== undefined) updateData.items = items;
        if (promotionalCode !== undefined) updateData.promotionalCode = promotionalCode;
        if (total !== undefined) updateData.total = total;

        const updatedCart = await shoppingCartModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('clientId')
            .populate({
                path: 'items.itemId',
                refPath: 'items.itemTypeRef'
            });

        if (!updatedCart) {
            return res.status(404).json({
                message: "Carrito no encontrado",
                error: "Cart not found"
            });
        }

        res.status(200).json({
            message: "Carrito actualizado exitosamente",
            cart: updatedCart
        });

    } catch (error) {
        // Manejo de errores específicos de MongoDB/Mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: "Error de validación en el modelo",
                error: error.message
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                message: "ID proporcionado no es válido",
                error: "Invalid ID format"
            });
        }

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Conflicto al actualizar carrito",
                error: "Duplicate key error"
            });
        }

        // Error genérico del servidor
        res.status(500).json({
            message: "Error interno del servidor al actualizar carrito",
            error: error.message
        });
    }
};

// Eliminamos carrito
shoppingCartController.deleteShoppingCart = async (req, res) => {
    try {
        const deletedCart = await shoppingCartModel.findByIdAndDelete(req.params.id);

        if (!deletedCart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }

        res.status(200).json({ message: "Carrito eliminado" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar carrito", error: error.message });
    }
};

export default shoppingCartController;
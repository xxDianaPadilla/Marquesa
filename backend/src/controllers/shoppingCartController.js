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
        res.json(carts);
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
        
        res.json(cart);
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
        
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener carrito del cliente", error: error.message });
    }
};

// Creamos nuevo carrito
shoppingCartController.createShoppingCart = async (req, res) => {
    try {
        const { clientId, items, promotionalCode, total } = req.body;

        const newCart = new shoppingCartModel({
            clientId,
            items,
            promotionalCode,
            total
        });

        await newCart.save();
        res.status(201).json({ message: "Carrito creado exitosamente", cart: newCart });
    } catch (error) {
        res.status(500).json({ message: "Error al crear carrito", error: error.message });
    }
};

// Agregamos item al carrito
shoppingCartController.addItemToCart = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { itemType, itemId, itemTypeRef, quantity, subtotal } = req.body;

        let cart = await shoppingCartModel.findOne({ clientId });

        if (!cart) {
            // Si no existe carrito, crear uno nuevo
            cart = new shoppingCartModel({
                clientId,
                items: [],
                total: "0"
            });
        }

        // Verificamos si el item ya existe en el carrito
        const existingItemIndex = cart.items.findIndex(
            item => item.itemId.toString() === itemId && item.itemType === itemType
        );

        if (existingItemIndex > -1) {
            // Si existe, actualizar cantidad y subtotal
            cart.items[existingItemIndex].quantity = (cart.items[existingItemIndex].quantity || 0) + (quantity || 1);
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

        // Recalculamos total
        const newTotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
        cart.total = newTotal.toString();

        await cart.save();
        res.json({ message: "Item agregado al carrito", cart });
    } catch (error) {
        res.status(500).json({ message: "Error al agregar item al carrito", error: error.message });
    }
};

// Actualizamos item del carrito
shoppingCartController.updateCartItem = async (req, res) => {
    try {
        const { cartId, itemId } = req.params;
        const { quantity, subtotal } = req.body;

        const cart = await shoppingCartModel.findById(cartId);
        
        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }

        const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
        
        if (itemIndex === -1) {
            return res.status(404).json({ message: "Item no encontrado en el carrito" });
        }

        // Actualizamos item
        if (quantity !== undefined) cart.items[itemIndex].quantity = quantity;
        if (subtotal !== undefined) cart.items[itemIndex].subtotal = subtotal;

        // Recalculamos total
        const newTotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
        cart.total = newTotal.toString();

        await cart.save();
        res.json({ message: "Item actualizado", cart });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar item", error: error.message });
    }
};

// Eliminamos item del carrito
shoppingCartController.removeItemFromCart = async (req, res) => {
    try {
        const { cartId, itemId } = req.params;

        const cart = await shoppingCartModel.findById(cartId);
        
        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }

        cart.items = cart.items.filter(item => item._id.toString() !== itemId);

        // Recalculamos total
        const newTotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
        cart.total = newTotal.toString();

        await cart.save();
        res.json({ message: "Item eliminado del carrito", cart });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar item", error: error.message });
    }
};

// Aplicamos código promocional
shoppingCartController.applyPromotionalCode = async (req, res) => {
    try {
        const { cartId } = req.params;
        const { promotionalCode } = req.body;

        const cart = await shoppingCartModel.findById(cartId);
        
        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }

        cart.promotionalCode = promotionalCode;

        await cart.save();
        res.json({ message: "Código promocional aplicado", cart });
    } catch (error) {
        res.status(500).json({ message: "Error al aplicar código promocional", error: error.message });
    }
};

// Vaciamos carrito
shoppingCartController.clearCart = async (req, res) => {
    try {
        const { cartId } = req.params;

        const cart = await shoppingCartModel.findById(cartId);
        
        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }

        cart.items = [];
        cart.total = "0";
        cart.promotionalCode = undefined;

        await cart.save();
        res.json({ message: "Carrito vaciado", cart });
    } catch (error) {
        res.status(500).json({ message: "Error al vaciar carrito", error: error.message });
    }
};

// Actualizamos carrito completo
shoppingCartController.updateShoppingCart = async (req, res) => {
    try {
        const { items, promotionalCode, total } = req.body;

        const updatedCart = await shoppingCartModel.findByIdAndUpdate(
            req.params.id,
            { items, promotionalCode, total },
            { new: true }
        ).populate('clientId')
         .populate({
             path: 'items.itemId',
             refPath: 'items.itemTypeRef'
         });

        if (!updatedCart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }

        res.json({ message: "Carrito actualizado", cart: updatedCart });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar carrito", error: error.message });
    }
};

// Eliminamos carrito
shoppingCartController.deleteShoppingCart = async (req, res) => {
    try {
        const deletedCart = await shoppingCartModel.findByIdAndDelete(req.params.id);
        
        if (!deletedCart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }
        
        res.json({ message: "Carrito eliminado" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar carrito", error: error.message });
    }
};

export default shoppingCartController;
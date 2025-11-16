// Importar Express para crear el enrutador
import express from "express";
// Importar el controlador del carrito de compras
import shoppingCartController from "../controllers/shoppingCartController.js";

// Crear una instancia del enrutador de Express
const router = express.Router();

// IMPORTANTE: Las rutas específicas ANTES que las rutas con parámetros

// Rutas para operaciones generales del carrito de compras
router.route("/")
    .get(shoppingCartController.getShoppingCarts)
    .post(shoppingCartController.createShoppingCart);

// Ruta para remover item específico
router.route("/removeItem")
    .delete(shoppingCartController.removeSpecificItem);

// Ruta para actualizar cantidad
router.route("/updateQuantity")
    .put(shoppingCartController.updateItemQuantity);

// Ruta para agregar item
router.route("/addItem")
    .post(shoppingCartController.addItemToCartNew);

// Ruta para limpiar carritos duplicados
router.route("/cleanupDuplicates")
    .post(shoppingCartController.cleanupDuplicateCarts);

// Ruta para obtener carrito activo de un usuario específico
router.route("/active/:userId")
    .get(shoppingCartController.getActiveCart);

// Aplicar descuento pendiente (no afecta el total hasta completar la compra)
router.route("/:cartId/pendingDiscount")
    .put(shoppingCartController.applyPendingDiscount)
    .delete(shoppingCartController.removePendingDiscount);

// Confirmar descuento al completar la compra
router.route("/:cartId/confirmDiscount")
    .post(shoppingCartController.confirmDiscountOnPurchase);

// Ruta para limpiar carrito después de compra (actualizada para confirmar descuento)
router.route("/:cartId/clearAfterPurchase")
    .post(shoppingCartController.clearCartAfterPurchase);

// ESTAS RUTAS CON PARÁMETROS DEBEN IR AL FINAL
router.route("/:id")
    .get(shoppingCartController.getShoppingCartById)
    .put(shoppingCartController.updateShoppingCart)
    .delete(shoppingCartController.deleteShoppingCart);

router.route("/client/:clientId")
    .get(shoppingCartController.getShoppingCartByClient);

router.route("/:clientId/addItem")
    .post(shoppingCartController.addItemToCart);

router.route("/client/:clientId/items")
    .put(shoppingCartController.updateCartItem)
    .delete(shoppingCartController.removeItemFromCart);

// Ruta antigua de código promocional (deprecada, usar pendingDiscount)
router.route("/:cartId/promotionalCode")
    .put(shoppingCartController.applyPromotionalCode);

// Exportar el enrutador
export default router;
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

// VERIFICAR QUE ESTA RUTA ESTÉ PRESENTE Y ANTES DE LAS RUTAS CON PARÁMETROS
router.route("/remove-item")
    .delete(shoppingCartController.removeSpecificItem);

// VERIFICAR QUE ESTAS RUTAS ESTÉN PRESENTES
router.route("/update-quantity")
    .put(shoppingCartController.updateItemQuantity);

router.route("/add-item")
    .post(shoppingCartController.addItemToCartNew);

// NUEVA RUTA: Para limpiar carritos duplicados
router.route("/cleanup-duplicates")
    .post(shoppingCartController.cleanupDuplicateCarts);

// NUEVA RUTA: Obtener carrito activo de un usuario específico
router.route("/active/:userId")
    .get(shoppingCartController.getActiveCart);

// ESTAS RUTAS CON PARÁMETROS DEBEN IR AL FINAL
router.route("/:id")
    .get(shoppingCartController.getShoppingCartById)
    .put(shoppingCartController.updateShoppingCart)
    .delete(shoppingCartController.deleteShoppingCart);

router.route("/client/:clientId")
    .get(shoppingCartController.getShoppingCartByClient);

router.route("/:clientId/add-item")
    .post(shoppingCartController.addItemToCart);

router.route("/client/:clientId/items")
    .put(shoppingCartController.updateCartItem)
    .delete(shoppingCartController.removeItemFromCart);

router.route("/:cartId/promotionalCode")
    .put(shoppingCartController.applyPromotionalCode);

router.route("/:cartId/clear-after-purchase")
    .post(shoppingCartController.clearCartAfterPurchase);

// Exportar el enrutador
export default router;
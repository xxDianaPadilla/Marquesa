// Importar Express para crear el enrutador
import express from "express";
// Importar el controlador del carrito de compras
import shoppingCartController from "../controllers/shoppingCartController.js";

// Crear una instancia del enrutador de Express
const router = express.Router();

// Rutas para operaciones generales del carrito de compras
router.route("/")
    .get(shoppingCartController.getShoppingCarts) // Obtener todos los carritos de compras
    .post(shoppingCartController.createShoppingCart); // Crear un nuevo carrito de compras

// NUEVAS RUTAS para operaciones específicas de items (antes de las rutas con parámetros)
// Ruta para actualizar cantidad de un item específico
router.route("/update-quantity")
    .put(shoppingCartController.updateItemQuantity); // Actualizar cantidad de un item

// Ruta para eliminar un item específico del carrito
router.route("/remove-item")
    .delete(shoppingCartController.removeSpecificItem); // Eliminar item específico

// Ruta para agregar item al carrito (formato del hook)
router.route("/add-item")
    .post(shoppingCartController.addItemToCartNew); // Agregar item al carrito

// Rutas para operaciones específicas de un carrito por ID
router.route("/:id")
    .get(shoppingCartController.getShoppingCartById) // Obtener un carrito específico por ID
    .put(shoppingCartController.updateShoppingCart) // Actualizar un carrito específico
    .delete(shoppingCartController.deleteShoppingCart); // Eliminar un carrito específico

// Ruta para obtener el carrito de un cliente específico
router.route("/client/:clientId")
    .get(shoppingCartController.getShoppingCartByClient); // Obtener carrito por ID del cliente

// RUTA ACTUALIZADA: Agregar item al carrito (formato alternativo)
// POST /api/shoppingCart/:clientId/add-item
router.route("/:clientId/add-item")
    .post(shoppingCartController.addItemToCart); // Agregar un item al carrito (formato original)

// Rutas para gestión de items/productos dentro del carrito de un cliente
router.route("/client/:clientId/items")
    .put(shoppingCartController.updateCartItem) // Actualizar un item del carrito
    .delete(shoppingCartController.removeItemFromCart); // Eliminar un item del carrito

// Ruta para aplicar código promocional a un carrito específico
router.route("/:cartId/promotionalCode")
    .put(shoppingCartController.applyPromotionalCode); // Aplicar código promocional

// Ruta para limpiar/vaciar completamente un carrito
router.route("/:cartId/clear")
    .delete(shoppingCartController.clearCart); // Limpiar todo el contenido del carrito

// Exportar el enrutador para ser usado en la aplicación principal
export default router;
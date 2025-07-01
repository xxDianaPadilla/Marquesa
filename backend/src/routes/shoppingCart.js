import express from "express";
import shoppingCartController from "../controllers/shoppingCartController.js";

const router = express.Router();

router.route("/")
.get(shoppingCartController.getShoppingCarts)
.post(shoppingCartController.createShoppingCart);

router.route("/:id")
.get(shoppingCartController.getShoppingCartById)
.put(shoppingCartController.updateShoppingCart)
.delete(shoppingCartController.deleteShoppingCart);

router.route("/client/:clientId")
.get(shoppingCartController.getShoppingCartByClient);

router.route("/client/:clientId/items")
.post(shoppingCartController.addItemToCart)
.put(shoppingCartController.updateCartItem)
.delete(shoppingCartController.removeItemFromCart);

router.route("/:cartId/promotional-code")
.put(shoppingCartController.applyPromotionalCode);

router.route("/:cartId/clear")
.delete(shoppingCartController.clearCart);

export default router;
import express from "express";
import customProductsController from "../controllers/customProductsController.js";
const router = express.Router();

router.route("/")
    .get(customProductsController.getCustomProducts)
    .post(customProductsController.createCustomProducts)

router.route("/client/:clientId")
    .get(customProductsController.getCustomProductsByClient);

router.route("/category/:categoryId")
    .get(customProductsController.getCustomProductsByCategory);

router.route("/:id/summary")
    .get(customProductsController.getProductsSummary);

router.route("/:id")
    .get(customProductsController.getCustomProductsById)
    .delete(customProductsController.deleteCustomProducts)
    .put(customProductsController.updateCustomProduct)

export default router;
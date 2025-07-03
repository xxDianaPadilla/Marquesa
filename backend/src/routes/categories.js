import express from "express";
import categoriesController from "../controllers/categoriesController.js";

const router = express.Router();

router.route("/")
    .get(categoriesController.getCategories);

router.route("/:id")
    .get(categoriesController.getCategoryById);

export default router;
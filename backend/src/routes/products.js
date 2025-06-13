import express from "express";
import productsController from '../controllers/productsController.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({dest: "public/"})


router.route("/")
  .get(productsController.getProducts)
  .post(upload.array("images"), productsController.createProducts);

router.route("/:id")
  .get(productsController.getProduct)
  .put(upload.array("image"), productsController.updateProducts)
  .delete(productsController.deleteProducts);

export default router;
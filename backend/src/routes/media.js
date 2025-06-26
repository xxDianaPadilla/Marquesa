import express from "express";
import mediaController from "../controllers/mediaController.js";
import multer from "multer";

const router = express.Router();

const upload = multer({dest: "media/"});

router.route("/")
  .get(mediaController.getAllMedia)
  .post(upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]), mediaController.insertMedia);

router.route("/:id")
  .get(mediaController.getMediaById)
  .put(upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]), mediaController.putMedia)
  .delete(mediaController.deleteMedia);

export default router;
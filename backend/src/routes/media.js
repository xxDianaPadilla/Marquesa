import express from "express";
import mediaController from "../controllers/mediaController.js";
import multer from "multer";

const router = express.Router();

// Configuración de Multer
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'media/'); 
    },
    filename: function (req, file, cb) {
      // Generamos un nombre único para el archivo
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
  }),
  fileFilter: function (req, file, cb) {
    // Filtro para validar tipos de archivos
    if (file.fieldname === 'image') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos de imagen'), false);
      }
    } else if (file.fieldname === 'video') {
      if (file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos de video'), false);
      }
    } else {
      cb(new Error('Campo de archivo no válido'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, 
  }
});

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
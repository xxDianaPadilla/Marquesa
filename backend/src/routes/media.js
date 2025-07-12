// Importar Express para crear el enrutador
import express from "express";
// Importar el controlador de medios (imágenes y videos)
import mediaController from "../controllers/mediaController.js";
// Importar multer para manejo de archivos multimedia
import multer from "multer";

// Crear una instancia del enrutador de Express
const router = express.Router();

// Configuración avanzada de Multer para archivos multimedia
const upload = multer({
  // Configuración de almacenamiento personalizada
  storage: multer.diskStorage({
    // Definir el directorio de destino para los archivos
    destination: function (req, file, cb) {
      cb(null, 'media/'); // Carpeta específica para archivos multimedia
    },
    // Generar nombres únicos para evitar conflictos de archivos
    filename: function (req, file, cb) {
      // Crear sufijo único usando timestamp + número aleatorio
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      // Extraer la extensión del archivo original
      const fileExtension = file.originalname.split('.').pop();
      // Combinar nombre del campo + sufijo único + extensión original
      cb(null, file.fieldname + '-' + uniqueSuffix + '.' + fileExtension);
    }
  }),
  // Filtro inteligente para validar tipos de archivos según el campo
  fileFilter: function (req, file, cb) {
    // Validación específica por tipo de campo
    if (file.fieldname === 'image') {
      // Solo permitir archivos de imagen para el campo 'image'
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos de imagen'), false);
      }
    } else if (file.fieldname === 'video') {
      // Solo permitir archivos de video para el campo 'video'
      if (file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos de video'), false);
      }
    } else {
      // Rechazar campos no reconocidos
      cb(new Error('Campo de archivo no válido'), false);
    }
  },
  // Límites de tamaño: 50MB para archivos multimedia
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB en bytes
  }
});

// Rutas principales CRUD para medios
router.route("/")
  .get(mediaController.getAllMedia) // Obtener todos los archivos multimedia
  .post(upload.fields([
    { name: 'image', maxCount: 1 }, // Máximo 1 imagen por request
    { name: 'video', maxCount: 1 }  // Máximo 1 video por request
  ]), mediaController.insertMedia); // Crear nuevo archivo multimedia

// Rutas específicas para un archivo multimedia por ID
router.route("/:id")
  .get(mediaController.getMediaById) // Obtener archivo específico por ID
  .put(upload.fields([
    { name: 'image', maxCount: 1 }, // Permitir actualizar imagen
    { name: 'video', maxCount: 1 }  // Permitir actualizar video
  ]), mediaController.putMedia) // Actualizar archivo multimedia completo
  .delete(mediaController.deleteMedia); // Eliminar archivo multimedia

// Exportar el enrutador para ser usado en la aplicación principal
export default router
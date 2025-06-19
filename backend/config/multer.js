import multer from 'multer';
import path from 'path';
import fs from 'fs';
 
// Crear la carpeta temporal si no existe
const uploadDir = 'uploads/temp';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
 
// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
 
// Filtro para validar archivos
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/tiff'
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (JPG, PNG, GIF, WebP, TIFF)'), false);
  }
};
 
// Configuración principal de multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB por archivo
    files: 10 // Máximo 10 archivos por petición
  },
  fileFilter: fileFilter
});
 
// Middleware para un solo archivo (campo 'image')
export const uploadSingle = upload.single('image');
 
// Middleware para múltiples archivos (campo 'images')
export const uploadMultiple = upload.array('images', 10);
 
// Middleware flexible: acepta tanto 'image' como 'images'
export const uploadFlexible = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]);
 
export default upload;
import express from "express";
import productsController from "../controllers/productsController.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// ✅ CONFIGURACIÓN MULTER COMPLETA (ESTO ES LO QUE FALTABA)
const uploadDir = "products/";

// Crear directorio si no existe
try {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(`✅ Directorio creado: ${uploadDir}`);
    }
} catch (error) {
    console.error(`❌ Error creando directorio ${uploadDir}:`, error);
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const filename = 'product-' + uniqueSuffix + extension;
        console.log(`📷 Archivo subido: ${filename}`);
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB por archivo
        files: 5 // Máximo 5 archivos
    },
    fileFilter: (req, file, cb) => {
        console.log('🔍 Validando archivo:', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        });

        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            console.error(`❌ Tipo de archivo no válido: ${file.mimetype}`);
            cb(new Error(`Solo se permiten archivos de imagen. Recibido: ${file.mimetype}`), false);
        }
    }
});

// ✅ MIDDLEWARE DE DEBUG ESPECÍFICO
router.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log('\n' + '='.repeat(80));
    console.log(`🛣️ [PRODUCTS ROUTE] ${req.method} ${req.originalUrl}`);
    console.log(`🕐 [PRODUCTS ROUTE] Timestamp: ${timestamp}`);
    console.log(`🌐 [PRODUCTS ROUTE] Origin: ${req.get('Origin') || 'Sin Origin'}`);
    console.log(`📋 [PRODUCTS ROUTE] Headers:`, {
        'content-type': req.get('Content-Type'),
        'user-agent': req.get('User-Agent'),
        'accept': req.get('Accept'),
        'cache-control': req.get('Cache-Control')
    });
    console.log(`📊 [PRODUCTS ROUTE] Params:`, req.params);
    console.log(`🔍 [PRODUCTS ROUTE] Query:`, req.query);
    console.log('='.repeat(80));
    next();
});

// ✅ MIDDLEWARE ESPECÍFICO PARA DEPURAR CATEGORÍAS
router.use('/by-category/:categoryId', (req, res, next) => {
    console.log('\n' + '🏷️'.repeat(20));
    console.log(`🏷️ [CATEGORY ROUTE] CategoryId solicitado: ${req.params.categoryId}`);
    console.log(`🏷️ [CATEGORY ROUTE] Tipo de CategoryId: ${typeof req.params.categoryId}`);
    console.log(`🏷️ [CATEGORY ROUTE] Longitud CategoryId: ${req.params.categoryId?.length}`);
    console.log(`🏷️ [CATEGORY ROUTE] Es ObjectId válido: ${req.params.categoryId && req.params.categoryId.match(/^[0-9a-fA-F]{24}$/) ? 'SÍ' : 'NO'}`);
    console.log('🏷️'.repeat(20) + '\n');
    next();
});

// ✅ RUTAS ESPECÍFICAS PRIMERO (orden importa)
router.get('/featured', (req, res, next) => {
    console.log('🌟 [ROUTE] Ejecutando ruta /featured');
    next();
}, productsController.getFeaturedProducts);

router.get('/bestSelling', (req, res, next) => {
    console.log('🏆 [ROUTE] Ejecutando ruta /bestSelling');
    next();
}, productsController.getBestSellingProducts);

router.get('/bestRated', (req, res, next) => {
    console.log('⭐ [ROUTE] Ejecutando ruta /bestRated');
    next();
}, productsController.getBestRatedProducts);

// ✅ RUTA DE CATEGORÍA CON DEBUG MEJORADO
router.get('/by-category/:categoryId', (req, res, next) => {
    console.log(`🏷️ [ROUTE] Ejecutando ruta /by-category/${req.params.categoryId}`);
    console.log(`🏷️ [ROUTE] Llamando a productsController.getProductsByCategory`);
    next();
}, productsController.getProductsByCategory);

// ✅ RUTAS PRINCIPALES (AHORA CON upload DEFINIDO)
router.route("/")
    .get((req, res, next) => {
        console.log('📦 [ROUTE] Ejecutando GET / (todos los productos)');
        next();
    }, productsController.getProducts)
    .post((req, res, next) => {
        console.log('➕ [ROUTE] Ejecutando POST / (crear producto)');
        next();
    }, upload.array("images", 5), productsController.createProducts);

// ✅ RUTAS CON ID (AHORA CON upload DEFINIDO)
router.route("/:id")
    .get((req, res, next) => {
        console.log(`🔍 [ROUTE] Ejecutando GET /:id (producto ${req.params.id})`);
        next();
    }, productsController.getProduct)
    .put((req, res, next) => {
        console.log(`✏️ [ROUTE] Ejecutando PUT /:id (actualizar ${req.params.id})`);
        next();
    }, upload.array("images", 5), productsController.updateProducts)
    .delete((req, res, next) => {
        console.log(`🗑️ [ROUTE] Ejecutando DELETE /:id (eliminar ${req.params.id})`);
        next();
    }, productsController.deleteProducts);

// ✅ MIDDLEWARE PARA RESPUESTAS (LOG DE SALIDA)
router.use((req, res, next) => {
    const originalSend = res.send;

    res.send = function (data) {
        console.log(`📤 [PRODUCTS RESPONSE] Status: ${res.statusCode}`);
        console.log(`📤 [PRODUCTS RESPONSE] Headers:`, res.getHeaders());

        try {
            const parsedData = JSON.parse(data);
            console.log(`📤 [PRODUCTS RESPONSE] Body:`, {
                success: parsedData.success,
                message: parsedData.message,
                productsCount: parsedData.products?.length || 0,
                dataCount: parsedData.data?.length || 0
            });
        } catch (e) {
            console.log(`📤 [PRODUCTS RESPONSE] Body (no JSON):`, data.substring(0, 200));
        }

        console.log('📤'.repeat(20) + '\n');

        originalSend.call(this, data);
    };

    next();
});

router.use((error, req, res, next) => {
    console.error('❌ Error en rutas de productos:', error);

    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'El archivo es demasiado grande. Máximo 10MB por imagen.'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Demasiados archivos. Máximo 5 imágenes.'
            });
        }
    }

    res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
});

export default router;
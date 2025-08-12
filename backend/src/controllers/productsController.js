import productsModel from '../models/products.js';
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";
import mongoose from "mongoose";
import salesModel from "../models/Sales.js";

// Configuración de Cloudinary para el manejo de imágenes
cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.cloudinary_api_key,
    api_secret: config.cloudinary.cloudinary_api_secret
});

const productsController = {};

// Función helper para validar ObjectId
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// Función helper para validar nombre de producto
const validateProductName = (name) => {
    if (!name || typeof name !== 'string') {
        return { isValid: false, error: "El nombre es requerido" };
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 3) {
        return { isValid: false, error: "El nombre debe tener al menos 3 caracteres" };
    }

    if (trimmedName.length > 100) {
        return { isValid: false, error: "El nombre no puede exceder 100 caracteres" };
    }

    // Validar caracteres especiales no permitidos
    const invalidChars = /[<>{}()[\]]/;
    if (invalidChars.test(trimmedName)) {
        return { isValid: false, error: "El nombre contiene caracteres no válidos" };
    }

    return { isValid: true, value: trimmedName };
};

// Función helper para validar descripción
const validateDescription = (description) => {
    if (!description || typeof description !== 'string') {
        return { isValid: false, error: "La descripción es requerida" };
    }

    const trimmedDescription = description.trim();

    if (trimmedDescription.length < 10) {
        return { isValid: false, error: "La descripción debe tener al menos 10 caracteres" };
    }

    if (trimmedDescription.length > 500) {
        return { isValid: false, error: "La descripción no puede exceder 500 caracteres" };
    }

    return { isValid: true, value: trimmedDescription };
};

// Función helper para validar precio
const validatePrice = (price) => {
    if (price === undefined || price === null || price === '') {
        return { isValid: false, error: "El precio es requerido" };
    }

    const numericPrice = parseFloat(price);

    if (isNaN(numericPrice)) {
        return { isValid: false, error: "El precio debe ser un número válido" };
    }

    if (numericPrice <= 0) {
        return { isValid: false, error: "El precio debe ser mayor a 0" };
    }

    if (numericPrice > 999999.99) {
        return { isValid: false, error: "El precio es demasiado alto" };
    }

    // Validar máximo 2 decimales
    if (!/^\d+(\.\d{1,2})?$/.test(numericPrice.toString())) {
        return { isValid: false, error: "El precio puede tener máximo 2 decimales" };
    }

    return { isValid: true, value: numericPrice };
};

// Función helper para validar stock
const validateStock = (stock) => {
    if (stock === undefined || stock === null || stock === '') {
        return { isValid: true, value: 0 }; // Stock por defecto es 0
    }

    const numericStock = parseInt(stock);

    if (isNaN(numericStock)) {
        return { isValid: false, error: "El stock debe ser un número entero" };
    }

    if (numericStock < 0) {
        return { isValid: false, error: "El stock no puede ser negativo" };
    }

    if (numericStock > 999999) {
        return { isValid: false, error: "El stock es demasiado alto" };
    }

    return { isValid: true, value: numericStock };
};

// Función helper para validar categoryId
const validateCategoryId = (categoryId) => {
    if (!categoryId || typeof categoryId !== 'string') {
        return { isValid: false, error: "La categoría es requerida" };
    }

    if (!isValidObjectId(categoryId)) {
        return { isValid: false, error: "ID de categoría no válido" };
    }

    return { isValid: true, value: categoryId };
};

// Función helper para validar detalles
const validateDetails = (details) => {
    if (!details || details.trim() === '') {
        return { isValid: true, value: undefined }; // Detalles son opcionales
    }

    const trimmedDetails = details.trim();

    if (trimmedDetails.length < 4) {
        return { isValid: false, error: "Los detalles deben tener al menos 4 caracteres" };
    }

    if (trimmedDetails.length > 1000) {
        return { isValid: false, error: "Los detalles no pueden exceder 1000 caracteres" };
    }

    return { isValid: true, value: trimmedDetails };
};

// Función helper para validar imágenes
const validateImages = (files) => {
    if (!files || files.length === 0) {
        return { isValid: true, images: [] }; // Imágenes son opcionales
    }

    if (files.length > 5) {
        return { isValid: false, error: "Máximo 5 imágenes permitidas" };
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
        if (!allowedTypes.includes(file.mimetype)) {
            return {
                isValid: false,
                error: "Formato de imagen no válido. Solo se permiten JPG, PNG y WEBP"
            };
        }

        if (file.size > maxSize) {
            return {
                isValid: false,
                error: "Una o más imágenes son demasiado grandes. Máximo 5MB por imagen"
            };
        }
    }

    return { isValid: true, files };
};

/**
 * Obtiene todos los productos con sus categorías pobladas
 * CORREGIDO: Estructura de respuesta compatible con frontend
 * @route GET /products
 * @returns {Array} Lista de productos con información de categoría
 */
productsController.getProducts = async (req, res) => {
    try {
        console.log('📦 [getProducts] Iniciando obtención de productos');
        console.log('📦 [getProducts] Origin:', req.get('Origin'));
        console.log('📦 [getProducts] Method:', req.method);

        const products = await productsModel.find().populate('categoryId');

        console.log(`📦 [getProducts] Productos encontrados: ${products.length}`);

        // Log de las primeras 3 productos para debugging
        if (products.length > 0) {
            products.slice(0, 3).forEach((product, index) => {
                console.log(`  ${index + 1}. ${product.name} (Categoría: ${product.categoryId?.name || 'Sin categoría'})`);
            });
        }

        if (!products || products.length === 0) {
            console.log('⚠️ [getProducts] No se encontraron productos');
            return res.status(200).json({
                success: true,
                message: 'No hay productos disponibles',
                products: [],
                data: [],
                count: 0
            });
        }

        const response = {
            success: true,
            message: 'Productos obtenidos exitosamente',
            products: products,
            data: products,
            count: products.length
        };

        console.log(`✅ [getProducts] Enviando respuesta: ${products.length} productos`);
        
        res.status(200).json(response);
        
    } catch (error) {
        console.error('❌ [getProducts] Error:', error);
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener productos',
            error: error.message,
            products: [],
            data: []
        });
    }
};

/**
 * Crea un nuevo producto con validaciones adicionales
 * @route POST /products
 * @body {Object} Datos del producto
 * @returns {Object} Producto creado
 */
productsController.createProducts = async (req, res) => {
    try {
        console.log('=== INICIO CREATE PRODUCT ===');
        console.log('Body recibido:', req.body);
        console.log('Archivos recibidos:', req.files);
        console.log('Número de archivos:', req.files ? req.files.length : 0);

        const { name, description, price, stock, categoryId, isPersonalizable, details } = req.body;

        // Validar campos requeridos
        const nameValidation = validateProductName(name);
        if (!nameValidation.isValid) {
            console.log('Error validación nombre:', nameValidation.error);
            return res.status(400).json({
                success: false,
                message: nameValidation.error
            });
        }

        const descriptionValidation = validateDescription(description);
        if (!descriptionValidation.isValid) {
            console.log('Error validación descripción:', descriptionValidation.error);
            return res.status(400).json({
                success: false,
                message: descriptionValidation.error
            });
        }

        const priceValidation = validatePrice(price);
        if (!priceValidation.isValid) {
            console.log('Error validación precio:', priceValidation.error);
            return res.status(400).json({
                success: false,
                message: priceValidation.error
            });
        }

        const stockValidation = validateStock(stock);
        if (!stockValidation.isValid) {
            console.log('Error validación stock:', stockValidation.error);
            return res.status(400).json({
                success: false,
                message: stockValidation.error
            });
        }

        const categoryValidation = validateCategoryId(categoryId);
        if (!categoryValidation.isValid) {
            console.log('Error validación categoría:', categoryValidation.error);
            return res.status(400).json({
                success: false,
                message: categoryValidation.error
            });
        }

        const detailsValidation = validateDetails(details);
        if (!detailsValidation.isValid) {
            console.log('Error validación detalles:', detailsValidation.error);
            return res.status(400).json({
                success: false,
                message: detailsValidation.error
            });
        }

        // Validar imágenes - ESTE ERA EL PROBLEMA
        console.log('Validando imágenes...');
        const imagesValidation = validateImages(req.files);
        if (!imagesValidation.isValid) {
            console.log('Error validación imágenes:', imagesValidation.error);
            return res.status(400).json({
                success: false,
                message: imagesValidation.error
            });
        }

        // IMPORTANTE: Si no hay imágenes, pero la validación pasó, está bien
        // Tu función validateImages permite imágenes opcionales
        console.log('Validación de imágenes exitosa');

        // Verificar si ya existe un producto con el mismo nombre
        console.log('Verificando si el producto ya existe...');
        const existingProduct = await productsModel.findOne({
            name: { $regex: new RegExp('^' + nameValidation.value + '$', 'i') }
        });

        if (existingProduct) {
            console.log('Producto ya existe:', nameValidation.value);
            return res.status(409).json({
                success: false,
                message: "Ya existe un producto con este nombre"
            });
        }

        let images = [];

        // Procesamiento de imágenes si se proporcionan
        if (req.files && req.files.length > 0) {
            console.log(`Iniciando subida de ${req.files.length} imágenes a Cloudinary...`);

            try {
                for (let i = 0; i < req.files.length; i++) {
                    const file = req.files[i];
                    console.log(`Subiendo imagen ${i + 1}/${req.files.length}:`);
                    console.log(`- Nombre: ${file.originalname}`);
                    console.log(`- Tipo: ${file.mimetype}`);
                    console.log(`- Tamaño: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
                    console.log(`- Ruta: ${file.path}`);

                    // Verificar que el archivo existe antes de subirlo
                    try {
                        const fs = await import('fs');
                        if (!fs.existsSync(file.path)) {
                            throw new Error(`El archivo ${file.path} no existe`);
                        }
                    } catch (fsError) {
                        console.error('Error verificando archivo:', fsError);
                        throw new Error(`Error accediendo al archivo: ${file.originalname}`);
                    }

                    // Subir imagen a Cloudinary
                    const result = await cloudinary.uploader.upload(
                        file.path,
                        {
                            folder: "products",
                            allowed_formats: ["jpg", "png", "jpeg", "webp"],
                            transformation: [
                                { width: 1200, height: 1200, crop: "limit" },
                                { quality: "auto" }
                            ]
                        }
                    );

                    images.push({ image: result.secure_url });
                    console.log(`✓ Imagen ${i + 1} subida exitosamente`);
                    console.log(`  URL: ${result.secure_url}`);
                }

                console.log(`✓ Todas las imágenes subidas exitosamente. Total: ${images.length}`);
            } catch (cloudinaryError) {
                console.error('=== ERROR EN CLOUDINARY ===');
                console.error('Tipo:', cloudinaryError.name);
                console.error('Mensaje:', cloudinaryError.message);
                console.error('Stack:', cloudinaryError.stack);

                return res.status(502).json({
                    success: false,
                    message: `Error al procesar las imágenes: ${cloudinaryError.message}`
                });
            }
        } else {
            console.log('No se proporcionaron imágenes, continuando sin imágenes...');
        }

        // Crear nuevo producto con datos validados
        console.log('Creando producto en base de datos...');
        console.log('Datos a guardar:', {
            name: nameValidation.value,
            description: descriptionValidation.value,
            price: priceValidation.value,
            stock: stockValidation.value,
            categoryId: categoryValidation.value,
            isPersonalizable: isPersonalizable === 'true',
            details: detailsValidation.value,
            imagesCount: images.length
        });

        const newProduct = await productsModel.create({
            name: nameValidation.value,
            description: descriptionValidation.value,
            price: priceValidation.value,
            stock: stockValidation.value,
            categoryId: categoryValidation.value,
            isPersonalizable: isPersonalizable === 'true',
            details: detailsValidation.value,
            images
        });

        console.log('✓ Producto creado en DB con ID:', newProduct._id);

        // Poblar categoría en la respuesta
        const populatedProduct = await productsModel.findById(newProduct._id).populate('categoryId');

        console.log('=== PRODUCTO CREADO EXITOSAMENTE ===');
        console.log('ID:', populatedProduct._id);
        console.log('Nombre:', populatedProduct.name);
        console.log('Imágenes:', populatedProduct.images.length);
        console.log('Categoría:', populatedProduct.categoryId.name);

        // Respuesta exitosa con producto creado
        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: populatedProduct
        });

    } catch (error) {
        console.error('=== ERROR GENERAL EN CREATE PRODUCTS ===');
        console.error('Tipo de error:', error.name);
        console.error('Mensaje:', error.message);
        console.error('Stack completo:', error.stack);

        // Manejar errores específicos de MongoDB
        if (error.code === 11000) {
            console.error('Error de duplicación de clave única');
            return res.status(409).json({
                success: false,
                message: "Ya existe un producto con este nombre"
            });
        }

        // Manejar errores de validación de Mongoose
        if (error.name === 'ValidationError') {
            console.error('Errores de validación de Mongoose:');
            Object.values(error.errors).forEach(err => {
                console.error(`- ${err.path}: ${err.message}`);
            });

            return res.status(400).json({
                success: false,
                message: 'Error de validación en la base de datos',
                details: Object.values(error.errors).map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }

        if (error.name === 'CastError') {
            console.error('Error de conversión de tipos:', error.path, error.value);
            return res.status(400).json({
                success: false,
                message: `Datos con formato incorrecto en el campo: ${error.path}`
            });
        }

        // Error interno del servidor
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al crear producto',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
        });
    }
};

/**
 * Elimina un producto por ID y sus imágenes de Cloudinary
 * @route DELETE /products/:id
 * @param {string} id - ID del producto a eliminar
 * @returns {Object} Mensaje de confirmación
 */
productsController.deleteProducts = async (req, res) => {
    try {
        const productId = req.params.id;

        // Validar que el ID sea válido
        if (!isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de producto no válido'
            });
        }

        // Buscar y eliminar el producto
        const deleteProduct = await productsModel.findByIdAndDelete(productId);

        // Verificar si el producto existe
        if (!deleteProduct) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        // Eliminar imágenes de Cloudinary si existen
        if (deleteProduct.images && deleteProduct.images.length > 0) {
            try {
                for (const img of deleteProduct.images) {
                    // Extraer el public_id de la URL de Cloudinary
                    const urlParts = img.image.split('/');
                    const publicIdWithExtension = urlParts[urlParts.length - 1];
                    const publicId = publicIdWithExtension.split('.')[0];
                    await cloudinary.uploader.destroy(`products/${publicId}`);
                }
            } catch (cloudinaryError) {
                // Log del error pero no detener la operación
                console.error('Error al eliminar imágenes de Cloudinary:', cloudinaryError);
            }
        }

        // Respuesta exitosa
        res.status(200).json({
            success: true,
            message: "Producto eliminado exitosamente",
            data: {
                deletedProduct: {
                    id: deleteProduct._id,
                    name: deleteProduct.name
                }
            }
        });
    } catch (error) {
        console.error('Error en deleteProducts:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "ID de producto con formato incorrecto"
            });
        }

        // Error interno del servidor
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al eliminar producto',
            error: error.message
        });
    }
};

/**
 * Actualiza un producto existente
 * @route PUT /products/:id
 * @param {string} id - ID del producto a actualizar
 * @body {Object} Datos del producto a actualizar
 * @returns {Object} Producto actualizado
 */
productsController.updateProducts = async (req, res) => {
    try {
        console.log('=== INICIO UPDATE PRODUCT ===');
        console.log('Product ID:', req.params.id);
        console.log('Body recibido:', req.body);
        console.log('Files recibidos:', req.files);
        console.log('Número de archivos nuevos:', req.files ? req.files.length : 0);

        const productId = req.params.id;
        const { name, description, price, stock, categoryId, isPersonalizable, details, existingImages } = req.body;

        // Validar que el ID sea válido
        if (!isValidObjectId(productId)) {
            console.log('ERROR: ID no válido');
            return res.status(400).json({
                success: false,
                message: 'ID de producto no válido'
            });
        }

        // Verificar que el producto existe antes de actualizar
        const existingProduct = await productsModel.findById(productId);
        if (!existingProduct) {
            console.log('ERROR: Producto no encontrado');
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        console.log('Producto existente encontrado:', existingProduct.name);
        console.log('Imágenes actuales del producto:', existingProduct.images?.length || 0);

        const updateData = {};

        // Validar y agregar campos si se proporcionan
        if (name !== undefined) {
            const nameValidation = validateProductName(name);
            if (!nameValidation.isValid) {
                console.log('ERROR: Validación nombre fallida');
                return res.status(400).json({
                    success: false,
                    message: nameValidation.error
                });
            }

            // Verificar duplicados solo si el nombre es diferente al actual
            if (nameValidation.value !== existingProduct.name) {
                const duplicateProduct = await productsModel.findOne({
                    name: nameValidation.value,
                    _id: { $ne: productId }
                });

                if (duplicateProduct) {
                    console.log('ERROR: Nombre duplicado');
                    return res.status(409).json({
                        success: false,
                        message: "Ya existe otro producto con este nombre"
                    });
                }
            }

            updateData.name = nameValidation.value;
        }

        if (description !== undefined) {
            const descriptionValidation = validateDescription(description);
            if (!descriptionValidation.isValid) {
                console.log('ERROR: Validación descripción fallida');
                return res.status(400).json({
                    success: false,
                    message: descriptionValidation.error
                });
            }
            updateData.description = descriptionValidation.value;
        }

        if (price !== undefined) {
            const priceValidation = validatePrice(price);
            if (!priceValidation.isValid) {
                console.log('ERROR: Validación precio fallida');
                return res.status(400).json({
                    success: false,
                    message: priceValidation.error
                });
            }
            updateData.price = priceValidation.value;
        }

        if (stock !== undefined) {
            const stockValidation = validateStock(stock);
            if (!stockValidation.isValid) {
                console.log('ERROR: Validación stock fallida');
                return res.status(400).json({
                    success: false,
                    message: stockValidation.error
                });
            }
            updateData.stock = stockValidation.value;
        }

        if (categoryId !== undefined) {
            const categoryValidation = validateCategoryId(categoryId);
            if (!categoryValidation.isValid) {
                console.log('ERROR: Validación categoría fallida');
                return res.status(400).json({
                    success: false,
                    message: categoryValidation.error
                });
            }
            updateData.categoryId = categoryValidation.value;
        }

        if (isPersonalizable !== undefined) {
            console.log('BACKEND - isPersonalizable recibido:', isPersonalizable);
            console.log('BACKEND - Tipo de isPersonalizable:', typeof isPersonalizable);

            let personalizable;

            if (typeof isPersonalizable === 'string') {
                // Viene de FormData: "true" o "false" como strings
                personalizable = isPersonalizable.toLowerCase() === 'true';
                console.log('Procesado desde string:', personalizable);
            } else if (typeof isPersonalizable === 'boolean') {
                // Viene de JSON: true o false como booleans
                personalizable = isPersonalizable;
                console.log('Procesado desde boolean:', personalizable);
            } else {
                // Fallback: convertir a boolean
                personalizable = Boolean(isPersonalizable);
                console.log('Procesado con fallback:', personalizable);
            }

            updateData.isPersonalizable = personalizable;
            console.log('BACKEND - isPersonalizable final asignado:', updateData.isPersonalizable);
        }

        if (details !== undefined) {
            const detailsValidation = validateDetails(details);
            if (!detailsValidation.isValid) {
                console.log('ERROR: Validación detalles fallida');
                return res.status(400).json({
                    success: false,
                    message: detailsValidation.error
                });
            }
            updateData.details = detailsValidation.value;
        }

        // CAMBIO PRINCIPAL: Manejo mejorado de imágenes
        console.log('=== PROCESANDO IMÁGENES ===');

        // Procesar imágenes existentes que se quieren mantener
        let imagesToKeep = [];
        if (existingImages) {
            try {
                // Si existingImages es string JSON, parsearlo
                const parsedExistingImages = typeof existingImages === 'string'
                    ? JSON.parse(existingImages)
                    : existingImages;

                if (Array.isArray(parsedExistingImages)) {
                    imagesToKeep = parsedExistingImages.map(url => ({ image: url }));
                }
                console.log('Imágenes existentes a mantener:', imagesToKeep.length);
            } catch (parseError) {
                console.error('Error parseando existingImages:', parseError);
            }
        }

        // Procesar nuevas imágenes si se proporcionan
        let newImages = [];
        if (req.files && req.files.length > 0) {
            console.log(`Procesando ${req.files.length} nuevas imágenes...`);

            const imagesValidation = validateImages(req.files);
            if (!imagesValidation.isValid) {
                console.log('ERROR: Validación imágenes nuevas fallida');
                return res.status(400).json({
                    success: false,
                    message: imagesValidation.error
                });
            }

            try {
                for (let i = 0; i < req.files.length; i++) {
                    const file = req.files[i];
                    console.log(`Subiendo nueva imagen ${i + 1}/${req.files.length}: ${file.originalname}`);

                    const result = await cloudinary.uploader.upload(
                        file.path,
                        {
                            folder: "products",
                            allowed_formats: ["jpg", "png", "jpeg", "webp"],
                            transformation: [
                                { width: 1200, height: 1200, crop: "limit" },
                                { quality: "auto" }
                            ]
                        }
                    );
                    newImages.push({ image: result.secure_url });
                    console.log(`✓ Nueva imagen ${i + 1} subida: ${result.secure_url}`);
                }

                console.log(`✓ Todas las nuevas imágenes subidas: ${newImages.length}`);
            } catch (cloudinaryError) {
                console.error('Error en Cloudinary:', cloudinaryError);
                return res.status(502).json({
                    success: false,
                    message: 'Error al procesar las nuevas imágenes: ' + cloudinaryError.message
                });
            }
        }

        // Combinar imágenes existentes + nuevas imágenes
        const finalImages = [...imagesToKeep, ...newImages];
        console.log(`Imágenes finales: ${imagesToKeep.length} existentes + ${newImages.length} nuevas = ${finalImages.length} total`);

        // Validar límite total de imágenes
        if (finalImages.length > 5) {
            console.log('ERROR: Demasiadas imágenes');
            return res.status(400).json({
                success: false,
                message: 'Máximo 5 imágenes permitidas en total'
            });
        }

        // Validar que haya al menos una imagen
        if (finalImages.length === 0) {
            console.log('ERROR: Sin imágenes');
            return res.status(400).json({
                success: false,
                message: 'El producto debe tener al menos una imagen'
            });
        }

        // Actualizar imágenes solo si hay cambios
        if (newImages.length > 0 || existingImages !== undefined) {
            updateData.images = finalImages;
            console.log('Imágenes actualizadas en updateData');
        }

        // Verificar que hay al menos un campo para actualizar
        if (Object.keys(updateData).length === 0) {
            console.log('ERROR: Sin datos para actualizar');
            return res.status(400).json({
                success: false,
                message: "No se proporcionaron datos para actualizar"
            });
        }

        console.log('Datos a actualizar:', {
            ...updateData,
            images: updateData.images ? `${updateData.images.length} imágenes` : 'sin cambios'
        });

        // Actualizar el producto
        console.log('Actualizando producto en base de datos...');
        const updatedProduct = await productsModel.findByIdAndUpdate(
            productId,
            updateData,
            { new: true, runValidators: true }
        ).populate('categoryId');

        console.log('=== PRODUCTO ACTUALIZADO EXITOSAMENTE ===');
        console.log('ID:', updatedProduct._id);
        console.log('Nombre:', updatedProduct.name);
        console.log('Imágenes finales:', updatedProduct.images?.length || 0);

        // Respuesta exitosa
        res.status(200).json({
            success: true,
            message: 'Producto actualizado exitosamente',
            data: updatedProduct
        });

    } catch (error) {
        console.error('=== ERROR EN UPDATE PRODUCTS ===');
        console.error('Tipo:', error.name);
        console.error('Mensaje:', error.message);
        console.error('Stack:', error.stack);

        // Manejar errores específicos
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Ya existe un producto con este nombre"
            });
        }

        // Manejar errores de validación de Mongoose
        if (error.name === 'ValidationError') {
            console.error('Errores de validación:', Object.values(error.errors).map(err => err.message));
            return res.status(400).json({
                success: false,
                message: 'Error de validación en la base de datos',
                details: Object.values(error.errors).map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: `Datos con formato incorrecto en el campo: ${error.path}`
            });
        }

        // Error interno del servidor
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al actualizar producto',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
        });
    }
};

/**
 * Obtiene un producto específico por ID
 * @route GET /products/:id
 * @param {string} id - ID del producto
 * @returns {Object} Producto con información de categoría
 */
productsController.getProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        // Validar que el ID sea válido
        if (!isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de producto no válido'
            });
        }

        // Buscar el producto y poblar la categoría
        const product = await productsModel.findById(productId).populate('categoryId');

        // Verificar si el producto existe
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        // Respuesta exitosa
        res.status(200).json({
            success: true,
            message: 'Producto obtenido exitosamente',
            data: product
        });
    } catch (error) {
        console.error('Error en getProduct:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "ID de producto con formato incorrecto"
            });
        }

        // Error interno del servidor
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener producto',
            error: error.message
        });
    }
};

// Obtener productos filtrados por categoría
productsController.getProductsByCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        console.log(`🏷️ [getProductsByCategory] Categoría solicitada: ${categoryId}`);
        console.log(`🏷️ [getProductsByCategory] Origin: ${req.get('Origin')}`);

        // Validar categoryId
        if (!categoryId) {
            console.error('❌ [getProductsByCategory] CategoryId no proporcionado');
            return res.status(400).json({
                success: false,
                message: 'ID de categoría requerido',
                products: [],
                data: []
            });
        }

        if (!isValidObjectId(categoryId)) {
            console.error(`❌ [getProductsByCategory] CategoryId inválido: ${categoryId}`);
            return res.status(400).json({
                success: false,
                message: `ID de categoría inválido: ${categoryId}`,
                products: [],
                data: []
            });
        }

        console.log(`🔍 [getProductsByCategory] Buscando productos con categoryId: ${categoryId}`);

        const products = await productsModel.find({ categoryId }).populate('categoryId');

        console.log(`📊 [getProductsByCategory] Productos encontrados: ${products.length}`);
        
        // Log detallado de productos encontrados
        if (products.length > 0) {
            console.log(`📋 [getProductsByCategory] Lista de productos:`);
            products.forEach((product, index) => {
                console.log(`  ${index + 1}. ${product.name} (ID: ${product._id})`);
            });
        } else {
            console.log(`⚠️ [getProductsByCategory] No se encontraron productos para categoryId: ${categoryId}`);
        }

        const response = {
            success: true,
            message: `${products.length} productos encontrados para la categoría`,
            products: products,
            data: products,
            count: products.length,
            categoryId: categoryId
        };

        console.log(`✅ [getProductsByCategory] Enviando respuesta exitosa`);
        
        res.status(200).json(response);

    } catch (error) {
        console.error('❌ [getProductsByCategory] Error:', error);
        console.error('❌ [getProductsByCategory] Stack:', error.stack);
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener productos por categoría',
            error: error.message,
            products: [],
            data: [],
            categoryId: req.params.categoryId
        });
    }
};

productsController.getFeaturedProducts = async (req, res) => {
    try {
        // Obtenemos todos los productos disponibles
        const allProducts = await productsModel.find({
            stock: { $gt: 0 } // Solo productos con stock disponible
        }).populate('categoryId');

        // Si no hay productos suficientes, devolvemos los que existan
        if (allProducts.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No hay productos disponibles',
                data: []
            });
        }

        // Mezclamos array de productos de manera aleatoria 
        const shuffledProducts = [...allProducts];
        for (let i = shuffledProducts.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledProducts[i], shuffledProducts[j]] = [shuffledProducts[j], shuffledProducts[i]];
        }

        // Tomamos máximo 6 productos aleatorios
        const featuredProducts = shuffledProducts.slice(0, 6);

        // Formateamos los productos para el frontend
        const formattedProducts = featuredProducts.map(product => ({
            _id: product._id,
            id: product._id,
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            image: product.images && product.images.length > 0 ? product.images[0].image : null,
            images: product.images,
            category: product.categoryId ? {
                _id: product.categoryId._id,
                name: product.categoryId.name
            } : null,
            categoryId: product.categoryId?._id,
            isPersonalizable: product.isPersonalizable,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
        }));

        res.status(200).json({
            success: true,
            message: 'Productos destacados obtenidos exitosamente',
            data: formattedProducts,
            total: formattedProducts.length
        });

    } catch (error) {
        console.error('Error en getFeaturedProducts:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener productos destacados',
            error: error.message
        });
    }
};

productsController.getBestSellingProducts = async (req, res) => {
    try {
        const bestSellingProducts = await salesModel.aggregate([
            {
                $match: {
                    status: "Pagado"
                }
            },
            {
                $lookup: {
                    from: "shoppingcarts",
                    localField: "ShoppingCartId",
                    foreignField: "_id",
                    as: "shoppingCart"
                }
            },
            {
                $unwind: "$shoppingCart"
            },
            {
                $unwind: "$shoppingCart.items"
            },
            {
                $match: {
                    "shoppingCart.items.itemType": "product"
                }
            },
            {
                $group: {
                    _id: "$shoppingCart.items.itemId",
                    totalSold: { $sum: "$shoppingCart.items.quantity" },
                    totalRevenue: { $sum: "$shoppingCart.items.subtotal" }
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $unwind: "$product"
            },
            {
                $lookup: {
                    from: "cateogies",
                    localField: "product.categoryId",
                    foreignField: "_id",
                    as: "product.category"
                }
            },
            {
                $addFields: {
                    "product.categoryId": { $arrayElemAt: ["$product.category", 0] }
                }
            },
            {
                $sort: { totalSold: -1 }
            },
            {
                $limit: 10
            }
        ]);

        const totalSales = bestSellingProducts.reduce((sum, item) => sum + item.totalSold, 0);

        const formattedProducts = bestSellingProducts.map(item => ({
            product: {
                _id: item.product._id,
                name: item.product.name,
                description: item.product.description,
                price: item.product.price,
                images: item.product.images,
                categoryId: item.product.categoryId
            },
            sold: item.totalSold,
            revenue: item.totalRevenue,
            percentage: totalSales > 0 ? Math.round((item.totalSold / totalSales) * 100) : 0
        }));

        if (!formattedProducts || formattedProducts.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No hay productos vendidos aún',
                data: [],
                count: 0
            });
        }

        res.status(200).json({
            success: true,
            message: 'Productos más vendidos obtenidos exitosamente',
            data: formattedProducts,
            count: formattedProducts.length,
            totalSales: totalSales
        });
    } catch (error) {
        console.error('Error en getBestSellingProducts: ', error);

        if (error.name === 'MongoNetworkError') {
            return res.status(503).json({
                success: false,
                message: "Servicio de base de datos no disponible temporalmente"
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener productos más vendidos',
            error: error.message
        });
    }
};
/**
 * Obtener productos mejor calificados
 * Esta función es requerida por BestRankedProductsCards.jsx
 */
productsController.getBestRankedProducts = async (req, res) => {
    try {
        // Esta función requiere un sistema de calificaciones
        // Por ahora, devolvemos productos con ratings mock para que funcione el frontend
        
        const products = await productsModel.find({}).limit(10).populate('categoryId');
        
        if (!products || products.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No hay productos disponibles',
                bestRated: [],
                count: 0
            });
        }
        
        // Simular datos de rating para desarrollo
        const bestRated = products.map(product => ({
            _id: product._id,
            name: product.name,
            description: product.description,
            category: product.categoryId?.name || 'Sin categoría',
            image: product.images && product.images.length > 0 ? product.images[0].image : null,
            images: product.images,
            averageRating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // Rating entre 3-5
            reviewCount: Math.floor(Math.random() * 50) + 5, // Entre 5-55 reviews
            type: product.type || 'regular',
            itemType: product.isPersonalizable ? 'custom' : 'regular',
            selectedItemsCount: product.isPersonalizable ? Math.floor(Math.random() * 5) + 1 : 0
        })).sort((a, b) => b.averageRating - a.averageRating);

        res.status(200).json({
            success: true,
            bestRated: bestRated,
            message: 'Productos mejor calificados obtenidos exitosamente'
        });
    } catch (error) {
        console.error('Error al obtener productos mejor calificados:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener productos mejor calificados',
            error: error.message
        });
    }
};

productsController.getBestRatedProducts = async (req, res) => {
    try {
        console.log('📊 Obteniendo productos mejor calificados...');
        
        // Esta función requiere un sistema de calificaciones
        // Por ahora, devolvemos productos con ratings mock para que funcione el frontend
        
        const products = await productsModel.find({}).limit(10).populate('categoryId');
        
        if (!products || products.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No hay productos disponibles',
                bestRated: [],
                count: 0
            });
        }
        
        // Simular datos de rating para desarrollo
        const bestRated = products.map(product => ({
            _id: product._id,
            name: product.name,
            description: product.description,
            category: product.categoryId?.name || 'Sin categoría',
            image: product.images && product.images.length > 0 ? product.images[0].image : null,
            images: product.images,
            averageRating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // Rating entre 3-5
            reviewCount: Math.floor(Math.random() * 50) + 5, // Entre 5-55 reviews
            type: product.type || 'regular',
            itemType: product.isPersonalizable ? 'custom' : 'regular',
            selectedItemsCount: product.isPersonalizable ? Math.floor(Math.random() * 5) + 1 : 0
        })).sort((a, b) => b.averageRating - a.averageRating);

        console.log(`✅ ${bestRated.length} productos mejor calificados generados`);

        res.status(200).json({
            success: true,
            bestRated: bestRated,
            count: bestRated.length,
            message: 'Productos mejor calificados obtenidos exitosamente'
        });
    } catch (error) {
        console.error('Error al obtener productos mejor calificados:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener productos mejor calificados',
            error: error.message
        });
    }
};

export default productsController;
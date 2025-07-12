import productsModel from '../models/products.js';
import {v2 as cloudinary} from "cloudinary";
import { config } from "../config.js";
import mongoose from "mongoose";

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
 * @route GET /products
 * @returns {Array} Lista de productos con información de categoría
 */
productsController.getProducts = async (req, res) => {
    try {
        // Buscar todos los productos y poblar la información de categoría
        const products = await productsModel.find().populate('categoryId');
        
        if (!products || products.length === 0) {
            return res.status(204).json({
                success: true,
                message: 'No hay productos disponibles',
                data: [],
                count: 0
            });
        }
        
        // Respuesta exitosa con lista de productos
        res.status(200).json({
            success: true,
            message: 'Productos obtenidos exitosamente',
            data: products,
            count: products.length
        });
    } catch (error) {
        console.error('Error en getProducts:', error);
        
        // Manejar errores específicos de MongoDB
        if (error.name === 'MongoNetworkError') {
            return res.status(503).json({
                success: false,
                message: "Servicio de base de datos no disponible temporalmente"
            });
        }
        
        // Error interno del servidor
        res.status(500).json({ 
            success: false,
            message: 'Error interno del servidor al obtener productos',
            error: error.message 
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
        const { name, description, price, stock, categoryId, isPersonalizable, details } = req.body;
        
        // Validar campos requeridos
        const nameValidation = validateProductName(name);
        if (!nameValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: nameValidation.error
            });
        }
        
        const descriptionValidation = validateDescription(description);
        if (!descriptionValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: descriptionValidation.error
            });
        }
        
        const priceValidation = validatePrice(price);
        if (!priceValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: priceValidation.error
            });
        }
        
        const stockValidation = validateStock(stock);
        if (!stockValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: stockValidation.error
            });
        }
        
        const categoryValidation = validateCategoryId(categoryId);
        if (!categoryValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: categoryValidation.error
            });
        }
        
        const detailsValidation = validateDetails(details);
        if (!detailsValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: detailsValidation.error
            });
        }
        
        // Validar imágenes
        const imagesValidation = validateImages(req.files);
        if (!imagesValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: imagesValidation.error
            });
        }
        
        // Verificar si ya existe un producto con el mismo nombre
        const existingProduct = await productsModel.findOne({ 
            name: { $regex: new RegExp('^' + nameValidation.value + '$', 'i') }
        });
        
        if (existingProduct) {
            return res.status(409).json({
                success: false,
                message: "Ya existe un producto con este nombre"
            });
        }
        
        let images = [];
        
        // Procesamiento de imágenes si se proporcionan
        if (req.files && req.files.length > 0) {
            try {
                for (const file of req.files) {
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
                }
            } catch (cloudinaryError) {
                console.error('Error en Cloudinary:', cloudinaryError);
                return res.status(502).json({
                    success: false,
                    message: 'Error al procesar las imágenes'
                });
            }
        }
        
        // Crear nuevo producto con datos validados
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
        
        // Poblar categoría en la respuesta
        const populatedProduct = await productsModel.findById(newProduct._id).populate('categoryId');
        
        // Respuesta exitosa con producto creado
        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: populatedProduct
        });
    } catch (error) {
        console.error('Error en createProducts:', error);
        
        // Manejar errores específicos de MongoDB
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Ya existe un producto con este nombre"
            });
        }
        
        // Manejar errores de validación de Mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false,
                message: 'Error de validación',
                details: Object.values(error.errors).map(err => err.message)
            });
        }
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Datos con formato incorrecto"
            });
        }
        
        // Error interno del servidor
        res.status(500).json({ 
            success: false,
            message: 'Error interno del servidor al crear producto',
            error: error.message 
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
        const productId = req.params.id;
        const { name, description, price, stock, categoryId, isPersonalizable, details } = req.body;
        
        // Validar que el ID sea válido
        if (!isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de producto no válido'
            });
        }
        
        // Verificar que el producto existe antes de actualizar
        const existingProduct = await productsModel.findById(productId);
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        const updateData = {};
        
        // Validar y agregar campos si se proporcionan
        if (name !== undefined) {
            const nameValidation = validateProductName(name);
            if (!nameValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: nameValidation.error
                });
            }
            
            // Verificar duplicados solo si el nombre es diferente al actual
            if (nameValidation.value !== existingProduct.name) {
                const duplicateProduct = await productsModel.findOne({
                    name: nameValidation.value,
                    _id: { $ne: productId } // Excluir el producto actual
                });
                
                if (duplicateProduct) {
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
                return res.status(400).json({
                    success: false,
                    message: categoryValidation.error
                });
            }
            updateData.categoryId = categoryValidation.value;
        }
        
        if (isPersonalizable !== undefined) {
            updateData.isPersonalizable = isPersonalizable === 'true';
        }
        
        if (details !== undefined) {
            const detailsValidation = validateDetails(details);
            if (!detailsValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: detailsValidation.error
                });
            }
            updateData.details = detailsValidation.value;
        }
        
        // Procesamiento de nuevas imágenes si se proporcionan
        if (req.files && req.files.length > 0) {
            const imagesValidation = validateImages(req.files);
            if (!imagesValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: imagesValidation.error
                });
            }
            
            try {
                const newImages = [];
                for (const file of req.files) {
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
                }
                updateData.images = newImages;
                
                // Eliminar imágenes anteriores de Cloudinary
                if (existingProduct.images && existingProduct.images.length > 0) {
                    try {
                        for (const img of existingProduct.images) {
                            const urlParts = img.image.split('/');
                            const publicIdWithExtension = urlParts[urlParts.length - 1];
                            const publicId = publicIdWithExtension.split('.')[0];
                            await cloudinary.uploader.destroy(`products/${publicId}`);
                        }
                    } catch (cloudinaryError) {
                        console.error('Error eliminando imágenes anteriores:', cloudinaryError);
                    }
                }
            } catch (cloudinaryError) {
                console.error('Error en Cloudinary:', cloudinaryError);
                return res.status(502).json({
                    success: false,
                    message: 'Error al procesar las imágenes'
                });
            }
        }
        
        // Verificar que hay al menos un campo para actualizar
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No se proporcionaron datos para actualizar"
            });
        }
        
        // Actualizar el producto
        const updatedProduct = await productsModel.findByIdAndUpdate(
            productId,
            updateData,
            { new: true, runValidators: true }
        ).populate('categoryId');
        
        // Respuesta exitosa
        res.status(200).json({
            success: true,
            message: 'Producto actualizado exitosamente',
            data: updatedProduct
        });
    } catch (error) {
        console.error('Error en updateProducts:', error);
        
        // Manejar errores específicos
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Ya existe un producto con este nombre"
            });
        }
        
        // Manejar errores de validación de Mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false,
                message: 'Error de validación',
                details: Object.values(error.errors).map(err => err.message)
            });
        }
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Datos con formato incorrecto"
            });
        }
        
        // Error interno del servidor
        res.status(500).json({ 
            success: false,
            message: 'Error interno del servidor al actualizar producto',
            error: error.message 
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

export default productsController;
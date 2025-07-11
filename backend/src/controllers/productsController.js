import productsModel from '../models/products.js';
import {v2 as cloudinary} from "cloudinary";
import { config } from "../config.js";

// Configuración de Cloudinary para el manejo de imágenes
cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.cloudinary_api_key,
    api_secret: config.cloudinary.cloudinary_api_secret
});

const productsController = {};

/**
 * Obtiene todos los productos con sus categorías pobladas
 * @route GET /products
 * @returns {Array} Lista de productos con información de categoría
 */

productsController.getProducts = async (req, res) => {
    try {
        // Buscar todos los productos y poblar la información de categoría
        const products = await productsModel.find().populate('categoryId');
        
        // Respuesta exitosa con lista de productos
        res.status(200).json({
            success: true,
            message: 'Productos obtenidos exitosamente',
            data: products,
            count: products.length
        });
    } catch (error) {
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
        
        // Validación de campos requeridos
        if (!name || !description || !price || !categoryId) {
            return res.status(400).json({ 
                success: false,
                message: 'Datos incompletos',
                error: 'Los campos name, description, price y categoryId son obligatorios'
            });
        }
        
        // Validación adicional: precio debe ser mayor a 0
        const numericPrice = parseFloat(price);
        if (isNaN(numericPrice) || numericPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Precio inválido',
                error: 'El precio debe ser un número mayor a 0'
            });
        }
        
        // Validación adicional: stock no puede ser negativo
        const numericStock = parseInt(stock) || 0;
        if (numericStock < 0) {
            return res.status(400).json({
                success: false,
                message: 'Stock inválido',
                error: 'El stock no puede ser un número negativo'
            });
        }
        
        // Validación del nombre: no puede ser solo espacios
        if (!name.trim() || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Nombre inválido',
                error: 'El nombre del producto no puede estar vacío o contener solo espacios'
            });
        }
        
        // Validación de descripción: mínimo 10 caracteres
        if (description.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Descripción inválida',
                error: 'La descripción debe tener al menos 10 caracteres'
            });
        }
        
        // Validación de detalles si se proporciona
        if (details && details.trim().length > 0 && details.trim().length < 4) {
            return res.status(400).json({
                success: false,
                message: 'Detalles inválidos',
                error: 'Los detalles deben tener al menos 4 caracteres'
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
                            allowed_formats: ["jpg", "png", "jpeg"]
                        }
                    );
                    images.push({ image: result.secure_url });
                }
            } catch (cloudinaryError) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al subir imágenes',
                    error: 'No se pudieron procesar las imágenes: ' + cloudinaryError.message
                });
            }
        }
        
        // Crear nuevo producto con datos validados
        const newProduct = await productsModel.create({
            name: name.trim(),
            description: description.trim(),
            price: numericPrice,
            stock: numericStock,
            categoryId,
            isPersonalizable: isPersonalizable === 'true',
            details: details ? details.trim() : undefined,
            images
        });
        
        // Respuesta exitosa con producto creado
        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: newProduct
        });
    } catch (error) {
        // Manejo de errores de validación de Mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false,
                message: 'Error de validación',
                error: error.message 
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
        if (!productId || productId.length !== 24) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido',
                error: 'El ID del producto debe ser un ObjectId válido'
            });
        }
        
        // Buscar y eliminar el producto
        const deleteProduct = await productsModel.findByIdAndDelete(productId);
        
        // Verificar si el producto existe
        if (!deleteProduct) {
            return res.status(404).json({ 
                success: false,
                message: 'Producto no encontrado',
                error: 'No se encontró un producto con el ID proporcionado'
            });
        }
        
        // Eliminar imágenes de Cloudinary si existen
        if (deleteProduct.images && deleteProduct.images.length > 0) {
            try {
                for (const img of deleteProduct.images) {
                    // Extraer el public_id de la URL de Cloudinary
                    const publicId = img.image.split('/').pop().split('.')[0];
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
        if (!productId || productId.length !== 24) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido',
                error: 'El ID del producto debe ser un ObjectId válido'
            });
        }
        
        // Verificar que el producto existe antes de actualizar
        const existingProduct = await productsModel.findById(productId);
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado',
                error: 'No se encontró un producto con el ID proporcionado'
            });
        }
        
        const updateData = {};
        
        // Validar y agregar campos si se proporcionan
        if (name !== undefined) {
            if (!name.trim() || name.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Nombre inválido',
                    error: 'El nombre del producto no puede estar vacío o contener solo espacios'
                });
            }
            updateData.name = name.trim();
        }
        
        if (description !== undefined) {
            if (description.trim().length < 10) {
                return res.status(400).json({
                    success: false,
                    message: 'Descripción inválida',
                    error: 'La descripción debe tener al menos 10 caracteres'
                });
            }
            updateData.description = description.trim();
        }
        
        if (price !== undefined) {
            const numericPrice = parseFloat(price);
            if (isNaN(numericPrice) || numericPrice <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Precio inválido',
                    error: 'El precio debe ser un número mayor a 0'
                });
            }
            updateData.price = numericPrice;
        }
        
        if (stock !== undefined) {
            const numericStock = parseInt(stock);
            if (isNaN(numericStock) || numericStock < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Stock inválido',
                    error: 'El stock debe ser un número mayor o igual a 0'
                });
            }
            updateData.stock = numericStock;
        }
        
        if (categoryId !== undefined) {
            updateData.categoryId = categoryId;
        }
        
        if (isPersonalizable !== undefined) {
            updateData.isPersonalizable = isPersonalizable === 'true';
        }
        
        if (details !== undefined) {
            if (details && details.trim().length > 0 && details.trim().length < 4) {
                return res.status(400).json({
                    success: false,
                    message: 'Detalles inválidos',
                    error: 'Los detalles deben tener al menos 4 caracteres'
                });
            }
            updateData.details = details ? details.trim() : undefined;
        }
        
        // Procesamiento de nuevas imágenes si se proporcionan
        if (req.files && req.files.length > 0) {
            try {
                const newImages = [];
                for (const file of req.files) {
                    const result = await cloudinary.uploader.upload(
                        file.path,
                        {
                            folder: "products",
                            allowed_formats: ["jpg", "png", "jpeg"]
                        }
                    );
                    newImages.push({ image: result.secure_url });
                }
                updateData.images = newImages;
            } catch (cloudinaryError) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al subir imágenes',
                    error: 'No se pudieron procesar las imágenes: ' + cloudinaryError.message
                });
            }
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
        // Manejo de errores de validación de Mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false,
                message: 'Error de validación',
                error: error.message 
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
        if (!productId || productId.length !== 24) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido',
                error: 'El ID del producto debe ser un ObjectId válido'
            });
        }
        
        // Buscar el producto y poblar la categoría
        const product = await productsModel.findById(productId).populate('categoryId');
        
        // Verificar si el producto existe
        if (!product) {
            return res.status(404).json({ 
                success: false,
                message: 'Producto no encontrado',
                error: 'No se encontró un producto con el ID proporcionado'
            });
        }
        
        // Respuesta exitosa
        res.status(200).json({
            success: true,
            message: 'Producto obtenido exitosamente',
            data: product
        });
    } catch (error) {
        // Error interno del servidor
        res.status(500).json({ 
            success: false,
            message: 'Error interno del servidor al obtener producto',
            error: error.message 
        });
    }
};

export default productsController;
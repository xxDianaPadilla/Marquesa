//Importo el modelo de tbCategories
import categoriesModel from "../models/Categories.js";
//Importo cloudinary
import { v2 as cloudinary } from "cloudinary";
//Importo mi config.js
import { config } from "../config.js";
//Importo mongoose para validaciones
import mongoose from "mongoose";

// Configuración de cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.cloudinary_api_key,
  api_secret: config.cloudinary.cloudinary_api_secret,
});

// Array de funciones vacío
const categoriesController = {};

// Función helper para validar ObjectId
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// Función helper para validar imagen
const validateImage = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!file) {
        return { isValid: false, error: "La imagen es requerida" };
    }
    
    if (!allowedTypes.includes(file.mimetype)) {
        return { isValid: false, error: "Formato de imagen no válido. Solo se permiten JPG, PNG y WEBP" };
    }
    
    if (file.size > maxSize) {
        return { isValid: false, error: "La imagen es demasiado grande. Máximo 5MB" };
    }
    
    return { isValid: true };
};

// Función helper para validar nombre de categoría
const validateCategoryName = (name) => {
    if (!name || typeof name !== 'string') {
        return { isValid: false, error: "El nombre es requerido" };
    }
    
    const trimmedName = name.trim();
    
    if (trimmedName.length < 2) {
        return { isValid: false, error: "El nombre debe tener al menos 2 caracteres" };
    }
    
    if (trimmedName.length > 50) {
        return { isValid: false, error: "El nombre no puede exceder 50 caracteres" };
    }
    
    // Validar caracteres especiales no permitidos
    const invalidChars = /[<>{}()[\]]/;
    if (invalidChars.test(trimmedName)) {
        return { isValid: false, error: "El nombre contiene caracteres no válidos" };
    }
    
    return { isValid: true, value: trimmedName };
};

// Método de obtener todas las categorías
categoriesController.getCategories = async (req, res) => {
    try {
        const categories = await categoriesModel.find();
        
        if (!categories || categories.length === 0) {
            return res.status(204).json({
                success: true,
                message: "No hay categorías disponibles",
                data: []
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Categorías obtenidas exitosamente",
            data: categories,
            count: categories.length
        });
    } catch (error) {
        console.error('Error en getCategories:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

// Método de obtener categorías por id
categoriesController.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validar ObjectId
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de categoría no válido"
            });
        }
        
        const category = await categoriesModel.findById(id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Categoría no encontrada"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Categoría obtenida exitosamente",
            data: category
        });
    } catch (error) {
        console.error('Error en getCategoryById:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

// Método de crear categorías
categoriesController.createCategories = async (req, res) => {
    try {
        const { name } = req.body;
        
        // Validar nombre
        const nameValidation = validateCategoryName(name);
        if (!nameValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: nameValidation.error
            });
        }
        
        // Validar imagen
        const imageValidation = validateImage(req.file);
        if (!imageValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: imageValidation.error
            });
        }
        
        // Verificar si ya existe una categoría con el mismo nombre
        const existingCategory = await categoriesModel.findOne({ 
            name: { $regex: new RegExp('^' + nameValidation.value + '$', 'i') }
        });
        
        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "Ya existe una categoría con este nombre"
            });
        }

        let imageURL = "";

        try {
            // Subir imagen a Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "categories",
                allowed_formats: ["jpg", "jpeg", "png", "webp"],
                transformation: [
                    { width: 800, height: 600, crop: "limit" },
                    { quality: "auto" }
                ]
            });
            imageURL = result.secure_url;
        } catch (cloudinaryError) {
            console.error('Error en Cloudinary:', cloudinaryError);
            return res.status(502).json({
                success: false,
                message: "Error al procesar la imagen"
            });
        }

        // Guardar el registro en la base de datos
        const newCategory = new categoriesModel({ 
            name: nameValidation.value, 
            image: imageURL 
        });
        
        await newCategory.save();

        res.status(201).json({
            success: true,
            message: "Categoría creada exitosamente",
            data: newCategory
        });
    } catch (error) {
        console.error('Error en createCategories:', error);
        
        // Manejar errores específicos de MongoDB
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Ya existe una categoría con este nombre"
            });
        }
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Datos de categoría no válidos",
                details: Object.values(error.errors).map(err => err.message)
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

// Método de actualizar categorías
categoriesController.updateCategories = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        
        // Validar ObjectId
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de categoría no válido"
            });
        }
        
        // Validar nombre
        const nameValidation = validateCategoryName(name);
        if (!nameValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: nameValidation.error
            });
        }

        // Verificar que la categoría existe
        const existingCategory = await categoriesModel.findById(id);
        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: "Categoría no encontrada"
            });
        }
        
        // Verificar si ya existe otra categoría con el mismo nombre
        const duplicateCategory = await categoriesModel.findOne({ 
            name: { $regex: new RegExp('^' + nameValidation.value + '$', 'i') },
            _id: { $ne: id }
        });
        
        if (duplicateCategory) {
            return res.status(409).json({
                success: false,
                message: "Ya existe otra categoría con este nombre"
            });
        }

        let imageURL = existingCategory.image; // Usar la imagen existente por defecto

        // Solo subir nueva imagen si se proporcionó una
        if (req.file) {
            const imageValidation = validateImage(req.file);
            if (!imageValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: imageValidation.error
                });
            }
            
            try {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: "categories",
                    allowed_formats: ["jpg", "jpeg", "png", "webp"],
                    transformation: [
                        { width: 800, height: 600, crop: "limit" },
                        { quality: "auto" }
                    ]
                });
                imageURL = result.secure_url;
            } catch (cloudinaryError) {
                console.error('Error en Cloudinary:', cloudinaryError);
                return res.status(502).json({
                    success: false,
                    message: "Error al procesar la imagen"
                });
            }
        }

        // Actualizar categoría
        const updateData = { name: nameValidation.value, image: imageURL };
        const updatedCategory = await categoriesModel.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Categoría actualizada exitosamente",
            data: updatedCategory
        });
    } catch (error) {
        console.error('Error en updateCategories:', error);
        
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Ya existe una categoría con este nombre"
            });
        }
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Datos de categoría no válidos",
                details: Object.values(error.errors).map(err => err.message)
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

// Método de eliminar categorías
categoriesController.deleteCategories = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validar ObjectId
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de categoría no válido"
            });
        }
        
        const deletedCategory = await categoriesModel.findByIdAndDelete(id);
        
        if (!deletedCategory) {
            return res.status(404).json({
                success: false,
                message: "Categoría no encontrada"
            });
        }
        
        // Opcional: Eliminar imagen de Cloudinary
        try {
            if (deletedCategory.image) {
                const publicId = deletedCategory.image.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`categories/${publicId}`);
            }
        } catch (cloudinaryError) {
            console.error('Error al eliminar imagen de Cloudinary:', cloudinaryError);
            // No fallar la operación por esto
        }
        
        res.status(200).json({
            success: true,
            message: "Categoría eliminada exitosamente",
            data: {
                id: deletedCategory._id,
                name: deletedCategory.name
            }
        });
    } catch (error) {
        console.error('Error en deleteCategories:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

export default categoriesController;
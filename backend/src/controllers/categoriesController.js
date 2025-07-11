//Importo el modelo de tbCategories
import categoriesModel from "../models/Categories.js";
//Importo cloudinary
import { v2 as cloudinary } from "cloudinary";
//Importo mi config.js
import { config } from "../config.js";

// Configuración de cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.cloudinary_api_key,
  api_secret: config.cloudinary.cloudinary_api_secret,
});

// Array de funciones vacío
const categoriesController = {};

// Método de obtener todas las categorías
categoriesController.getCategories = async (req, res) => {
    try {
        const categories = await categoriesModel.find();
        res.status(200).json({
            success: true,
            message: "Categorías obtenidas exitosamente",
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener categorías",
            error: error.message
        });
    }
};

// Método de obtener categorías por id
categoriesController.getCategoryById = async (req, res) => {
    try {
        const category = await categoriesModel.findById(req.params.id);
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
        res.status(500).json({
            success: false,
            message: "Error al obtener la categoría",
            error: error.message
        });
    }
};

// Método de crear categorías
categoriesController.createCategories = async (req, res) => {
    try {
        const { name } = req.body;
        
        // Validaciones requeridas
        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "El campo 'name' es requerido"
            });
        }
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "La imagen es requerida"
            });
        }

        let imageURL = "";

        // Subir imagen a Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "categories",
            allowed_formats: ["jpg", "jpeg", "png"],
        });
        imageURL = result.secure_url;

        // Guardar el registro en la base de datos
        const newCategory = new categoriesModel({ name: name.trim(), image: imageURL });
        await newCategory.save();

        res.status(201).json({
            success: true,
            message: "Categoría creada exitosamente",
            data: newCategory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al crear categoría",
            error: error.message
        });
    }
};

// Método de actualizar categorías
categoriesController.updateCategories = async (req, res) => {
    try {
        const { name } = req.body;
        
        // Validaciones requeridas
        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "El campo 'name' es requerido"
            });
        }
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "La imagen es requerida"
            });
        }

        // Verificar que la categoría existe
        const existingCategory = await categoriesModel.findById(req.params.id);
        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: "Categoría no encontrada"
            });
        }

        let imageURL = "";

        // Subir imagen a Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "categories",
            allowed_formats: ["jpg", "jpeg", "png"],
        });
        imageURL = result.secure_url;

        // Actualizar categoría
        const updateData = { name: name.trim(), image: imageURL };
        const updatedCategory = await categoriesModel.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Categoría actualizada exitosamente",
            data: updatedCategory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar categoría",
            error: error.message
        });
    }
};

// Método de eliminar categorías
categoriesController.deleteCategories = async (req, res) => {
    try {
        const deletedCategory = await categoriesModel.findByIdAndDelete(req.params.id);
        if (!deletedCategory) {
            return res.status(404).json({
                success: false,
                message: "Categoría no encontrada"
            });
        }
        res.status(200).json({
            success: true,
            message: "Categoría eliminada exitosamente",
            data: deletedCategory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar categoría",
            error: error.message
        });
    }
};

export default categoriesController;
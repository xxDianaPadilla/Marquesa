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
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener categorías", error: error.message });
    }
};

// Método de obtener categorías por id
categoriesController.getCategoryById = async (req, res) => {
    try {
        const category = await categoriesModel.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Categoría no encontrada" });
        }
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la categoría", error: error.message });
    }
};

// Método de crear categorías
categoriesController.createCategories = async (req, res) => {
  try {
    const { name } = req.body;
    let imageURL = "";

    // Subir imagen a Cloudinary si se proporciona
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "categories",
        allowed_formats: ["jpg", "jpeg", "png"],
      });
      imageURL = result.secure_url;
    }

    // Guardar el registro en la base de datos
    const newCategory = new categoriesModel({ name, image: imageURL });
    await newCategory.save();

    res.json({ message: "Categoría guardada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al crear categoría", error: error.message });
  }
};

// Método de actualizar categorías
categoriesController.updateCategories = async (req, res) => {
  try {
    const { name } = req.body;
    let imageURL = "";

    // Subir imagen a Cloudinary si se proporciona
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "categories",
        allowed_formats: ["jpg", "jpeg", "png"],
      });
      imageURL = result.secure_url;
    }

    // Construir datos a actualizar
    const updateData = { name };
    if (imageURL) updateData.image = imageURL;

    await categoriesModel.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.json({ message: "Categoría actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar categoría", error: error.message });
  }
};

// Método de eliminar categorías
categoriesController.deleteCategories = async (req, res) => {
  try {
    const deletedCategory = await categoriesModel.findByIdAndDelete(req.params.id);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    res.json({ message: "Categoría eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar categoría", error: error.message });
  }
};

export default categoriesController;
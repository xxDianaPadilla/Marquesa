import categoriesModel from "../models/Categories.js";

const categoriesController = {};

categoriesController.getCategories = async (req, res) => {
    try {
        const categories = await categoriesModel.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener categorías", error: error.message });
    }
};

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

export default categoriesController;
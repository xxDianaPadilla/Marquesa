import customProductsModel from "../models/CustomProducts.js";

const customProductsController = {};

customProductsController.getCustomProducts = async (req, res) => {
    try {
        const customProducts = await customProductsModel.find()
            .populate('clientId')
            .populate('categoryId')
            .populate('selectedItems.productId');
        res.json(customProducts);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los productos personalizados", error: error.message });
    }
};

customProductsController.getCustomProductsById = async (req, res) => {
    try {
        const customProduct = await customProductsModel.findById(req.params.id)
            .populate('clientId')
            .populate('categoryId')
            .populate('selectedItems.productId');
        
        if (!customProduct) {
            return res.status(404).json({ message: "Producto personalizado no encontrado" });
        }
        
        res.json(customProduct);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el producto personalizado", error: error.message });
    }
};

customProductsController.createCustomProducts = async (req, res) => {
    try {
        const { clientId, categoryId, selectedItems, referenceImage, extraComments, totalPrice } = req.body;

        // Validamos que selectedItems no esté vacío
        if (!selectedItems || selectedItems.length === 0) {
            return res.status(400).json({ message: "Se requiere al menos un producto seleccionado" });
        }

        // Validamos que cada item tenga productId y quantity
        for (const item of selectedItems) {
            if (!item.productId) {
                return res.status(400).json({ message: "Cada producto seleccionado debe tener un productId válido" });
            }
        }

        // Validamos que totalPrice sea positivo
        if (totalPrice <= 0) {
            return res.status(400).json({ message: "El precio total debe ser mayor a 0" });
        }

        const newCustomProduct = new customProductsModel({
            clientId,
            categoryId,
            selectedItems,
            referenceImage,
            extraComments,
            totalPrice
        });

        await newCustomProduct.save();
        
        // Populate la respuesta
        const populatedProduct = await customProductsModel.findById(newCustomProduct._id)
            .populate('clientId')
            .populate('categoryId')
            .populate('selectedItems.productId');

        res.status(201).json({ 
            message: "Producto personalizado guardado", 
            customProduct: populatedProduct 
        });
    } catch (error) {
        res.status(500).json({ message: "Error al crear el producto personalizado", error: error.message });
    }
};

customProductsController.updateCustomProduct = async (req, res) => {
    try {
        const { clientId, categoryId, selectedItems, referenceImage, extraComments, totalPrice } = req.body;

        // Validamos selectedItems si se está actualizando
        if (selectedItems) {
            if (selectedItems.length === 0) {
                return res.status(400).json({ message: "Se requiere al menos un producto seleccionado" });
            }

            for (const item of selectedItems) {
                if (!item.productId) {
                    return res.status(400).json({ message: "Cada producto seleccionado debe tener un productId válido" });
                }
            }
        }

        // Validamos totalPrice si se está actualizando
        if (totalPrice !== undefined && totalPrice <= 0) {
            return res.status(400).json({ message: "El precio total debe ser mayor a 0" });
        }

        const updatedCustomProduct = await customProductsModel.findByIdAndUpdate(
            req.params.id,
            { clientId, categoryId, selectedItems, referenceImage, extraComments, totalPrice },
            { new: true }
        ).populate('clientId')
         .populate('categoryId')
         .populate('selectedItems.productId');

        if (!updatedCustomProduct) {
            return res.status(404).json({ message: "Producto personalizado no encontrado" });
        }

        res.json({ 
            message: "Producto personalizado actualizado", 
            customProduct: updatedCustomProduct 
        });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el producto personalizado", error: error.message });
    }
};

customProductsController.deleteCustomProducts = async (req, res) => {
    try {
        const deletedCustomProducts = await customProductsModel.findByIdAndDelete(req.params.id);
        
        if (!deletedCustomProducts) {
            return res.status(404).json({ message: "Producto personalizado no encontrado" });
        }
        
        res.json({ message: "Producto personalizado eliminado" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el producto personalizado", error: error.message });
    }
};

// Método adicional para obtener proyectos personalizados por cliente
customProductsController.getCustomProductsByClient = async (req, res) => {
    try {
        const customProducts = await customProductsModel.find({ clientId: req.params.clientId })
            .populate('clientId')
            .populate('categoryId')
            .populate('selectedItems.productId');
        
        res.json(customProducts);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los products personalizados del cliente", error: error.message });
    }
};

// Método adicional para obtener proyectos personalizados por categoría
customProductsController.getCustomProductsByCategory = async (req, res) => {
    try {
        const customProducts = await customProductsModel.find({ categoryId: req.params.categoryId })
            .populate('clientId')
            .populate('categoryId')
            .populate('selectedItems.productId');
        
        res.json(customProducts);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los productos personalizados de la categoría", error: error.message });
    }
};

// Método para calcular el total de productos en un proyecto
customProductsController.getProductsSummary = async (req, res) => {
    try {
        const customProduct = await customProductsModel.findById(req.params.id)
            .populate('selectedItems.productId');
        
        if (!customProduct) {
            return res.status(404).json({ message: "Producto personalizado no encontrado" });
        }

        const totalProducts = customProduct.selectedItems.reduce((total, item) => total + item.quantity, 0);
        const uniqueProducts = customProduct.selectedItems.length;

        res.json({
            productId: customProduct._id,
            totalProducts,
            uniqueProducts,
            totalPrice: customProduct.totalPrice,
            selectedItems: customProduct.selectedItems
        });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el resumen del producto", error: error.message });
    }
};

export default customProductsController;
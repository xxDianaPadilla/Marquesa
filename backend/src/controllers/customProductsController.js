import customProductsModel from "../models/CustomProducts.js";
import mongoose from "mongoose";

const customProductsController = {};

// Función de ayuda para validar ObjectId
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// Función de ayuda para validar datos del producto personalizado
const validateCustomProductData = (data, isUpdate = false) => {
    const errors = [];

    // Validamos clientId
    if (!isUpdate && !data.clientId) {
        errors.push("El clientId es requerido");
    } else if (data.clientId && !isValidObjectId(data.clientId)) {
        errors.push("El clientId debe ser un ObjectId válido");
    }

    // Validamos categoryId
    if (!isUpdate && !data.categoryId) {
        errors.push("El categoryId es requerido");
    } else if (data.categoryId && !isValidObjectId(data.categoryId)) {
        errors.push("El categoryId debe ser un ObjectId válido");
    }

    // Validamos selectedItems
    if (!isUpdate && (!data.selectedItems || data.selectedItems.length === 0)) {
        errors.push("Se requiere al menos un producto seleccionado");
    } else if (data.selectedItems && Array.isArray(data.selectedItems)) {
        // Validar límite máximo de productos
        if (data.selectedItems.length > 50) {
            errors.push("No se pueden seleccionar más de 50 productos");
        }
        
        data.selectedItems.forEach((item, index) => {
            if (!item.productId) {
                errors.push(`El producto en la posición ${index + 1} debe tener un productId válido`);
            } else if (!isValidObjectId(item.productId)) {
                errors.push(`El productId en la posición ${index + 1} debe ser un ObjectId válido`);
            }
            
            // Validamos quantity si está presente
            if (item.quantity !== undefined && item.quantity !== null) {
                if (typeof item.quantity !== 'number' || item.quantity < 0 || item.quantity > 1000) {
                    errors.push(`La cantidad en la posición ${index + 1} debe ser un número entre 0 y 1000`);
                }
            }
        });
    }

    // Validamos totalPrice
    if (!isUpdate && (data.totalPrice === undefined || data.totalPrice === null)) {
        errors.push("El precio total es requerido");
    } else if (data.totalPrice !== undefined && data.totalPrice !== null) {
        if (typeof data.totalPrice !== 'number' || data.totalPrice <= 0 || data.totalPrice > 999999) {
            errors.push("El precio total debe ser un número entre 0.01 y 999999");
        }
    }

    // Validamos referenceImage si está presente
    if (data.referenceImage && typeof data.referenceImage !== 'string') {
        errors.push("La imagen de referencia debe ser una cadena de texto");
    } else if (data.referenceImage && data.referenceImage.length > 500) {
        errors.push("La URL de la imagen de referencia es demasiado larga");
    }

    // Validamos extraComments si está presente
    if (data.extraComments && typeof data.extraComments !== 'string') {
        errors.push("Los comentarios extra deben ser una cadena de texto");
    } else if (data.extraComments && data.extraComments.length > 1000) {
        errors.push("Los comentarios extra no pueden exceder 1000 caracteres");
    }

    return errors;
};

// Método para obtener todos los custom products existentes
customProductsController.getCustomProducts = async (req, res) => {
    try {
        const customProducts = await customProductsModel.find()
            .populate('clientId')
            .populate('categoryId')
            .populate('selectedItems.productId');
        
        if (customProducts.length === 0) {
            return res.status(204).json({
                success: true,
                message: "No hay productos personalizados disponibles",
                data: []
            });
        }

        res.status(200).json({
            success: true,
            message: "Productos personalizados obtenidos exitosamente",
            data: customProducts,
            count: customProducts.length
        });
    } catch (error) {
        console.error('Error en getCustomProducts:', error);
        
        // Manejar errores específicos de MongoDB
        if (error.name === 'MongoNetworkError') {
            return res.status(503).json({
                success: false,
                message: "Servicio de base de datos no disponible temporalmente"
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener los productos personalizados",
            error: error.message
        });
    }
};

// Método para obtener los custom products por su id
customProductsController.getCustomProductsById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validamos que el ID sea un ObjectId válido
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "El ID proporcionado no es válido"
            });
        }

        const customProduct = await customProductsModel.findById(id)
            .populate('clientId')
            .populate('categoryId')
            .populate('selectedItems.productId');
        
        if (!customProduct) {
            return res.status(404).json({
                success: false,
                message: "Producto personalizado no encontrado"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Producto personalizado obtenido exitosamente",
            data: customProduct
        });
    } catch (error) {
        console.error('Error en getCustomProductsById:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener el producto personalizado",
            error: error.message
        });
    }
};

// Método para crear los custom products
customProductsController.createCustomProducts = async (req, res) => {
    try {
        const { clientId, categoryId, selectedItems, referenceImage, extraComments, totalPrice } = req.body;

        // Validamos datos de entrada
        const validationErrors = validateCustomProductData(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Errores de validación",
                errors: validationErrors
            });
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
        
        // Filtramos la respuesta
        const populatedProduct = await customProductsModel.findById(newCustomProduct._id)
            .populate('clientId')
            .populate('categoryId')
            .populate('selectedItems.productId');

        res.status(201).json({
            success: true,
            message: "Producto personalizado creado exitosamente",
            data: populatedProduct
        });
    } catch (error) {
        console.error('Error en createCustomProducts:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Error de validación de datos",
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Error en el formato de datos",
                error: "Uno o más IDs no tienen el formato correcto"
            });
        }
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al crear el producto personalizado",
            error: error.message
        });
    }
};

// Método para actualizar los custom products
customProductsController.updateCustomProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { clientId, categoryId, selectedItems, referenceImage, extraComments, totalPrice } = req.body;

        // Validamos que el ID sea un ObjectId válido
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "El ID proporcionado no es válido"
            });
        }

        // Validamos que al menos un campo esté presente para actualizar
        if (!clientId && !categoryId && !selectedItems && !referenceImage && !extraComments && totalPrice === undefined) {
            return res.status(400).json({
                success: false,
                message: "Se requiere al menos un campo para actualizar"
            });
        }

        // Validamos datos de entrada para actualización
        const validationErrors = validateCustomProductData(req.body, true);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Errores de validación",
                errors: validationErrors
            });
        }

        const updatedCustomProduct = await customProductsModel.findByIdAndUpdate(
            id,
            { clientId, categoryId, selectedItems, referenceImage, extraComments, totalPrice },
            { new: true, runValidators: true }
        ).populate('clientId')
         .populate('categoryId')
         .populate('selectedItems.productId');

        if (!updatedCustomProduct) {
            return res.status(404).json({
                success: false,
                message: "Producto personalizado no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            message: "Producto personalizado actualizado exitosamente",
            data: updatedCustomProduct
        });
    } catch (error) {
        console.error('Error en updateCustomProduct:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Error de validación de datos",
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Error en el formato de datos",
                error: "Uno o más IDs no tienen el formato correcto"
            });
        }
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al actualizar el producto personalizado",
            error: error.message
        });
    }
};

// Método para eliminar custom products
customProductsController.deleteCustomProducts = async (req, res) => {
    try {
        const { id } = req.params;

        // Validamos que el ID sea un ObjectId válido
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "El ID proporcionado no es válido"
            });
        }

        const deletedCustomProducts = await customProductsModel.findByIdAndDelete(id);
        
        if (!deletedCustomProducts) {
            return res.status(404).json({
                success: false,
                message: "Producto personalizado no encontrado"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Producto personalizado eliminado exitosamente",
            data: { id: deletedCustomProducts._id }
        });
    } catch (error) {
        console.error('Error en deleteCustomProducts:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al eliminar el producto personalizado",
            error: error.message
        });
    }
};

// Método adicional para obtener proyectos personalizados por cliente
customProductsController.getCustomProductsByClient = async (req, res) => {
    try {
        const { clientId } = req.params;

        // Validamos que el clientId sea un ObjectId válido
        if (!isValidObjectId(clientId)) {
            return res.status(400).json({
                success: false,
                message: "El clientId proporcionado no es válido"
            });
        }

        const customProducts = await customProductsModel.find({ clientId })
            .populate('clientId')
            .populate('categoryId')
            .populate('selectedItems.productId');
        
        if (customProducts.length === 0) {
            return res.status(204).json({
                success: true,
                message: "No hay productos personalizados disponibles para este cliente",
                data: []
            });
        }

        res.status(200).json({
            success: true,
            message: "Productos personalizados del cliente obtenidos exitosamente",
            data: customProducts,
            count: customProducts.length
        });
    } catch (error) {
        console.error('Error en getCustomProductsByClient:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener los productos personalizados del cliente",
            error: error.message
        });
    }
};

// Método adicional para obtener proyectos personalizados por categoría
customProductsController.getCustomProductsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        // Validamos que el categoryId sea un ObjectId válido
        if (!isValidObjectId(categoryId)) {
            return res.status(400).json({
                success: false,
                message: "El categoryId proporcionado no es válido"
            });
        }

        const customProducts = await customProductsModel.find({ categoryId })
            .populate('clientId')
            .populate('categoryId')
            .populate('selectedItems.productId');
        
        if (customProducts.length === 0) {
            return res.status(204).json({
                success: true,
                message: "No hay productos personalizados disponibles para esta categoría",
                data: []
            });
        }

        res.status(200).json({
            success: true,
            message: "Productos personalizados de la categoría obtenidos exitosamente",
            data: customProducts,
            count: customProducts.length
        });
    } catch (error) {
        console.error('Error en getCustomProductsByCategory:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener los productos personalizados de la categoría",
            error: error.message
        });
    }
};

// Método para calcular el total de productos en un proyecto
customProductsController.getProductsSummary = async (req, res) => {
    try {
        const { id } = req.params;

        // Validamos que el ID sea un ObjectId válido
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "El ID proporcionado no es válido"
            });
        }

        const customProduct = await customProductsModel.findById(id)
            .populate('selectedItems.productId');
        
        if (!customProduct) {
            return res.status(404).json({
                success: false,
                message: "Producto personalizado no encontrado"
            });
        }

        const totalProducts = customProduct.selectedItems.reduce((total, item) => {
            return total + (item.quantity || 0);
        }, 0);
        const uniqueProducts = customProduct.selectedItems.length;

        res.status(200).json({
            success: true,
            message: "Resumen del producto obtenido exitosamente",
            data: {
                productId: customProduct._id,
                totalProducts,
                uniqueProducts,
                totalPrice: customProduct.totalPrice,
                selectedItems: customProduct.selectedItems
            }
        });
    } catch (error) {
        console.error('Error en getProductsSummary:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener el resumen del producto",
            error: error.message
        });
    }
};

export default customProductsController;
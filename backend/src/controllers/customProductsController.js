import customProductsModel from "../models/CustomProducts.js";
import mongoose from "mongoose";

const customProductsController = {};

// Función de ayuda para validar ObjectId
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// Tipos de productos válidos
const VALID_PRODUCT_TYPES = ["Ramo de flores naturales", "Ramo de flores secas", "Giftbox"];

// Función de ayuda para validar datos del producto personalizado
const validateCustomProductData = (data, isUpdate = false) => {
    const errors = [];

    // Validamos clientId
    if (!isUpdate && !data.clientId) {
        errors.push("El clientId es requerido");
    } else if (data.clientId && !isValidObjectId(data.clientId)) {
        errors.push("El clientId debe ser un ObjectId válido");
    }

    // Validamos productToPersonalize
    if (!isUpdate && !data.productToPersonalize) {
        errors.push("El tipo de producto a personalizar es requerido");
    } else if (data.productToPersonalize && !VALID_PRODUCT_TYPES.includes(data.productToPersonalize)) {
        errors.push(`El tipo de producto debe ser uno de: ${VALID_PRODUCT_TYPES.join(", ")}`);
    }

    // Validamos selectedMaterials
    if (!isUpdate && (!data.selectedMaterials || data.selectedMaterials.length === 0)) {
        errors.push("Se requiere al menos un material seleccionado");
    } else if (data.selectedMaterials && Array.isArray(data.selectedMaterials)) {
        // Validar límite máximo de materiales
        if (data.selectedMaterials.length > 50) {
            errors.push("No se pueden seleccionar más de 50 materiales");
        }
        
        data.selectedMaterials.forEach((material, index) => {
            if (!material.materialId) {
                errors.push(`El material en la posición ${index + 1} debe tener un materialId válido`);
            } else if (!isValidObjectId(material.materialId)) {
                errors.push(`El materialId en la posición ${index + 1} debe ser un ObjectId válido`);
            }
            
            // Validamos quantity si está presente
            if (material.quantity !== undefined && material.quantity !== null) {
                if (typeof material.quantity !== 'number' || material.quantity < 1 || material.quantity > 1000) {
                    errors.push(`La cantidad en la posición ${index + 1} debe ser un número entre 1 y 1000`);
                }
            }
        });
    }

    // Validamos totalPrice
    if (!isUpdate && (data.totalPrice === undefined || data.totalPrice === null)) {
        errors.push("El precio total es requerido");
    } else if (data.totalPrice !== undefined && data.totalPrice !== null) {
        if (typeof data.totalPrice !== 'number' || data.totalPrice < 0 || data.totalPrice > 999999) {
            errors.push("El precio total debe ser un número entre 0 y 999999");
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
    } else if (data.extraComments && data.extraComments.length < 10) {
        errors.push("Los comentarios extra deben tener al menos 10 caracteres");
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
            .populate('selectedMaterials.materialId');
        
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
            .populate('selectedMaterials.materialId');
        
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
        const { clientId, productToPersonalize, selectedMaterials, referenceImage, extraComments, totalPrice } = req.body;

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
            productToPersonalize,
            selectedMaterials,
            referenceImage,
            extraComments,
            totalPrice
        });

        await newCustomProduct.save();
        
        // Filtramos la respuesta
        const populatedProduct = await customProductsModel.findById(newCustomProduct._id)
            .populate('clientId')
            .populate('selectedMaterials.materialId');

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
        const { clientId, productToPersonalize, selectedMaterials, referenceImage, extraComments, totalPrice } = req.body;

        // Validamos que el ID sea un ObjectId válido
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "El ID proporcionado no es válido"
            });
        }

        // Validamos que al menos un campo esté presente para actualizar
        if (!clientId && !productToPersonalize && !selectedMaterials && !referenceImage && !extraComments && totalPrice === undefined) {
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
            { clientId, productToPersonalize, selectedMaterials, referenceImage, extraComments, totalPrice },
            { new: true, runValidators: true }
        ).populate('clientId')
         .populate('selectedMaterials.materialId');

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

// Método adicional para obtener productos personalizados por cliente
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
            .populate('selectedMaterials.materialId');
        
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

// Método adicional para obtener productos personalizados por tipo de producto
customProductsController.getCustomProductsByType = async (req, res) => {
    try {
        const { productType } = req.params;

        // Validamos que el tipo de producto sea válido
        if (!VALID_PRODUCT_TYPES.includes(productType)) {
            return res.status(400).json({
                success: false,
                message: `El tipo de producto debe ser uno de: ${VALID_PRODUCT_TYPES.join(", ")}`
            });
        }

        const customProducts = await customProductsModel.find({ productToPersonalize: productType })
            .populate('clientId')
            .populate('selectedMaterials.materialId');
        
        if (customProducts.length === 0) {
            return res.status(204).json({
                success: true,
                message: "No hay productos personalizados disponibles para este tipo de producto",
                data: []
            });
        }

        res.status(200).json({
            success: true,
            message: "Productos personalizados por tipo obtenidos exitosamente",
            data: customProducts,
            count: customProducts.length
        });
    } catch (error) {
        console.error('Error en getCustomProductsByType:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener los productos personalizados por tipo",
            error: error.message
        });
    }
};

// Método para calcular el resumen de materiales en un producto
customProductsController.getMaterialsSummary = async (req, res) => {
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
            .populate('selectedMaterials.materialId');
        
        if (!customProduct) {
            return res.status(404).json({
                success: false,
                message: "Producto personalizado no encontrado"
            });
        }

        const totalMaterials = customProduct.selectedMaterials.reduce((total, material) => {
            return total + (material.quantity || 1);
        }, 0);
        const uniqueMaterials = customProduct.selectedMaterials.length;

        res.status(200).json({
            success: true,
            message: "Resumen de materiales obtenido exitosamente",
            data: {
                productId: customProduct._id,
                productType: customProduct.productToPersonalize,
                totalMaterials,
                uniqueMaterials,
                totalPrice: customProduct.totalPrice,
                selectedMaterials: customProduct.selectedMaterials
            }
        });
    } catch (error) {
        console.error('Error en getMaterialsSummary:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener el resumen de materiales",
            error: error.message
        });
    }
};

// Método para obtener estadísticas de productos personalizados
customProductsController.getProductsStatistics = async (req, res) => {
    try {
        const totalProducts = await customProductsModel.countDocuments();
        
        const productTypeStats = await customProductsModel.aggregate([
            {
                $group: {
                    _id: "$productToPersonalize",
                    count: { $sum: 1 },
                    avgPrice: { $avg: "$totalPrice" },
                    totalRevenue: { $sum: "$totalPrice" }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        const recentProducts = await customProductsModel.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('clientId', 'name email')
            .select('productToPersonalize totalPrice createdAt');

        res.status(200).json({
            success: true,
            message: "Estadísticas obtenidas exitosamente",
            data: {
                totalProducts,
                productTypeStats,
                recentProducts
            }
        });
    } catch (error) {
        console.error('Error en getProductsStatistics:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener las estadísticas",
            error: error.message
        });
    }
};

export default customProductsController;
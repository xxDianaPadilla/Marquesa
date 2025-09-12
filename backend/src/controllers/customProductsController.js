import customProductsModel from "../models/CustomProducts.js";
import mongoose from "mongoose";
import { config } from '../config.js';
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.cloudinary_api_key,
    api_secret: config.cloudinary.cloudinary_api_secret,
});

const customProductsController = {};

// Función de ayuda para validar ObjectId
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// Tipos de productos válidos
const VALID_PRODUCT_TYPES = ["Ramo de flores naturales", "Ramo de flores secas", "Giftbox"];

// Función de ayuda para validar datos del producto personalizado
const validateCustomProductData = (data) => {
    const errors = [];

    console.log('=== VALIDANDO DATOS ===');
    console.log('Data to validate:', data);

    // Validar clientId
    if (!data.clientId) {
        errors.push("El ID del cliente es requerido");
    } else if (typeof data.clientId !== 'string' || data.clientId.length !== 24) {
        errors.push("El ID del cliente no tiene un formato válido");
    }

    // Validar productToPersonalize
    const validProductTypes = ["Ramo de flores naturales", "Ramo de flores secas", "Giftbox"];
    if (!data.productToPersonalize) {
        errors.push("El tipo de producto a personalizar es requerido");
    } else if (!validProductTypes.includes(data.productToPersonalize)) {
        errors.push(`El tipo de producto debe ser uno de: ${validProductTypes.join(', ')}`);
    }

    // Validar selectedMaterials
    if (!data.selectedMaterials) {
        errors.push("Debe seleccionar al menos un material");
    } else if (!Array.isArray(data.selectedMaterials)) {
        errors.push("Los materiales seleccionados deben ser un array");
    } else if (data.selectedMaterials.length === 0) {
        errors.push("Debe seleccionar al menos un material");
    } else {
        // Validar cada material
        data.selectedMaterials.forEach((material, index) => {
            if (!material.materialId) {
                errors.push(`Material ${index + 1}: ID del material es requerido`);
            } else if (typeof material.materialId !== 'string' || material.materialId.length !== 24) {
                errors.push(`Material ${index + 1}: ID del material no tiene un formato válido`);
            }

            if (material.quantity !== undefined && (typeof material.quantity !== 'number' || material.quantity < 1)) {
                errors.push(`Material ${index + 1}: La cantidad debe ser un número mayor a 0`);
            }
        });
    }

    // Validar totalPrice
    if (data.totalPrice === undefined || data.totalPrice === null) {
        errors.push("El precio total es requerido");
    } else if (typeof data.totalPrice !== 'number') {
        errors.push("El precio total debe ser un número");
    } else if (data.totalPrice < 0) {
        errors.push("El precio total debe ser un número mayor o igual a 0");
    }

    // Validar extraComments (opcional)
    if (data.extraComments !== undefined && data.extraComments !== null) {
        if (typeof data.extraComments !== 'string') {
            errors.push("Los comentarios adicionales deben ser texto");
        } else if (data.extraComments.trim().length < 10) {
            errors.push("Los comentarios adicionales deben tener al menos 10 caracteres");
        }
    }

    console.log('Validation errors found:', errors);
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

// Método para crear los custom products (ADAPTADO PARA WEB Y MÓVIL)
customProductsController.createCustomProducts = async (req, res) => {
    try {
        console.log('=== DATOS RECIBIDOS EN EL BACKEND ===');
        console.log('req.body:', req.body);
        console.log('req.file:', req.file);
        console.log('Content-Type:', req.headers['content-type']);

        // Procesar los datos según el Content-Type
        let processedData = { ...req.body };

        // CASO 1: FormData (web con imagen)
        if (req.headers['content-type']?.includes('multipart/form-data')) {
            console.log('=== PROCESANDO FORMDATA (WEB CON IMAGEN) ===');
            
            // Si selectedMaterials viene como string (FormData), parsearlo a JSON
            if (typeof processedData.selectedMaterials === 'string') {
                try {
                    processedData.selectedMaterials = JSON.parse(processedData.selectedMaterials);
                    console.log('selectedMaterials parsed from FormData:', processedData.selectedMaterials);
                } catch (parseError) {
                    console.error('Error parsing selectedMaterials:', parseError);
                    return res.status(400).json({
                        success: false,
                        message: "Error en el formato de materiales seleccionados"
                    });
                }
            }

            // Si totalPrice viene como string (FormData), convertirlo a número
            if (typeof processedData.totalPrice === 'string') {
                processedData.totalPrice = Number(processedData.totalPrice);
                console.log('totalPrice converted from FormData:', processedData.totalPrice);
            }
        }
        // CASO 2: JSON (web sin imagen o móvil)
        else if (req.headers['content-type']?.includes('application/json')) {
            console.log('=== PROCESANDO JSON (WEB SIN IMAGEN O MÓVIL) ===');
            
            // Los datos ya vienen en formato correcto desde JSON
            console.log('Datos JSON ya procesados:', processedData);
        }
        // CASO 3: Móvil con imagen (si usas otra forma de envío)
        else {
            console.log('=== PROCESANDO DATOS DE MÓVIL ===');
            
            // Verificar si hay datos de imagen en base64 o URL
            if (processedData.referenceImageBase64) {
                console.log('Imagen en base64 detectada desde móvil');
            }
        }

        // Ahora extraer los datos procesados
        const { 
            clientId, 
            productToPersonalize, 
            selectedMaterials, 
            extraComments, 
            totalPrice,
            referenceImageBase64  // Para móvil
        } = processedData;

        console.log('=== DATOS PROCESADOS ===');
        console.log('clientId:', clientId, typeof clientId);
        console.log('productToPersonalize:', productToPersonalize);
        console.log('selectedMaterials:', selectedMaterials, Array.isArray(selectedMaterials));
        console.log('extraComments:', extraComments);
        console.log('totalPrice:', totalPrice, typeof totalPrice);
        console.log('referenceImageBase64:', !!referenceImageBase64);

        // Crear objeto con datos procesados para validación
        const dataToValidate = {
            clientId,
            productToPersonalize,
            selectedMaterials,
            extraComments,
            totalPrice
        };

        // Validamos datos de entrada
        const validationErrors = validateCustomProductData(dataToValidate);
        if (validationErrors.length > 0) {
            console.log('Validation errors:', validationErrors);
            return res.status(400).json({
                success: false,
                message: "Errores de validación",
                errors: validationErrors
            });
        }

        let referenceImageURL = "";

        // MANEJO DE IMÁGENES UNIVERSAL
        if (req.file) {
            // Imagen desde FormData (web)
            try {
                console.log('=== SUBIENDO IMAGEN DESDE FORMDATA (WEB) ===');
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: "custom-products/reference-images",
                    allowed_formats: ["jpg", "jpeg", "png", "webp"],
                    transformation: [
                        { width: 1200, height: 1200, crop: "limit" },
                        { quality: "auto" }
                    ]
                });
                referenceImageURL = result.secure_url;
                console.log('Imagen web subida exitosamente:', referenceImageURL);
            } catch (cloudinaryError) {
                console.error('Error en Cloudinary (web):', cloudinaryError);
                return res.status(502).json({
                    success: false,
                    message: "Error al procesar la imagen de referencia"
                });
            }
        } else if (referenceImageBase64) {
            // Imagen desde base64 (móvil)
            try {
                console.log('=== SUBIENDO IMAGEN DESDE BASE64 (MÓVIL) ===');
                console.log('Base64 data type:', typeof referenceImageBase64);
                console.log('Base64 data length:', referenceImageBase64.length);
                
                // Verificar y formatear el base64 correctamente
                let base64Data = referenceImageBase64;
                
                // Si no tiene el prefijo data:image, agregarlo
                if (!base64Data.startsWith('data:image')) {
                    base64Data = `data:image/jpeg;base64,${base64Data}`;
                    console.log('Base64 prefix added');
                }
                
                console.log('Uploading to Cloudinary with formatted base64');
                
                const result = await cloudinary.uploader.upload(base64Data, {
                    folder: "custom-products/reference-images",
                    allowed_formats: ["jpg", "jpeg", "png", "webp"],
                    transformation: [
                        { width: 1200, height: 1200, crop: "limit" },
                        { quality: "auto" }
                    ],
                    resource_type: "image"
                });
                referenceImageURL = result.secure_url;
                console.log('Imagen móvil subida exitosamente:', referenceImageURL);
            } catch (cloudinaryError) {
                console.error('Error en Cloudinary (móvil):', cloudinaryError);
                console.error('Cloudinary error details:', {
                    message: cloudinaryError.message,
                    name: cloudinaryError.name,
                    stack: cloudinaryError.stack
                });
                return res.status(502).json({
                    success: false,
                    message: "Error al procesar la imagen de referencia desde móvil",
                    error: cloudinaryError.message
                });
            }
        }

        console.log('=== CREANDO PRODUCTO PERSONALIZADO ===');
        const productData = {
            clientId,
            productToPersonalize,
            selectedMaterials,
            referenceImage: referenceImageURL || undefined,
            extraComments,
            totalPrice
        };
        console.log('Product data:', productData);

        const newCustomProduct = new customProductsModel(productData);

        await newCustomProduct.save();
        console.log('Producto creado exitosamente:', newCustomProduct._id);

        // Poblamos la respuesta con los datos relacionados
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
            const validationErrors = Object.values(error.errors).map(err => err.message);
            console.log('MongoDB Validation errors:', validationErrors);
            return res.status(400).json({
                success: false,
                message: "Error de validación de datos",
                errors: validationErrors
            });
        }

        if (error.name === 'CastError') {
            console.log('MongoDB Cast error:', error.message);
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
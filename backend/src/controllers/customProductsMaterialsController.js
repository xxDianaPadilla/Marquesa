import customProductsMaterials from "../models/customProductsMaterials.js";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";

// Configuración de Cloudinary para el manejo de imágenes
cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.cloudinary_api_key,
    api_secret: config.cloudinary.cloudinary_api_secret
});

const customProductsMaterialsController = {};

// Obtener todos los materiales de productos personalizados
customProductsMaterialsController.getCustomProductsMaterials = async (req, res) => {
    try {
        const materials = await customProductsMaterials.find();
        res.status(200).json({
            success: true,
            data: materials
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener los materiales",
            error: error.message
        });
    }
};

// Obtener un material específico por ID
customProductsMaterialsController.getCustomProductsMaterialById = async (req, res) => {
    try {
        const { id } = req.params;
        const material = await customProductsMaterials.findById(id);

        if (!material) {
            return res.status(404).json({
                success: false,
                message: "Material no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            data: material
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener el material",
            error: error.message
        });
    }
};

customProductsMaterialsController.getMaterialsByProduct = async (req, res) => {
    try {
        const {productType} = req.params;

        const validProducts = ["Ramo de flores naturales", "Ramo de flores secas", "Giftbox"];
        if(!validProducts.includes(productType)){
            return res.status(400).json({
                success: false,
                message: "Tipo de producto no válido"
            });
        }

        const materials = await customProductsMaterials.find({
            productToPersonalize: productType
        });

        const materialsByCategory = materials.reduce((acc, material) => {
            if(!acc[material.categoryToParticipate]){
                acc[material.categoryToParticipate] = [];
            }
            acc[material.categoryToParticipate].push(material);
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            data: {
                productType,
                categories: materialsByCategory,
                totalMaterials: materials.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener los materiales por producto",
            error: error.message
        });
    }
};

customProductsMaterialsController.getMaterialsByCategory = async (req, res) => {
    try {
        const {productType, category} = req.params;

        const materials = await customProductsMaterials.find({
            productToPersonalize: productType,
            categoryToParticipate: category
        });

        res.status(200).json({
            success: true,
            data: materials
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener los materiales por categoría",
            error: error.message
        });
    }
};

// Crear un nuevo material con imagen en Cloudinary
customProductsMaterialsController.createCustomProductsMaterial = async (req, res) => {
    try {
        const { productToPersonalize, categoryToParticipate, name, price, stock } = req.body;

        // Verificar que se haya subido una imagen
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Se requiere una imagen"
            });
        }

        // Subir imagen a Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "custom-products-materials",
            resource_type: "image"
        });

        // Crear el nuevo material con la URL de Cloudinary
        const newMaterial = new customProductsMaterials({
            productToPersonalize,
            categoryToParticipate,
            name,
            image: result.secure_url, 
            price: Number(price),
            stock: Number(stock)
        });

        const savedMaterial = await newMaterial.save();

        res.status(201).json({
            success: true,
            message: "Material creado exitosamente",
            data: savedMaterial
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al crear el material",
            error: error.message
        });
    }
};

// Actualizar un material existente
customProductsMaterialsController.updateCustomProductsMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const { productToPersonalize, categoryToParticipate, name, price, stock } = req.body;

        // Buscar el material existente
        const existingMaterial = await customProductsMaterials.findById(id);
        if (!existingMaterial) {
            return res.status(404).json({
                success: false,
                message: "Material no encontrado"
            });
        }

        // Preparar los datos a actualizar
        const updateData = {
            productToPersonalize,
            categoryToParticipate,
            name,
            price: Number(price),
            stock: Number(stock)
        };

        // Si se subió una nueva imagen, actualizar en Cloudinary
        if (req.file) {
            // Obtener el public_id de la imagen anterior para eliminarla
            const oldImageUrl = existingMaterial.image;
            const publicId = oldImageUrl.split('/').pop().split('.')[0];
            
            // Eliminar la imagen anterior de Cloudinary
            await cloudinary.uploader.destroy(`custom-products-materials/${publicId}`);

            // Subir la nueva imagen
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "custom-products-materials",
                resource_type: "image"
            });

            updateData.image = result.secure_url;
        }

        const updatedMaterial = await customProductsMaterials.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Material actualizado exitosamente",
            data: updatedMaterial
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar el material",
            error: error.message
        });
    }
};

// Eliminar un material
customProductsMaterialsController.deleteCustomProductsMaterial = async (req, res) => {
    try {
        const { id } = req.params;

        // Buscar el material para obtener la URL de la imagen
        const material = await customProductsMaterials.findById(id);
        if (!material) {
            return res.status(404).json({
                success: false,
                message: "Material no encontrado"
            });
        }

        // Obtener el public_id de la imagen para eliminarla de Cloudinary
        const imageUrl = material.image;
        const publicId = imageUrl.split('/').pop().split('.')[0];

        // Eliminar la imagen de Cloudinary
        await cloudinary.uploader.destroy(`custom-products-materials/${publicId}`);

        // Eliminar el material de la base de datos
        await customProductsMaterials.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Material eliminado exitosamente"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar el material",
            error: error.message
        });
    }
};

export default customProductsMaterialsController;
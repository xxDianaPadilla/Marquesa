import productsModel from '../models/products.js';
import {v2 as cloudinary} from "cloudinary";
import { config } from "../config.js";

cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.cloudinary_api_key,
    api_secret: config.cloudinary.cloudinary_api_secret
});

const productsController = {};

productsController.getProducts = async (req, res) => {
    try {
        const products = await productsModel.find().populate('categoryId');
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

productsController.createProducts = async (req, res) => {
    try {
        const { name, description, price, stock, categoryId, isPersonalizable, details } = req.body;
        
        // Validar campos requeridos
        if (!name || !description || !price || !categoryId) {
            return res.status(400).json({ 
                error: 'Faltan campos requeridos: name, description, price, categoryId' 
            });
        }
        
        let images = [];
        
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(
                    file.path,
                    {
                        folder: "products",
                        allowed_formats: ["jpg", "png", "jpeg"]
                    }
                );
                images.push({ image: result.secure_url });
            }
        }
        
        const newProduct = await productsModel.create({
            name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock) || 0,
            categoryId,
            isPersonalizable: isPersonalizable === 'true',
            details,
            images
        });
        
        res.status(201).json(newProduct);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

productsController.deleteProducts = async (req, res) => {
    try {
        const deleteProduct = await productsModel.findByIdAndDelete(req.params.id);
        
        if (!deleteProduct) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        if (deleteProduct.images && deleteProduct.images.length > 0) {
            for (const img of deleteProduct.images) {
                const publicId = img.image.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`products/${publicId}`);
            }
        }
        
        res.json({ message: "Producto eliminado exitosamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

productsController.updateProducts = async (req, res) => {
    try {
        const { name, description, price, stock, categoryId, isPersonalizable, details } = req.body;
        
        const updateData = {
            name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock),
            categoryId,
            isPersonalizable: isPersonalizable === 'true',
            details
        };
        
        // Remover campos undefined
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined || updateData[key] === null || updateData[key] === '') {
                delete updateData[key];
            }
        });
        
        if (req.files && req.files.length > 0) {
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
        }
        
        const updatedProduct = await productsModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!updatedProduct) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.json(updatedProduct);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

productsController.getProduct = async (req, res) => {
    try {
        const product = await productsModel.findById(req.params.id).populate('categoryId');
        
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default productsController;
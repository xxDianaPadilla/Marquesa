import productsModel from "../models/products.js";
import { v2 as cloudinary } from "cloudinary";


import { config } from "../config.js";

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.cloudinary_api_key,
  api_secret: config.cloudinary.cloudinary_api_secret,
});

const productsController = {};

productsController.getProducts = async (req, res) => {
    try {
    const products = await productsModel.find().populate('categoryId');
  res.status(200).json(products);
    } catch (error) {
    console.error("Error al obtener los productos:", error);
    res.status(500).json({ message: "Error al obtener los productos" });
    }
};

productsController.getProduct = async (req, res) => {
try {
const product = await productsModel.findById(req.params.id).populate('categoryId');
  if (!product) {
    return res.status(404).json({ message: "Producto no encontrado" });
  }
  res.status(200).json(product);
} catch (error) {
    console.error("Error al obtener el producto:", error);
    res.status(500).json({ message: "Error al obtener el producto" });
}
};

productsController.createProducts = async (req, res) => {
  try {
    const { name, description, price, stock, categoryId, isPersonalizable, details } = req.body;
    let imageURL = "";

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: "El nombre del producto es requerido y debe ser un texto" });
    }

    if (!description || typeof description !== 'string') {
      return res.status(400).json({ message: "La descripción es requerida y debe ser un texto" });
    }

    if (price === undefined || typeof price !== 'number' || price < 0) {
      return res.status(400).json({ message: "El precio es requerido, debe ser numérico y mayor o igual a 0" });
    }

    if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
      return res.status(400).json({ message: "El stock debe ser un número mayor o igual a 0" });
    }

    if (!categoryId || typeof categoryId !== 'string') {
      return res.status(400).json({ message: "El ID de categoría es requerido y debe ser un texto" });
    }

    

    if (isPersonalizable !== undefined && typeof isPersonalizable !== 'boolean') {
      return res.status(400).json({ message: "El campo 'isPersonalizable' debe ser booleano (true/false)" });
    }

    if (details && typeof details !== 'string') {
      return res.status(400).json({ message: "El campo 'details' debe ser una cadena de texto" });
    }

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "public",
        allowed_formats: ["jpg", "png", "jpeg"],
      });
      imageURL = result.secure_url;
    }

    // Crear el producto
    const newProduct = new productsModel({
      name,
      description,
      price,
      stock: stock || 0,
      categoryId,
      images: imageURL ,
      isPersonalizable,
      details,
    });

    await newProduct.save();
    res.status(201).json({ message: "Producto creado con éxito" });

  } catch (error) {
    console.error("Error al crear el producto:", error);
    return res.status(500).json({ message: "Error al crear el producto" });
  }
};

productsController.updateProducts = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      categoryId,
      isPersonalizable,
      details,
    } = req.body;
    let imageURL = "";

    //subir la imagen a Cloudinary
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "public",
        allowed_formats: ["jpg", "png", "jpeg"],
      });
      imageURL = result.secure_url;
    }
    // Validaciones de campos si existen
    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      return res.status(400).json({ message: "El nombre debe ser una cadena no vacía" });
    }

    if (description !== undefined && (typeof description !== 'string' || description.trim() === '')) {
      return res.status(400).json({ message: "La descripción debe ser una cadena no vacía" });
    }

    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return res.status(400).json({ message: "El precio debe ser un número mayor o igual a 0" });
    }

    if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
      return res.status(400).json({ message: "El stock debe ser un número mayor o igual a 0" });
    }

    if (categoryId !== undefined && typeof categoryId !== 'string') {
      return res.status(400).json({ message: "El ID de categoría debe ser una cadena" });
    }

    if (isPersonalizable !== undefined && typeof isPersonalizable !== 'boolean') {
      return res.status(400).json({ message: "El campo isPersonalizable debe ser booleano" });
    }
    if (details && typeof details !== 'string') {
      return res.status(400).json({ message: "El campo 'details' debe ser una cadena de texto" });
    }

    const updatedProduct = await productsModel.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price,
        stock: stock || 0,
        categoryId,
        images: imageURL,
        isPersonalizable,
        details,
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json({ message: "Producto actualizado con éxito" });

  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    res.status(500).json({ message: "Error al actualizar el producto" });
  }
};


productsController.deleteProducts = async (req, res) => {
    try {
const deletedProduct = await productsModel.findByIdAndDelete(req.params.id);
  if (!deletedProduct) {
    return res.status(404).json({ message: "Producto no encontrado" });
  }
  res.json({ message: "Producto eliminado con éxito" });
        
    } catch (error) {
    console.error("Error al eliminar el producto:", error);
    res.status(500).json({ message: "Error al eliminar el producto" });
    }
 
};

export default productsController;
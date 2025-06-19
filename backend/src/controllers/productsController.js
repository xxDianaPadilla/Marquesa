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
    let imageURL = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "public",
          allowed_formats: ["jpg", "png", "jpeg"],
        });
        imageURL.push(result.secure_url);
      }
    }

    const newProduct = new productsModel({
      name: JSON.parse(name),
      description: JSON.parse(description),
      price,
      stock: stock || 0,
      categoryId,
      images: imageURL,
      isPersonalizable,
      details: JSON.parse(details),
    });

    await newProduct.save();
    res.status(201).json({ message: "Producto creado con éxito" });

  } catch (error) {
    console.error("Error al crear el producto:", error);
    res.status(500).json({ message: "Error al crear el producto" });
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

    let imageURL = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "public",
          allowed_formats: ["jpg", "png", "jpeg"],
        });
        imageURL.push(result.secure_url);
      }
    }

    const updatedFields = {
      name: JSON.parse(name),
      description: JSON.parse(description),
      price,
      stock: stock || 0,
      categoryId,
      isPersonalizable,
      details: JSON.parse(details),
    };

    if (imageURL.length > 0) {
      updatedFields.images = imageURL;
    }

    const updatedProduct = await productsModel.findByIdAndUpdate(
      req.params.id,
      updatedFields,
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
import mediaModel from "../models/Media.js";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.cloudinary_api_key,
  api_secret: config.cloudinary.cloudinary_api_secret,
});

const mediaController = {};

// Obtener todos los elementos de media
mediaController.getAllMedia = async (req, res) => {
  try {
    const { type, search } = req.query;
    let filter = {};

    // Filtrar por tipo si se proporciona
    if (type && type !== 'todos') {
      filter.type = type;
    }

    // Buscar en título o descripción si se proporciona (campos adicionales del schema)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const mediaItems = await mediaModel.find(filter).sort({ createdAt: -1 });
    res.status(200).json(mediaItems);
  } catch (error) {
    console.error("Error al obtener los elementos de media:", error);
    res.status(500).json({ message: "Error al obtener los elementos de media" });
  }
};

// Obtener un elemento de media por ID
mediaController.getMediaById = async (req, res) => {
  try {
    const media = await mediaModel.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ message: "Elemento de media no encontrado" });
    }
    res.status(200).json(media);
  } catch (error) {
    console.error("Error al obtener el elemento de media:", error);
    res.status(500).json({ message: "Error al obtener el elemento de media" });
  }
};

// Crear nuevo elemento de media
mediaController.insertMedia = async (req, res) => {
  try {
    const { type, title, description } = req.body;
    let imageURL = "";
    let videoURL = "";

    // Subir imagen si se proporciona
    if (req.files && req.files.image && req.files.image[0]) {
      const imageResult = await cloudinary.uploader.upload(req.files.image[0].path, {
        folder: "media/images",
        allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"],
      });
      imageURL = imageResult.secure_url;
    }

    // Subir video si se proporciona
    if (req.files && req.files.video && req.files.video[0]) {
      const videoResult = await cloudinary.uploader.upload(req.files.video[0].path, {
        folder: "media/videos",
        resource_type: "video",
        allowed_formats: ["mp4", "mov", "avi", "wmv"],
      });
      videoURL = videoResult.secure_url;
    }

    // Verificar que al menos uno tenga contenido
    if (!imageURL && !videoURL) {
      return res.status(400).json({
        message: "Se requiere al menos una imagen o un video"
      });
    }

    // Si el modelo requiere que ambos campos tengan valor, usar un placeholder
    // o cambiar el modelo para que no sean required
    const newMedia = new mediaModel({
      type,
      imageURL: imageURL || "N/A", // Usar placeholder si está vacío
      videoURL: videoURL || "N/A", // Usar placeholder si está vacío
      title,
      description
    });

    await newMedia.save();
    res.status(201).json({
      message: "Elemento de media creado con éxito",
      media: newMedia
    });

  } catch (error) {
    console.error("Error al crear el elemento de media:", error);
    
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Error de validación", 
        details: error.message 
      });
    }
    
    res.status(500).json({ message: "Error al crear el elemento de media" });
  }
};

// Actualizar elemento de media
mediaController.putMedia = async (req, res) => {
  try {
    const { type, title, description } = req.body;
    const mediaId = req.params.id;

    // Buscar el elemento existente
    const existingMedia = await mediaModel.findById(mediaId);
    if (!existingMedia) {
      return res.status(404).json({ message: "Elemento de media no encontrado" });
    }

    // Preparar campos a actualizar
    const updatedFields = {
      type,
      title,
      description,
      imageURL: existingMedia.imageURL, // Mantener URLs existentes
      videoURL: existingMedia.videoURL
    };

    // Actualizar imagen si se proporciona nueva
    if (req.files && req.files.image && req.files.image[0]) {
      const imageResult = await cloudinary.uploader.upload(req.files.image[0].path, {
        folder: "media/images",
        allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"],
      });
      updatedFields.imageURL = imageResult.secure_url;
    }

    // Actualizar video si se proporciona nuevo
    if (req.files && req.files.video && req.files.video[0]) {
      const videoResult = await cloudinary.uploader.upload(req.files.video[0].path, {
        folder: "media/videos",
        resource_type: "video",
        allowed_formats: ["mp4", "mov", "avi", "wmv"],
      });
      updatedFields.videoURL = videoResult.secure_url;
    }

    const updatedMedia = await mediaModel.findByIdAndUpdate(
      mediaId,
      updatedFields,
      { new: true }
    );

    res.json({ 
      message: "Elemento de media actualizado con éxito",
      media: updatedMedia 
    });

  } catch (error) {
    console.error("Error al actualizar el elemento de media:", error);
    res.status(500).json({ message: "Error al actualizar el elemento de media" });
  }
};

// Eliminar elemento de media
mediaController.deleteMedia = async (req, res) => {
  try {
    const mediaId = req.params.id;
    
    // Buscar el elemento a eliminar
    const mediaToDelete = await mediaModel.findById(mediaId);
    if (!mediaToDelete) {
      return res.status(404).json({ message: "Elemento de media no encontrado" });
    }

    // Eliminar de la base de datos
    await mediaModel.findByIdAndDelete(mediaId);
    
    res.json({ message: "Elemento de media eliminado con éxito" });

  } catch (error) {
    console.error("Error al eliminar el elemento de media:", error);
    res.status(500).json({ message: "Error al eliminar el elemento de media" });
  }
};

export default mediaController;
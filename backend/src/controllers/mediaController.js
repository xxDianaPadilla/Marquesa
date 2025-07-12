import mediaModel from "../models/Media.js";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.cloudinary_api_key,
  api_secret: config.cloudinary.cloudinary_api_secret,
});

const mediaController = {};

// CORREGIDO: Obtener todos los elementos de media - devuelve array directo
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
    
    // CORREGIDO: Devolver array directo para compatibilidad con frontend
    res.status(200).json(mediaItems);
  } catch (error) {
    console.error("Error al obtener los elementos de media:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener los elementos de media",
      error: error.message 
    });
  }
};

// Obtener un elemento de media por ID
mediaController.getMediaById = async (req, res) => {
  try {
    const media = await mediaModel.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ 
        success: false,
        message: "Elemento de media no encontrado" 
      });
    }
    res.status(200).json({
      success: true,
      data: media
    });
  } catch (error) {
    console.error("Error al obtener el elemento de media:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener el elemento de media",
      error: error.message 
    });
  }
};

// Crear nuevo elemento de media
mediaController.insertMedia = async (req, res) => {
  try {
    const { type, title, description } = req.body;
    let imageURL = "";
    let videoURL = "";

    // Validaciones básicas
    if (!type) {
      return res.status(400).json({
        success: false,
        message: "El tipo es requerido"
      });
    }

    const validTypes = ['Dato Curioso', 'Tip', 'Blog'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Tipo no válido. Debe ser: " + validTypes.join(", ")
      });
    }

    // Subir imagen si se proporciona
    if (req.files && req.files.image && req.files.image[0]) {
      try {
        const imageResult = await cloudinary.uploader.upload(req.files.image[0].path, {
          folder: "media/images",
          allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"],
          transformation: [
            { width: 1200, height: 800, crop: "limit" },
            { quality: "auto" }
          ]
        });
        imageURL = imageResult.secure_url;
      } catch (cloudinaryError) {
        console.error("Error uploading image to Cloudinary:", cloudinaryError);
        return res.status(502).json({
          success: false,
          message: "Error al procesar la imagen"
        });
      }
    }

    // Subir video si se proporciona
    if (req.files && req.files.video && req.files.video[0]) {
      try {
        const videoResult = await cloudinary.uploader.upload(req.files.video[0].path, {
          folder: "media/videos",
          resource_type: "video",
          allowed_formats: ["mp4", "mov", "avi", "wmv"],
        });
        videoURL = videoResult.secure_url;
      } catch (cloudinaryError) {
        console.error("Error uploading video to Cloudinary:", cloudinaryError);
        return res.status(502).json({
          success: false,
          message: "Error al procesar el video"
        });
      }
    }

    // Verificar que al menos uno tenga contenido
    if (!imageURL && !videoURL) {
      return res.status(400).json({
        success: false,
        message: "Se requiere al menos una imagen o un video"
      });
    }

    // Crear el nuevo elemento de media
    const newMedia = new mediaModel({
      type,
      imageURL: imageURL || "N/A", // Usar placeholder si está vacío
      videoURL: videoURL || "N/A", // Usar placeholder si está vacío
      title: title || "",
      description: description || ""
    });

    await newMedia.save();
    
    res.status(201).json({
      success: true,
      message: "Elemento de media creado con éxito",
      data: newMedia
    });

  } catch (error) {
    console.error("Error al crear el elemento de media:", error);
    
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: "Error de validación", 
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Error al crear el elemento de media",
      error: error.message 
    });
  }
};

// Actualizar elemento de media con mejor manejo de errores
mediaController.putMedia = async (req, res) => {
  try {
    const { type, title, description } = req.body;
    const mediaId = req.params.id;

    // Configurar timeout más largo para operaciones con archivos
    req.setTimeout(60000); // 60 segundos

    // Buscar el elemento existente
    const existingMedia = await mediaModel.findById(mediaId);
    if (!existingMedia) {
      return res.status(404).json({ 
        success: false,
        message: "Elemento de media no encontrado" 
      });
    }

    // Validar tipo si se proporciona
    if (type) {
      const validTypes = ['Dato Curioso', 'Tip', 'Blog'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Tipo no válido. Debe ser: " + validTypes.join(", ")
        });
      }
    }

    // Preparar campos a actualizar
    const updatedFields = {
      type: type || existingMedia.type,
      title: title !== undefined ? title : existingMedia.title,
      description: description !== undefined ? description : existingMedia.description,
      imageURL: existingMedia.imageURL,
      videoURL: existingMedia.videoURL
    };

    // Función auxiliar para subir con reintentos
    const uploadWithRetry = async (file, options, maxRetries = 3) => {
      let lastError;
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await cloudinary.uploader.upload(file.path, options);
        } catch (error) {
          lastError = error;
          
          if (attempt < maxRetries) {
            console.log(`Reintentando subida... Intento ${attempt + 1}/${maxRetries}`);
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
            continue;
          }
          
          throw error;
        }
      }
      
      throw lastError;
    };

    // Actualizar imagen si se proporciona nueva
    if (req.files && req.files.image && req.files.image[0]) {
      try {
        const imageResult = await uploadWithRetry(req.files.image[0], {
          folder: "media/images",
          allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"],
          transformation: [
            { width: 1200, height: 800, crop: "limit" },
            { quality: "auto" }
          ],
          timeout: 30000 // 30 segundos timeout para Cloudinary
        });
        updatedFields.imageURL = imageResult.secure_url;
      } catch (error) {
        console.error("Error al subir imagen:", error);
        return res.status(500).json({ 
          success: false,
          message: "Error al procesar la imagen. Intenta con un archivo más pequeño." 
        });
      }
    }

    // Actualizar video si se proporciona nuevo
    if (req.files && req.files.video && req.files.video[0]) {
      try {
        const videoResult = await uploadWithRetry(req.files.video[0], {
          folder: "media/videos",
          resource_type: "video",
          allowed_formats: ["mp4", "mov", "avi", "wmv"],
          timeout: 60000 // 60 segundos timeout para videos
        });
        updatedFields.videoURL = videoResult.secure_url;
      } catch (error) {
        console.error("Error al subir video:", error);
        return res.status(500).json({ 
          success: false,
          message: "Error al procesar el video. Intenta con un archivo más pequeño." 
        });
      }
    }

    const updatedMedia = await mediaModel.findByIdAndUpdate(
      mediaId,
      updatedFields,
      { new: true, runValidators: true }
    );

    res.status(200).json({ 
      success: true,
      message: "Elemento de media actualizado con éxito",
      data: updatedMedia 
    });

  } catch (error) {
    console.error("Error al actualizar el elemento de media:", error);
    
    // Proporcionar respuestas más específicas según el tipo de error
    if (error.code === 'ECONNRESET') {
      res.status(500).json({ 
        success: false,
        message: "La conexión se interrumpió durante la actualización. Intenta nuevamente." 
      });
    } else if (error.code === 'ETIMEDOUT') {
      res.status(500).json({ 
        success: false,
        message: "La operación tardó demasiado tiempo. Intenta con archivos más pequeños." 
      });
    } else if (error.name === 'ValidationError') {
      res.status(400).json({ 
        success: false,
        message: "Error de validación", 
        details: Object.values(error.errors).map(err => err.message)
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: "Error al actualizar el elemento de media",
        error: error.message 
      });
    }
  }
};

// Eliminar elemento de media
mediaController.deleteMedia = async (req, res) => {
  try {
    const mediaId = req.params.id;
    
    // Buscar el elemento a eliminar
    const mediaToDelete = await mediaModel.findById(mediaId);
    if (!mediaToDelete) {
      return res.status(404).json({ 
        success: false,
        message: "Elemento de media no encontrado" 
      });
    }

    // Eliminar de la base de datos
    await mediaModel.findByIdAndDelete(mediaId);
    
    res.status(200).json({ 
      success: true,
      message: "Elemento de media eliminado con éxito",
      data: {
        id: mediaToDelete._id
      }
    });

  } catch (error) {
    console.error("Error al eliminar el elemento de media:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al eliminar el elemento de media",
      error: error.message 
    });
  }
};

export default mediaController;
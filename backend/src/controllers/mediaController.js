import mediaModel from "../models/Media.js";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.cloudinary_api_key,
  api_secret: config.cloudinary.cloudinary_api_secret,
});

const mediaController = {};

// Función helper para validar ObjectId de MongoDB
const validateObjectId = (id) => {
  if (!id || typeof id !== 'string') {
    return { isValid: false, error: "ID es requerido" };
  }
  
  const trimmedId = id.trim();
  
  if (!/^[0-9a-fA-F]{24}$/.test(trimmedId)) {
    return { isValid: false, error: "ID no válido" };
  }
  
  return { isValid: true, value: trimmedId };
};

// Función helper para validar tipo de media
const validateMediaType = (type) => {
  if (!type || typeof type !== 'string') {
    return { isValid: false, error: "Tipo es requerido" };
  }
  
  const trimmedType = type.trim();
  const validTypes = ['Dato Curioso', 'Tip', 'Blog'];
  
  if (!validTypes.includes(trimmedType)) {
    return { 
      isValid: false, 
      error: `Tipo no válido. Debe ser: ${validTypes.join(", ")}` 
    };
  }
  
  return { isValid: true, value: trimmedType };
};

// Función helper para validar texto (título/descripción)
const validateText = (text, fieldName, maxLength = 500) => {
  if (text !== undefined && text !== null) {
    if (typeof text !== 'string') {
      return { isValid: false, error: `${fieldName} debe ser texto` };
    }
    
    if (text.length > maxLength) {
      return { isValid: false, error: `${fieldName} excede la longitud máxima de ${maxLength} caracteres` };
    }
  }
  
  return { isValid: true, value: text || "" };
};

// Función helper para validar archivos
const validateFile = (file, type) => {
  if (!file) return { isValid: true };
  
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/wmv'];
  
  const maxImageSize = 10 * 1024 * 1024; // 10MB
  const maxVideoSize = 50 * 1024 * 1024; // 50MB
  
  if (type === 'image') {
    if (!allowedImageTypes.includes(file.mimetype)) {
      return { isValid: false, error: "Tipo de imagen no permitido. Formatos válidos: JPG, PNG, GIF, WEBP" };
    }
    
    if (file.size > maxImageSize) {
      return { isValid: false, error: "Imagen demasiado grande. Máximo 10MB" };
    }
  } else if (type === 'video') {
    if (!allowedVideoTypes.includes(file.mimetype)) {
      return { isValid: false, error: "Tipo de video no permitido. Formatos válidos: MP4, MOV, AVI, WMV" };
    }
    
    if (file.size > maxVideoSize) {
      return { isValid: false, error: "Video demasiado grande. Máximo 50MB" };
    }
  }
  
  return { isValid: true };
};

// Función helper para validar configuración de Cloudinary
const validateCloudinaryConfig = () => {
  if (!config.cloudinary.cloud_name || 
      !config.cloudinary.cloudinary_api_key || 
      !config.cloudinary.cloudinary_api_secret) {
    return { isValid: false, error: "Configuración de Cloudinary incompleta" };
  }
  
  return { isValid: true };
};

// Obtener todos los elementos de media - devuelve array directo
mediaController.getAllMedia = async (req, res) => {
  try {
    const { type, search } = req.query;
    let filter = {};

    // Validar tipo si se proporciona
    if (type && type !== 'todos') {
      const typeValidation = validateMediaType(type);
      if (!typeValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: typeValidation.error
        });
      }
      filter.type = typeValidation.value;
    }

    // Validar búsqueda si se proporciona
    if (search) {
      if (typeof search !== 'string') {
        return res.status(400).json({
          success: false,
          message: "Parámetro de búsqueda debe ser texto"
        });
      }
      
      const trimmedSearch = search.trim();
      if (trimmedSearch.length > 100) {
        return res.status(400).json({
          success: false,
          message: "Término de búsqueda demasiado largo"
        });
      }
      
      if (trimmedSearch.length > 0) {
        filter.$or = [
          { title: { $regex: trimmedSearch, $options: 'i' } },
          { description: { $regex: trimmedSearch, $options: 'i' } }
        ];
      }
    }

    const mediaItems = await mediaModel.find(filter).sort({ createdAt: -1 });
    
    // Devolver array directo para compatibilidad con frontend
    res.status(200).json(mediaItems);
  } catch (error) {
    console.error("Error al obtener los elementos de media:", error);
    
    // Manejar errores específicos de MongoDB
    if (error.name === 'MongoNetworkError') {
      return res.status(503).json({ 
        success: false,
        message: "Servicio de base de datos no disponible temporalmente"
      });
    }
    
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
    const { id } = req.params;
    
    // Validar ID
    const idValidation = validateObjectId(id);
    if (!idValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: idValidation.error 
      });
    }
    
    const media = await mediaModel.findById(idValidation.value);
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
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: "ID de elemento no válido" 
      });
    }
    
    if (error.name === 'MongoNetworkError') {
      return res.status(503).json({ 
        success: false,
        message: "Servicio de base de datos no disponible temporalmente"
      });
    }
    
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

    // Validar tipo
    const typeValidation = validateMediaType(type);
    if (!typeValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: typeValidation.error
      });
    }

    // Validar título
    const titleValidation = validateText(title, "Título", 200);
    if (!titleValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: titleValidation.error
      });
    }

    // Validar descripción
    const descriptionValidation = validateText(description, "Descripción", 1000);
    if (!descriptionValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: descriptionValidation.error
      });
    }

    // Validar archivos
    const imageFile = req.files?.image?.[0];
    const videoFile = req.files?.video?.[0];

    if (imageFile) {
      const imageValidation = validateFile(imageFile, 'image');
      if (!imageValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: imageValidation.error
        });
      }
    }

    if (videoFile) {
      const videoValidation = validateFile(videoFile, 'video');
      if (!videoValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: videoValidation.error
        });
      }
    }

    // Verificar que al menos uno tenga contenido
    if (!imageFile && !videoFile) {
      return res.status(400).json({
        success: false,
        message: "Se requiere al menos una imagen o un video"
      });
    }

    // Validar configuración de Cloudinary
    const cloudinaryValidation = validateCloudinaryConfig();
    if (!cloudinaryValidation.isValid) {
      console.error("Configuración de Cloudinary incompleta");
      return res.status(500).json({
        success: false,
        message: "Error de configuración del servicio de archivos"
      });
    }

    // Subir imagen si se proporciona
    if (imageFile) {
      try {
        const imageResult = await cloudinary.uploader.upload(imageFile.path, {
          folder: "media/images",
          allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"],
          transformation: [
            { width: 1200, height: 800, crop: "limit" },
            { quality: "auto" }
          ],
          timeout: 30000
        });
        imageURL = imageResult.secure_url;
      } catch (cloudinaryError) {
        console.error("Error uploading image to Cloudinary:", cloudinaryError);
        return res.status(502).json({
          success: false,
          message: "Error al procesar la imagen. Intenta con un archivo más pequeño."
        });
      }
    }

    // Subir video si se proporciona
    if (videoFile) {
      try {
        const videoResult = await cloudinary.uploader.upload(videoFile.path, {
          folder: "media/videos",
          resource_type: "video",
          allowed_formats: ["mp4", "mov", "avi", "wmv"],
          timeout: 60000
        });
        videoURL = videoResult.secure_url;
      } catch (cloudinaryError) {
        console.error("Error uploading video to Cloudinary:", cloudinaryError);
        return res.status(502).json({
          success: false,
          message: "Error al procesar el video. Intenta con un archivo más pequeño."
        });
      }
    }

    // Crear el nuevo elemento de media
    const newMedia = new mediaModel({
      type: typeValidation.value,
      imageURL: imageURL || "N/A",
      videoURL: videoURL || "N/A",
      title: titleValidation.value,
      description: descriptionValidation.value
    });

    await newMedia.save();
    
    res.status(201).json({
      success: true,
      message: "Elemento de media creado con éxito",
      data: newMedia
    });

  } catch (error) {
    console.error("Error al crear el elemento de media:", error);
    
    // Manejar errores específicos
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: "Error de validación", 
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.name === 'MongoNetworkError') {
      return res.status(503).json({ 
        success: false,
        message: "Servicio de base de datos no disponible temporalmente"
      });
    }
    
    if (error.code === 11000) {
      return res.status(409).json({ 
        success: false,
        message: "Elemento duplicado"
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
    const { id: mediaId } = req.params;

    // Validar ID
    const idValidation = validateObjectId(mediaId);
    if (!idValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: idValidation.error 
      });
    }

    // Configurar timeout más largo para operaciones con archivos
    req.setTimeout(60000); // 60 segundos

    // Buscar el elemento existente
    const existingMedia = await mediaModel.findById(idValidation.value);
    if (!existingMedia) {
      return res.status(404).json({ 
        success: false,
        message: "Elemento de media no encontrado" 
      });
    }

    // Validar tipo si se proporciona
    let validatedType = existingMedia.type;
    if (type !== undefined) {
      const typeValidation = validateMediaType(type);
      if (!typeValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: typeValidation.error
        });
      }
      validatedType = typeValidation.value;
    }

    // Validar título
    const titleValidation = validateText(title, "Título", 200);
    if (!titleValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: titleValidation.error
      });
    }

    // Validar descripción
    const descriptionValidation = validateText(description, "Descripción", 1000);
    if (!descriptionValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: descriptionValidation.error
      });
    }

    // Validar archivos
    const imageFile = req.files?.image?.[0];
    const videoFile = req.files?.video?.[0];

    if (imageFile) {
      const imageValidation = validateFile(imageFile, 'image');
      if (!imageValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: imageValidation.error
        });
      }
    }

    if (videoFile) {
      const videoValidation = validateFile(videoFile, 'video');
      if (!videoValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: videoValidation.error
        });
      }
    }

    // Validar configuración de Cloudinary si hay archivos nuevos
    if (imageFile || videoFile) {
      const cloudinaryValidation = validateCloudinaryConfig();
      if (!cloudinaryValidation.isValid) {
        console.error("Configuración de Cloudinary incompleta");
        return res.status(500).json({
          success: false,
          message: "Error de configuración del servicio de archivos"
        });
      }
    }

    // Preparar campos a actualizar
    const updatedFields = {
      type: validatedType,
      title: titleValidation.value !== undefined ? titleValidation.value : existingMedia.title,
      description: descriptionValidation.value !== undefined ? descriptionValidation.value : existingMedia.description,
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
    if (imageFile) {
      try {
        const imageResult = await uploadWithRetry(imageFile, {
          folder: "media/images",
          allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"],
          transformation: [
            { width: 1200, height: 800, crop: "limit" },
            { quality: "auto" }
          ],
          timeout: 30000
        });
        updatedFields.imageURL = imageResult.secure_url;
      } catch (error) {
        console.error("Error al subir imagen:", error);
        return res.status(502).json({ 
          success: false,
          message: "Error al procesar la imagen. Intenta con un archivo más pequeño." 
        });
      }
    }

    // Actualizar video si se proporciona nuevo
    if (videoFile) {
      try {
        const videoResult = await uploadWithRetry(videoFile, {
          folder: "media/videos",
          resource_type: "video",
          allowed_formats: ["mp4", "mov", "avi", "wmv"],
          timeout: 60000
        });
        updatedFields.videoURL = videoResult.secure_url;
      } catch (error) {
        console.error("Error al subir video:", error);
        return res.status(502).json({ 
          success: false,
          message: "Error al procesar el video. Intenta con un archivo más pequeño." 
        });
      }
    }

    const updatedMedia = await mediaModel.findByIdAndUpdate(
      idValidation.value,
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
      return res.status(500).json({ 
        success: false,
        message: "La conexión se interrumpió durante la actualización. Intenta nuevamente." 
      });
    }
    
    if (error.code === 'ETIMEDOUT') {
      return res.status(500).json({ 
        success: false,
        message: "La operación tardó demasiado tiempo. Intenta con archivos más pequeños." 
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: "Error de validación", 
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: "ID de elemento no válido" 
      });
    }
    
    if (error.name === 'MongoNetworkError') {
      return res.status(503).json({ 
        success: false,
        message: "Servicio de base de datos no disponible temporalmente"
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Error al actualizar el elemento de media",
      error: error.message 
    });
  }
};

// Eliminar elemento de media
mediaController.deleteMedia = async (req, res) => {
  try {
    const { id: mediaId } = req.params;
    
    // Validar ID
    const idValidation = validateObjectId(mediaId);
    if (!idValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: idValidation.error 
      });
    }
    
    // Buscar el elemento a eliminar
    const mediaToDelete = await mediaModel.findById(idValidation.value);
    if (!mediaToDelete) {
      return res.status(404).json({ 
        success: false,
        message: "Elemento de media no encontrado" 
      });
    }

    // Eliminar de la base de datos
    await mediaModel.findByIdAndDelete(idValidation.value);
    
    res.status(200).json({ 
      success: true,
      message: "Elemento de media eliminado con éxito",
      data: {
        id: mediaToDelete._id
      }
    });

  } catch (error) {
    console.error("Error al eliminar el elemento de media:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: "ID de elemento no válido" 
      });
    }
    
    if (error.name === 'MongoNetworkError') {
      return res.status(503).json({ 
        success: false,
        message: "Servicio de base de datos no disponible temporalmente"
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Error al eliminar el elemento de media",
      error: error.message 
    });
  }
};

export default mediaController;
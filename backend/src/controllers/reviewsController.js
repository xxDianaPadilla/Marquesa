import reviewsModel from "../models/Reviews.js";
import mongoose from "mongoose";

const reviewsController = {};

// Función helper para validar ObjectId
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// Función helper para validar rating
const validateRating = (rating) => {
    if (rating === undefined || rating === null) {
        return { isValid: false, error: "La calificación es requerida" };
    }
    
    const numericRating = parseInt(rating);
    
    if (isNaN(numericRating)) {
        return { isValid: false, error: "La calificación debe ser un número" };
    }
    
    if (numericRating < 1 || numericRating > 5) {
        return { isValid: false, error: "La calificación debe estar entre 1 y 5" };
    }
    
    return { isValid: true, value: numericRating };
};

// Función helper para validar mensaje
const validateMessage = (message) => {
    if (!message || typeof message !== 'string') {
        return { isValid: false, error: "El mensaje es requerido" };
    }
    
    const trimmedMessage = message.trim();
    
    if (trimmedMessage.length < 10) {
        return { isValid: false, error: "El mensaje debe tener al menos 10 caracteres" };
    }
    
    if (trimmedMessage.length > 1000) {
        return { isValid: false, error: "El mensaje no puede exceder 1000 caracteres" };
    }
    
    // Validar caracteres especiales maliciosos
    const dangerousChars = /<script|javascript:|on\w+=/i;
    if (dangerousChars.test(trimmedMessage)) {
        return { isValid: false, error: "El mensaje contiene contenido no permitido" };
    }
    
    return { isValid: true, value: trimmedMessage };
};

// Función helper para validar productos
const validateProducts = (products) => {
    if (!products || !Array.isArray(products) || products.length === 0) {
        return { isValid: false, error: "Se requiere al menos un producto" };
    }
    
    if (products.length > 10) {
        return { isValid: false, error: "Máximo 10 productos por reseña" };
    }
    
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        
        if (!product.itemType || !['product', 'custom'].includes(product.itemType)) {
            return { 
                isValid: false, 
                error: `Tipo de producto inválido en posición ${i + 1}. Debe ser 'product' o 'custom'` 
            };
        }
        
        if (!product.itemId || !isValidObjectId(product.itemId)) {
            return { 
                isValid: false, 
                error: `ID de producto inválido en posición ${i + 1}` 
            };
        }
        
        // Validar itemTypeRef
        const validRefs = { product: 'products', custom: 'CustomProducts' };
        if (!product.itemTypeRef || product.itemTypeRef !== validRefs[product.itemType]) {
            return { 
                isValid: false, 
                error: `Referencia de tipo incorrecta en posición ${i + 1}` 
            };
        }
    }
    
    return { isValid: true };
};

// Función helper para validar respuesta
const validateResponse = (response) => {
    if (!response || typeof response !== 'string') {
        return { isValid: false, error: "La respuesta es requerida" };
    }
    
    const trimmedResponse = response.trim();
    
    if (trimmedResponse.length < 10) {
        return { isValid: false, error: "La respuesta debe tener al menos 10 caracteres" };
    }
    
    if (trimmedResponse.length > 1000) {
        return { isValid: false, error: "La respuesta no puede exceder 1000 caracteres" };
    }
    
    // Validar caracteres especiales maliciosos
    const dangerousChars = /<script|javascript:|on\w+=/i;
    if (dangerousChars.test(trimmedResponse)) {
        return { isValid: false, error: "La respuesta contiene contenido no permitido" };
    }
    
    return { isValid: true, value: trimmedResponse };
};

// Función helper para populate consistente
const getPopulateOptions = () => ({
    path: 'products.itemId',
    refPath: 'products.itemTypeRef',
    populate: {
        path: 'categoryId',
        select: 'name'
    }
});

// Función helper para populate del cliente
const getClientPopulateOptions = () => ({
    path: 'clientId',
    model: 'Clients',
    select: 'fullName email phone profilePicture'
});

// CORREGIDO: Devolver array directo para compatibilidad con frontend
reviewsController.getReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, rating } = req.query;
        
        // Validar parámetros de paginación
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        
        if (isNaN(pageNum) || pageNum < 1) {
            return res.status(400).json({
                success: false,
                message: "Número de página inválido"
            });
        }
        
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            return res.status(400).json({
                success: false,
                message: "Límite inválido (1-100)"
            });
        }
        
        // Construir filtros
        const filters = {};
        
        if (status && ['pending', 'replied'].includes(status)) {
            filters.status = status;
        }
        
        if (rating) {
            const ratingValidation = validateRating(rating);
            if (ratingValidation.isValid) {
                filters.rating = ratingValidation.value;
            }
        }
        
        const skip = (pageNum - 1) * limitNum;
        
        const [reviews, totalCount] = await Promise.all([
            reviewsModel.find(filters)
                .populate(getClientPopulateOptions())
                .populate(getPopulateOptions())
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            reviewsModel.countDocuments(filters)
        ]);

        console.log('Reviews encontradas:', reviews.length);

        // CORREGIDO: Devolver array directo para compatibilidad
        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error en getReviews:', error);
        res.status(500).json({ 
            success: false,
            message: "Error interno del servidor al obtener las reseñas", 
            error: error.message 
        });
    }
};

reviewsController.getReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de reseña no válido"
            });
        }
        
        const review = await reviewsModel.findById(id)
            .populate(getClientPopulateOptions())
            .populate(getPopulateOptions());

        if (!review) {
            return res.status(404).json({ 
                success: false,
                message: "Reseña no encontrada" 
            });
        }

        res.status(200).json({
            success: true,
            data: review
        });
    } catch (error) {
        console.error('Error en getReviewById:', error);
        res.status(500).json({ 
            success: false,
            message: "Error interno del servidor al obtener la reseña", 
            error: error.message 
        });
    }
};

reviewsController.getReviewByClient = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        
        if (!isValidObjectId(clientId)) {
            return res.status(400).json({
                success: false,
                message: "ID de cliente no válido"
            });
        }
        
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        
        if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
            return res.status(400).json({
                success: false,
                message: "Parámetros de paginación inválidos"
            });
        }
        
        const skip = (pageNum - 1) * limitNum;
        
        const [reviews, totalCount] = await Promise.all([
            reviewsModel.find({ clientId })
                .populate(getClientPopulateOptions())
                .populate(getPopulateOptions())
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            reviewsModel.countDocuments({ clientId })
        ]);
        
        res.status(200).json({
            success: true,
            data: reviews,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalCount / limitNum),
                totalItems: totalCount
            }
        });
    } catch (error) {
        console.error('Error en getReviewByClient:', error);
        res.status(500).json({ 
            success: false,
            message: "Error interno del servidor al obtener las reseñas del cliente", 
            error: error.message 
        });
    }
};

reviewsController.createReview = async (req, res) => {
    try {
        const { clientId, products, rating, message } = req.body;

        // Validar clientId
        if (!clientId || !isValidObjectId(clientId)) {
            return res.status(400).json({
                success: false,
                message: "ID de cliente inválido"
            });
        }

        // Validar productos
        const productsValidation = validateProducts(products);
        if (!productsValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: productsValidation.error
            });
        }

        // Validar rating
        const ratingValidation = validateRating(rating);
        if (!ratingValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: ratingValidation.error
            });
        }

        // Validar mensaje
        const messageValidation = validateMessage(message);
        if (!messageValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: messageValidation.error
            });
        }

        const newReview = new reviewsModel({
            clientId,
            products,
            rating: ratingValidation.value,
            message: messageValidation.value
        });

        await newReview.save();

        // Populate la respuesta
        const populatedReview = await reviewsModel.findById(newReview._id)
            .populate(getClientPopulateOptions())
            .populate(getPopulateOptions());

        res.status(201).json({ 
            success: true,
            message: "Reseña guardada exitosamente", 
            data: populatedReview 
        });
    } catch (error) {
        console.error('Error en createReview:', error);
        
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
                message: "Datos con formato incorrecto"
            });
        }
        
        res.status(500).json({ 
            success: false,
            message: "Error interno del servidor al crear la reseña", 
            error: error.message 
        });
    }
};

reviewsController.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { clientId, products, rating, message } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de reseña no válido"
            });
        }

        // Verificar que la reseña existe
        const existingReview = await reviewsModel.findById(id);
        if (!existingReview) {
            return res.status(404).json({
                success: false,
                message: "Reseña no encontrada"
            });
        }

        const updateData = {};

        // Validar campos opcionales para actualización
        if (clientId !== undefined) {
            if (!isValidObjectId(clientId)) {
                return res.status(400).json({
                    success: false,
                    message: "ID de cliente inválido"
                });
            }
            updateData.clientId = clientId;
        }

        if (products !== undefined) {
            const productsValidation = validateProducts(products);
            if (!productsValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: productsValidation.error
                });
            }
            updateData.products = products;
        }

        if (rating !== undefined) {
            const ratingValidation = validateRating(rating);
            if (!ratingValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: ratingValidation.error
                });
            }
            updateData.rating = ratingValidation.value;
        }

        if (message !== undefined) {
            const messageValidation = validateMessage(message);
            if (!messageValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: messageValidation.error
                });
            }
            updateData.message = messageValidation.value;
        }

        // Verificar que hay algo que actualizar
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No se proporcionaron datos para actualizar"
            });
        }

        const updatedReview = await reviewsModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate(getClientPopulateOptions())
         .populate(getPopulateOptions());

        res.status(200).json({ 
            success: true,
            message: "Reseña actualizada exitosamente", 
            data: updatedReview 
        });
    } catch (error) {
        console.error('Error en updateReview:', error);
        
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
                message: "Datos con formato incorrecto"
            });
        }
        
        res.status(500).json({ 
            success: false,
            message: "Error interno del servidor al actualizar la reseña", 
            error: error.message 
        });
    }
};

reviewsController.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de reseña no válido"
            });
        }

        const deletedReview = await reviewsModel.findByIdAndDelete(id);

        if (!deletedReview) {
            return res.status(404).json({ 
                success: false,
                message: "Reseña no encontrada" 
            });
        }

        res.status(200).json({ 
            success: true,
            message: "Reseña eliminada exitosamente",
            data: {
                id: deletedReview._id
            }
        });
    } catch (error) {
        console.error('Error en deleteReview:', error);
        res.status(500).json({ 
            success: false,
            message: "Error interno del servidor al eliminar la reseña", 
            error: error.message 
        });
    }
};

// Agregar endpoints para moderar y responder reseñas
reviewsController.moderateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de reseña no válido"
            });
        }

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ 
                success: false,
                message: "Acción inválida. Use 'approve' o 'reject'" 
            });
        }

        const status = action === 'approve' ? 'approved' : 'rejected';

        const updatedReview = await reviewsModel.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        ).populate(getClientPopulateOptions())
         .populate(getPopulateOptions());

        if (!updatedReview) {
            return res.status(404).json({ 
                success: false,
                message: "Reseña no encontrada" 
            });
        }

        res.status(200).json({ 
            success: true,
            message: "Reseña moderada exitosamente", 
            data: updatedReview 
        });
    } catch (error) {
        console.error('Error en moderateReview:', error);
        res.status(500).json({ 
            success: false,
            message: "Error interno del servidor al moderar la reseña", 
            error: error.message 
        });
    }
};

reviewsController.replyToReview = async (req, res) => {
    try {
        console.log('=== BACKEND replyToReview DEBUG ===');
        console.log('Full req.params:', req.params);
        console.log('Full req.url:', req.url);
        console.log('Full req.path:', req.path);
        console.log('Review ID:', req.params.id);
        console.log('Request body:', req.body);
        
        const { id } = req.params;
        const { response } = req.body;
        
        // Validaciones
        if (!isValidObjectId(id)) {
            return res.status(400).json({ 
                success: false,
                message: 'ID de reseña no válido' 
            });
        }
        
        const responseValidation = validateResponse(response);
        if (!responseValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: responseValidation.error
            });
        }

        // Verificar que la reseña existe
        const existingReview = await reviewsModel.findById(id);
        if (!existingReview) {
            return res.status(404).json({
                success: false,
                message: "Reseña no encontrada"
            });
        }

        // Actualizar en la base de datos y poblar los datos relacionados
        const updatedReview = await reviewsModel.findByIdAndUpdate(
            id,
            { 
                response: responseValidation.value,
                status: 'replied'
            },
            { new: true, runValidators: true }
        )
        .populate(getClientPopulateOptions())
        .populate(getPopulateOptions());
        
        console.log('Reseña actualizada exitosamente:', updatedReview);
        
        res.status(200).json({ 
            success: true, 
            message: 'Respuesta guardada correctamente',
            data: updatedReview 
        });
        
    } catch (error) {
        console.error('Error en replyToReview backend:', error);
        res.status(500).json({ 
            success: false,
            message: "Error interno del servidor al responder la reseña",
            error: error.message 
        });
    }
};

// CORREGIDO: Devolver estadísticas en formato simple para compatibilidad
reviewsController.getReviewStats = async (req, res) => {
    try {
        const [generalStats, ratingDistribution] = await Promise.all([
            reviewsModel.aggregate([
                {
                    $group: {
                        _id: null,
                        totalReviews: { $sum: 1 },
                        averageRating: { $avg: "$rating" },
                        minRating: { $min: "$rating" },
                        maxRating: { $max: "$rating" }
                    }
                }
            ]),
            reviewsModel.aggregate([
                {
                    $group: {
                        _id: "$rating",
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ])
        ]);

        const stats = generalStats[0] || {
            totalReviews: 0,
            averageRating: 0,
            minRating: 0,
            maxRating: 0
        };

        // Redondear el promedio a 2 decimales
        if (stats.averageRating) {
            stats.averageRating = Math.round(stats.averageRating * 100) / 100;
        }

        // Crear distribución completa
        const fullDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        ratingDistribution.forEach(item => {
            fullDistribution[item._id] = item.count;
        });

        // CORREGIDO: Devolver formato simple para compatibilidad
        res.status(200).json({
            totalReviews: stats.totalReviews,
            averageRating: stats.averageRating,
            minRating: stats.minRating,
            maxRating: stats.maxRating,
            ratingDistribution: fullDistribution
        });
    } catch (error) {
        console.error('Error en getReviewStats:', error);
        res.status(500).json({ 
            success: false,
            message: "Error interno del servidor al obtener estadísticas", 
            error: error.message 
        });
    }
};

reviewsController.getBestRankedProducts = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        const limitNum = parseInt(limit);
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
            return res.status(400).json({
                success: false,
                message: "Límite inválido (1-50)"
            });
        }

        const reviews = await reviewsModel.find()
            .populate(getClientPopulateOptions())
            .populate(getPopulateOptions());

        console.log('Reviews obtenidas:', reviews.length);

        // Agrupamos y calculamos promedios
        const productRatings = {};

        reviews.forEach(review => {
            if (!review.products || review.products.length === 0) {
                console.warn('Review sin productos:', review._id);
                return;
            }

            review.products.forEach(product => {
                if (!product.itemId) {
                    console.warn('Producto sin itemId encontrado en review:', review._id);
                    return;
                }

                const productId = product.itemId._id.toString();
                const productInfo = product.itemId;
                const itemType = product.itemType;

                console.log('Procesando producto:', {
                    id: productId,
                    name: productInfo.name,
                    itemType: itemType,
                    category: productInfo.categoryId?.name
                });

                if (!productRatings[productId]) {
                    productRatings[productId] = {
                        product: productInfo,
                        itemType: itemType,
                        ratings: [],
                        totalRating: 0,
                        reviewCount: 0
                    };
                }

                productRatings[productId].ratings.push(review.rating);
                productRatings[productId].totalRating += review.rating;
                productRatings[productId].reviewCount += 1;
            });
        });

        console.log('Productos agrupados:', Object.keys(productRatings).length);

        // Calculamos promedios y ordenamos
        const rankedProducts = Object.values(productRatings)
            .filter(item => item.product)
            .map(item => {
                const productData = item.product.toObject ? item.product.toObject() : item.product;

                // Construimos el objeto según el tipo de producto
                if (item.itemType === "product") {
                    return {
                        _id: productData._id,
                        name: productData.name || 'Producto sin nombre',
                        description: productData.description || '',
                        category: productData.categoryId?.name || 'Sin categoría',
                        image: productData.images?.[0]?.image || null,
                        price: productData.price,
                        itemType: item.itemType,
                        averageRating: Math.round((item.totalRating / item.reviewCount) * 10) / 10,
                        reviewCount: item.reviewCount
                    };
                } else if (item.itemType === "custom") {
                    return {
                        _id: productData._id,
                        name: 'Producto Personalizado',
                        description: productData.extraComments || 'Producto personalizado',
                        category: productData.categoryId?.name || 'Personalizado',
                        image: productData.referenceImage || '🎨',
                        price: productData.totalPrice,
                        selectedItemsCount: productData.selectedItems?.length || 0,
                        itemType: item.itemType,
                        averageRating: Math.round((item.totalRating / item.reviewCount) * 10) / 10,
                        reviewCount: item.reviewCount
                    };
                }

                return {
                    ...productData,
                    type: item.itemType,
                    averageRating: Math.round((item.totalRating / item.reviewCount) * 10) / 10,
                    reviewCount: item.reviewCount
                };
            })
            .sort((a, b) => {
                if (b.averageRating === a.averageRating) {
                    return b.reviewCount - a.reviewCount;
                }
                return b.averageRating - a.averageRating;
            })
            .slice(0, limitNum);

        console.log('Productos rankeados:', rankedProducts.length);

        res.status(200).json({
            success: true,
            data: rankedProducts,
            count: rankedProducts.length
        });
    } catch (error) {
        console.error('Error completo en getBestRankedProducts:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener productos mejor calificados",
            error: error.message
        });
    }
};

export default reviewsController;
import reviewsModel from "../models/Reviews.js";

const reviewsController = {};

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

reviewsController.getReviews = async (req, res) => {
    try {
        const reviews = await reviewsModel.find()
            .populate(getClientPopulateOptions())
            .populate(getPopulateOptions());

        console.log('Reviews encontradas:', reviews.length);
        console.log('Primera review con cliente:', reviews[0]?.clientId);

        res.json(reviews);
    } catch (error) {
        console.error('Error en getReviews:', error);
        res.status(500).json({ message: "Error al obtener las reviews", error: error.message });
    }
};

reviewsController.getReviewById = async (req, res) => {
    try {
        const review = await reviewsModel.findById(req.params.id)
            .populate(getClientPopulateOptions())
            .populate(getPopulateOptions());

        if (!review) {
            return res.status(404).json({ message: "Review no encontrada" });
        }

        res.json(review);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la review", error: error.message });
    }
};

reviewsController.getReviewByClient = async (req, res) => {
    try {
        const reviews = await reviewsModel.find({ clientId: req.params.clientId })
            .populate(getClientPopulateOptions())
            .populate(getPopulateOptions());
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las reviews del cliente", error: error.message });
    }
};

reviewsController.createReview = async (req, res) => {
    try {
        const { clientId, products, rating, message } = req.body;

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "El rating debe estar entre 1 y 5" });
        }

        const newReview = new reviewsModel({
            clientId,
            products,
            rating,
            message
        });

        await newReview.save();

        // Populate la respuesta
        const populatedReview = await reviewsModel.findById(newReview._id)
            .populate(getClientPopulateOptions())
            .populate(getPopulateOptions());

        res.status(201).json({ message: "Review guardada exitosamente", review: populatedReview });
    } catch (error) {
        res.status(400).json({ message: "Error al crear la review", error: error.message });
    }
};

reviewsController.updateReview = async (req, res) => {
    try {
        const { clientId, products, rating, message } = req.body;

        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({ message: "El rating debe estar entre 1 y 5" });
        }

        const updatedReview = await reviewsModel.findByIdAndUpdate(
            req.params.id,
            { clientId, products, rating, message },
            { new: true, runValidators: true }
        ).populate(getClientPopulateOptions())
            .populate(getPopulateOptions());

        if (!updatedReview) {
            return res.status(404).json({ message: "Review no encontrada" });
        }

        res.json({ message: "Review actualizada exitosamente", review: updatedReview });
    } catch (error) {
        res.status(400).json({ message: "Error al actualizar la review", error: error.message });
    }
};

reviewsController.deleteReview = async (req, res) => {
    try {
        const deletedReview = await reviewsModel.findByIdAndDelete(req.params.id);

        if (!deletedReview) {
            return res.status(404).json({ message: "Review no encontrada" });
        }

        res.json({ message: "Review eliminada exitosamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la review", error: error.message });
    }
};

// Agregar endpoints para moderar y responder reseñas
reviewsController.moderateReview = async (req, res) => {
    try {
        const { action } = req.body;

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ message: "Acción inválida. Usa 'approve' o 'reject'" });
        }

        const status = action === 'approve' ? 'approved' : 'rejected';

        const updatedReview = await reviewsModel.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate(getClientPopulateOptions())
            .populate(getPopulateOptions());

        if (!updatedReview) {
            return res.status(404).json({ message: "Review no encontrada" });
        }

        res.json({ message: "Review moderada exitosamente", review: updatedReview });
    } catch (error) {
        res.status(500).json({ message: "Error al moderar la review", error: error.message });
    }
};

reviewsController.replyToReview = async (req, res) => {
    try {
        const { response } = req.body;

        if (!response || response.trim() === '') {
            return res.status(400).json({ message: "La respuesta no puede estar vacía" });
        }

        const updatedReview = await reviewsModel.findByIdAndUpdate(
            req.params.id,
            { response, status: 'replied' },
            { new: true }
        ).populate(getClientPopulateOptions())
            .populate(getPopulateOptions());

        if (!updatedReview) {
            return res.status(404).json({ message: "Review no encontrada" });
        }

        res.json({ message: "Respuesta enviada exitosamente", review: updatedReview });
    } catch (error) {
        res.status(500).json({ message: "Error al responder la review", error: error.message });
    }
};

reviewsController.getReviewStats = async (req, res) => {
    try {
        const stats = await reviewsModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalReviews: { $sum: 1 },
                    averageRating: { $avg: "$rating" },
                    minRating: { $min: "$rating" },
                    maxRating: { $max: "$rating" }
                }
            }
        ]);

        const ratingDistribution = await reviewsModel.aggregate([
            {
                $group: {
                    _id: "$rating",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.json({
            generalStats: stats[0] || {
                totalReviews: 0,
                averageRating: 0,
                minRating: 0,
                maxRating: 0
            },
            ratingDistribution
        });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener estadísticas", error: error.message });
    }
};

reviewsController.getBestRankedProducts = async (req, res) => {
    try {
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
            .slice(0, 10);

        console.log('Productos rankeados:', rankedProducts.length);

        res.json(rankedProducts);
    } catch (error) {
        console.error('Error completo en getBestRankedProducts:', error);
        res.status(500).json({
            message: "Error al obtener productos mejor calificados",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

reviewsController.replyToReview = async (req, res) => {
    try {
        console.log('=== BACKEND replyToReview DEBUG ===');
        console.log('Full req.params:', req.params);
        console.log('Full req.url:', req.url);
        console.log('Full req.path:', req.path);
        console.log('Review ID:', req.params.reviewId);
        console.log('Request body:', req.body);
        
        const { id: reviewId } = req.params;
        const { response } = req.body;
        
        // Validaciones
        if (!reviewId) {
            return res.status(400).json({ message: 'reviewId es requerido' });
        }
        
        if (!response || response.trim() === '') {
            return res.status(400).json({ message: 'response es requerido' });
        }

        // Actualizar en la base de datos y poblar los datos relacionados
        const updatedReview = await reviewsModel.findByIdAndUpdate(
            reviewId,
            { 
                response: response.trim(),
                status: 'replied'
            },
            { new: true }
        )
        .populate(getClientPopulateOptions())
        .populate(getPopulateOptions());
        
        if (!updatedReview) {
            return res.status(404).json({ message: 'Reseña no encontrada' });
        }
        
        console.log('Reseña actualizada exitosamente:', updatedReview);
        
        res.json({ 
            success: true, 
            message: 'Respuesta guardada correctamente',
            review: updatedReview 
        });
        
    } catch (error) {
        console.error('Error en replyToReview backend:', error);
        res.status(500).json({ message: error.message });
    }
};

export default reviewsController;
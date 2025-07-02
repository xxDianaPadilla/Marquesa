import reviewsModel from "../models/Reviews.js";

const reviewsController = {};

reviewsController.getReviews = async (req, res) => {
    try {
        const reviews = await reviewsModel.find()
            .populate('clientId')
            .populate({
                path: 'products.itemId',
                refPath: 'products.itemTypeRef'
            });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las reviews", error: error.message });
    }
};

reviewsController.getReviewById = async (req, res) => {
    try {
        const review = await reviewsModel.findById(req.params.id)
            .populate('clientId')
            .populate({
                path: 'products.itemId',
                refPath: 'products.itemTypeRef'
            });

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
            .populate('clientId')
            .populate({
                path: 'products.itemId',
                refPath: 'products.itemTypeRef'
            });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({message: "Error al obtener las reviews del cliente", error: error.message});
    }
};

reviewsController.createReview = async (req, res) => {
    try {
        const {clientId, products, rating, message} = req.body;

        if(rating < 1 || rating > 5){
            return res.status(400).json({message: "El rating debe estar entre 1 y 5"});
        }

        const newReview = new reviewsModel({
            clientId,
            products,
            rating,
            message
        });

        await newReview.save();
        res.status(201).json({message: "Review guardada exitosamente", review: newReview});
    } catch (error) {
        res.status(400).json({message: "Error al crear la review", error: error.message});
    }
};

reviewsController.updateReview = async (req, res) => {
    try {
        const {clientId, products, rating, message} = req.body;

        if(rating && (rating < 1 || rating > 5)){
            return res.status(400).json({message: "El rating debe estar entre 1 y 5"});
        }

        const updatedReview = await reviewsModel.findByIdAndUpdate(
            req.params.id,
            {clientId, products, rating, message},
            {new: true, runValidators: true}
        );

        if(!updatedReview){
            return res.status(404).json({message: "Review no encontrada"});
        }

        res.json({message: "Review actualizada exitosamente", review: updatedReview});
    } catch (error) {
        res.status(400).json({message: "Error al actualizar la review", error: error.message});
    }
};

reviewsController.deleteReview = async (req, res) => {
    try {
        const deletedReview = await reviewsModel.findByIdAndDelete(req.params.id);

        if(!deletedReview){
            return res.status(404).json({message: "Review no encontrada"});
        }
        
        res.json({message: "Review eliminada exitosamente"});
    } catch (error) {
        res.status(500).json({message: "Error al eliminar la review", error: error.message});
    }
};

reviewsController.getReviewStats = async (req, res) => {
    try {
        const stats = await reviewsModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalReviews: {$sum: 1},
                    averageRating: {$avg: "$rating"},
                    minRating: {$min: "$rating"},
                    maxRating: {$max: "$rating"}
                }
            }
        ]);

        const ratingDistribution = await reviewsModel.aggregate([
            {
                $group: {
                    _id: "$rating",
                    count: {$sum: 1}
                }
            },
            {
                $sort: {_id: 1}
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
        res.status(500).json({message: "Error al obtener estadísticas", error: error.message});
    }
};

export default reviewsController;
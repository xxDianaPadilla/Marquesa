import express from "express";
import reviewsController from "../controllers/reviewsController.js";

const router = express.Router();

// Rutas principales CRUD
router.route("/")
    .post(reviewsController.createReview)
    .get(reviewsController.getReviews);

// Rutas de estadísticas y rankings (deben ir antes de las rutas con parámetros)
router.route("/stats")
    .get(reviewsController.getReviewStats);

router.route("/best-ranked")
    .get(reviewsController.getBestRankedProducts);

// Rutas específicas por cliente
router.route("/client/:clientId")
    .get(reviewsController.getReviewByClient);

// Rutas de moderación y respuesta (deben ir antes de /:id)
router.route("/:id/moderate")
    .put(reviewsController.moderateReview);

router.route("/:id/reply")
    .patch(reviewsController.replyToReview);

// Rutas CRUD por ID (deben ir al final)
router.route("/:id")
    .get(reviewsController.getReviewById)
    .put(reviewsController.updateReview)
    .delete(reviewsController.deleteReview);

export default router;
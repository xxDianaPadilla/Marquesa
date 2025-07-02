import express from "express";
import reviewsController from "../controllers/reviewsController.js";

const router = express.Router();

router.route("/")
    .post(reviewsController.createReview)
    .get(reviewsController.getReviews);

router.route("/stats")
    .get(reviewsController.getReviewStats);

router.route("/best-ranked")
    .get(reviewsController.getBestRankedProducts);

router.route("/client/:clientId")
    .get(reviewsController.getReviewByClient);

router.route("/:id")
    .get(reviewsController.getReviewById)
    .put(reviewsController.updateReview)
    .delete(reviewsController.deleteReview);

export default router;
import express from "express";
import reviewsController from "../controllers/reviewsController.js";

const router = express.Router();

router.route("/")
    .post(reviewsController.createReview)
    .get(reviewsController.getReviews);

router.route("/stats")
    .get(reviewsController.getReviewStats);

router.route("/:id")
    .get(reviewsController.getReviewById)
    .put(reviewsController.updateReview)
    .delete(reviewsController.deleteReview);

router.route("/client/:clientId")
    .get(reviewsController.getReviewByClient);

export default router;
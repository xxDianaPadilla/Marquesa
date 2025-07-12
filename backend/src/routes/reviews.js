// Importar Express para crear el enrutador
import express from "express";
// Importar el controlador de reseñas
import reviewsController from "../controllers/reviewsController.js";

// Crear una instancia del enrutador de Express
const router = express.Router();

// Rutas principales CRUD para reseñas
// Nota: estas rutas van primero para evitar conflictos con rutas parametrizadas
router.route("/")
    .post(reviewsController.createReview) // Crear una nueva reseña
    .get(reviewsController.getReviews); // Obtener todas las reseñas

// Rutas de estadísticas y rankings
// Importante: estas rutas deben ir antes de las rutas con parámetros /:id para evitar conflictos
router.route("/stats")
    .get(reviewsController.getReviewStats); // Obtener estadísticas de reseñas

// Ruta para obtener productos mejor calificados
router.route("/bestRanked")
    .get(reviewsController.getBestRankedProducts); // Obtener productos con mejor ranking

// Ruta para obtener reseñas específicas de un cliente
router.route("/client/:clientId")
    .get(reviewsController.getReviewByClient); // Obtener todas las reseñas de un cliente específico

// Rutas de moderación y respuesta a reseñas
// Nota: estas rutas deben ir antes de /:id para que Express las reconozca correctamente
router.route("/:id/moderate")
    .put(reviewsController.moderateReview); // Moderar una reseña (aprobar/rechazar)

// Ruta para que el administrador responda a una reseña
router.route("/:id/reply")
    .patch(reviewsController.replyToReview); // Responder a una reseña específica

// Rutas CRUD por ID específico
// Importante: estas rutas van al final porque /:id es muy genérico y podría capturar otras rutas
router.route("/:id")
    .get(reviewsController.getReviewById) // Obtener una reseña específica por ID
    .put(reviewsController.updateReview) // Actualizar una reseña completa
    .delete(reviewsController.deleteReview); // Eliminar una reseña específica

// Exportar el enrutador para ser usado en la aplicación principal
export default router;
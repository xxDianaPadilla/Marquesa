import express from "express";
import clientsController from "../controllers/clientsController.js";

const router = express.Router();

router.route("/new-clients-stats")
.get(clientsController.getNewClientsStats);

router.route("/total")
.get(clientsController.getTotalClients);

export default router;
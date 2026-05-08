import express from "express";
import * as notificationController from "../controllers/notificationController.js";

const router = express.Router();

//Notifications routes - Ordem importante: rotas mais específicas primeiro
/**
 * POST /notifications/message/stream
 * Envia uma mensagem para criar notificação via IA e responde em stream com function calls
 * Body: { message: string, conversationHistory?: Array, userId?: number }
 */
router.post("/message/stream", notificationController.sendMessageToBotStream);

router.get("/", notificationController.getNotifications);
router.get("/:id", notificationController.getNotificationById);
router.post("/", notificationController.createNotification);
router.put("/:id", notificationController.updateNotification);
router.delete("/:id", notificationController.deleteNotification);

export default router;
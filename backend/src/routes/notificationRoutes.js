import express from "express";
import * as notificationController from "../controllers/notificationController.js";

const router = express.Router(); // Router de notificações

// Rotas CRUD de notificações
router.get("/",             notificationController.getNotifications);
router.get("/:id",          notificationController.getNotificationById);
router.post("/",            notificationController.createNotification);
router.put("/:id",          notificationController.updateNotification);
router.delete("/:id",       notificationController.deleteNotification);

export default router;

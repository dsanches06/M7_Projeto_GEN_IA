import express from "express";
import * as userController from "../controllers/userController.js";
import { checkUserExists } from "../middlewares/checkUserExists.js";
import { validateUserData } from "../middlewares/validateUserData.js";

const router = express.Router(); // Router de utilizadores

// Aplica verificação de existência do utilizador a todas as rotas
router.use(checkUserExists);

// Rotas estáticas — devem vir antes das dinâmicas (:id)
router.get("/", userController.getUsers);
router.get("/stats", userController.getStats);

// Rotas de notificações aninhadas — mais específicas antes da geral
router.get("/:id/notifications/unread", userController.getUnreadNotifications);
router.get("/:id/notifications", userController.getNotificationsByUser);
router.patch("/:id/notifications/:notificationId", userController.markAsRead);

// Rotas dinâmicas — devem ser as últimas para evitar conflitos
router.get("/:id", userController.getUserById);
router.post("/", validateUserData, userController.createUser);
router.put("/:id", validateUserData, userController.updateUser);
router.patch("/:id", userController.toggleUserActive);
router.delete("/:id", userController.deleteUser);

export default router;

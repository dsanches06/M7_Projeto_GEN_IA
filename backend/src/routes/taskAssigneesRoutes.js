import express from "express";
import * as taskAssigneesController from "../controllers/taskAssigneesController.js";

const router = express.Router(); // Router de atribuições de tarefas

// Rotas CRUD de atribuições de tarefas a utilizadores
router.get("/", taskAssigneesController.getTaskAssignees);
router.get("/:id", taskAssigneesController.getTaskAssigneeByUserId);
router.post("/", taskAssigneesController.createTaskAssignee);
router.put("/:id", taskAssigneesController.updateTaskAssignee);
router.delete("/:id", taskAssigneesController.deleteTaskAssignee);

export default router;

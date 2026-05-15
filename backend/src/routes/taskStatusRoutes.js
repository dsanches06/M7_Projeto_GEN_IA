import express from "express";
import * as taskStatusController from "../controllers/taskStatusController.js";

const router = express.Router(); // Router de estados de tarefa

// Rotas CRUD de estados de tarefa
router.get("/", taskStatusController.getTaskStatuses);
router.get("/:id", taskStatusController.getTaskStatusById);
router.post("/", taskStatusController.createTaskStatus);
router.put("/:id", taskStatusController.updateTaskStatus);
router.delete("/:id", taskStatusController.deleteTaskStatus);

export default router;

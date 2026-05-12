import express from "express";
import * as taskController from "../controllers/taskController.js";
import { validateTaskData } from "../middlewares/validateTaskData.js";

const router = express.Router();

//Taks routes
router.get("/", taskController.getTasks);
router.get("/stats", taskController.getStats);
router.get("/:id", taskController.getTaskById);
router.post("/", validateTaskData, taskController.createTask);
router.patch("/:id", taskController.partialUpdateTask);
router.patch("/:id/status", taskController.updateStatus);
router.put("/:id", validateTaskData, taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

// Tags routes (must come before /:id routes)
router.post("/:id/tags", taskController.addTagToTask);
router.delete("/:id/tags/:tagId", taskController.removeTagFromTask);
router.get("/:id/tags", taskController.getTaskTags);

export default router;

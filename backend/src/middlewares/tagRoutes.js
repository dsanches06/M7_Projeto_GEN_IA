import express from "express";
import * as tagController from "../controllers/tagController.js";

const router = express.Router(); // Router de etiquetas (versão com rota de tarefas)

// Rotas CRUD de etiquetas, incluindo sub-rota de tarefas associadas
router.get("/", tagController.getTags);
router.get("/:id", tagController.getTagById);
router.post("/", tagController.createTag);
router.put("/:id", tagController.updateTag);
router.delete("/:id", tagController.deleteTag);
router.get("/:id/tasks", tagController.getTagTasks); // Devolve tarefas da etiqueta

export default router;

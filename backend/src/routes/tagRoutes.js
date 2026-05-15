import express from "express";
import * as tagController from "../controllers/tagController.js";

const router = express.Router(); // Router de etiquetas

// Rotas CRUD de etiquetas
router.get("/", tagController.getTags);
router.get("/:id", tagController.getTagById);
router.post("/", tagController.createTag);
router.put("/:id", tagController.updateTag);
router.delete("/:id", tagController.deleteTag);

export default router;
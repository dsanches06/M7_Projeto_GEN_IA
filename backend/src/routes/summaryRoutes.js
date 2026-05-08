import express from "express";
import * as summaryController from "../controllers/summaryController.js";

const router = express.Router();

// CRUD Padrão
router.get("/", summaryController.getSummaries);
router.get("/conversation/:conversationId", summaryController.getSummaryByConversationId);
router.get("/:id", summaryController.getSummaryById);
router.post("/", summaryController.createSummary);
router.put("/:id", summaryController.updateSummary);
router.delete("/:id", summaryController.deleteSummary);

export default router;

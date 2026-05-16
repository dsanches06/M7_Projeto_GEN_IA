import express from "express";
import * as chatBotController from "../controllers/chatBotController.js";
import * as chatHistoryController from "../controllers/chatHistoryController.js";


const router = express.Router();

/**
 * POST /chat/message/stream
 * Envia uma mensagem para o bot e responde em stream com function calls
 * Body: { message: string, conversationHistory?: Array }
 */
router.post("/message/stream", chatBotController.sendMessageToBotStream);
router.post("/message", chatBotController.sendMessageToBotStream); // compatibilidade com rota legada

/**
 * POST /chat/conversation/:conversationId/message
 * Envia uma mensagem em uma conversa específica
 * Body: { message: string }
 */
router.post(
  "/conversation/:conversationId/message",
  chatBotController.sendMessageToConversation
);

// Chat history CRUD unificado em /chat/history
router.get("/history", chatHistoryController.getChatHistories);
router.get("/history/conversation/:conversationId", chatHistoryController.getChatHistoryByConversationId);
router.get("/history/:id", chatHistoryController.getChatHistoryById);
router.post("/history", chatHistoryController.createChatHistory);
router.put("/history/:id", chatHistoryController.updateChatHistory);
router.delete("/history/:id", chatHistoryController.deleteChatHistory);

export default router;

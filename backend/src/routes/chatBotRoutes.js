import express from "express";
import * as chatBotController from "../controllers/chatBotController.js";

const router = express.Router();

/**
 * GET /bot/test
 * Endpoint de teste para verificar se o bot está funcionando
 */
router.get("/test", chatBotController.testBot);

/**
 * POST /bot/message
 * Envia uma mensagem para o bot com suporte a function calls
 * Body: { message: string, conversationHistory?: Array }
 */
router.post("/message", chatBotController.sendMessageToBot);

/**
 * POST /bot/conversation/:conversationId/message
 * Envia uma mensagem em uma conversa específica
 * Body: { message: string }
 */
router.post(
  "/conversation/:conversationId/message",
  chatBotController.sendMessageToConversation
);

export default router;

import express from "express";
import * as ticketController from "../controllers/ticketController.js";

const router = express.Router();

/**
 * POST /tickets/message/stream
 * Envia uma mensagem para criar ticket via IA e responde em stream com function calls
 * Body: { message: string, conversationHistory?: Array, ticketId?: number }
 */
router.post("/message/stream", ticketController.sendMessageToBotStream);

router.get("/", ticketController.getTickets);
router.get("/:id", ticketController.getTicketById);
router.post("/", ticketController.createTicket);
router.put("/:id", ticketController.updateTicket);
router.delete("/:id", ticketController.deleteTicket);

export default router;

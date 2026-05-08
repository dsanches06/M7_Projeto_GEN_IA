// ======================================================
// FILE: chat_processor_task.js
// ======================================================

import { BaseChatProcessor } from "../../models/BaseChatProcessor.js";

import {
  functionDeclarations,
  setCreateTicketValues,
} from "../../functions/tickets/create_ticket.js";

// Processador de chat específico para tickets
class TicketChatProcessor extends BaseChatProcessor {
  constructor() {
    super({
      toolConfig: functionDeclarations,

      functionHandlers: {
        set_create_ticket_values: setCreateTicketValues,
      },
    });
  }
}

//singleton do processador de chat para tarefas
const ticketChatProcessor = new TicketChatProcessor();

// Exporta as funções de processamento de mensagens do chat
export const processChatMessage =
  ticketChatProcessor.processChatMessage.bind(ticketChatProcessor);

// Exporta a função de processamento de mensagens do chat em modo stream
export const processChatMessageStream =
  ticketChatProcessor.processChatMessageStream.bind(ticketChatProcessor);

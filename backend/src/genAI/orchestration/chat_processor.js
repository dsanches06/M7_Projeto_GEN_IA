import { BaseChatProcessor } from "../../models/chat/BaseChatProcessor.js";

import {
  functionDeclarations as taskDeclarations,
  setCreateTaskValues,
} from "../../functions/tasks/create_task.js";

import {
  functionDeclarations as assignDeclarations,
  setAssignTaskValues,
} from "../../functions/tasks/assign_task.js";

import {
  functionDeclarations as notificationDeclarations,
  setCreateNotificationValues,
} from "../../functions/notifications/create_notification.js";

import {
  functionDeclarations as ticketDeclarations,
  setCreateTicketValues,
} from "../../functions/tickets/create_ticket.js";

/**
 * UnifiedChatProcessor
 *
 * Reúne todas as function declarations para que o modelo possa decidir,
 * com base na intenção do utilizador, qual entidade criar ou operar:
 *
 *   - set_create_task_values        → cria tarefa (+ atribuição automática se user_id presente)
 *   - set_assign_task_values        → atribui tarefa existente a utilizador
 *   - set_create_notification_values → cria notificação
 *   - set_create_ticket_values       → cria ticket
 *
 * O controller (chatBotController.js) inspecciona result.functionResults[0].functionName
 * e encaminha para o service correcto.
 */
class ChatProcessor extends BaseChatProcessor {
  constructor() {
    super({
      toolConfig: [
        ...taskDeclarations,
        ...assignDeclarations,
        ...notificationDeclarations,
        ...ticketDeclarations,
      ],
      functionHandlers: {
        set_create_task_values:         setCreateTaskValues,
        set_assign_task_values:         setAssignTaskValues,
        set_create_notification_values: setCreateNotificationValues,
        set_create_ticket_values:       setCreateTicketValues,
      },
    });
  }
}

const chatProcessor = new ChatProcessor();

export const processChatMessage =
  chatProcessor.processChatMessage.bind(chatProcessor);

export const processChatMessageStream =
  chatProcessor.processChatMessageStream.bind(chatProcessor);

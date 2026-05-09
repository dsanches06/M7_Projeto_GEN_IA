import { BaseChatProcessor } from "../../models/chat/BaseChatProcessor.js";

import {
  functionDeclarations as taskDeclarations,
  setCreateTaskValues,
} from "../../functions/tasks/create_task.js";

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
 * Combines all three function declaration sets so the model can decide,
 * based on user intent, which entity to create:
 *   - set_create_task_values        → persisted as a task row
 *   - set_create_notification_values → persisted as a notification row
 *   - set_create_ticket_values       → persisted as a ticket row
 *
 * The controller (chatBotController.js) inspects result.functionResults[0].functionName
 * and routes to the correct service method.
 */
class ChatProcessor extends BaseChatProcessor {
  constructor() {
    super({
      toolConfig: [
        ...taskDeclarations,
        ...notificationDeclarations,
        ...ticketDeclarations,
      ],
      functionHandlers: {
        set_create_task_values: setCreateTaskValues,
        set_create_notification_values: setCreateNotificationValues,
        set_create_ticket_values: setCreateTicketValues,
      },
    });
  }
}

const chatProcessor = new ChatProcessor();

export const processChatMessage =
  chatProcessor.processChatMessage.bind(chatProcessor);

export const processChatMessageStream =
  chatProcessor.processChatMessageStream.bind(chatProcessor);

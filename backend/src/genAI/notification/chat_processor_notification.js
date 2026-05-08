// ======================================================
// FILE: chat_processor_notification.js
// ======================================================

import { BaseChatProcessor } from "../../models/BaseChatProcessor.js";

import {
  functionDeclarations,
  setCreateNotificationValues,
} from "../../functions/notifications/create_notification.js";

// Processador de chat específico para notificações
class NotificationChatProcessor extends BaseChatProcessor {
  constructor() {
    super({
      toolConfig: functionDeclarations,

      functionHandlers: {
        set_create_notification_values: setCreateNotificationValues,
      },
    });
  }
}

//singleton
const notificationChatProcessor = new NotificationChatProcessor();

// Exporta as funções de processamento de mensagens do chat
export const processChatMessage =
  notificationChatProcessor.processChatMessage.bind(notificationChatProcessor);

// Exporta a função de processamento de mensagens do chat em modo stream
export const processChatMessageStream =
  notificationChatProcessor.processChatMessageStream.bind(
    notificationChatProcessor,
  );

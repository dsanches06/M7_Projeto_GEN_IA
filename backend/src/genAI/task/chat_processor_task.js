// ======================================================
// FILE: chat_processor_task.js
// ======================================================

import { BaseChatProcessor } from "../../models/BaseChatProcessor.js";

import {
  functionDeclarations,
  setCreateTaskValues,
} from "../../functions/tasks/create_task.js";

// Processador de chat específico para tarefas
class TaskChatProcessor extends BaseChatProcessor {
  constructor() {
    super({
      toolConfig: functionDeclarations,

      functionHandlers: {
        set_create_task_values: setCreateTaskValues,
      },
    });
  }
}

//singleton do processador de chat para tarefas
const taskChatProcessor = new TaskChatProcessor();

// Exporta as funções de processamento de mensagens do chat
export const processChatMessage =
  taskChatProcessor.processChatMessage.bind(taskChatProcessor);

// Exporta a função de processamento de mensagens do chat em modo stream
export const processChatMessageStream =
  taskChatProcessor.processChatMessageStream.bind(taskChatProcessor);

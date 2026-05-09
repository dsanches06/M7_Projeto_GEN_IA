// ======================================================
// FILE: chat_processor_task.js
// ======================================================

import { BaseChatProcessor } from "../../models/chat/BaseChatProcessor.js";

import {
  functionDeclarations,
  setCreateSummaryValues,
} from "../../functions/summaries/create_summary.js";

// Processador de chat específico para resumos
class SummaryChatProcessor extends BaseChatProcessor {
  constructor() {
    super({
      toolConfig: functionDeclarations,

      functionHandlers: {
        set_create_summary_values: setCreateSummaryValues,
      },
    });
  }
}

//singleton do processador de chat para tarefas
const summaryChatProcessor = new SummaryChatProcessor();

// Exporta as funções de processamento de mensagens do chat
export const processChatMessage =
  summaryChatProcessor.processChatMessage.bind(summaryChatProcessor);

// Exporta a função de processamento de mensagens do chat em modo stream
export const processChatMessageStream =
  summaryChatProcessor.processChatMessageStream.bind(summaryChatProcessor);

/**
 * Processador Base de Chat — Loop agêntico com chamadas de funções em paralelo
 *
 * Padrão extraído de multifunction.js:
 *   const chat = ai.chats.create({ model, history, config });
 *   let response = await chat.sendMessage({ message });
 *   while (response.functionCalls?.length && step < MAX_STEPS) {
 *     const results = await Promise.all(response.functionCalls.map(execute));
 *     response = await chat.sendMessage({ message: { role:'tool', parts:[...results] } });
 *   }
 */

import { createGeminiChat } from "../genAI/gemini_config.js";

const MAX_AGENTIC_STEPS = 5;

export class BaseChatProcessor {
  constructor({ toolConfig = [], functionHandlers = {} }) {
    this.toolConfig       = toolConfig;
    this.functionHandlers = functionHandlers;
  }

  // ── Construir histórico Gemini a partir do formato de conversa ────────────────
  buildHistory(conversationHistory = []) {
    return conversationHistory.map((item) => ({
      role:  item.role === "assistant" ? "model" : "user",
      parts: [{ text: item.content }],
    }));
  }

  // ── Executar uma chamada de função ────────────────────────────────────────────
  async executeFunction(functionCall) {
    const { name } = functionCall;
    const rawArgs  = functionCall.args || functionCall.arguments || {};
    const args     = typeof rawArgs === "string" ? JSON.parse(rawArgs) : rawArgs;
    const handler  = this.functionHandlers[name];

    if (!handler) throw new Error(`Função "${name}" não está registada.`);

    const result = await handler(args);
    return { name, args, result, functionCall };
  }

  extractUserIdFromArgs(rawArgs) {
    const args = typeof rawArgs === "string" ? JSON.parse(rawArgs) : rawArgs || {};
    return args.user_id ?? args.userId ?? null;
  }

  filterFunctionCalls(functionCalls = []) {
    const hasCreateWithUserId = functionCalls.some((fc) => {
      if (fc.name !== "set_create_task_values") return false;
      return this.extractUserIdFromArgs(fc.args) != null;
    });

    if (!hasCreateWithUserId) return functionCalls;

    return functionCalls.filter((fc) => fc.name !== "set_assign_task_values");
  }

  isGeminiError(error) {
    return !!error?.geminiType;
  }

  // ── Loop agêntico (sem streaming) ────────────────────────────────────────────
  async processChatMessage(userMessage, conversationHistory = []) {
    try {
      const history = this.buildHistory(conversationHistory);
      const chat    = createGeminiChat(this.toolConfig, history);

      let response         = await chat.sendMessage({ message: userMessage });
      const allResults     = [];
      let step             = 0;

      while (response.functionCalls?.length && step < MAX_AGENTIC_STEPS) {
        step++;
        const callsToExecute = this.filterFunctionCalls(response.functionCalls);
        console.log(`[Agentic step ${step}] calling: ${callsToExecute.map((f) => f.name).join(", ")}`);

        // Execute filtered function calls in parallel
        const execResults = await Promise.all(
          callsToExecute.map((fc) => this.executeFunction(fc))
        );
        allResults.push(...execResults);

        // Return ALL results to the model in one message
        response = await chat.sendMessage({
          message: {
            role:  "tool",
            parts: execResults.map(({ name, result }) => ({
              functionResponse: { name, response: result },
            })),
          },
        });
      }

      const finalText = response.text || "";
      return {
        success:         true,
        message:         finalText || "Como posso ajudar?",
        functionResults: allResults.map(({ name, args, result, functionCall }) => ({
          functionName: name,
          arguments:    args,
          result,
          functionCall,
        })),
      };
    } catch (error) {
      if (this.isGeminiError(error)) {
        console.error(`[ChatProcessor] Gemini ${error.geminiType}:`, error.message);
        return { success: false, geminiError: true, errorType: error.geminiType, message: error.message, functionResults: [] };
      }
      console.error("[ChatProcessor] Unexpected error:", error);
      return { success: false, geminiError: false, message: "Ocorreu um erro interno. Tente novamente.", functionResults: [] };
    }
  }

  // ── Agentic loop (stream: function rounds non-streaming, final text chunked) ─
  async processChatMessageStream(userMessage, conversationHistory = [], onChunk) {
    const history = this.buildHistory(conversationHistory);
    const chat    = createGeminiChat(this.toolConfig, history);

    let response     = await chat.sendMessage({ message: userMessage });
    const allResults = [];
    let step         = 0;

    while (response.functionCalls?.length && step < MAX_AGENTIC_STEPS) {
      step++;
      const callsToExecute = this.filterFunctionCalls(response.functionCalls);
      console.log(`[Agentic stream step ${step}] calling: ${callsToExecute.map((f) => f.name).join(", ")}`);

      const execResults = await Promise.all(
        callsToExecute.map((fc) => this.executeFunction(fc))
      );
      allResults.push(...execResults);

      response = await chat.sendMessage({
        message: {
          role:  "tool",
          parts: execResults.map(({ name, result }) => ({
            functionResponse: { name, response: result },
          })),
        },
      });
    }

    const finalText = response.text || "";
    if (finalText) onChunk(finalText);

    return {
      success:         true,
      message:         finalText,
      functionResults: allResults.map(({ name, args, result, functionCall }) => ({
        functionName: name,
        arguments:    args,
        result,
        functionCall,
      })),
    };
  }
}

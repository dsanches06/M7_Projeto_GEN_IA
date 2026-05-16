/**
 * Processador Base de Chat — Loop agêntico com chamadas de funções em paralelo
 */

import { createGroqChat } from "../genAI/groq_config.js";

const MAX_AGENTIC_STEPS = 5;
const AI_PROVIDER = process.env.AI_PROVIDER?.toLowerCase() || "groq";

export class BaseChatProcessor {
  constructor({ toolConfig = [], functionHandlers = {} }) {
    this.toolConfig = toolConfig;
    this.functionHandlers = functionHandlers;
  }

  async createChat(tools, history, includeTagMap = false) {
    return createGroqChat(tools, history, includeTagMap);
  }

  // Return a tool config that hides tag-related capabilities when not requested.
  // This prevents the model from ever seeing tag options, which is more reliable
  // than post-filtering executed calls.
  getEffectiveToolConfig(userMessage = "") {
    if (this.userRequestedTags(userMessage)) return this.toolConfig;

    return this.toolConfig
      .filter((tool) => {
        const name = tool?.function?.name ?? tool?.name;
        return name !== "set_tag_task_values";
      })
      .map((tool) => {
        const name = tool?.function?.name ?? tool?.name;
        if (name !== "set_create_task_values") return tool;

        // Deep-clone and strip tag_ids from the parameter schema
        const cloned = JSON.parse(JSON.stringify(tool));
        const props = cloned?.function?.parameters?.properties;
        if (props) delete props.tag_ids;
        const req = cloned?.function?.parameters?.required;
        if (Array.isArray(req)) {
          cloned.function.parameters.required = req.filter((r) => r !== "tag_ids");
        }
        return cloned;
      });
  }

  // ── Construir histórico de chat a partir do formato de conversa ──────────────
  buildHistory(conversationHistory = []) {
    return conversationHistory.map((item) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: item.content,
    }));
  }

  // ── Executar uma chamada de função ────────────────────────────────────────────
  async executeFunction(functionCall) {
    const { name } = functionCall;
    const rawArgs = functionCall.args || functionCall.arguments || {};
    const args = typeof rawArgs === "string" ? JSON.parse(rawArgs) : rawArgs;
    const handler = this.functionHandlers[name];

    if (!handler) throw new Error(`Função "${name}" não está registada.`);

    const result = await handler(args);
    return { name, args, result, functionCall };
  }

  extractUserIdFromArgs(rawArgs) {
    const args =
      typeof rawArgs === "string" ? JSON.parse(rawArgs) : rawArgs || {};
    return args.user_id ?? args.userId ?? null;
  }

  extractTagIdsFromArgs(rawArgs) {
    const args = typeof rawArgs === "string" ? JSON.parse(rawArgs) : rawArgs || {};
    return Array.isArray(args.tag_ids) && args.tag_ids.length > 0;
  }

  // Tags are only allowed when the user explicitly mentioned them
  userRequestedTags(userMessage = "") {
    return /\b(tag|tags|etiqueta|etiquetas|label|labels)\b/i.test(userMessage);
  }

  filterFunctionCalls(functionCalls = [], userMessage = "", assignedTaskIds = new Set()) {
    const tagsRequested = this.userRequestedTags(userMessage);

    // Strip tag_ids from set_create_task_values when user did not ask for tags
    let calls = functionCalls.map((fc) => {
      if (fc.name === "set_create_task_values" && !tagsRequested) {
        const rawArgs = fc.args || fc.arguments || {};
        const args = typeof rawArgs === "string" ? JSON.parse(rawArgs) : { ...rawArgs };
        if (args.tag_ids) {
          delete args.tag_ids;
          return { ...fc, args };
        }
      }
      return fc;
    });

    // Remove set_tag_task_values entirely when user did not ask for tags
    if (!tagsRequested) {
      calls = calls.filter((fc) => fc.name !== "set_tag_task_values");
    }

    const hasCreateWithUserId = calls.some((fc) => {
      if (fc.name !== "set_create_task_values") return false;
      return this.extractUserIdFromArgs(fc.args) != null;
    });

    const hasCreateWithTagIds = calls.some((fc) => {
      if (fc.name !== "set_create_task_values") return false;
      return this.extractTagIdsFromArgs(fc.args);
    });

    // If there's a set_assign_task_values with a valid task_id, the model is
    // assigning an existing task — drop any spurious set_create_task_values call.
    const hasAssignWithTaskId = calls.some((fc) => {
      if (fc.name !== "set_assign_task_values") return false;
      const rawArgs = fc.args || fc.arguments || {};
      const args = typeof rawArgs === "string" ? JSON.parse(rawArgs) : rawArgs;
      return Number(args.task_id ?? args.taskId) > 0;
    });

    if (hasAssignWithTaskId) {
      calls = calls.filter((fc) => fc.name !== "set_create_task_values");
    } else {
      if (hasCreateWithUserId) calls = calls.filter((fc) => fc.name !== "set_assign_task_values");
    }

    if (hasCreateWithTagIds) calls = calls.filter((fc) => fc.name !== "set_tag_task_values");

    // Drop set_assign_task_values for tasks already assigned in a previous agentic step
    // (e.g. via user_id embedded in set_create_task_values → _assignmentPersisted).
    if (assignedTaskIds.size > 0) {
      calls = calls.filter((fc) => {
        if (fc.name !== "set_assign_task_values") return true;
        const rawArgs = fc.args || fc.arguments || {};
        const args = typeof rawArgs === "string" ? JSON.parse(rawArgs) : rawArgs;
        return !assignedTaskIds.has(Number(args.task_id ?? args.taskId));
      });
    }

    // Prevent cross-contamination from stale context:
    // If creating a task, remove unrelated ticket mutation calls (and vice-versa).
    // Both creations together are allowed (e.g. "cria tarefa e ticket").
    const TICKET_MUTATIONS = ["set_delete_ticket_values", "set_update_ticket_values", "set_patch_status_ticket_values"];
    const TASK_MUTATIONS   = ["set_delete_task_values",   "set_update_task_values",   "set_patch_status_task_values"];

    const isCreatingTask   = calls.some((fc) => fc.name === "set_create_task_values");
    const isCreatingTicket = calls.some((fc) => fc.name === "set_create_ticket_values");

    if (isCreatingTask && !isCreatingTicket)
      calls = calls.filter((fc) => !TICKET_MUTATIONS.includes(fc.name));
    if (isCreatingTicket && !isCreatingTask)
      calls = calls.filter((fc) => !TASK_MUTATIONS.includes(fc.name));

    return calls;
  }

  isProviderError(error) {
    return !!error?.groqType;
  }

  // Build tool-response parts: executed results + "cancelled" placeholder for blocked calls
  buildToolParts(allCalls, execResults) {
    const executedNames = new Set(execResults.map((r) => r.name));
    const blocked = allCalls.filter((fc) => !executedNames.has(fc.name));

    return [
      ...execResults.map(({ name, result }) => ({
        functionResponse: { name, response: result },
      })),
      ...blocked.map((fc) => ({
        functionResponse: {
          name: fc.name,
          response: { cancelled: true, message: "Ação não permitida neste contexto." },
        },
      })),
    ];
  }

  // ── Loop agêntico (sem streaming) ────────────────────────────────────────────
  async processChatMessage(userMessage, conversationHistory = []) {
    try {
      const history = this.buildHistory(conversationHistory);
      const chat = await this.createChat(this.getEffectiveToolConfig(userMessage), history, this.userRequestedTags(userMessage));

      let response = await chat.sendMessage(userMessage);
      const allResults = [];
      let step = 0;
      const assignedTaskIds = new Set();

      while (response.functionCalls?.length && step < MAX_AGENTIC_STEPS) {
        step++;
        const allCalls = response.functionCalls;
        const callsToExecute = this.filterFunctionCalls(allCalls, userMessage, assignedTaskIds);
        console.log(
          `[Agentic step ${step}] calling: ${callsToExecute.map((f) => f.name).join(", ")}`,
        );

        // Execute only allowed function calls in parallel
        const execResults = await Promise.all(
          callsToExecute.map((fc) => this.executeFunction(fc)),
        );
        allResults.push(...execResults);

        for (const r of execResults) {
          if (r.name === "set_create_task_values" && r.result?._assignmentPersisted) {
            assignedTaskIds.add(Number(r.result.task_id ?? r.result.id));
          }
        }

        // Return results for ALL original calls (blocked ones get a "cancelled" placeholder)
        response = await chat.sendMessage({
          message: {
            role: "tool",
            parts: this.buildToolParts(allCalls, execResults),
          },
        });
      }

      const finalText = response.text || "";
      return {
        success: true,
        message: finalText || "Como posso ajudar?",
        functionResults: allResults.map(
          ({ name, args, result, functionCall }) => ({
            functionName: name,
            arguments: args,
            result,
            functionCall,
          }),
        ),
      };
    } catch (error) {
      if (this.isProviderError(error)) {
        const providerName = "Groq";
        const errorType = error.groqType;

        console.error(`[ChatProcessor] ${providerName} ${errorType}:`, error.message);
        return {
          success: false,
          providerError: true,
          errorType,
          message: error.message,
          functionResults: [],
        };
      }
      console.error("[ChatProcessor] Unexpected error:", error);
      return {
        success: false,
        providerError: false,
        message: "Ocorreu um erro interno. Tente novamente.",
        functionResults: [],
      };
    }
  }

  // ── Agentic loop (stream: function rounds non-streaming, final text chunked) ─
  async processChatMessageStream(
    userMessage,
    conversationHistory = [],
    onChunk,
  ) {
    const history = this.buildHistory(conversationHistory);
    const chat = await this.createChat(this.getEffectiveToolConfig(userMessage), history, this.userRequestedTags(userMessage));

    let response;
    if (typeof chat.sendMessageStream === "function") {
      response = await chat.sendMessageStream({ message: userMessage }, onChunk);
    } else {
      response = await chat.sendMessage(userMessage);
      if (response.text) onChunk(response.text);
    }

    const allResults = [];
    let step = 0;
    const assignedTaskIds = new Set();

    while (response.functionCalls?.length && step < MAX_AGENTIC_STEPS) {
      step++;
      const allCalls = response.functionCalls;
      const callsToExecute = this.filterFunctionCalls(allCalls, userMessage, assignedTaskIds);
      console.log(
        `[Agentic stream step ${step}] calling: ${callsToExecute.map((f) => f.name).join(", ")}`,
      );

      const execResults = await Promise.all(
        callsToExecute.map((fc) => this.executeFunction(fc)),
      );
      allResults.push(...execResults);

      for (const r of execResults) {
        if (r.name === "set_create_task_values" && r.result?._assignmentPersisted) {
          assignedTaskIds.add(Number(r.result.task_id ?? r.result.id));
        }
      }

      response = await chat.sendMessage({
        message: {
          role: "tool",
          parts: this.buildToolParts(allCalls, execResults),
        },
      });

      // Only emit intermediate text if there are no more tool calls (final step)
      if (response.text && !response.functionCalls?.length) onChunk(response.text);
    }

    const finalText = response.text || "";

    return {
      success: true,
      message: finalText,
      functionResults: allResults.map(
        ({ name, args, result, functionCall }) => ({
          functionName: name,
          arguments: args,
          result,
          functionCall,
        }),
      ),
    };
  }
}

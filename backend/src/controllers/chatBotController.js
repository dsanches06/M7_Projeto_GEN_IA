import {
  processChatMessage,
  processChatMessageStream,
} from "../genAI/orchestration/chat_processor.js";

import {
  createChatHistory,
  getChatHistoryByConversationId,
} from "../services/chatHistoryService.js";

import {
  createConversation,
  getConversationById,
} from "../services/conversationService.js";

import { createTask }         from "../services/taskService.js";
import { createNotification } from "../services/notificationService.js";
import { createTicket }       from "../services/ticketService.js";
import { upsertSummary }      from "../services/summaryService.js";

import { processChatMessage as processSummaryMessage } from "../genAI/summaries/chat_processor_summary.js";

const ROLE_USER      = 2;
const ROLE_ASSISTANT = 3;

const buildConversationHistory = (historyRows) =>
  historyRows.map((row) => ({
    role:    row.role_id === ROLE_USER ? "user" : "assistant",
    content: row.content,
  }));

/**
 * Persist an auto-generated summary in the background (fire-and-forget).
 * Never blocks the SSE response.
 */
const autoGenerateSummary = async (conversationId) => {
  try {
    const historyRows = await getChatHistoryByConversationId(conversationId);
    if (!historyRows || historyRows.length < 2) return;

    const historyText = historyRows
      .slice(-12)
      .map(
        (r) =>
          `${r.role_id === ROLE_USER ? "Utilizador" : "Assistente"}: ${r.content.substring(0, 120)}`
      )
      .join("\n");

    const prompt = `Resume esta conversa de forma concisa (conversation_id: ${conversationId}). Histórico:\n${historyText}`;
    const result = await processSummaryMessage(prompt, []);

    if (result.functionResults?.[0]?.result) {
      const fd = result.functionResults[0].result;
      await upsertSummary({
        conversation_id: fd.conversation_id || conversationId,
        original_text:   historyText.substring(0, 295),
        summary:         (fd.summary || result.message || "Resumo indisponível").substring(0, 195),
      });
    } else if (result.message) {
      await upsertSummary({
        conversation_id: conversationId,
        original_text:   historyText.substring(0, 295),
        summary:         result.message.substring(0, 195),
      });
    }
  } catch (err) {
    console.warn("[AutoSummary] Non-critical error:", err.message);
  }
};

/**
 * Persist the entity returned by the model's function call.
 *
 * Returns { task, notification, ticket } — exactly one field populated,
 * the other two null.  All three are forwarded in the SSE done event so
 * the frontend can surface the right UI feedback without hitting the DB again.
 */
const persistFunctionResult = async (functionResult) => {
  let task         = null;
  let notification = null;
  let ticket       = null;

  if (!functionResult?.result) return { task, notification, ticket };

  const { functionName, result } = functionResult;

  try {
    if (functionName === "set_create_task_values") {
      console.log("📝 Criando tarefa:", result);
      task = await createTask(result);
      console.log("✅ Tarefa criada:", task);
    } else if (functionName === "set_create_notification_values") {
      console.log("📬 Criando notificação:", result);
      notification = await createNotification(result);
      console.log("✅ Notificação criada:", notification);
    } else if (functionName === "set_create_ticket_values") {
      console.log("🎟️ Criando ticket:", result);
      ticket = await createTicket(result);
      console.log("✅ Ticket criado:", ticket);
    } else {
      console.warn("[chatBotController] Função desconhecida:", functionName);
    }
  } catch (err) {
    console.error(`❌ Erro ao persistir ${functionName}:`, err.message);
  }

  return { task, notification, ticket };
};

/**
 * POST /chat/message/stream
 * Envia uma mensagem e responde em SSE.  Usa o UnifiedChatProcessor para que
 * a IA possa criar tarefas, notificações e tickets a partir do mesmo endpoint.
 */
export const sendMessageToBotStream = async (req, res) => {
  try {
    const { message, conversationHistory, conversationId } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, error: "Mensagem não pode estar vazia" });
    }

    const userMessage = message.trim();
    let actualConversationId          = conversationId ? Number(conversationId) : null;
    let resolvedConversationHistory   = conversationHistory || [];

    if (actualConversationId) {
      const existingConversation = await getConversationById(actualConversationId);
      if (!existingConversation) {
        return res.status(404).json({ success: false, error: "Conversation não encontrada" });
      }
      if (!resolvedConversationHistory.length) {
        const historyRows = await getChatHistoryByConversationId(actualConversationId);
        resolvedConversationHistory = buildConversationHistory(historyRows);
      }
    } else {
      const title =
        userMessage.length > 50 ? userMessage.substring(0, 47) + "..." : userMessage;
      const newConversation    = await createConversation({ title });
      actualConversationId     = newConversation.id;
    }

    await createChatHistory({
      conversation_id: actualConversationId,
      role_id:         ROLE_USER,
      content:         userMessage,
    });

    res.setHeader("Content-Type",  "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection",    "keep-alive");
    res.flushHeaders();

    const sendEvent = (event, data) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    let finalText = "";

    const result = await processChatMessageStream(
      userMessage,
      resolvedConversationHistory,
      (chunkText) => {
        finalText += chunkText;
        sendEvent("message", { text: chunkText });
      }
    );

    const assistantText = result.message || finalText;

    let task         = null;
    let notification = null;
    let ticket       = null;

    if (result.success !== false) {
      await createChatHistory({
        conversation_id: actualConversationId,
        role_id:         ROLE_ASSISTANT,
        content:         assistantText,
      });

      const firstResult = result.functionResults?.[0];
      if (firstResult) {
        ({ task, notification, ticket } = await persistFunctionResult(firstResult));
      }

      setImmediate(() => autoGenerateSummary(actualConversationId));
    }

    sendEvent("done", {
      success:         true,
      message:         assistantText,
      conversationId:  actualConversationId,
      functionResults: result.functionResults || [],
      // exactly one of the three will be non-null when a function was called
      task,
      notification,
      ticket,
    });

    res.end();
  } catch (error) {
    console.error("Erro no controller stream:", error);
    res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
    res.end();
  }
};

/**
 * POST /chat/conversation/:conversationId/message
 * Envia uma mensagem numa conversa específica (modo não-stream).
 */
export const sendMessageToConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { message }        = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, error: "Mensagem não pode estar vazia" });
    }

    const userMessage      = message.trim();
    const chatHistoryRows  = await getChatHistoryByConversationId(conversationId);
    const conversationHist = buildConversationHistory(chatHistoryRows);

    await createChatHistory({
      conversation_id: conversationId,
      role_id:         ROLE_USER,
      content:         userMessage,
    });

    const result = await processChatMessage(userMessage, conversationHist);

    if (result.success && result.message) {
      await createChatHistory({
        conversation_id: conversationId,
        role_id:         ROLE_ASSISTANT,
        content:         result.message,
      });

      const firstResult = result.functionResults?.[0];
      if (firstResult) {
        await persistFunctionResult(firstResult);
      }

      setImmediate(() => autoGenerateSummary(Number(conversationId)));
    }

    res.status(result.success ? 200 : 400).json({ ...result, conversationId });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:   "Erro ao processar mensagem: " + error.message,
    });
  }
};

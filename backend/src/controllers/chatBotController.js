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

import {
  createTask,
  updateStatus,
  updateTask,
  deleteTask,
  getTaskById,
} from "../services/taskService.js";

import {
  createTicket,
  updateTicket,
  deleteTicket,
} from "../services/ticketService.js";

import { db }                              from "../db.js";
import { createNotification }              from "../services/notificationService.js";
import { upsertSummary }                   from "../services/summaryService.js";
import { getUserById }                     from "../services/userService.js";
import { createTaskAssignee, deleteTaskAssignee } from "../services/taskAssigneesService.js";
import { createTagTask, createTagTasks }   from "../services/tagTaskService.js";
import { getAllTags }                       from "../services/tagService.js";

import { processChatMessage as processSummaryMessage } from "../genAI/summaries/chat_processor_summary.js";

const ROLE_USER      = 2;
const ROLE_ASSISTANT = 3;

const STATUS_NAME = {
  1: "CREATED", 2: "ASSIGNED", 3: "IN_PROGRESS",
  4: "BLOCKED", 5: "COMPLETED", 6: "ARCHIVED",
};

const buildConversationHistory = (historyRows) =>
  historyRows.map((row) => ({
    role:    row.role_id === ROLE_USER ? "user" : "assistant",
    content: row.content,
  }));

// ── Auto-summary (fire-and-forget) ───────────────────────────────────────────
const autoGenerateSummary = async (conversationId) => {
  try {
    const historyRows = await getChatHistoryByConversationId(conversationId);
    if (!historyRows || historyRows.length < 2) return;

    const historyText = historyRows
      .slice(-12)
      .map((r) => `${r.role_id === ROLE_USER ? "Utilizador" : "Assistente"}: ${r.content.substring(0, 120)}`)
      .join("\n");

    const prompt = `Resume esta conversa (conversation_id: ${conversationId}). Histórico:\n${historyText}`;
    const result = await processSummaryMessage(prompt, []);

    if (result.geminiError) return;

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

// ── Upsert task assignment ────────────────────────────────────────────────────
const upsertAssignment = async (task_id, user_id) => {
  const taskIdNum = Number(task_id);
  const userIdNum = Number(user_id);

  if (!taskIdNum || !userIdNum)
    throw new Error(`IDs inválidos: task_id=${task_id}, user_id=${user_id}`);

  let assignment;
  try {
    assignment = await createTaskAssignee({ task_id: taskIdNum, user_id: userIdNum });
  } catch (err) {
    if (err.message?.includes("já está atribuída")) {
      // Replace existing assignment — use ? placeholder (works for MySQL + PostgreSQL)
      await db.query("DELETE FROM task_assignees WHERE task_id = ?", [taskIdNum]);
      assignment = await createTaskAssignee({ task_id: taskIdNum, user_id: userIdNum });
    } else {
      throw err;
    }
  }

  try {
    const [user, task] = await Promise.all([
      getUserById(userIdNum),
      getTaskById(taskIdNum),
    ]);
    return {
      ...assignment,
      user_name:  user?.name  || `Utilizador #${userIdNum}`,
      task_title: task?.title || `Tarefa #${taskIdNum}`,
    };
  } catch {
    return assignment;
  }
};

// ── Persist one function result ───────────────────────────────────────────────
const persistFunctionResult = async (functionResult) => {
  let task = null, notification = null, ticket = null,
      assignment = null, tags = null, taskUpdated = null, taskDeleted = null;

  if (!functionResult?.result)
    return { task, notification, ticket, assignment, tags, taskUpdated, taskDeleted };

  const { functionName, result } = functionResult;

  try {
    // ── Tasks ────────────────────────────────────────────────────────────────
    if (functionName === "set_create_task_values") {
      task = await createTask(result);
      if (result.user_id && task?.id) {
        try { assignment = await upsertAssignment(task.id, result.user_id); }
        catch (e) { console.warn("[persist] Auto-assign failed:", e.message); }
      }

    } else if (functionName === "set_update_task_values") {
      const { task_id, ...updateFields } = result;
      const taskIdNum = Number(task_id);
      if (!taskIdNum) throw new Error("task_id inválido para update");
      if (Object.keys(updateFields).length) await updateTask(taskIdNum, updateFields);
      taskUpdated = await getTaskById(taskIdNum);
      if (taskUpdated) taskUpdated.status_name = STATUS_NAME[taskUpdated.status_id] || "UNKNOWN";

    } else if (functionName === "set_delete_task_values") {
      const taskIdNum = Number(result.task_id);
      if (!taskIdNum) throw new Error("task_id inválido para delete");
      const taskBefore = await getTaskById(taskIdNum).catch(() => null);
      await deleteTask(taskIdNum);
      taskDeleted = { id: taskIdNum, title: taskBefore?.title || `Tarefa #${taskIdNum}` };

    } else if (functionName === "set_assign_task_values") {
      assignment = await upsertAssignment(result.task_id, result.user_id);

    } else if (functionName === "set_patch_status_task_values") {
      const taskIdNum   = Number(result.task_id);
      const statusIdNum = Number(result.status_id);
      if (!taskIdNum || !statusIdNum)
        throw new Error(`IDs inválidos: task_id=${result.task_id}, status_id=${result.status_id}`);
      await updateStatus(taskIdNum, { status_id: statusIdNum });
      taskUpdated = await getTaskById(taskIdNum);
      if (taskUpdated) taskUpdated.status_name = STATUS_NAME[statusIdNum] || "UNKNOWN";

    } else if (functionName === "set_tag_task_values") {
      let rawTags = [];
      if (Array.isArray(result.tag_ids) && result.tag_ids.length > 0)
        rawTags = await createTagTasks(result);
      else if (result.tag_id)
        rawTags = [await createTagTask(result)];

      let allTags = [];
      try { allTags = await getAllTags(); } catch { /* non-critical */ }

      const tagMap      = Object.fromEntries(allTags.map((t) => [t.id, t]));
      const taskDetails = await getTaskById(result.task_id).catch(() => null);

      tags = {
        task_id:    result.task_id,
        task_title: taskDetails?.title || `Tarefa #${result.task_id}`,
        added: (rawTags || []).map((rt) => {
          const tag = tagMap[rt.tag_id] || {};
          return { tag_id: rt.tag_id, tag_name: tag.name || `Tag #${rt.tag_id}`, tag_color: tag.color || "#6B7280" };
        }),
      };

    // ── Notifications ─────────────────────────────────────────────────────────
    } else if (functionName === "set_create_notification_values") {
      notification = await createNotification(result);

    // ── Tickets ───────────────────────────────────────────────────────────────
    } else if (functionName === "set_create_ticket_values") {
      ticket = await createTicket(result);

    } else if (functionName === "set_update_ticket_values") {
      const { ticket_id, ...updateFields } = result;
      const ticketIdNum = Number(ticket_id);
      if (!ticketIdNum) throw new Error("ticket_id inválido para update");
      if (Object.keys(updateFields).length) await updateTicket(ticketIdNum, updateFields);
      // Return updated ticket as taskUpdated-style payload (reuse key)
      const updated = { id: ticketIdNum, ...updateFields, _type: "ticket_updated" };
      ticket = updated;

    } else if (functionName === "set_delete_ticket_values") {
      const ticketIdNum = Number(result.ticket_id);
      if (!ticketIdNum) throw new Error("ticket_id inválido para delete");
      await deleteTicket(ticketIdNum);
      // Signal deletion via ticket key
      ticket = { id: ticketIdNum, _type: "ticket_deleted" };

    } else if (functionName === "set_patch_status_ticket_values") {
      const ticketIdNum = Number(result.ticket_id);
      if (!ticketIdNum) throw new Error("ticket_id inválido para patch status");
      await updateTicket(ticketIdNum, { status: result.status });
      ticket = { id: ticketIdNum, status: result.status, _type: "ticket_status" };

    } else {
      console.warn("[chatBotController] Função desconhecida:", functionName);
    }
  } catch (err) {
    console.error(`❌ Erro ao persistir ${functionName}:`, err.message);
  }

  return { task, notification, ticket, assignment, tags, taskUpdated, taskDeleted };
};

// ── Process ALL function results (parallel support) ───────────────────────────
const persistAllFunctionResults = async (functionResults) => {
  const settled = await Promise.allSettled(
    functionResults.map((fr) => persistFunctionResult(fr))
  );

  return settled.reduce((acc, r) => {
    if (r.status !== "fulfilled") return acc;
    const v = r.value;
    if (v.task)        acc.task        = v.task;
    if (v.notification) acc.notification = v.notification;
    if (v.ticket)      acc.ticket      = v.ticket;
    if (v.assignment)  acc.assignment  = v.assignment;
    if (v.tags)        acc.tags        = v.tags;
    if (v.taskUpdated) acc.taskUpdated = v.taskUpdated;
    if (v.taskDeleted) acc.taskDeleted = v.taskDeleted;
    return acc;
  }, {});
};

// ── Friendly Gemini error messages ───────────────────────────────────────────
const GEMINI_ERROR_MESSAGES = {
  SERVICE_DOWN:    "⚠️ O serviço de IA está temporariamente em baixo. Tente novamente em instantes.",
  RATE_LIMIT:      "⏳ Limite de pedidos atingido. Aguarde alguns segundos e tente novamente.",
  AUTH_ERROR:      "🔑 Erro de autenticação com o serviço de IA. Contacte o administrador.",
  NETWORK_ERROR:   "🌐 Sem ligação ao serviço de IA. Verifique a internet e tente novamente.",
  INVALID_REQUEST: "✏️ O pedido não pôde ser processado. Tente reformular a mensagem.",
  UNKNOWN:         "🤖 O assistente de IA não está disponível. Tente novamente.",
};

// ── Stream endpoint ───────────────────────────────────────────────────────────
export const sendMessageToBotStream = async (req, res) => {
  let actualConversationId = null;

  try {
    const { message, conversationHistory, conversationId } = req.body;

    if (!message || message.trim().length === 0)
      return res.status(400).json({ success: false, error: "Mensagem não pode estar vazia" });

    const userMessage = message.trim();
    actualConversationId = conversationId ? Number(conversationId) : null;
    let resolvedHistory  = conversationHistory || [];

    if (actualConversationId) {
      const existing = await getConversationById(actualConversationId);
      if (!existing)
        return res.status(404).json({ success: false, error: "Conversation não encontrada" });
      if (!resolvedHistory.length) {
        const rows = await getChatHistoryByConversationId(actualConversationId);
        resolvedHistory = buildConversationHistory(rows);
      }
    } else {
      const title   = userMessage.length > 50 ? userMessage.substring(0, 47) + "..." : userMessage;
      const newConv = await createConversation({ title });
      actualConversationId = newConv.id;
    }

    await createChatHistory({ conversation_id: actualConversationId, role_id: ROLE_USER, content: userMessage });

    res.setHeader("Content-Type",  "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection",    "keep-alive");
    res.flushHeaders();

    const sendEvent = (event, data) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      const result = await processChatMessageStream(
        userMessage,
        resolvedHistory,
        (chunkText) => sendEvent("message", { text: chunkText })
      );

      const assistantText = result.message || "";

      // ── Gemini / AI error ─────────────────────────────────────────────────
      if (result.geminiError || result.success === false) {
        const errorMsg = GEMINI_ERROR_MESSAGES[result.errorType] || result.message;
        await createChatHistory({ conversation_id: actualConversationId, role_id: ROLE_ASSISTANT, content: errorMsg });
        sendEvent("gemini_error", {
          success: false, geminiError: true,
          errorType: result.errorType || "UNKNOWN",
          message:   errorMsg,
          conversationId: actualConversationId,
        });
        return res.end();
      }

      // ── Success — persist all function results ────────────────────────────
      await createChatHistory({ conversation_id: actualConversationId, role_id: ROLE_ASSISTANT, content: assistantText });

      let persisted = {};
      if (result.functionResults?.length)
        persisted = await persistAllFunctionResults(result.functionResults);

      setImmediate(() => autoGenerateSummary(actualConversationId));

      sendEvent("done", {
        success:         true,
        message:         assistantText,
        conversationId:  actualConversationId,
        functionResults: result.functionResults || [],
        ...persisted,
      });

      res.end();
    } catch (streamError) {
      const isGeminiErr = !!streamError?.geminiType;
      const errorMsg    = isGeminiErr ? streamError.message : GEMINI_ERROR_MESSAGES.UNKNOWN;
      console.error("[Controller Stream] Error:", streamError.message);
      sendEvent("gemini_error", {
        success:     false,
        geminiError: isGeminiErr,
        errorType:   streamError?.geminiType || "UNKNOWN",
        message:     errorMsg,
        conversationId: actualConversationId,
      });
      res.end();
    }
  } catch (error) {
    console.error("[Controller] Fatal error:", error);
    if (!res.headersSent)
      return res.status(500).json({ success: false, error: "Erro interno do servidor." });
    try {
      res.write(`event: gemini_error\ndata: ${JSON.stringify({
        success: false, geminiError: false, message: GEMINI_ERROR_MESSAGES.UNKNOWN,
      })}\n\n`);
      res.end();
    } catch { /* client disconnected */ }
  }
};

// ── Non-stream endpoint ───────────────────────────────────────────────────────
export const sendMessageToConversation = async (req, res) => {
  try {
    const conversationId = Number(req.params.conversationId);
    const { message }    = req.body;

    if (!message || message.trim().length === 0)
      return res.status(400).json({ success: false, error: "Mensagem não pode estar vazia" });
    if (!conversationId)
      return res.status(400).json({ success: false, error: "conversationId inválido" });

    const existing = await getConversationById(conversationId);
    if (!existing)
      return res.status(404).json({ success: false, error: "Conversation não encontrada" });

    const userMessage = message.trim();
    const rows        = await getChatHistoryByConversationId(conversationId);
    const history     = buildConversationHistory(rows);

    await createChatHistory({ conversation_id: conversationId, role_id: ROLE_USER, content: userMessage });

    const result = await processChatMessage(userMessage, history);

    if (result.geminiError || result.success === false) {
      const errorMsg = GEMINI_ERROR_MESSAGES[result.errorType] || result.message;
      return res.status(503).json({ success: false, geminiError: true, errorType: result.errorType || "UNKNOWN", message: errorMsg, conversationId });
    }

    await createChatHistory({ conversation_id: conversationId, role_id: ROLE_ASSISTANT, content: result.message });

    let persisted = {};
    if (result.functionResults?.length)
      persisted = await persistAllFunctionResults(result.functionResults);

    setImmediate(() => autoGenerateSummary(Number(conversationId)));

    return res.status(200).json({ ...result, conversationId, ...persisted });
  } catch (error) {
    res.status(500).json({ success: false, error: "Erro ao processar mensagem: " + error.message });
  }
};

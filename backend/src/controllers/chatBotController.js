import {
  processChatMessage,
  processChatMessageStream,
} from "../genAI/chat_processor.js";

import {
  chatHistoryService,
  conversationService,
  taskService,
  ticketService,
  notificationService,
  userService,
  taskAssigneesService,
  tagTaskService,
  tagService,
} from "../services/index.js";

import { db } from "../db.js";
import {
  ROLE_USER,
  ROLE_ASSISTANT,
  STATUS_NAME,
  PROVIDER_ERROR_MESSAGES,
} from "../utils/chatBotUtil.js";

const { createChatHistory, getChatHistoryByConversationId } =
  chatHistoryService;

const { createConversation, getConversationById } = conversationService;

const { createTask, updateStatus, updateTask, deleteTask, getTaskById } =
  taskService;

const { createTicket, updateTicket, deleteTicket } = ticketService;

const { createNotification } = notificationService;
const { getUserById } = userService;
const { createTaskAssignee, deleteTaskAssignee } = taskAssigneesService;
const { createTagTask, createTagTasks } = tagTaskService;
const { getAllTags } = tagService;

const buildConversationHistory = (historyRows) =>
  historyRows.map((row) => ({
    role: row.role_id === ROLE_USER ? "user" : "assistant",
    content: row.content,
  }));

// ── Gera resumo da conversa e devolve como texto (sem gravar na DB) ───────────
const autoGenerateSummary = async (conversationId) => {
  try {
    const historyRows = await getChatHistoryByConversationId(conversationId);
    if (!historyRows || historyRows.length < 2) return null;

    const historyText = historyRows
      .slice(-12)
      .map(
        (r) =>
          `${r.role_id === ROLE_USER ? "Utilizador" : "Assistente"}: ${r.content.substring(0, 120)}`,
      )
      .join("\n");

    const prompt = `Resume esta conversa em 1-2 frases curtas e claras (máx. 195 caracteres). Histórico:\n${historyText}`;
    const result = await processChatMessage(prompt, []);

    if (result.providerError || !result.success) return null;

    const summaryText =
      result.functionResults?.[0]?.result?.summary || result.message || null;

    return summaryText ? summaryText.substring(0, 195) : null;
  } catch (err) {
    console.warn("[AutoSummary] Non-critical error:", err.message);
    return null;
  }
};

export const getConversationSummary = async (req, res) => {
  try {
    const conversationId = Number(req.params.conversationId);
    if (!conversationId)
      return res
        .status(400)
        .json({ success: false, error: "conversationId inválido" });

    const existing = await getConversationById(conversationId);
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: "Conversation não encontrada" });

    const summary = await autoGenerateSummary(conversationId);
    if (!summary)
      return res
        .status(200)
        .json({ success: true, conversationId, summary: null });

    return res.status(200).json({ success: true, conversationId, summary });
  } catch (error) {
    console.error("[getConversationSummary] Error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Erro ao gerar resumo da conversa",
    });
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
    assignment = await createTaskAssignee({
      task_id: taskIdNum,
      user_id: userIdNum,
    });
  } catch (err) {
    if (err.message?.includes("já está atribuída")) {
      // Replace existing assignment — use ? placeholder (works for MySQL + PostgreSQL)
      await db.query("DELETE FROM task_assignees WHERE task_id = ?", [
        taskIdNum,
      ]);
      assignment = await createTaskAssignee({
        task_id: taskIdNum,
        user_id: userIdNum,
      });
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
      user_name: user?.name || `Utilizador #${userIdNum}`,
      task_title: task?.title || `Tarefa #${taskIdNum}`,
    };
  } catch {
    return assignment;
  }
};

// ── Persist one function result ───────────────────────────────────────────────
const persistFunctionResult = async (functionResult) => {
  let task = null,
    notification = null,
    ticket = null,
    assignment = null,
    tags = null,
    taskUpdated = null,
    taskDeleted = null;

  if (!functionResult?.result)
    return {
      task,
      notification,
      ticket,
      assignment,
      tags,
      taskUpdated,
      taskDeleted,
    };

  const { functionName, result } = functionResult;

  try {
    // ── Tasks ────────────────────────────────────────────────────────────────
    if (functionName === "set_create_task_values") {
      task = await createTask(result);
      if (result.user_id && task?.id) {
        try {
          assignment = await upsertAssignment(task.id, result.user_id);
        } catch (e) {
          console.warn("[persist] Auto-assign failed:", e.message);
        }
      }
    } else if (functionName === "set_update_task_values") {
      const { task_id, ...updateFields } = result;
      const taskIdNum = Number(task_id);
      if (!taskIdNum) throw new Error("task_id inválido para update");
      if (Object.keys(updateFields).length)
        await updateTask(taskIdNum, updateFields);
      taskUpdated = await getTaskById(taskIdNum);
      if (!taskUpdated) throw new Error(`Tarefa ${taskIdNum} não encontrada`);
      taskUpdated.status_name =
        STATUS_NAME[taskUpdated.status_id] || "UNKNOWN";
    } else if (functionName === "set_delete_task_values") {
      const taskIdNum = Number(result.task_id);
      if (!taskIdNum) throw new Error("task_id inválido para delete");
      const taskBefore = await getTaskById(taskIdNum);
      if (!taskBefore) throw new Error(`Tarefa ${taskIdNum} não encontrada`);
      await deleteTask(taskIdNum);
      taskDeleted = {
        id: taskIdNum,
        title: taskBefore.title,
      };
    } else if (functionName === "set_assign_task_values") {
      assignment = await upsertAssignment(result.task_id, result.user_id);
    } else if (functionName === "set_patch_status_task_values") {
      const taskIdNum = Number(result.task_id);
      const statusIdNum = Number(result.status_id);
      if (!taskIdNum || !statusIdNum)
        throw new Error(
          `IDs inválidos: task_id=${result.task_id}, status_id=${result.status_id}`,
        );
      await updateStatus(taskIdNum, { status_id: statusIdNum });
      taskUpdated = await getTaskById(taskIdNum);
      if (!taskUpdated) throw new Error(`Tarefa ${taskIdNum} não encontrada`);
      taskUpdated.status_name = STATUS_NAME[statusIdNum] || "UNKNOWN";
    } else if (functionName === "set_tag_task_values") {
      let rawTags = [];
      if (Array.isArray(result.tag_ids) && result.tag_ids.length > 0)
        rawTags = await createTagTasks(result);
      else if (result.tag_id) rawTags = [await createTagTask(result)];

      let allTags = [];
      try {
        allTags = await getAllTags();
      } catch {
        /* non-critical */
      }

      const tagMap = Object.fromEntries(allTags.map((t) => [t.id, t]));
      const taskDetails = await getTaskById(result.task_id).catch(() => null);

      tags = {
        task_id: result.task_id,
        task_title: taskDetails?.title || `Tarefa #${result.task_id}`,
        added: (rawTags || []).map((rt) => {
          const tag = tagMap[rt.tag_id] || {};
          return {
            tag_id: rt.tag_id,
            tag_name: tag.name || `Tag #${rt.tag_id}`,
            tag_color: tag.color || "#6B7280",
          };
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
      const existingTicket = await getTicketById(ticketIdNum);
      if (!existingTicket) throw new Error(`Ticket ${ticketIdNum} não encontrado`);
      if (Object.keys(updateFields).length)
        await updateTicket(ticketIdNum, updateFields);
      // Return updated ticket as taskUpdated-style payload (reuse key)
      ticket = {
        id: ticketIdNum,
        ...updateFields,
        _type: "ticket_updated",
      };
    } else if (functionName === "set_delete_ticket_values") {
      const ticketIdNum = Number(result.ticket_id);
      if (!ticketIdNum) throw new Error("ticket_id inválido para delete");
      const existingTicket = await getTicketById(ticketIdNum);
      if (!existingTicket) throw new Error(`Ticket ${ticketIdNum} não encontrado`);
      await deleteTicket(ticketIdNum);
      // Signal deletion via ticket key
      ticket = { id: ticketIdNum, _type: "ticket_deleted" };
    } else if (functionName === "set_patch_status_ticket_values") {
      const ticketIdNum = Number(result.ticket_id);
      if (!ticketIdNum) throw new Error("ticket_id inválido para patch status");
      await updateTicket(ticketIdNum, { status: result.status });
      ticket = {
        id: ticketIdNum,
        status: result.status,
        _type: "ticket_status",
      };
    } else {
      console.warn("[chatBotController] Função desconhecida:", functionName);
    }
  } catch (err) {
    console.error(`❌ Erro ao persistir ${functionName}:`, err.message);
    throw new Error(`Falha ao executar ${functionName}: ${err.message}`);
  }

  return {
    task,
    notification,
    ticket,
    assignment,
    tags,
    taskUpdated,
    taskDeleted,
  };
};

const normalizeResultValue = (value) => {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(normalizeResultValue);

  return Object.keys(value)
    .sort()
    .reduce((acc, key) => {
      acc[key] = normalizeResultValue(value[key]);
      return acc;
    }, {});
};

const getCreateTaskFingerprint = (result = {}) => {
  const keys = [
    "title",
    "description",
    "status_id",
    "priority_id",
    "created_at",
    "due_date",
    "completed_at",
    "estimated_hours",
  ];

  return JSON.stringify(
    keys.reduce((acc, key) => {
      acc[key] = result[key] ?? null;
      return acc;
    }, {}),
  );
};

const getFunctionResultKey = (functionResult) => {
  const { functionName, result } = functionResult;

  if (functionName === "set_create_task_values") {
    return `createTask:${getCreateTaskFingerprint(result)}`;
  }

  if (functionName === "set_assign_task_values") {
    return `assignTask:${Number(result.task_id)}:${Number(result.user_id)}`;
  }

  return `${functionName}:${JSON.stringify(normalizeResultValue(result || {}))}`;
};

const deduplicateFunctionResults = (functionResults = []) => {
  const seen = new Map();
  const deduped = [];

  for (const functionResult of functionResults) {
    const key = getFunctionResultKey(functionResult);

    if (!seen.has(key)) {
      seen.set(key, functionResult);
      deduped.push(functionResult);
      continue;
    }

    const existing = seen.get(key);
    if (
      functionResult.functionName === "set_create_task_values" &&
      !existing.result.user_id &&
      functionResult.result.user_id
    ) {
      existing.result.user_id = functionResult.result.user_id;
    }
  }

  return deduped;
};

// ── Process ALL function results (sequential support) ────────────────────────
const persistAllFunctionResults = async (functionResults) => {
  const cleanResults = deduplicateFunctionResults(functionResults || []);
  const acc = {
    persistenceErrors: [],
  };

  for (const functionResult of cleanResults) {
    try {
      const v = await persistFunctionResult(functionResult);
      if (v.task) acc.task = v.task;
      if (v.notification) acc.notification = v.notification;
      if (v.ticket) acc.ticket = v.ticket;
      if (v.assignment) acc.assignment = v.assignment;
      if (v.tags) acc.tags = v.tags;
      if (v.taskUpdated) acc.taskUpdated = v.taskUpdated;
      if (v.taskDeleted) acc.taskDeleted = v.taskDeleted;
    } catch (err) {
      // Capture individual persistence errors
      acc.persistenceErrors.push({
        functionName: functionResult.functionName,
        errorMessage: err.message,
        timestamp: new Date().toISOString(),
      });
      console.error(
        `❌ Erro ao persistir ${functionResult.functionName}:`,
        err.message,
      );
    }
  }

  return acc;
};

// ── Stream endpoint ───────────────────────────────────────────────────────────
export const sendMessageToBotStream = async (req, res) => {
  let actualConversationId = null;

  try {
    const requestBody = req.body && typeof req.body === "object" ? req.body : {};
    let { message, conversationHistory, conversationId, user_id } = requestBody;

    if (typeof message === "object" && message !== null) {
      const nested = message;
      message = nested.message ?? JSON.stringify(nested);
      conversationHistory = conversationHistory?.length ? conversationHistory : nested.conversationHistory;
      conversationId = conversationId ?? nested.conversationId;
      user_id = user_id ?? nested.user_id;
    }

    if (!message || String(message).trim().length === 0)
      return res
        .status(400)
        .json({ success: false, error: "Mensagem não pode estar vazia" });

    const userMessage = String(message).trim();
    actualConversationId = conversationId ? Number(conversationId) : null;
    let resolvedHistory = conversationHistory || [];

    if (actualConversationId) {
      const existing = await getConversationById(actualConversationId);
      if (!existing)
        return res
          .status(404)
          .json({ success: false, error: "Conversation não encontrada" });
      if (!resolvedHistory.length) {
        const rows = await getChatHistoryByConversationId(actualConversationId);
        resolvedHistory = buildConversationHistory(rows);
      }
    } else {
      const title =
        userMessage.length > 50
          ? userMessage.substring(0, 47) + "..."
          : userMessage;
      const newConv = await createConversation({
        title,
        user_id: Number(user_id) || 1,
      });
      actualConversationId = newConv.id;
    }

    await createChatHistory({
      conversation_id: actualConversationId,
      role_id: ROLE_USER,
      content: userMessage,
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const sendEvent = (event, data) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Envia evento inicial para indicar que a stream foi aberta.
    sendEvent("loading", {
      status: "waiting",
      timestamp: Date.now(),
    });

    const keepAliveInterval = setInterval(() => {
      if (res.writableEnded || res.destroyed) return;
      res.write(`event: ping\ndata: ${JSON.stringify({ timestamp: Date.now() })}\n\n`);
    }, 10000);

    const clearKeepAlive = () => clearInterval(keepAliveInterval);

    try {
      const result = await processChatMessageStream(
        userMessage,
        resolvedHistory,
        (chunkText) => sendEvent("message", { text: chunkText }),
      );

      const assistantText = result.message || "";

      const enrichAssistantText = (text, persisted) => {
        const base = (text || "").trim();
        const hasCreatedTask = persisted.task && persisted.task.id;
        const hasAssignedTask =
          persisted.assignment && persisted.assignment.task_id;

        let finalText = base;

        if (hasCreatedTask) {
          const idFragment = `ID #${persisted.task.id}`;
          if (!finalText.includes(idFragment)) {
            const suffix = finalText
              ? `\n✓ Tarefa criada com ${idFragment}.`
              : `✓ Tarefa criada com ${idFragment}.`;
            finalText = `${finalText}${suffix}`.trim();
          }
        }

        if (!finalText && hasAssignedTask) {
          finalText = `✓ Tarefa #${persisted.assignment.task_id} atribuída a ${persisted.assignment.user_name}.`;
        }

        return finalText || assistantText;
      };

      let persisted = {};
      if (result.functionResults?.length)
        persisted = await persistAllFunctionResults(result.functionResults);

      const finalAssistantText = enrichAssistantText(assistantText, persisted);

      await createChatHistory({
        conversation_id: actualConversationId,
        role_id: ROLE_ASSISTANT,
        content: finalAssistantText,
      });

      const summary = await autoGenerateSummary(actualConversationId);

      // Check if there were persistence errors to report
      const hasPersistenceErrors =
        persisted.persistenceErrors && persisted.persistenceErrors.length > 0;

      if (hasPersistenceErrors) {
        sendEvent("done", {
          success: false,
          message: finalAssistantText,
          conversationId: actualConversationId,
          functionResults: result.functionResults || [],
          summary,
          persistenceErrors: persisted.persistenceErrors,
          ...persisted,
        });
      } else {
        sendEvent("done", {
          success: true,
          message: finalAssistantText,
          conversationId: actualConversationId,
          functionResults: result.functionResults || [],
          summary,
          ...persisted,
        });
      }

      clearKeepAlive();
      res.end();
    } catch (streamError) {
      clearKeepAlive();
      const isGroqErr = !!streamError?.groqType;
      const errorMsg = isGroqErr
        ? streamError.message
        : PROVIDER_ERROR_MESSAGES.UNKNOWN;
      console.error("[Controller Stream] Error:", streamError.message);
      sendEvent("provider_error", {
        success: false,
        providerError: true,
        providerType: isGroqErr ? "GROQ" : "UNKNOWN",
        errorType: streamError?.groqType || "UNKNOWN",
        message: errorMsg,
        conversationId: actualConversationId,
      });
      clearKeepAlive();
      res.end();
    }
  } catch (error) {
    console.error("[Controller] Fatal error:", error);
    if (!res.headersSent)
      return res
        .status(500)
        .json({ success: false, error: "Erro interno do servidor." });
    try {
      res.write(
        `event: provider_error\ndata: ${JSON.stringify({
          success: false,
          providerError: false,
          message: PROVIDER_ERROR_MESSAGES.UNKNOWN,
        })}\n\n`,
      );
      res.end();
    } catch {
      /* client disconnected */
    }
  }
};

// ── Non-stream endpoint ───────────────────────────────────────────────────────
export const sendMessageToConversation = async (req, res) => {
  try {
    const conversationId = Number(req.params.conversationId);
    const { message } = req.body;

    if (!message || message.trim().length === 0)
      return res
        .status(400)
        .json({ success: false, error: "Mensagem não pode estar vazia" });
    if (!conversationId)
      return res
        .status(400)
        .json({ success: false, error: "conversationId inválido" });

    const existing = await getConversationById(conversationId);
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: "Conversation não encontrada" });

    const userMessage = message.trim();
    const rows = await getChatHistoryByConversationId(conversationId);
    const history = buildConversationHistory(rows);

    await createChatHistory({
      conversation_id: conversationId,
      role_id: ROLE_USER,
      content: userMessage,
    });

    const result = await processChatMessage(userMessage, history);

    if (result.providerError || result.success === false) {
      const errorMsg =
        PROVIDER_ERROR_MESSAGES[result.errorType] || result.message;
      return res.status(503).json({
        success: false,
        providerError: true,
        errorType: result.errorType || "UNKNOWN",
        message: errorMsg,
        conversationId,
      });
    }

    let persisted = {};
    if (result.functionResults?.length)
      persisted = await persistAllFunctionResults(result.functionResults);

    const enrichAssistantText = (text, persistedData) => {
      const base = (text || "").trim();
      const hasCreatedTask = persistedData.task && persistedData.task.id;
      const hasAssignedTask =
        persistedData.assignment && persistedData.assignment.task_id;

      let finalText = base;

      if (hasCreatedTask) {
        const idFragment = `ID #${persistedData.task.id}`;
        if (!finalText.includes(idFragment)) {
          const suffix = finalText
            ? `\n✓ Tarefa criada com ${idFragment}.`
            : `✓ Tarefa criada com ${idFragment}.`;
          finalText = `${finalText}${suffix}`.trim();
        }
      }

      if (!finalText && hasAssignedTask) {
        finalText = `✓ Tarefa #${persistedData.assignment.task_id} atribuída a ${persistedData.assignment.user_name}.`;
      }

      return finalText || text;
    };

    const finalAssistantText = enrichAssistantText(result.message, persisted);

    await createChatHistory({
      conversation_id: conversationId,
      role_id: ROLE_ASSISTANT,
      content: finalAssistantText,
    });

    const summary = await autoGenerateSummary(conversationId);

    // Check if there were persistence errors
    const hasPersistenceErrors =
      persisted.persistenceErrors && persisted.persistenceErrors.length > 0;
    const statusCode = hasPersistenceErrors ? 207 : 200; // 207 Multi-Status for partial success

    return res.status(statusCode).json({
      ...result,
      message: finalAssistantText,
      conversationId,
      summary,
      success: !hasPersistenceErrors,
      persistenceErrors: persisted.persistenceErrors || [],
      ...persisted,
    });
  } catch (error) {
    console.error("[sendMessageToConversation] Error:", error.message);
    res.status(500).json({
      success: false,
      error: "Erro ao processar mensagem: " + error.message,
      conversationId,
    });
  }
};

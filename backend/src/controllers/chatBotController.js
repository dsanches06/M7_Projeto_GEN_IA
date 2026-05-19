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

const { createTicket, updateTicket, deleteTicket, getTicketById } = ticketService;

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

// Extract most recent task_id from assistant messages ("ID #N" or "Tarefa #N")
const extractRecentTaskIdFromHistory = (history = []) => {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].role !== "assistant") continue;
    const match = history[i].content.match(/(?:Tarefa\s+criada\s+com\s+)?ID\s*#(\d+)/i);
    if (match) return Number(match[1]);
  }
  return null;
};

// Extract most recent ticket_id from assistant messages ("Ticket #N criado")
const extractRecentTicketIdFromHistory = (history = []) => {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].role !== "assistant") continue;
    const match = history[i].content.match(/[Tt]icket\s+#(\d+)/i);
    if (match) return Number(match[1]);
  }
  return null;
};

// Inject contextual IDs into the user message so the model uses them directly.
const injectTaskContext = (userMessage, history) => {
  const hasCreateIntent = /\b(cria|criar|nova\s+tarefa|adiciona\s+uma?\s+tarefa)\b/i.test(userMessage);
  const hasAssignIntent = /\b(atribui|atribuir|assign)\b/i.test(userMessage);

  // Pronoun-based reference ("esta tarefa", "essa tarefa") OR assign-only intent
  const refersToTask =
    /\b(esta|essa|a mesma|nesta|nessa|a anterior)\s+tarefa\b/i.test(userMessage) ||
    (hasAssignIntent && !hasCreateIntent);
  const refersToTicket = /\b(este|esse|o mesmo|neste|nesse|o anterior)\s+ticket\b/i.test(userMessage);

  let msg = userMessage;

  if (refersToTask && !hasCreateIntent) {
    const taskId = extractRecentTaskIdFromHistory(history);
    if (taskId) msg = `[task_id desta conversa = ${taskId}]\n${msg}`;
  }

  if (refersToTicket) {
    const ticketId = extractRecentTicketIdFromHistory(history);
    if (ticketId) msg = `[ticket_id desta conversa = ${ticketId}]\n${msg}`;
  }

  return msg;
};


// ── Upsert task assignment ────────────────────────────────────────────────────
const upsertAssignment = async (payload) => {
  const taskIdNum = Number(payload.task_id ?? payload.taskId);
  const userIdNum = Number(payload.user_id ?? payload.userId);

  if (!taskIdNum || !userIdNum)
    throw new Error(
      `IDs inválidos: task_id=${payload.task_id ?? payload.taskId}, user_id=${payload.user_id ?? payload.userId}`,
    );

  let assignment;
  try {
    assignment = await createTaskAssignee({
      task_id: taskIdNum,
      user_id: userIdNum,
      notification_title: payload.notification_title ?? payload.notificationTitle,
      notification_message:
        payload.notification_message ?? payload.notificationMessage,
    });
  } catch (err) {
    if (err.message?.includes("já está atribuída")) {
      await db.query("DELETE FROM task_assignees WHERE task_id = ?", [taskIdNum]);
      assignment = await createTaskAssignee({
        task_id: taskIdNum,
        user_id: userIdNum,
        notification_title: payload.notification_title ?? payload.notificationTitle,
        notification_message:
          payload.notification_message ?? payload.notificationMessage,
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
      // Task was already persisted in the agentic loop (createTaskAndPersist); just fetch it.
      if (result.id) {
        task = await getTaskById(result.id);
      } else {
        task = await createTask(result);
      }
      // Assignment is handled separately by set_assign_task_values in the agentic loop.
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
      if (!result._persisted) {
        assignment = await upsertAssignment(result);
        if (assignment?.notification) notification = assignment.notification;
      } else {
        const [user, taskRow] = await Promise.all([
          getUserById(Number(result.user_id)).catch(() => null),
          getTaskById(Number(result.task_id)).catch(() => null),
        ]);
        assignment = {
          task_id: Number(result.task_id),
          user_id: Number(result.user_id),
          user_name: user?.name || `Utilizador #${result.user_id}`,
          task_title: taskRow?.title || `Tarefa #${result.task_id}`,
        };
      }
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
      if (result._persisted) {
        rawTags = (result.tag_ids || []).map((id) => ({ tag_id: id }));
      } else if (Array.isArray(result.tag_ids) && result.tag_ids.length > 0) {
        rawTags = await createTagTasks(result);
      } else if (result.tag_id) {
        rawTags = [await createTagTask(result)];
      }

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
      const userIdNum = Number(result.user_id);
      if (!userIdNum) throw new Error("user_id inválido para ticket");
      const existingUser = await getUserById(userIdNum);
      if (!existingUser) throw new Error(`Utilizador ${userIdNum} não encontrado.`);
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
    tasks: [],
    persistenceErrors: [],
  };

  for (const functionResult of cleanResults) {
    try {
      const v = await persistFunctionResult(functionResult);
      if (v.task) { acc.tasks.push(v.task); acc.task = v.task; }
      if (v.notification) acc.notification = v.notification;
      if (v.ticket) acc.ticket = v.ticket;
      if (v.assignment) acc.assignment = v.assignment;
      if (v.tags) acc.tags = v.tags;
      if (v.taskUpdated) acc.taskUpdated = v.taskUpdated;
      if (v.taskDeleted) acc.taskDeleted = v.taskDeleted;
    } catch (err) {
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
        injectTaskContext(userMessage, resolvedHistory),
        resolvedHistory,
        (chunkText) => sendEvent("message", { text: chunkText }),
      );

      const assistantText = result.message || "";

      const enrichAssistantText = (text, persisted) => {
        const base = (text || "").trim();
        const createdTasks = persisted.tasks?.length ? persisted.tasks : (persisted.task ? [persisted.task] : []);
        const hasAssignedTask = persisted.assignment && persisted.assignment.task_id;

        let finalText = base;

        for (const t of createdTasks) {
          const idFragment = `ID #${t.id}`;
          if (!finalText.includes(idFragment)) {
            finalText = finalText
              ? `${finalText}\n✓ Tarefa criada com ${idFragment}.`
              : `✓ Tarefa criada com ${idFragment}.`;
          }
        }

        if (!finalText && hasAssignedTask) {
          finalText = `✓ Tarefa #${persisted.assignment.task_id} atribuída a ${persisted.assignment.user_name}.`;
        }

        if (hasAssignedTask && persisted.notification?.message) {
          const notificationText = persisted.notification.message;
          if (!finalText.includes(notificationText)) {
            finalText = finalText
              ? `${finalText}\n${notificationText}`
              : notificationText;
          }
        }

        // Inject ticket ID so it can be recovered from history for contextual references
        if (persisted.ticket?.id && !persisted.ticket._type?.includes("deleted")) {
          const ticketFrag = `Ticket #${persisted.ticket.id}`;
          if (!finalText.includes(ticketFrag)) {
            finalText = finalText
              ? `${finalText}\n✓ ${ticketFrag} criado.`
              : `✓ ${ticketFrag} criado.`;
          }
        }

        return finalText || assistantText;
      };

      let persisted = {};
      if (result.functionResults?.length) {
        const tagsExplicitlyRequested = /\b(tag|tags|etiqueta|etiquetas|label|labels)\b/i.test(userMessage);
        const resultsToProcess = tagsExplicitlyRequested
          ? result.functionResults
          : result.functionResults.filter((fr) => fr.functionName !== "set_tag_task_values");
        persisted = await persistAllFunctionResults(resultsToProcess);
      }

      const finalAssistantText = enrichAssistantText(assistantText, persisted);

      await createChatHistory({
        conversation_id: actualConversationId,
        role_id: ROLE_ASSISTANT,
        content: finalAssistantText,
      });

      const summary = null;

      // Check if there were persistence errors to report
      const hasPersistenceErrors =
        persisted.persistenceErrors && persisted.persistenceErrors.length > 0;

      if (hasPersistenceErrors) {
        sendEvent("done", {
          success: false,
          message: finalAssistantText,
          thinking: result.thinking || null,
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
          thinking: result.thinking || null,
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

    const result = await processChatMessage(injectTaskContext(userMessage, history), history);

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
    if (result.functionResults?.length) {
      const tagsExplicitlyRequested = /\b(tag|tags|etiqueta|etiquetas|label|labels)\b/i.test(userMessage);
      const resultsToProcess = tagsExplicitlyRequested
        ? result.functionResults
        : result.functionResults.filter((fr) => fr.functionName !== "set_tag_task_values");
      persisted = await persistAllFunctionResults(resultsToProcess);
    }

    const enrichAssistantText = (text, persistedData) => {
      const base = (text || "").trim();
      const createdTasks = persistedData.tasks?.length ? persistedData.tasks : (persistedData.task ? [persistedData.task] : []);
      const hasAssignedTask = persistedData.assignment && persistedData.assignment.task_id;

      let finalText = base;

      for (const t of createdTasks) {
        const idFragment = `ID #${t.id}`;
        if (!finalText.includes(idFragment)) {
          finalText = finalText
            ? `${finalText}\n✓ Tarefa criada com ${idFragment}.`
            : `✓ Tarefa criada com ${idFragment}.`;
        }
      }

      if (!finalText && hasAssignedTask) {
        finalText = `✓ Tarefa #${persistedData.assignment.task_id} atribuída a ${persistedData.assignment.user_name}.`;
      }

      if (hasAssignedTask && persistedData.notification?.message) {
        const notificationText = persistedData.notification.message;
        if (!finalText.includes(notificationText)) {
          finalText = finalText
            ? `${finalText}\n${notificationText}`
            : notificationText;
        }
      }

      if (persistedData.ticket?.id && !persistedData.ticket._type?.includes("deleted")) {
        const ticketFrag = `Ticket #${persistedData.ticket.id}`;
        if (!finalText.includes(ticketFrag)) {
          finalText = finalText
            ? `${finalText}\n✓ ${ticketFrag} criado.`
            : `✓ ${ticketFrag} criado.`;
        }
      }

      return finalText || text;
    };

    const finalAssistantText = enrichAssistantText(result.message, persisted);

    await createChatHistory({
      conversation_id: conversationId,
      role_id: ROLE_ASSISTANT,
      content: finalAssistantText,
    });

    const summary = null;

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

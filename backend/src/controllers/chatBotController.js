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

import { createTask, updateStatus, getTaskById } from "../services/taskService.js";
import { createNotification }   from "../services/notificationService.js";
import { createTicket }         from "../services/ticketService.js";
import { upsertSummary }        from "../services/summaryService.js";
import { getUserById }          from "../services/userService.js";
import { createTaskAssignee }   from "../services/taskAssigneesService.js";
import { createTagTask, createTagTasks } from "../services/tagTaskService.js";
import { getAllTags }            from "../services/tagService.js";

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

// ── Upsert assignment ─────────────────────────────────────────────────────────
const upsertAssignment = async (task_id, user_id) => {
  const taskIdNum = Number(task_id);
  const userIdNum = Number(user_id);

  if (!taskIdNum || !userIdNum) {
    throw new Error(`IDs inválidos para atribuição: task_id=${task_id}, user_id=${user_id}`);
  }

  let assignment;
  try {
    assignment = await createTaskAssignee({ task_id: taskIdNum, user_id: userIdNum });
  } catch (err) {
    if (err.message?.includes("já está atribuída")) {
      const { db } = await import("../db.js");
      await db.query("DELETE FROM task_assignees WHERE task_id = $1", [taskIdNum]);
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

// ── Persist function result ───────────────────────────────────────────────────
const persistFunctionResult = async (functionResult) => {
  let task         = null;
  let notification = null;
  let ticket       = null;
  let assignment   = null;
  let tags         = null;
  let taskUpdated  = null;

  if (!functionResult?.result) return { task, notification, ticket, assignment, tags, taskUpdated };

  const { functionName, result } = functionResult;

  try {
    // ── Criar tarefa ─────────────────────────────────────────────────────
    if (functionName === "set_create_task_values") {
      console.log("📝 Criando tarefa:", result);
      task = await createTask(result);
      console.log("✅ Tarefa criada:", task);

      if (result.user_id && task?.id) {
        console.log(`🔗 Auto-atribuindo tarefa #${task.id} ao utilizador #${result.user_id}`);
        try {
          assignment = await upsertAssignment(task.id, result.user_id);
          console.log("✅ Atribuição automática criada:", assignment);
        } catch (assignErr) {
          console.warn("[chatBotController] Auto-atribuição falhou:", assignErr.message);
        }
      }

    // ── Atribuir tarefa existente ────────────────────────────────────────
    } else if (functionName === "set_assign_task_values") {
      console.log("🔗 Atribuindo tarefa:", result);
      assignment = await upsertAssignment(result.task_id, result.user_id);
      console.log("✅ Atribuição criada:", assignment);

    // ── Alterar status da tarefa ──────────────────────────────────────────
    } else if (functionName === "set_patch_status_task_values") {
      console.log("🔄 Atualizando status da tarefa:", result);
      const taskIdNum   = Number(result.task_id);
      const statusIdNum = Number(result.status_id);

      if (!taskIdNum || !statusIdNum) {
        throw new Error(`IDs inválidos: task_id=${result.task_id}, status_id=${result.status_id}`);
      }

      await updateStatus(taskIdNum, { status_id: statusIdNum });
      taskUpdated = await getTaskById(taskIdNum);

      if (taskUpdated) {
        taskUpdated.status_name = STATUS_NAME[statusIdNum] || "UNKNOWN";
      }
      console.log("✅ Status atualizado:", taskUpdated);

    // ── Adicionar etiquetas ────────────────────────────────────────────────
    } else if (functionName === "set_tag_task_values") {
      console.log("🏷️ Adicionando etiquetas:", result);
      let rawTags = [];
      if (Array.isArray(result.tag_ids) && result.tag_ids.length > 0) {
        rawTags = await createTagTasks(result);
      } else if (result.tag_id) {
        rawTags = [await createTagTask(result)];
      }

      let allTags = [];
      try { allTags = await getAllTags(); } catch { /* non-critical */ }

      const tagMap     = Object.fromEntries(allTags.map(t => [t.id, t]));
      const taskDetails = await getTaskById(result.task_id).catch(() => null);

      tags = {
        task_id:    result.task_id,
        task_title: taskDetails?.title || `Tarefa #${result.task_id}`,
        added: (rawTags || []).map(rt => {
          const tag = tagMap[rt.tag_id] || {};
          return {
            tag_id:    rt.tag_id,
            tag_name:  tag.name  || `Tag #${rt.tag_id}`,
            tag_color: tag.color || "#6B7280",
          };
        }),
        skipped: [],
      };
      console.log("✅ Etiquetas adicionadas:", tags);

    // ── Criar notificação ────────────────────────────────────────────────
    } else if (functionName === "set_create_notification_values") {
      console.log("📬 Criando notificação:", result);
      notification = await createNotification(result);
      console.log("✅ Notificação criada:", notification);

    // ── Criar ticket ─────────────────────────────────────────────────────
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

  return { task, notification, ticket, assignment, tags, taskUpdated };
};

// ── Stream endpoint ───────────────────────────────────────────────────────────
export const sendMessageToBotStream = async (req, res) => {
  try {
    const { message, conversationHistory, conversationId } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, error: "Mensagem não pode estar vazia" });
    }

    const userMessage = message.trim();
    let actualConversationId        = conversationId ? Number(conversationId) : null;
    let resolvedConversationHistory = conversationHistory || [];

    if (actualConversationId) {
      const existing = await getConversationById(actualConversationId);
      if (!existing) {
        return res.status(404).json({ success: false, error: "Conversation não encontrada" });
      }
      if (!resolvedConversationHistory.length) {
        const historyRows = await getChatHistoryByConversationId(actualConversationId);
        resolvedConversationHistory = buildConversationHistory(historyRows);
      }
    } else {
      const title = userMessage.length > 50 ? userMessage.substring(0, 47) + "..." : userMessage;
      const newConv = await createConversation({ title });
      actualConversationId = newConv.id;
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
    let assignment   = null;
    let tags         = null;
    let taskUpdated  = null;

    if (result.success !== false) {
      await createChatHistory({
        conversation_id: actualConversationId,
        role_id:         ROLE_ASSISTANT,
        content:         assistantText,
      });

      const firstResult = result.functionResults?.[0];
      if (firstResult) {
        ({ task, notification, ticket, assignment, tags, taskUpdated } =
          await persistFunctionResult(firstResult));
      }

      setImmediate(() => autoGenerateSummary(actualConversationId));
    }

    sendEvent("done", {
      success:         true,
      message:         assistantText,
      conversationId:  actualConversationId,
      functionResults: result.functionResults || [],
      task,
      notification,
      ticket,
      assignment,
      tags,
      taskUpdated,
    });

    res.end();
  } catch (error) {
    console.error("Erro no controller stream:", error);
    res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
    res.end();
  }
};

// ── Non-stream endpoint ───────────────────────────────────────────────────────
export const sendMessageToConversation = async (req, res) => {
  try {
    const conversationId = Number(req.params.conversationId);
    const { message }    = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, error: "Mensagem não pode estar vazia" });
    }

    if (!conversationId) {
      return res.status(400).json({ success: false, error: "conversationId inválido" });
    }

    const existingConversation = await getConversationById(conversationId);
    if (!existingConversation) {
      return res.status(404).json({ success: false, error: "Conversation não encontrada" });
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
      let persisted = {};
      if (firstResult) {
        persisted = await persistFunctionResult(firstResult);
      }

      setImmediate(() => autoGenerateSummary(Number(conversationId)));

      return res.status(200).json({ ...result, conversationId, ...persisted });
    }

    res.status(result.success ? 200 : 400).json({ ...result, conversationId });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:   "Erro ao processar mensagem: " + error.message,
    });
  }
};

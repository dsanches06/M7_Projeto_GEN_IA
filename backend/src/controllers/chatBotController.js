import {
  processChatMessage,
  processChatMessageStream,
} from "../genAI/task/chat_processor_task.js";
import { processChatMessage as processSummaryMessage } from "../genAI/summaries/chat_processor_summary.js";
import {
  createChatHistory,
  getChatHistoryByConversationId,
} from "../services/chatHistoryService.js";
import {
  createConversation,
  getConversationById,
} from "../services/conversationService.js";
import { createTask } from "../services/taskService.js";
import { upsertSummary } from "../services/summaryService.js";

const ROLE_USER = 2;
const ROLE_ASSISTANT = 3;

const buildConversationHistory = (historyRows) => {
  return historyRows.map((row) => ({
    role: row.role_id === ROLE_USER ? "user" : "assistant",
    content: row.content,
  }));
};

/**
 * Gera e persiste automaticamente o resumo da conversa em background.
 * Usa o processador de resumos para chamar set_create_summary_values via IA.
 * Não bloqueia a resposta principal — fire and forget.
 */
const autoGenerateSummary = async (conversationId) => {
  try {
    const historyRows = await getChatHistoryByConversationId(conversationId);
    if (!historyRows || historyRows.length < 2) return; // Mínimo 1 troca para resumir

    const historyText = historyRows
      .slice(-12) // Últimas 12 mensagens para contexto
      .map(
        (r) =>
          `${r.role_id === ROLE_USER ? "Utilizador" : "Assistente"}: ${r.content.substring(0, 120)}`
      )
      .join("\n");

    const prompt = `Resume esta conversa de forma concisa (conversation_id: ${conversationId}). Histórico:\n${historyText}`;

    const result = await processSummaryMessage(prompt, []);

    if (result.functionResults?.[0]?.result) {
      const funcData = result.functionResults[0].result;
      await upsertSummary({
        conversation_id: funcData.conversation_id || conversationId,
        original_text: historyText.substring(0, 295),
        summary:
          (funcData.summary || result.message || "Resumo indisponível").substring(0, 195),
      });
    } else if (result.message) {
      // Fallback: usa a resposta da IA como resumo
      await upsertSummary({
        conversation_id: conversationId,
        original_text: historyText.substring(0, 295),
        summary: result.message.substring(0, 195),
      });
    }
  } catch (err) {
    // Não crítico — não propaga o erro
    console.warn("[AutoSummary] Non-critical error:", err.message);
  }
};

/**
 * Processa uma mensagem de chat com função genAI em modo stream.
 * Após resposta, dispara geração de resumo em background.
 */
export const sendMessageToBotStream = async (req, res) => {
  try {
    const { message, conversationHistory, conversationId } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Mensagem não pode estar vazia",
      });
    }

    const userMessage = message.trim();
    let actualConversationId = conversationId ? Number(conversationId) : null;
    let resolvedConversationHistory = conversationHistory || [];

    if (actualConversationId) {
      const existingConversation = await getConversationById(actualConversationId);
      if (!existingConversation) {
        return res.status(404).json({
          success: false,
          error: "Conversation não encontrada",
        });
      }

      if (!resolvedConversationHistory.length) {
        const historyRows = await getChatHistoryByConversationId(actualConversationId);
        resolvedConversationHistory = buildConversationHistory(historyRows);
      }
    } else {
      // Usa as primeiras 50 letras da mensagem como título da conversa
      const title =
        userMessage.length > 50
          ? userMessage.substring(0, 47) + "..."
          : userMessage;
      const newConversation = await createConversation({ title });
      actualConversationId = newConversation.id;
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
    let createdTask = null;

    if (result.success !== false) {
      await createChatHistory({
        conversation_id: actualConversationId,
        role_id: ROLE_ASSISTANT,
        content: assistantText,
      });

      const taskFunctionResult = result.functionResults?.[0];
      if (
        taskFunctionResult &&
        taskFunctionResult.functionName === "set_create_task_values" &&
        taskFunctionResult.result
      ) {
        try {
          console.log("📝 Criando tarefa com dados:", taskFunctionResult.result);
          createdTask = await createTask(taskFunctionResult.result);
          console.log("✅ Tarefa criada com sucesso:", createdTask);
        } catch (taskError) {
          console.error("❌ Erro ao salvar tarefa no banco:", taskError);
        }
      }

      // Dispara geração de resumo em background (não bloqueia a resposta SSE)
      setImmediate(() => autoGenerateSummary(actualConversationId));
    }

    sendEvent("done", {
      success: true,
      message: assistantText,
      conversationId: actualConversationId,
      functionResults: result.functionResults || [],
      task: createdTask,
    });
    res.end();
  } catch (error) {
    console.error("Erro no controller stream:", error);
    res.write(
      `event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`
    );
    res.end();
  }
};

/**
 * Processa uma mensagem em uma conversa específica.
 */
export const sendMessageToConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Mensagem não pode estar vazia",
      });
    }

    const userMessage = message.trim();

    const chatHistoryRows = await getChatHistoryByConversationId(conversationId);
    const conversationHistory = buildConversationHistory(chatHistoryRows);

    await createChatHistory({
      conversation_id: conversationId,
      role_id: ROLE_USER,
      content: userMessage,
    });

    const result = await processChatMessage(userMessage, conversationHistory);

    if (result.success && result.message) {
      await createChatHistory({
        conversation_id: conversationId,
        role_id: ROLE_ASSISTANT,
        content: result.message,
      });

      // Dispara geração de resumo em background
      setImmediate(() => autoGenerateSummary(Number(conversationId)));
    }

    res.status(result.success ? 200 : 400).json({
      ...result,
      conversationId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Erro ao processar mensagem: " + error.message,
    });
  }
};

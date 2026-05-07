import { processChatMessage, processChatMessageStream } from "../genAI/chat_processor_task.js";
import { createChatHistory, getChatHistoryByConversationId } from "../services/chatHistoryService.js";
import { createConversation, getConversationById } from "../services/conversationService.js";
import { createTask } from "../services/taskService.js";

const ROLE_USER = 2;
const ROLE_ASSISTANT = 3;

const buildConversationHistory = (historyRows) => {
  return historyRows.map((row) => ({
    role: row.role_id === ROLE_USER ? "user" : "assistant",
    content: row.content,
  }));
};

/**
 * Processa uma mensagem de chat com função genAI
 * Executa function calls automaticamente e retorna o resultado
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
      const newConversation = await createConversation({ title: "Chat AI" });
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

    let createdTask = null;
    if (result.success !== false) {
      await createChatHistory({
        conversation_id: actualConversationId,
        role_id: ROLE_ASSISTANT,
        content: finalText,
      });

      const taskFunctionResult = result.functionResults?.[0];
      if (
        taskFunctionResult &&
        taskFunctionResult.functionName === "set_create_task_values" &&
        taskFunctionResult.result
      ) {
        try {
          createdTask = await createTask(taskFunctionResult.result);
        } catch (taskError) {
          console.error("Erro ao salvar tarefa no banco:", taskError);
        }
      }
    }

    sendEvent("done", {
      success: true,
      message: finalText,
      conversationId: actualConversationId,
      functionResults: result.functionResults || [],
      task: createdTask,
    });
    res.end();
  } catch (error) {
    console.error("Erro no controller stream:", error);
    res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
    res.end();
  }
};

/**
 * Processa uma mensagem em uma conversa específica
 * Recupera histórico da conversa e processa a nova mensagem
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

    const chatHistoryRows =
      await getChatHistoryByConversationId(conversationId);
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

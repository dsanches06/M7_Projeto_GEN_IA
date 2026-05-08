import BaseService from "./BaseService.js";

/**
 * ChatService - Serviço de Chat com IA
 * Herda de BaseService para evitar duplicação de código
 */
class ChatService extends BaseService {
  constructor() {
    super("/chat");
  }

  /**
   * Envia mensagem para o bot com streaming
   */
  async sendMessageToBotStream(
    message,
    conversationHistory = [],
    onChunk,
    onDone,
    conversationId = null,
  ) {
    const payload = {
      message,
      conversationHistory,
      conversationId,
    };
    return this.sendStreamMessage(
      "/chat/message/stream",
      payload,
      onChunk,
      onDone,
    );
  }

  /**
   * Envia mensagem em uma conversa específica
   */
  async sendMessageToConversation(conversationId, message) {
    const endpoint = `/chat/conversation/${conversationId}/message`;
    return this.sendMessage(endpoint, { message });
  }

  /**
   * Alias para sendMessageToBotStream para compatibilidade
   */
  async sendMessage(
    message,
    conversationHistory = [],
    onChunk,
    onDone,
    conversationId = null,
  ) {
    return this.sendMessageToBotStream(
      message,
      conversationHistory,
      onChunk,
      onDone,
      conversationId,
    );
  }

  /**
   * Extrai dados de tarefa do function result
   */
  extractTaskDataFromFunctionResult(functionResult) {
    if (!functionResult || !functionResult.result) {
      return null;
    }

    const data = functionResult.result;
    return {
      title: data.title,
      description: data.description,
      type_id: data.types_id,
      status_id: data.status_id,
      priority_id: data.priority_id,
      category_id: data.category_id,
      project_id: data.project_id,
      created_at: data.created_at,
      due_date: data.due_date,
      completed_at: data.completed_at,
      estimated_hours: data.estimated_hours,
    };
  }

  /**
   * Extrai dados de tarefa de resposta do Gemini
   */
  extractTaskData(geminiResponse) {
    if (!geminiResponse) return null;
    if (typeof geminiResponse === "object") return geminiResponse;

    try {
      const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error("Error extracting task data:", error);
    }

    return null;
  }

  /**
   * Busca todas as conversas
   */
  async getConversations() {
    return this.fetchData("/conversations");
  }

  /**
   * Busca resumo de chat de uma conversa
   */
  async getChatSummary(conversationId) {
    return this.fetchData(`/summaries/conversation/${conversationId}`);
  }

  /**
   * Busca histórico de chat de uma conversa
   */
  async getChatHistory(conversationId) {
    return this.fetchData(`/chat/history/conversation/${conversationId}`);
  }
}

// Exporta instância singleton
export const chatService = new ChatService();

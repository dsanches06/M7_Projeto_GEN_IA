/**
 * Serviço para comunicação com o Bot GenAI
 * Usa function calls para executar ações no backend
 */

// URL do backend (porta 3000)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const botService = {
  /**
   * Enviar mensagem para o bot com function calls
   * @param {string} message - Mensagem do usuário
   * @param {Array} conversationHistory - Histórico da conversa
   * @returns {Promise<Object>} - Resposta com resultados das funções
   */
  async sendMessageToBot(message, conversationHistory = []) {
    try {
      const response = await fetch(`${BACKEND_URL}/bot/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`Bot API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Bot service error:', error);
      throw error;
    }
  },

  /**
   * Enviar mensagem em uma conversa específica
   * @param {number} conversationId - ID da conversa
   * @param {string} message - Mensagem do usuário
   * @returns {Promise<Object>} - Resposta com resultados das funções
   */
  async sendMessageToConversation(conversationId, message) {
    try {
      const response = await fetch(
        `${BACKEND_URL}/bot/conversation/${conversationId}/message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message }),
        }
      );

      if (!response.ok) {
        throw new Error(`Bot API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Bot service error:', error);
      throw error;
    }
  },

  /**
   * Extrair dados de tarefa do resultado da função
   * @param {Object} functionResult - Resultado da função set_create_task_values
   * @returns {Object} - Dados formatados para criação de tarefa
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
  },

  /**
   * Verificar se há resultado de function call na resposta
   * @param {Object} response - Resposta do bot
   * @returns {boolean}
   */
  hasFunctionResults(response) {
    return response.success && response.functionResults && response.functionResults.length > 0;
  },

  /**
   * Obter primeiro resultado de função
   * @param {Object} response - Resposta do bot
   * @returns {Object|null}
   */
  getFirstFunctionResult(response) {
    if (this.hasFunctionResults(response)) {
      return response.functionResults[0];
    }
    return null;
  },
};
